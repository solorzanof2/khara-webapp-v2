import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../commons/services/post.service';
import { TimelineModule } from '../../commons/components/timeline';
// import { ProjectService } from '../../commons/services/project.service';
import { SquareButtonModule } from '../../commons/components/square-button';
import { PostEditorModule } from '../../commons/components/post-editor';


@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
    ]),
    TimelineModule,
    SquareButtonModule,
    PostEditorModule,
  ],
  providers: [
    PostService,
    // ProjectService,
  ],
})
export class HomeModule { }

