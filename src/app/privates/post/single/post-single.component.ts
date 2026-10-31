import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../commons/services/notification.service';
import { BasePostDTO, FullPostDTO } from '../../../commons/models/interfaces/responses/post.response';
import { PostService } from '../../../commons/services/post.service';
import { TimelineComponent } from '../../../commons/components/timeline';
import { PaginatedResponse } from '../../../commons/models/interfaces/responses/api.response';


@Component({
  selector: 'app-post-single',
  templateUrl: './post-single.component.html',
  styleUrls: ['./post-single.component.scss'],
  standalone: false,
})
export class PostSingleComponent implements OnInit {
  private readonly DefaultPerPage: number = 10;

  @ViewChild(TimelineComponent) timeline!: TimelineComponent;

  pagination: PaginatedResponse<BasePostDTO> = {
    collection: new Array<BasePostDTO>(),
    hasNext: false,
    hasPrevious: false,
    length: 0,
    page: 0,
    perPage: 0,
    totalPages: 0,
    totalRows: 0,
  } as PaginatedResponse<BasePostDTO>;

  reference: string = '';
  post: FullPostDTO = {} as FullPostDTO;

  private currentPage: number = 0;

  comments: BasePostDTO[] = new Array<BasePostDTO>();
  insights: BasePostDTO[] = new Array<BasePostDTO>();

  get hasPosts(): boolean {
    return !!(this.post.comments?.length) || !!(this.post.insights?.length);
  }

  posts: BasePostDTO[] = new Array<BasePostDTO>();

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
  ) {
    this.activatedRoute.params.subscribe(params => {
      const reference = params['ref'];

      if (!reference) {
        history.back();
        return;
      }

      this.reference = reference;
    });
  }

  ngOnInit(): void {
    (async () => {
      await this.fetchData();
    })();
  }

  // #region DATALOADERS

  async fetchData(): Promise<void> {
    try {
      const post = await this.postService.fetchPostByUid(this.reference);
      this.post = {
        ...post,
        comments: post.comments ?? [],
        insights: post.insights ?? [],
      };
      const collection = [...this.post.comments, ...this.post.insights];
      this.mapNewPosts(collection as BasePostDTO[]);
      this.nextPage();
      this.timeline.complete();
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      return Promise.resolve();
    }
  }

  // #endregion DATALOADERS

  // #region DATA MAPPERS

  mapNewPosts(collection: BasePostDTO[]): void {
    let post: BasePostDTO;
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

  editClickEventHandler(post: FullPostDTO): void {
    this.router.navigate(['webapp', 'posts', 'add'], {
      queryParams: {
        ref: this.reference,
      },
    });
  }

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

  selectedPostEventHandler(post: FullPostDTO): void {
    this.router.navigate([
      'webapp', 'posts', post.uid,
    ]);
  }

  editPostEventHandler(post: FullPostDTO): void {
    this.router.navigate(['webapp', 'posts', 'add'], {
      queryParams: {
        ref: post.uid,
      },
    });
  }

  // #endregion EVENTS

}

