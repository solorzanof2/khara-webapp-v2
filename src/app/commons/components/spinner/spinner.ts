import { CommonModule } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';


@Component({
  selector: 'app-spinner',
  template: `
  <section id="app-spinner">
    <ng-container *ngIf="toggle; else contentTemplate">

      <!-- <ng-container *ngIf="native; else brandingTemplate"> -->
      <ng-container>
        <div class="spinner-wrapper">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="spinner-message">
            {{message}}
          </div>
        </div>
      </ng-container>
      <!-- <ng-template #brandingTemplate>
        <div id="brading-spinner">
          <img src="assets/images/loader-p360-inicio.gif" alt="Pagos360...">
        </div>
      </ng-template> -->

    </ng-container>
    <ng-template #contentTemplate>
      <ng-content></ng-content>
    </ng-template>
  </section>
  `,
  styles: [`
  #app-spinner {

    .spinner-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;

      .spinner-message {
        margin-top: 8px;
      }
    }
  }
  `],
  standalone: false,
})
export class SpinnerComponent {

  @Input() native: boolean = false;

  @Input() toggle: boolean = true;

  @Input() message: string = '';

}


@NgModule({
  declarations: [
    SpinnerComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    SpinnerComponent,
  ],
})
export class SpinnerModule { }

