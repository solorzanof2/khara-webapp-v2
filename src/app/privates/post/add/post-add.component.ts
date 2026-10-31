import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../commons/services/notification.service';
import { PostService } from '../../../commons/services/post.service';
import { FullPostDTO } from '../../../commons/models/interfaces/responses/post.response';
// import { StacksEditor } from "@stackoverflow/stacks-editor";

@Component({
  selector: 'app-post-add',
  templateUrl: './post-add.component.html',
  styleUrls: ['./post-add.component.scss'],
  standalone: false,
})
export class PostAddComponent implements OnInit {

  uidReference = '';
  projectUidReference = '';
  content = '';

  get isEdition(): boolean {
    return (!!this.uidReference);
  }

  post!: FullPostDTO;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private postService: PostService,
  ) {
    this.activatedRoute.queryParams.subscribe(query => {
      const uidReference = query['ref'];
      const projectUidReference = query['pref'];

      if (!uidReference && !projectUidReference) {
        return;
      }

      this.uidReference = uidReference;
      this.projectUidReference = projectUidReference;
    });
  }

  ngOnInit(): void {
    (async () => {
      if (this.isEdition) {
        await this.fetchPostContent();
      }
    })();
  }

  // #region DATA LOADERS

  async fetchPostContent(): Promise<void> {
    try {
      const content = await this.postService.fetchPostByUid(this.uidReference);

      this.content = content.rawContent;
      this.post = content;
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      return Promise.resolve();
    }
  }

  // #endregion DATA LOADERS

  // #region EVENTS

  saveEventHandler(value: string): void {
    (async () => {
      if (!value) {
        this.notificationService.showWarning('No se puede enviar una publicación en blanco.');
        return;
      }

      if (this.isEdition) {
        await this.updateData(value);
        return;
      }

      await this.saveData(value);
      this.router.navigate([
        'webapp', 'projects', 'timeline', this.projectUidReference,
      ]);
    })();
  }

  async saveData(value: string): Promise<void> {
    try {
      await this.postService.save(value, this.projectUidReference);
      await this.notificationService.show('Publicación almacenada.');
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      return Promise.resolve();
    }
  }

  async updateData(value: string): Promise<void> {
    try {
      await this.postService.update(value, this.uidReference);
      await this.notificationService.show('Publicación actualizada.');
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      return Promise.resolve();
    }
  }

  // #endregion EVENTS


}

