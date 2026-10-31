import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../commons/services/notification.service';
import { PostService } from '../../../commons/services/post.service';
import { PaginatedResponse } from '../../../commons/models/interfaces/responses/api.response';
import { FullPostDTO } from '../../../commons/models/interfaces/responses/post.response';
import { TimelineComponent } from '../../../commons/components/timeline';
import { Project } from '../../../commons/models/interfaces/responses/project.response';
import { ProjectService } from '../../../commons/services/project.service';


@Component({
  selector: 'app-projects-timeline',
  templateUrl: './projects-timeline.component.html',
  styleUrls: ['./projects-timeline.component.scss'],
  standalone: false,
})
export class ProjectsTimelineComponent implements OnInit {
  private readonly DefaultPerPage: number = 10;

  @ViewChild(TimelineComponent) timeline!: TimelineComponent;

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

  projectReference: string = '';
  project: Project = {} as Project;

  private currentPage: number = 0;

  posts: FullPostDTO[] = new Array<FullPostDTO>();

  get hasPosts(): boolean {
    return !!(this.posts.length);
  }

  get hasProject(): boolean {
    return !!(this.project?.uid);
  }

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private projectService: ProjectService,
  ) {
    this.activatedRoute.params.subscribe(params => {
      const reference = params['ref'];

      if (!reference) {
        this.router.navigate(['webapp']);
        return;
      }

      this.projectReference = reference;
    });
  }

  ngOnInit(): void {
    (async () => {
      await this.fetchData();
    })();
  }

  // #region DATA LOADERS

  async fetchData(): Promise<void> {
    try {
      this.project = await this.projectService.fetchByUid(this.projectReference);
      this.pagination = await this.postService.fetchAllPaginatedByProjectUid(this.projectReference, this.currentPage, this.DefaultPerPage);
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

        this.pagination = await this.postService.fetchAllPaginatedByProjectUid(this.projectReference, this.currentPage, this.DefaultPerPage);
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
      'webapp', 'posts', 'page', post.uid,
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

