import { Component } from '@angular/core';


@Component({
  selector: 'app-private-layout',
  template: `
<div id="wrapper">
  <!-- <app-private-sidebar></app-private-sidebar> -->
  <!-- Content Wrapper -->
  <div id="content-wrapper">
    <app-private-header></app-private-header>
    <!-- Main Content -->
    <div id="content">
      <router-outlet></router-outlet>
    </div>
    <!-- <app-private-footer></app-private-footer> -->
  </div>
</div>
  `,
  styles: [
    `
    `,
  ],
  standalone: false,
})
export class PrivateLayoutComponent {

  constructor() { }

}

