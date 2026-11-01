import { BrickFieldsComponent, BrickFieldsModule } from '../brick-fields/brick-fields';
import { BrickInput } from '../../models/interfaces/brick';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, NgModule, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { BasePostDTO, FullPostDTO } from '../../models/interfaces/responses/post.response';
import { PostService } from '../../services/post.service';
import { NotificationService } from '../../services/notification.service';
import { PostEditorModule } from '../post-editor';

export type PostEditContext =
  | { type: 'post'; projectUid: string }
  | { type: 'insight' | 'comment' | 'insight-comment' | 'insight-brick'; parentUid: string };

interface BootstrapModal {
  show(): void;
  hide(): void;
  dispose(): void;
}

type BootstrapWindow = Window & {
  bootstrap?: { Modal: new (element: HTMLElement) => BootstrapModal };
};

@Component({
  selector: 'app-post-edit-modal',
  standalone: false,
  template: `
    <div #modalElement class="modal" tabindex="-1" aria-hidden="true"
      [attr.aria-labelledby]="titleId">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content" [attr.aria-busy]="isSaving">
          <div class="modal-header">
            <h2 class="modal-title fs-5" [id]="titleId">{{title}}</h2>
            <button type="button" class="btn-close" aria-label="Cerrar"
              [disabled]="isSaving" (click)="close()"></button>
          </div>
          <div class="modal-body">
            <app-brick-fields *ngIf="post && brickInsightUid" [insightUid]="brickInsightUid"
              [attributes]="post.attributes" [category]="post.category || ''" [editing]="true" [legacy]="legacyBrick" [disabled]="isSaving"></app-brick-fields>
            <app-post-editor *ngIf="post" [source]="post.rawContent"
              [saving]="isSaving" [submitText]="isSaving ? 'Guardando…' : 'Guardar cambios'"
              (saveEvent)="save($event)"></app-post-editor>
            <p *ngIf="errorMessage" class="text-danger mt-3 mb-0" role="alert">{{errorMessage}}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" [disabled]="isSaving"
              (click)="close()">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PostEditModalComponent implements OnDestroy {
  private static nextId = 0;
  readonly titleId = 'post-edit-title-' + PostEditModalComponent.nextId++;
  @ViewChild('modalElement', { static: true }) modalElement!: ElementRef<HTMLDivElement>;
  @ViewChild(BrickFieldsComponent) brickFields?: BrickFieldsComponent;
  @Output() updatedEvent = new EventEmitter<string>();

  post?: BasePostDTO;
  private context?: PostEditContext;

  get brickInsightUid(): string { return this.context?.type === 'insight-brick' ? this.context.parentUid : ''; }
  get legacyBrick(): boolean { return !this.post?.attributes?.time; }

  get title(): string {
    return this.context?.type === 'insight' ? 'Editar insight'
      : this.context?.type === 'comment' || this.context?.type === 'insight-comment' ? 'Editar comentario'
      : this.context?.type === 'insight-brick' ? 'Editar brick' : 'Editar publicación';
  }
  isSaving = false;
  errorMessage = '';
  private modal?: BootstrapModal;
  private previousFocus?: HTMLElement;
  private destroyed = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private changeDetector: ChangeDetectorRef,
    private postService: PostService,
    private notificationService: NotificationService,
  ) {}

  private readonly hideHandler = (event: Event): void => {
    if (this.isSaving) event.preventDefault();
  };

  private readonly hiddenHandler = (): void => {
    this.post = undefined;
    this.context = undefined;
    this.errorMessage = '';
    if (!this.destroyed) this.changeDetector.detectChanges();
    this.previousFocus?.focus();
  };

  open(post: FullPostDTO): void;
  open(post: BasePostDTO, context: PostEditContext): void;
  open(post: BasePostDTO, context?: PostEditContext): void {
    if (this.isSaving || this.post) return;
    const editContext: PostEditContext = context ?? {
      type: 'post', projectUid: (post as FullPostDTO).project?.uid || '',
    };
    if (!post.uid || (editContext.type === 'post' ? !editContext.projectUid : !editContext.parentUid)) {
      this.notificationService.showError('Falta la referencia de la publicación o de su contexto de edición.');
      return;
    }
    const bootstrap = (this.document.defaultView as BootstrapWindow | null)?.bootstrap;
    if (!bootstrap) {
      this.notificationService.showError('No se pudo cargar el modal de edición. Recarga la página e intenta nuevamente.');
      return;
    }
    if (!this.modal) {
      const element = this.modalElement.nativeElement;
      this.modal = new bootstrap.Modal(element);
      element.addEventListener('hide.bs.modal', this.hideHandler);
      element.addEventListener('hidden.bs.modal', this.hiddenHandler);
    }
    this.previousFocus = this.document.activeElement as HTMLElement;
    this.post = post;
    this.context = editContext;
    this.errorMessage = '';
    this.changeDetector.detectChanges();
    this.modal.show();
  }

  close(): void {
    if (!this.isSaving) this.modal?.hide();
  }

  async save(content: string): Promise<void> {
    if (this.isSaving || !this.post || !this.context) return;
    if (!content.trim()) {
      this.errorMessage = 'No se puede enviar una publicación en blanco.';
      return;
    }

    let fields: BrickInput = {};
    if (this.context.type === 'insight-brick') {
      try {
        if (!this.brickFields) throw new Error('Completa los datos del brick.');
        fields = this.brickFields.read();
      }
      catch (error: any) { this.errorMessage = error.message; return; }
    }
    const post = this.post;
    const context = this.context;
    this.isSaving = true;
    this.errorMessage = '';
    try {
      if (context.type === 'post') {
        await this.postService.update(content, post.uid, context.projectUid);
      }
      else if (context.type === 'insight') {
        await this.postService.updateInsight(content, post.uid, context.parentUid);
      }
      else if (context.type === 'insight-comment') {
        await this.postService.updateInsightComment(content, post.uid, context.parentUid);
      }
      else if (context.type === 'insight-brick') {
        await this.postService.updateInsightBrick(content, post.uid, context.parentUid, fields);
      }
      else {
        await this.postService.updateComment(content, post.uid, context.parentUid);
      }
      if (this.destroyed) return;
      this.isSaving = false;
      this.close();
      this.notificationService.show(context.type === 'insight' ? 'Insight actualizado.'
        : context.type === 'insight-brick' ? 'Brick actualizado.'
        : context.type === 'comment' || context.type === 'insight-comment' ? 'Comentario actualizado.' : 'Publicación actualizada.');
      this.updatedEvent.emit(post.uid);
    }
    catch (error: any) {
      if (!this.destroyed) this.errorMessage = error.message;
    }
    finally {
      this.isSaving = false;
    }
  }

  ngOnDestroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    const element = this.modalElement.nativeElement;
    element.removeEventListener('hide.bs.modal', this.hideHandler);
    element.removeEventListener('hidden.bs.modal', this.hiddenHandler);
    this.modal?.hide();
    this.modal?.dispose();
  }
}

@NgModule({
  declarations: [PostEditModalComponent],
  imports: [CommonModule, PostEditorModule, BrickFieldsModule],
  exports: [PostEditModalComponent],
})
export class PostEditModalModule {}
