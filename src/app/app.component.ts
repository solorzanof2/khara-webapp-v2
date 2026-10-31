import { Component } from '@angular/core';

@Component({
  selector: 'body[root]',
  template: '<router-outlet></router-outlet>',
  styles: [':host { height: 100%; margin: 0; }'],
  standalone: false,
})
export class AppComponent {
  title = 'tracking-estimation-research-application-webclient';
}
