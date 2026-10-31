import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

export const Routes: Route[] = [
  {
    path: 'webapp',
    loadChildren: () => import('./privates/private.module').then(module => module.PrivateModule),
  },
  {
    path: '',
    loadChildren: () => import('./publics/public.module').then(module => module.PublicModule),
  },
];


@NgModule({
  imports: [
    RouterModule.forRoot(Routes, { onSameUrlNavigation: 'reload' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }


