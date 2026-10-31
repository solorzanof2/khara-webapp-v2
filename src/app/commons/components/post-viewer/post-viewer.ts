import { Component, EventEmitter, Input, NgModule, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { SanitizeHTMLModule } from '../../pipes/sanitize-html';
import { PostCommentEvent, PostCommentsModule } from '../post-comments';


@Component({
  selector: 'app-post-viewer',
  template: `
  <section id="app-post-viewer">
    <div class="row">
      <div class="col-12 mt-5">
        <div class="card">
          <div
            class="card-body"
            [innerHTML]="source.htmlContent | SanitizeHTML"
          ></div>
          <app-post-comments
            [type]="type"
            [source]="source.comments"
            (submitEvent)="submitFormEventHandler($event)"
          ></app-post-comments>
        </div>
      </div>
    </div>
  </section>
  `,
  styles: [`
    .card {
      border: 0;
    }

    .card-body p {
      font-size: 15px;
    }
  `],
  standalone: false,
  encapsulation: ViewEncapsulation.None,
})
export class PostViewerComponent implements OnInit {

  @Input() source: any;
  @Input() type: 'post-comments' | 'insight' = 'post-comments';

  @Output() submitEvent: EventEmitter<PostCommentEvent> = new EventEmitter<PostCommentEvent>();

  constructor() { }

  ngOnInit(): void { }

  // #region EVENTS

  submitFormEventHandler(event: PostCommentEvent): void {
    event.parentId = this.source.uid;
    this.submitEvent.emit(event);
  }

  // #endregion EVENTS

}


@NgModule({
  declarations: [PostViewerComponent],
  imports: [
    SanitizeHTMLModule,
    PostCommentsModule,
  ],
  exports: [PostViewerComponent],
})
export class PostViewerModule { }

