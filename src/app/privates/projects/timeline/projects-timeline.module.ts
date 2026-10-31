import { NgModule } from '@angular/core';
import { ProjectsTimelineComponent } from './projects-timeline.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../../commons/services/post.service';
import { ProjectService } from '../../../commons/services/project.service';
import { TimelineModule } from '../../../commons/components/timeline';


@NgModule({
  declarations: [
    ProjectsTimelineComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProjectsTimelineComponent,
      },
    ]),
    TimelineModule,
  ],
  providers: [
    PostService,
    ProjectService,
  ],
})
export class ProjectsTimelineModule { }

