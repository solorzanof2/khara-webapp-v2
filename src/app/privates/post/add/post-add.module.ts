import { NgModule } from '@angular/core';
import { PostAddComponent } from './post-add.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostEditorModule } from '../../../commons/components/post-editor';
import { PostService } from '../../../commons/services/post.service';


@NgModule({
  declarations: [
    PostAddComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PostAddComponent,
      },
    ]),
    PostEditorModule,
  ],
  providers: [
    PostService,
  ],
})
export class PostAddModule { }

