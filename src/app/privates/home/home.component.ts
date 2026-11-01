import { Component, OnInit, ViewChild } from '@angular/core';
import { PostService } from '../../commons/services/post.service';
import { TimelineComponent } from '../../commons/components/timeline';
import { PaginatedResponse } from '../../commons/models/interfaces/responses/api.response';
import { FullPostDTO } from '../../commons/models/interfaces/responses/post.response';
import { Router } from '@angular/router';
import { PostEditorComponent } from '../../commons/components/post-editor/post-editor';
import { PostEditModalComponent } from '../../commons/components/post-edit-modal';
import { NotificationService } from '../../commons/services/notification.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
export class HomeComponent implements OnInit {
  private readonly DefaultPerPage: number = 10;

  @ViewChild(TimelineComponent) timeline!: TimelineComponent;

  @ViewChild(PostEditorComponent) postEditor!: PostEditorComponent;

  @ViewChild(PostEditModalComponent) postEditModal!: PostEditModalComponent;

  isPublishing = false;

  pagination: PaginatedResponse<FullPostDTO> = {
    collection: new Array<FullPostDTO>(),
    hasNext: false,
    hasPrevious: false,
    length: 0,
    page: 0,
    perPage: 0,
    totalPages: 0,
    totalRows: 0,
  } as PaginatedResponse<FullPostDTO>;

  private currentPage: number = 0;

  posts: FullPostDTO[] = new Array<FullPostDTO>();

  get hasPosts(): boolean {
    return !!(this.posts.length);
  }

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private postService: PostService,
  ) { }

  ngOnInit(): void {
    (async () => {
      await this.fetchData();
    })();
  }

  // #region DATA LOADERS

  async fetchData(): Promise<void> {
    try {
      this.pagination = await this.postService.fetchAllPaginatedByUserUid(this.currentPage, this.DefaultPerPage);
      this.mapNewPosts(this.pagination.collection);
      this.nextPage();
      this.timeline.complete();
    }
    catch (error: any) {
      await this.notificationService.showError(error.message);
    }
    finally {
      return Promise.resolve();
    }
  }

  // #endregion DATA LOADERS

  // #region DATA MAPPERS

  mapNewPosts(collection: FullPostDTO[]): void {
    let post: FullPostDTO;
    for (post of collection) {
      this.posts.push(post);
    }
  }

  nextPage(): void {
    this.currentPage += 1;
  }

  resetPage(): void {
    this.currentPage = 0;
  }

  // #endregion DATA MAPPERS

  // #region EVENTS

  timelineNextEventHandler(): void {
    (async () => {
      try {
        if (!this.hasPosts) {
          return;
        }

        if (this.currentPage > this.pagination.totalRows) {
          this.timeline.complete();
          return;
        }

        this.pagination = await this.postService.fetchAllPaginatedByUserUid(this.currentPage, this.DefaultPerPage);
        this.nextPage();
        this.mapNewPosts(this.pagination.collection);

        return Promise.resolve();
      }
      catch (error: any) {
        this.notificationService.showError(error.message);
      }
    })();
  }

  async savePostEventHandler(value: string): Promise<void> {
    if (this.isPublishing) {
      return;
    }

    if (!value.trim()) {
      this.notificationService.showWarning('No se puede enviar una publicación en blanco.');
      return;
    }

    this.isPublishing = true;
    try {
      await this.postService.save(value);
      this.postEditor.source = '';
      this.notificationService.show('Publicación almacenada.');
      this.resetPage();
      this.posts = [];
      await this.fetchData();
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      this.isPublishing = false;
    }
  }

  selectedPostEventHandler(post: FullPostDTO): void {
    this.router.navigate([
      'webapp', 'posts', post.uid,
    ]);
  }

  editPostEventHandler(post: FullPostDTO): void {
    this.postEditModal.open(post);
  }

  async updatedPostEventHandler(uid: string): Promise<void> {
    try {
      console.log({homeComponentPostUid: uid});
      const updated = await this.postService.fetchPostByUid(uid);
      this.posts = this.posts.map(post => post.uid === uid ? updated : post);
    }
    catch (error: any) {
      this.notificationService.showError('La publicación se guardó, pero no se pudo refrescar: ' + error.message);
    }
  }

  // #endregion EVENTS

}
