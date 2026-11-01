import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PostInsightTypeEvent {
  value: string;
}

@Component({
  selector: 'app-post-insight-type-selector',
  template: `
  <section id="app-post-insight-type-selector">
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
          id="publication-brick"
          [checked]="isBrick"
          (change)="changeEventHandler(Brick)"
        >
        <label class="btn btn-outline-primary label-button" for="publication-brick">Brick</label>
      </div>
    </fieldset>
  </section>
  `,
  styles: [`
#app-post-insight-type-selector {
  .label-button {
    width: 100px;
  }
}
    `],
  standalone: false,
})
export class PostInsightTypeComponent {
  readonly Comment: string = 'insight-comment';
  readonly Brick: string = 'insight-brick';

  @Input() disabled: boolean = false;
  @Output() selectionEvent: EventEmitter<PostInsightTypeEvent> = new EventEmitter();

  get isComment(): boolean {
    return (this.replyType === this.Comment);
  }

  get isBrick(): boolean {
    return (this.replyType === this.Brick);
  }

  replyType: string = 'insight-comment';


  constructor() { }

  changeEventHandler(type: string): void {
    this.replyType = type;
    this.selectionEvent.emit({ value: type } as PostInsightTypeEvent);
  }

}
