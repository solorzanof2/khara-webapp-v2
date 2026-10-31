import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';


@Component({
  selector: 'app-hinttext',
  template: `
  <section class="hinttext-element">
    <p
      class="hinttext-message {{severity}}"
    ><span class="material-icons">{{icon}}</span>{{caption}}</p>
  </section>
  `,
  styles: [`
:host {
  --hinttext-font-size: 12px;
  --hinttext-font-color: var(--color-medium);
}

.hinttext-element {

  .hinttext-message {
    display: grid;
    grid-template-columns: 5% 95%;
    font-size: var(--hinttext-font-size);
    align-items: center;
    color: var(--hinttext-font-color);

    .material-icons {
      font-size: var(--hinttext-font-size);
    }

    &.danger {
      --hinttext-font-color: var(--color-danger);
    }

    &.warning {
      --hinttext-font-color: var(--color-warning);
    }

    &.info {
      --hinttext-font-color: var(--color-secondary);
    }

    &.success {
      --hinttext-font-color: var(--color-success);
    }
  }
}
  `],
  standalone: false,
})
export class HinttextComponent {

  @Input() source: HinttextOptions = {
    caption: 'Hinttext is Online!',
    icon: 'info',
    severity: 'info',
  };

  get caption(): string {
    return this.source.caption;
  }

  get icon(): string {
    return this.source.icon;
  }

  get severity(): string {
    return this.source.severity;
  }

  constructor() { }

}


export interface HinttextOptions {
  caption: string;
  icon: string;
  severity: string;
}


@NgModule({
  declarations: [
    HinttextComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    HinttextComponent,
  ],
})
export class HinttextModule { }

