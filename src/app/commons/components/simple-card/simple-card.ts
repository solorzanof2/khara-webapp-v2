import { CommonModule } from '@angular/common';
import { Component, ContentChild, Input, NgModule, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-simple-card',
  template: `
  <section class="sc-element">
    <ng-container *ngIf="!!headerText">
      <ng-container
        *ngTemplateOutlet="
          header || defaultHeaderTemplate
        "
      ></ng-container>
    </ng-container>
    <div class="sc-body">
      <ng-content></ng-content>
    </div>
  </section>
  <ng-template #defaultHeaderTemplate>
    <div class="header">{{headerText}}</div>
  </ng-template>
  `,
  styles: [`
  .sc-element {
    background: rgb(255, 255, 255);
    border-radius: 6px;
    border: 1px solid rgb(219, 214, 225);
    box-shadow: rgb(43 34 51 / 4%) 0px 1px 4px;
    margin-bottom: 16px;
    position: relative;

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: rgb(62, 52, 70);
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      border-bottom: 1px solid rgb(219, 214, 225);
      border-radius: calc(5px) calc(5px) 0px 0px;
      background: rgb(250, 249, 251);
      line-height: 1;
      position: relative;
      padding: 16px;
    }

    .sc-body {

      .sc-row {
        padding: 16px;
        align-items: center;
        display: flex;
        transition: background 0.15s ease 0s;
        border-bottom: 1px solid rgb(235, 230, 239);

        .row-label {
          font-weight: normal;
          margin-bottom: 0px;
          width: 50%;
          padding-right: 10px;
          flex-shrink: 0;

          .label-text {
            display: flex;
            gap: 4px;
            line-height: 16px;
          }

          .label-hinttext {
            font-size: 12px;
            margin-top: 4px;
            line-height: 1.4;
          }
        }

        .row-column {
          display: flex;
          flex: 1 1 0%;
          padding-left: 16px;

          .column-container {
            display: flex;
            flex: 1 1 0%;
            flex-direction: column;
            position: relative;
            max-width: 100%;

            .control-wrapper {
              position: relative;

              .input-trailing-items {
                display: grid;
                grid-auto-flow: column;
                align-items: center;
                gap: 8px;
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                right: 10px;

                .trailing-button {
                  display: flex;
                  padding: 0;
                  border: 0;
                  background: transparent;
                  transition: all .3s;
                  border-radius: 5px;

                  &:hover {
                    background: #dddddd;
                  }
                }
              }
            }
          }
        }

        &.compact-row {
          font-size: 12px !important;
          padding-top: 8px;
          padding-bottom: 8px;
        }
      }
    }
  }
  `],
  host: {
    class: 'simple-card',
  },
  encapsulation: ViewEncapsulation.None,
  standalone: false,
})
export class SimpleCardComponent implements OnInit {

  @Input() headerText: string = '';

  @ContentChild('header') header: TemplateRef<any> | undefined;

  constructor() { }

  ngOnInit(): void { }

}

@NgModule({
  declarations: [SimpleCardComponent],
  imports: [CommonModule],
  exports: [SimpleCardComponent]
})
export class SimpleCardModule { }
