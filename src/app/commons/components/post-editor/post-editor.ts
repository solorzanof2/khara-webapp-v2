import { Component, ElementRef, EventEmitter, Input, NgModule, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { StacksEditor } from '@stackoverflow/stacks-editor';
import "@stackoverflow/stacks-editor/dist/styles.css";
import "@stackoverflow/stacks";
import "@stackoverflow/stacks/dist/css/stacks.css";


@Component({
  selector: 'app-post-editor',
  template: `
  <section id="app-post-editor">
    <!-- <div class="row">
      <div class="col-12 mt-5">
        <h2 class="mb-0">{{headerText}}</h2>
      </div>
    </div> -->
    <div class="row">
      <div class="col-12 mt-3">
        <div #postEditor></div>
      </div>
      <div class="col-12 mt-3">
        <div class="save-button-container" align="end">
          <button
            type="button"
            class="btn btn-success btn-sm"
            [disabled]="saving"
            (click)="submitClickEventHandler()"
          >Publish</button>
        </div>
      </div>
    </div>
  </section>
  `,
  styles: [`
  #app-post-editor {

    .save-button-container {
      margin-right: 1rem;
    }
  }
  `],
  standalone: false,
  encapsulation: ViewEncapsulation.Emulated,
})
export class PostEditorComponent implements OnInit {
  @ViewChild('postEditor', { static: true }) postEditorRef!: ElementRef<HTMLDivElement>;

  private stackEditor?: StacksEditor;
  private pendingSource = '';

  private get postEditor(): HTMLDivElement {
    return this.postEditorRef.nativeElement;
  }

  @Input() saving = false;

  @Input() headerText = 'Haz una publicación';

  @Input() set source(value: string) {
    this.pendingSource = value || '';

    if (!this.stackEditor) {
      return;
    }

    this.stackEditor.content = this.pendingSource;
  }

  @Output() saveEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
    this.stackEditor = new StacksEditor(this.postEditor, this.pendingSource);
  }

  submitClickEventHandler(): void {
    if (this.saving) {
      return;
    }

    this.saveEvent.emit(this.stackEditor?.content || '');
  }

}


@NgModule({
  declarations: [
    PostEditorComponent,
  ],
  exports: [
    PostEditorComponent,
  ],
})
export class PostEditorModule { }
