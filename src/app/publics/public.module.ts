import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PublicRoutingModule } from './public-routing.module';
// import { PublicLayoutComponent } from './layout/public-layout.component';
// import { PublicHeaderComponent } from './layout/public-header.component';
// import { PublicFooterComponent } from './layout/public-footer.component';


@NgModule({
  declarations: [
    // PublicLayoutComponent,
    // PublicHeaderComponent,
    // PublicFooterComponent,
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
  ],
})
export class PublicModule { }

