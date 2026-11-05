import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../commons/services/notification.service';
import { BasePostDTO, FullPostDTO } from '../../../commons/models/interfaces/responses/post.response';
import { PostService } from '../../../commons/services/post.service';
import { TimelineComponent } from '../../../commons/components/timeline';
import { PostEditModalComponent } from '../../../commons/components/post-edit-modal';
import { PostEditorComponent } from '../../../commons/components/post-editor';

@Component({
  selector: 'app-post-single',
  templateUrl: './post-single.component.html',
  styleUrls: ['./post-single.component.scss'],
  standalone: false,
})
export class PostSingleComponent implements OnInit, OnDestroy {
  @ViewChild(TimelineComponent) timeline!: TimelineComponent;
  @ViewChild(PostEditorComponent) editor!: PostEditorComponent;
  @ViewChild(PostEditModalComponent) postEditModal!: PostEditModalComponent;
  saving = false;
  loading = true;
  reference = '';
  post: FullPostDTO = { childs: [] } as unknown as FullPostDTO;
  posts: BasePostDTO[] = [];
  private routeSubscription?: Subscription;
  private loadVersion = 0;
  private destroyed = false;

  get hasPosts(): boolean { return !!this.posts.length; }

  constructor(
    private location: Location,
    private router: Router,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.activatedRoute.params.subscribe(params => {
      const reference = params['ref'];
      if (!reference) { this.location.back(); return; }
      this.reference = reference;
      this.post = { childs: [] } as unknown as FullPostDTO;
      this.posts = [];
      if (this.editor) this.editor.source = '';
      void this.fetchData();
    });
  }

  async fetchData(): Promise<void> {
    const version = ++this.loadVersion;
    this.loading = true;
    try {
      const post = await this.postService.fetchPostByUid(this.reference);
      if (version !== this.loadVersion) return;
      this.post = { ...post, childs: post.childs ?? [] };
      this.posts = [...this.post.childs].sort((a, b) => b.created - a.created);
      setTimeout(() => this.timeline?.complete(), 300);
      // this.timeline?.complete();
    }
    catch (error: any) {
      if (version === this.loadVersion) this.notificationService.showError(error.message);
    }
    finally {
      if (version === this.loadVersion) this.loading = false;
    }
  }

  backEventHandler(): void { this.location.back(); }

  async saveEventHandler(value: string): Promise<void> {
    if (this.saving || this.loading || !this.post.uid) return;
    if (!value.trim()) {
      this.notificationService.showWarning('No se puede enviar una publicación en blanco.');
      return;
    }
    const parentUid = this.post.uid;
    const projectUid = this.post.project?.uid;
    this.saving = true;
    try {
      await this.postService.save(value, projectUid, parentUid);
      if (this.destroyed || this.reference !== parentUid) return;
      // Creation returns the persisted model; reload to get the public DTO and authors.
      await this.fetchData();
      if (this.reference !== parentUid) return;
      this.editor.source = '';
      this.notificationService.show('Publicación almacenada.');
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
    if (!this.loading) this.timeline?.complete();
  }

  selectedPostEventHandler(post: BasePostDTO): void {
    this.router.navigate(['webapp', 'posts', post.uid]);
  }

  editPostEventHandler(reply: BasePostDTO): void {
    if (this.loading || this.saving || !this.post.project?.uid) return;
    if (!this.post.childs.some(child => child.uid === reply.uid)) return;
    this.postEditModal.open(reply, {
      type: 'post', projectUid: this.post.project.uid, parentUid: this.post.uid,
    });
  }

  async updatedPostEventHandler(): Promise<void> { await this.fetchData(); }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.routeSubscription?.unsubscribe();
    ++this.loadVersion;
  }
}
