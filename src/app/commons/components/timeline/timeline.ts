import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgModule, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerModule } from '../spinner';
import { SanitizeHTMLModule } from '../../pipes/sanitize-html';


@Component({
  selector: 'app-timeline',
  template: `
  <div class="timeline-wrapper">
    <ng-container *ngIf="hasPosts">
      <ng-container
        *ngFor="let post of collection"
      >
        <div class="card card-white">
          <div class="card-header d-flex justify-content-between gap-2">
            <small>
              <strong> {{post.displayName}}</strong> &hyphen;
              <a href="javascript:void(0)">&#64;{{post.mention}}</a> &hyphen;
              <small>{{post.createdLabel}}</small>
            </small>
            <a
              href="javascript:void(0)"
              class="btn-xs-square"
              title="Editar publicación"
              (click)="editClickEventHandler(post)"
            ><i class="zmdi zmdi-edit"></i></a>
            <a
              href="javascript:void(0)"
              class="btn-xs-square"
              title="Agregar temporizador"
            ><i class="zmdi zmdi-time-restore"></i></a>
          </div>
          <div
            class="card-body"
            [innerHTML]="post.htmlContent | SanitizeHTML"
          ></div>
          <div class="card-footer">
            <table class="w-100">
              <tr>
                <td><small>{{post.totalChilds || 0}} Respuestas</small></td>
                <td align="end">
                  <div class="action-button">
                    <button type="button" class="btn-xs" (click)="selectClickEventHandler(post)">
                      <small>Ver más</small>
                    </button>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </ng-container>
    </ng-container>
    <ng-container *ngIf="!hasPosts">
      <div class="empty-section">
        <div class="border-bottom">
          <div class="text-wrapper p-5 text-center">
            <h3 class="mb-0 text-muted">Nothing Posted Today</h3>
            <p class="mb-0 text-muted">
              <small>Start adding the first post!</small>
            </p>
          </div>
        </div>
      </div>
    </ng-container>
    <div
      #spinnerWrapper
      class="spinner-wrapper p-2"
      *ngIf="canLoadPosts"
    >
      <app-spinner
        [toggle]="true"
        message="Searching..."
      ></app-spinner>
    </div>
    <ng-container *ngIf="isFinished">
      <div class="empty-section">
        <div class="border-bottom">
          <div class="text-wrapper p-5 text-center">
            <h3 class="mb-0 text-muted">End of timeline!</h3>
            <p class="mb-0 text-muted"><small>Looks like there is no more posts to show!</small></p>
          </div>
        </div>
      </div>
    </ng-container>
  </div>
  `,
  styles: [`
  .timeline-wrapper {
    border: 1px solid #ddd;
    border-radius: .25rem;

    // .post-card {
    //   border-radius: 0 !important;

    //   .card-header {
    //     background-color: #fff !important;
    //     border-bottom: #fff !important;
    //   }

    //   .card-body {
    //     padding: 0px var(--bs-card-spacer-x) !important;
    //   }

    //   .card-footer {
    //     background-color: #fff !important;
    //     border-top: #fff !important;

    //     .action-button {
    //       display: flex;
    //       justify-content: end;
    //     }
    //   }
    // }
  }
  `],
  standalone: false,
})
export class TimelineComponent implements AfterViewInit {
  private readonly TimelineStage = {
    CanLoad: 'CanLoad',
    Finished: 'Finished',
    Empty: 'Empty',
  } as const;

  @ViewChild('spinnerWrapper') spinnerWrapper!: ElementRef<HTMLDivElement>;

  @Input() collection: any[] = new Array<any>();

  @Output() nextEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() selectEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() editEvent: EventEmitter<any> = new EventEmitter<any>();

  stage: string = this.TimelineStage.CanLoad;

  get hasPosts(): boolean {
    return !!(this.collection?.length);
  }

  get canLoadPosts(): boolean {
    return (this.stage === this.TimelineStage.CanLoad);
  }

  get isFinished(): boolean {
    return (this.stage === this.TimelineStage.Finished);
  }

  constructor() { }

  ngAfterViewInit(): void {
    if (!this.spinnerWrapper) return;
    new IntersectionObserver((entries: any, observer: any) => {
      let entry: any;
      for (entry of entries) {
        console.log('[INF0] Timeline > Loading more elements...');
        if (!this.canLoadPosts) {
          continue;
        }

        this.nextEvent.emit();
      }
    }).observe(this.spinnerWrapper.nativeElement);
  }

  selectClickEventHandler(post: any): void {
    this.selectEvent.emit(post);
  }

  editClickEventHandler(post: any): void {
    this.editEvent.emit(post);
  }

  complete(): void {
    let stage = `${this.TimelineStage.Finished}`;
    if (!this.hasPosts) {
      stage = `${this.TimelineStage.Empty}`;
    }
    this.stage = stage;
  }

}


@NgModule({
  declarations: [
    TimelineComponent,
  ],
  imports: [
    CommonModule,
    SpinnerModule,
    SanitizeHTMLModule,
  ],
  exports: [
    TimelineComponent,
  ],
})
export class TimelineModule { }

