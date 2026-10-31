import { NgModule } from '@angular/core';
import { ProductProfileComponent } from './product-profile.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LightgalleryModule } from 'lightgallery/angular';
import { CardModule } from 'primeng/card';


@NgModule({
  declarations: [
    ProductProfileComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProductProfileComponent,
      },
    ]),
    GalleriaModule,
    ImageModule,
    FormsModule,
    ReactiveFormsModule,
    LightgalleryModule,
    CardModule,
  ],
  providers: [],
})
export class ProductModule { }

