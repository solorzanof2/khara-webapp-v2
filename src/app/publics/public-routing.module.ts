import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
// import { PublicLayoutComponent } from './layout/public-layout.component';


const Routes: Route[] = [
  // {
  //   path: '',
  //   component: PublicLayoutComponent,
  //   children: [
  //     {
  //       path: '',
  //       loadChildren: () => import('./home/home.module').then(module => module.PublicHomeModule),
  //     },
  //     {
  //       path: 'login',
  //       loadChildren: () => import('./login/login.module').then(module => module.LoginModule),
  //     },
  //     {
  //       path: 'products',
  //       loadChildren: () => import('./product-profile/product.module').then(module => module.ProductModule),
  //     }
  //   ],
  // },
  {
    path: '',
    loadChildren: () => import('./login/login.module').then(module => module.LoginModule),
  },
  {
    path: 'signup',
    loadChildren: () => import('./signup/signup.module').then(module => module.SignupModule),
  },
  {
    path: '**',
    redirectTo: '',
  },
];


@NgModule({
  imports: [
    RouterModule.forChild(Routes),
  ],
  exports: [RouterModule]
})
export class PublicRoutingModule { }

