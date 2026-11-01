import { NgModule } from '@angular/core';
import { PostSingleComponent } from './post-single.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../../commons/services/post.service';
import { PostEditModalModule } from '../../../commons/components/post-edit-modal';
import { PostEditorModule } from '../../../commons/components/post-editor';
import { TimelineModule } from '../../../commons/components/timeline';
import { SanitizeHTMLModule } from '../../../commons/pipes/sanitize-html';
import { PostTypeComponent } from './post-type';
// import { PostViewerModule } from '../../../commons/components/post-viewer';


@NgModule({
  declarations: [
    PostSingleComponent,
    PostTypeComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PostSingleComponent,
      },
    ]),
    PostEditorModule,
    PostEditModalModule,
    TimelineModule,
    // PostViewerModule,
    SanitizeHTMLModule,
  ],
  providers: [
    PostService,
  ],
})
export class PostSingleModule { }
