import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PrivateRoutingModule } from './private-routing.module';
import { PrivateLayoutComponent } from './layout/private-layout.component';
import { PrivateHeaderComponent } from './layout/private-header.component';
import { PrivateFooterComponent } from './layout/private-footer.component';
// import { MenubarModule } from 'primeng/menubar';
// import { PrivateSidebarComponent } from './layout/private-sidebar.component';


@NgModule({
  declarations: [
    PrivateLayoutComponent,
    PrivateHeaderComponent,
    PrivateFooterComponent,
    // PrivateSidebarComponent,
  ],
  imports: [
    CommonModule,
    PrivateRoutingModule,
    // MenubarModule,
  ],
  providers: [],
})
export class PrivateModule { }

