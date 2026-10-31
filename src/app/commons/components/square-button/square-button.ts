import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output } from '@angular/core';


@Component({
  selector: 'app-square-button',
  template: `
  <button
    class="square-button-element"
    (click)="clickEventHandler()"
  >
    <i class="{{icon}}"></i>
  </button>
  `,
  styles: [`
  :host { }

  .square-button-element {
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .5s;
    border-radius: .25rem;
    padding: 3px 5px;
    text-decoration: none;
    background: transparent;
    color: #0d6efd;
    height: 32px;
    width: 32px;

    &:hover {
      background-color: #ddd !important;
    }
  }
  `],
  standalone: false,
})
export class SquareButtonComponent {

  @Input() icon: string = '';

  @Output() clickEvent: EventEmitter<any> = new EventEmitter<any>();

  clickEventHandler(): void {
    this.clickEvent.emit();
  }

}


@NgModule({
  declarations: [SquareButtonComponent],
  imports: [CommonModule],
  exports: [SquareButtonComponent],
})
export class SquareButtonModule { }

