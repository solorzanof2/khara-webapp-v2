import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PostTypeEvent {
  value: string;
}

@Component({
  selector: 'app-post-type-selector',
  template: `
  <section id="app-post-type-selector">
    <fieldset
      class="mt-3 ml-1"
      [disabled]="disabled"
    >
      <div class="btn-group btn-group-sm" role="group" aria-label="Tipo de publicación">
        <input
          type="radio"
          class="btn-check"
          name="publicationType"
          id="publication-comment"
          [checked]="isComment"
          (change)="changeEventHandler(Comment)"
        >
        <label class="btn btn-outline-primary label-button" for="publication-comment">Comentario</label>
        <input
          type="radio"
          class="btn-check"
          name="publicationType"
          id="publication-insight"
          [checked]="isInsight"
          (change)="changeEventHandler(Insight)"
        >
        <label class="btn btn-outline-primary label-button" for="publication-insight">Insight</label>
      </div>
    </fieldset>
  </section>
  `,
  styles: [`
#app-post-type-selector {
  .label-button {
    width: 100px;
  }
}
    `],
  standalone: false,
})
export class PostTypeComponent {
  readonly Comment: string = 'comment';
  readonly Insight: string = 'insight';

  @Input() disabled: boolean = false;
  @Output() selectionEvent: EventEmitter<PostTypeEvent> = new EventEmitter();

  get isComment(): boolean {
    return (this.postType === this.Comment);
  }

  get isInsight(): boolean {
    return (this.postType === this.Insight);
  }

  postType: string = 'comment';


  constructor() { }

  changeEventHandler(type: string): void {
    this.postType = type;
    this.selectionEvent.emit({ value: type } as PostTypeEvent);
  }

}
