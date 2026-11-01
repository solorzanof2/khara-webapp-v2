import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../commons/services/notification.service';
import { BasePostDTO, FullPostDTO } from '../../../commons/models/interfaces/responses/post.response';
import { PostService } from '../../../commons/services/post.service';
import { TimelineComponent } from '../../../commons/components/timeline';
import { PostEditModalComponent } from '../../../commons/components/post-edit-modal';
import { PostEditorComponent } from '../../../commons/components/post-editor';
import { PostTypeEvent } from './post-type';

type PostType = 'comment' | 'insight';

@Component({
  selector: 'app-post-single',
  templateUrl: './post-single.component.html',
  styleUrls: ['./post-single.component.scss'],
  standalone: false,
})
export class PostSingleComponent implements OnInit {
  @ViewChild(TimelineComponent) timeline!: TimelineComponent;
  @ViewChild(PostEditorComponent) editor!: PostEditorComponent;
  @ViewChild(PostEditModalComponent) postEditModal!: PostEditModalComponent;
  publicationType: PostType = 'comment';
  saving = false;
  loading = true;

  reference: string = '';
  post: FullPostDTO = {} as FullPostDTO;

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
    this.loading = true;
    try {
      const post = await this.postService.fetchPostByUid(this.reference);
      this.post = {
        ...post,
        comments: post.comments ?? [],
        insights: post.insights ?? [],
      };
      this.refreshTimeline();
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      this.loading = false;
    }
  }

  // #endregion DATALOADERS

  // #region DATA MAPPERS

  private refreshTimeline(): void {
    this.posts = [...this.post.comments, ...this.post.insights]
      .sort((a, b) => b.created - a.created);
    this.timeline?.complete();
  }

  // #endregion DATA MAPPERS

  // #region EVENTS

  async saveEventHandler(value: string): Promise<void> {
    if (this.saving || this.loading || !this.post.uid) {
      return;
    }
    if (!value.trim()) {
      this.notificationService.showWarning('No se puede enviar una publicación en blanco.');
      return;
    }

    this.saving = true;
    const type = this.publicationType;
    try {
      if (type === 'insight') {
        const insight = await this.postService.saveInsight(value, this.reference);
        this.post.insights = [insight, ...this.post.insights];
        this.post.totalInsights = this.post.insights.length;
      }
      else {
        const comment = await this.postService.saveComment(value, this.reference);
        this.post.comments = [comment, ...this.post.comments];
        this.post.totalComments = this.post.comments.length;
      }
      this.refreshTimeline();
      this.editor.source = '';
      this.notificationService.show(type === 'insight' ? 'Insight almacenado.' : 'Comentario almacenado.');
    }
    catch (error: any) {
      this.notificationService.showError(error.message);
    }
    finally {
      this.saving = false;
    }
  }

  editClickEventHandler(post: FullPostDTO): void {
    if (this.loading || this.saving || !post.uid) return;
    this.postEditModal.open(post);
  }

  timelineNextEventHandler(): void {
    // The single-post endpoint already returns all comments and insights.
    if (!this.loading) {
      this.timeline?.complete();
    }
  }

  selectedPostEventHandler(post: FullPostDTO): void {
    this.router.navigate([
      'webapp', 'insights', post.uid,
    ]);
  }

  editPostEventHandler(reply: BasePostDTO): void {
    if (this.loading || this.saving || !this.post.uid) return;
    // Membership in the parent collections determines the endpoint, not optional DTO metadata.
    const type = this.post.insights.some(insight => insight.uid === reply.uid)
      ? 'insight'
      : this.post.comments.some(comment => comment.uid === reply.uid)
        ? 'comment'
        : undefined;
    if (!type) return;
    this.postEditModal.open(reply, { type, parentUid: this.post.uid });
  }

  async updatedPostEventHandler(): Promise<void> {
    await this.fetchData();
  }

  selectionPostTypeEventHandler(postTypeEvent: PostTypeEvent): void {
    this.publicationType = postTypeEvent.value as PostType;
  }

  // #endregion EVENTS

}

