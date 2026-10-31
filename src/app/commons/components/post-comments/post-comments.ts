import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { getRandomGUID } from '../../utils/security';
import { SanitizeHTMLModule } from '../../pipes/sanitize-html';


@Component({
  selector: 'app-post-comments',
  template: `
  <section class="app-post-comments">
    <ng-container
      *ngIf="isPostComments; else insightTemplate"
    >
      <ul class="list-group list-group-flush">
        <ng-container
          *ngIf="hasComments"
        >
          <ng-container
            *ngFor="let comment of source; emptyCommentsTemplate"
          >
            <li class="list-group-item">
              <!-- <div
                class="ms-2 me-auto font-comment"
              > -->
                <!-- <div class="fw-bold">Subheading</div> -->
                <!-- Content for list item -->
              <!-- </div> -->
              <!-- <span class="badge text-bg-primary rounded-pill">14</span> -->
              <div
                class="mb-1 comment-content"
                [innerHTML]="comment.htmlContent | SanitizeHTML"
              ></div>

              <small>{{comment.displayName}}</small> &hyphen;
              <small>{{comment.createdLabel}}</small>
            </li>
          </ng-container>
        </ng-container>
        <li class="list-group-item d-flex justify-content-between align-items-start">
          <form
            [formGroup]="form"
            autocomplete="off"
            (ngSubmit)="submitFormEventHandler(form.value)"
          >
            <div class="form-group">
              <textarea
                class="form-control"
                cols="100"
                formControlName="comment"
              ></textarea>
            </div>
            <div class="form-group" align="end">
              <button
                class="btn btn-primary btn-compact"
                [disabled]="form.invalid"
              >Enviar</button>
            </div>
          </form>
        </li>
        <ng-template
          #emptyCommentsTemplate
        >
          <li class="list-group-item d-flex justify-content-between align-items-start"></li>
        </ng-template>
      </ul>
    </ng-container>
    <ng-template #insightTemplate>
      <ul class="list-group list-group-flush">
        <ng-container
          *ngIf="hasComments"
        >
          <ng-container
            *ngFor="let comment of source; emptyCommentsTemplate"
          >
            <li class="list-group-item">
              <div
                class="mb-1 comment-content"
                [innerHTML]="comment.htmlContent | SanitizeHTML"
              ></div>

              <small>{{comment.displayName}}</small> &hyphen;
              <small>{{comment.createdLabel}}</small>
            </li>
          </ng-container>
        </ng-container>
        <li class="list-group-item d-flex justify-content-between align-items-start">
          <form
            [formGroup]="form"
            autocomplete="off"
            (ngSubmit)="submitFormEventHandler(form.value)"
          >
            <div class="form-group">
              <textarea
                class="form-control"
                cols="100"
                formControlName="comment"
              ></textarea>
            </div>
            <div class="form-group" align="end">
              <button
                class="btn btn-primary btn-compact"
                [disabled]="form.invalid"
              >Enviar</button>
            </div>
          </form>
        </li>
        <ng-template
          #emptyCommentsTemplate
        >
          <li class="list-group-item d-flex justify-content-between align-items-start"></li>
        </ng-template>
      </ul>
      <!-- <ul class="nav nav-tabs mb-3" id="pills-tab" role="tablist">
        <li class="nav-item" role="presentation">
          <button
            class="nav-link active"
            id="comments-tab-{{ComponentUID}}"
            data-bs-toggle="pill"
            attr.data-bs-target="#pills-comments-{{ComponentUID}}"
            type="button"
            role="tab"
            attr.aria-controls="pills-comments-{{ComponentUID}}"
            aria-selected="true"
          >Comentarios</button>
        </li>
        <li class="nav-item" role="presentation">
          <button
            class="nav-link"
            id="bricks-tab-{{ComponentUID}}"
            data-bs-toggle="pill"
            attr.data-bs-target="#pills-bricks-{{ComponentUID}}"
            type="button"
            role="tab"
            attr.aria-controls="pills-bricks-{{ComponentUID}}"
            aria-selected="false"
          >Bricks</button>
        </li>
      </ul> -->

      <!-- <div class="tab-content" id="pills-tabContent">
        <div class="tab-pane fade show active" id="pills-comments-{{ComponentUID}}" role="tabpanel" attr.aria-labelledby="comments-tab-{{ComponentUID}}" tabindex="0">
          <ul class="list-group list-group-flush">
            <ng-container
              *ngIf="hasComments"
            >
              <ng-container
                *ngFor="let comment of source; emptyCommentsTemplate"
              >
                <li class="list-group-item">
                  <div
                    class="mb-1 comment-content"
                    [innerHTML]="comment.htmlContent | SanitizeHTML"
                  ></div>

                  <small>{{comment.displayName}}</small> &hyphen;
                  <small>{{comment.createdLabel}}</small>
                </li>
              </ng-container>
            </ng-container>
            <li class="list-group-item d-flex justify-content-between align-items-start">
              <form
                [formGroup]="form"
                autocomplete="off"
                (ngSubmit)="submitFormEventHandler(form.value)"
              >
                <div class="form-group">
                  <textarea
                    class="form-control"
                    cols="100"
                    formControlName="comment"
                  ></textarea>
                </div>
                <div class="form-group" align="end">
                  <button
                    class="btn btn-primary btn-compact"
                    [disabled]="form.invalid"
                  >Enviar</button>
                </div>
              </form>
            </li>
            <ng-template
              #emptyCommentsTemplate
            >
              <li class="list-group-item d-flex justify-content-between align-items-start"></li>
            </ng-template>
          </ul>
        </div>
        <div
          class="tab-pane fade"
          id="pills-bricks-{{ComponentUID}}"
          role="tabpanel"
          attr.aria-labelledby="bricks-tab-{{ComponentUID}}"
          tabindex="0"
        >
          <ul class="list-group list-group-flush">
            <li class="list-group-item d-flex justify-content-between align-items-start">
              <form
                [formGroup]="formBrick"
                autocomplete="off"
                (ngSubmit)="submitFormBrickEventHandler(formBrick.value)"
              >
                <div class="form-group">
                  <textarea
                    class="form-control"
                    cols="100"
                    formControlName="brick"
                  ></textarea>
                </div>
                <div class="form-group" align="end">
                  <button
                    class="btn btn-primary btn-compact"
                    [disabled]="formBrick.invalid"
                  >Enviar</button>
                </div>
              </form>
            </li>
            <ng-container
              *ngIf="hasBricks"
            >
              <ng-container
                *ngFor="let brick of source; emptyBricksTemplate"
              >
                <li class="list-group-item d-flex justify-content-between align-items-start">
                  <div class="ms-2 me-auto">
                    <div class="fw-bold">Subheading</div>
                    Content for list item
                  </div>
                  <span class="badge text-bg-primary rounded-pill">14</span>
                </li>
              </ng-container>
            </ng-container>
            <ng-template
              #emptyBricksTemplate
            >
              <li class="list-group-item d-flex justify-content-between align-items-start"></li>
            </ng-template>
          </ul>
        </div>
      </div> -->
    </ng-template>
  </section>
  `,
  styles: [`
  :host { }

  .app-post-comments {
    .list-group {
      margin-left: 0;

      li {

        &:last-child {
          border-radius: var(--bs-card-border-radius);
        }

        .comment-content p {
          font-size: 13px;
          margin-bottom: 0 !important;
        }
      }
    }

    .nav-tabs {
      margin-left: 0;
    }
  }
  `],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class PostCommentsComponent implements OnInit {

  readonly ComponentUID = getRandomGUID();

  @Input() source: any[] = new Array<any>();
  @Input() sourceBricks: any[] = new Array<any>();
  @Input() type: 'post-comments' | 'insight' = 'post-comments';

  @Output() submitEvent: EventEmitter<PostCommentEvent> = new EventEmitter<PostCommentEvent>();

  form!: FormGroup;
  formBrick!: FormGroup;

  commentControl: FormControl = new FormControl('', Validators.required);
  brickControl: FormControl = new FormControl('', Validators.required);

  get isPostComments(): boolean {
    return (this.type === 'post-comments');
  }

  get hasComments(): boolean {
    return (!!this.source?.length);
  }

  get hasBricks(): boolean {
    return (!!this.sourceBricks?.length);
  }

  constructor() {
    this.form = new FormGroup({
      comment: this.commentControl,
    });

    this.formBrick = new FormGroup({
      brick: this.brickControl,
    });
  }

  ngOnInit(): void { }

  // #region EVENTS

  submitFormEventHandler(form: CommentForm): void {
    this.emitEvent(form.comment);
  }

  submitFormBrickEventHandler(form: CommentForm): void {
    this.emitEvent(form.comment, false);
  }

  emitEvent(content: string, isComment: boolean = true): void {
    if (!content) {
      return;
    }

    let event = {
      content,
      originType: this.type,
      isComment,
    } as PostCommentEvent;

    this.submitEvent.emit(event);
  }

  // #endregion EVENTS

}

interface CommentForm {
  comment: string;
}

export interface PostCommentEvent {
  content: string;
  originType: string;
  isComment: boolean;
  parentId: string;
}


@NgModule({
  declarations: [PostCommentsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SanitizeHTMLModule,
  ],
  exports: [PostCommentsComponent],
})
export class PostCommentsModule { }

