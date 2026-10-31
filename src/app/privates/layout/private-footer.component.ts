import { Component } from '@angular/core';


@Component({
  selector: 'app-private-footer',
  template: `
<!-- Footer -->
<footer class="sticky-footer">
  <div class="container my-auto">
    <div class="copyright text-center my-auto">
      <p class="mb-0">Copyright &copy; Your Website 2021 | Versión 0.0.1</p>
    </div>
  </div>
</footer>
<!-- End of Footer -->
  `,
  styles: [
    `
    :host {
      background: #212121;
      color: #fff;
    }

    .sticky-footer {
      position: sticky;
      bottom: 0;
    }
    `,
  ],
  standalone: false,
})
export class PrivateFooterComponent {

  constructor() { }

}

