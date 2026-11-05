import { NgModule } from '@angular/core';
import { PostInsightComponent } from './post-insight.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostEditorModule } from '../../../commons/components/post-editor';
import { PostEditModalModule } from '../../../commons/components/post-edit-modal';
import { TimelineModule } from '../../../commons/components/timeline';
import { SanitizeHTMLModule } from '../../../commons/pipes/sanitize-html';
import { PostService } from '../../../commons/services/post.service';


@NgModule({
  declarations: [
    PostInsightComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PostInsightComponent,
      },
    ]),
    PostEditorModule,
    PostEditModalModule,
    TimelineModule,
    SanitizeHTMLModule,
  ],
  providers: [
    PostService,
  ],
})
export class PostInsightModule { }
