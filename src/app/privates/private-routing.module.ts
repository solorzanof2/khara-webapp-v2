import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { PrivateLayoutComponent } from './layout/private-layout.component';


const Routes: Route[] = [
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./home/home.module').then(module => module.HomeModule),
      },
      {
        path:'projects/timeline/:ref',
        loadChildren: () => import('./projects/timeline/projects-timeline.module').then(module => module.ProjectsTimelineModule),
      },
      {
        path: 'projects/form',
        loadChildren: () => import('./projects/form/projects-form.module').then(module => module.ProjectsFormModule),
      },
      // {
      //   path: 'configs',
      //   loadChildren: () => import('./config/config.module').then(module => module.ConfigModule),
      // },
      {
        path: 'posts/add',
        loadChildren: () => import('./post/add/post-add.module').then(module => module.PostAddModule),
      },
      {
        path: 'posts/:ref',
        loadChildren: () => import('./post/single/post-single.module').then(module => module.PostSingleModule),
      },
      {
        path: 'insights/:ref',
        loadChildren: () => import('./post/insight/post-insight.module').then(module => module.PostInsightModule),
      },
    ],
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
  exports: [RouterModule],
})
export class PrivateRoutingModule { }

