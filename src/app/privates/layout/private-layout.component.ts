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
    :host {
      display: block;
      height: 100vh;
      height: 100dvh;
      overflow: hidden;
    }

    #wrapper, #content-wrapper {
      height: 100%;
      min-height: 0;
    }

    #content-wrapper {
      display: flex;
      flex-direction: column;
    }

    app-private-header {
      flex: 0 0 auto;
      position: relative;
      z-index: 20;
    }

    #content {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
    `,
  ],
  standalone: false,
})
export class PrivateLayoutComponent {

  constructor() { }

}

