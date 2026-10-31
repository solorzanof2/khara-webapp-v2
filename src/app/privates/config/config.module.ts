import { NgModule } from '@angular/core';
import { ConfigComponent } from './config.component';
import { ConfigUserComponent } from './user/config-user.component';
import { ConfigBasicComponent } from './basic/config-basic.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SimpleCardModule } from '../../commons/components/simple-card';
// import { MegaMenuModule } from 'primeng/megamenu';


@NgModule({
  declarations: [
    ConfigComponent,
    ConfigBasicComponent,
    ConfigUserComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ConfigComponent,
        children: [
          {
            path: '',
            component: ConfigBasicComponent,
          },
          {
            path: 'users',
            component: ConfigUserComponent,
          },
        ],
      },
    ]),
    FormsModule,
    ReactiveFormsModule,
    SimpleCardModule,
    // MegaMenuModule,
  ],
  providers: [],
})
export class ConfigModule { }

