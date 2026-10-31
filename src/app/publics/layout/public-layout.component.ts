import { Component } from '@angular/core';


@Component({
  selector: 'app-public-layout',
  template: `
<app-public-header></app-public-header>
<div class="app-public-layout">
  <router-outlet></router-outlet>
</div>
<app-public-footer></app-public-footer>
  `,
  styles: [
    ``,
  ],
  standalone: false,
})
export class PublicLayoutComponent {

  constructor() { }

}

