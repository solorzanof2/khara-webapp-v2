import { BrickTimeEvent } from '../../../commons/components/brick-time/brick-time';
import { BrickFieldsComponent } from '../../../commons/components/brick-fields/brick-fields';
import { BrickInput } from '../../../commons/models/interfaces/brick';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../commons/services/notification.service';
import { BasePostDTO, FullInsightDTO } from '../../../commons/models/interfaces/responses/post.response';
import { PostService } from '../../../commons/services/post.service';
import { TimelineComponent } from '../../../commons/components/timeline';
import { PostEditModalComponent } from '../../../commons/components/post-edit-modal';
import { PostEditorComponent } from '../../../commons/components/post-editor';
import { PostInsightTypeEvent } from './post-insight-type';

type InsightReplyType = 'insight-comment' | 'insight-brick';

@Component({
  selector: 'app-post-insight',
  templateUrl: './post-insight.component.html',
  styleUrls: ['./post-insight.component.scss'],
  standalone: false,
})
export class PostInsightComponent implements OnInit {
  @ViewChild(BrickFieldsComponent) brickFields?: BrickFieldsComponent;
  publicationError = '';
  brickFieldsInitialized = false;
  @ViewChild(TimelineComponent) timeline!: TimelineComponent;
  @ViewChild(PostEditorComponent) editor!: PostEditorComponent;
  @ViewChild(PostEditModalComponent) postEditModal!: PostEditModalComponent;
  publicationType: InsightReplyType = 'insight-comment';
  saving = false;
  loading = true;

  reference: string = '';
  insight: FullInsightDTO = {} as FullInsightDTO;

  get hasReplies(): boolean {
    return !!(this.insight.comments?.length) || !!(this.insight.bricks?.length);
  }

  replies: BasePostDTO[] = new Array<BasePostDTO>();

  constructor(
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
      const insight = await this.postService.fetchInsightByUid(this.reference);
      this.insight = {
        ...insight,
        comments: insight.comments ?? [],
        bricks: insight.bricks ?? [],
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
    this.replies = [...this.insight.comments, ...this.insight.bricks]
      .sort((a, b) => b.created - a.created);
    this.timeline?.complete();
  }

  // #endregion DATA MAPPERS

  // #region EVENTS

  async saveEventHandler(value: string): Promise<void> {
    if (this.saving || this.loading || !this.insight.uid) {
      return;
    }
    if (!value.trim()) {
      this.notificationService.showWarning('No se puede enviar una publicación en blanco.');
      return;
    }

    let fields: BrickInput = {};
    this.publicationError = '';
    if (this.publicationType === 'insight-brick') {
      try {
        if (!this.brickFields) throw new Error('Completa los datos del brick.');
        fields = this.brickFields.read();
      }
      catch (error: any) { this.publicationError = error.message; return; }
    }
    this.saving = true;
    const type = this.publicationType;
    try {
      if (type === 'insight-brick') {
        const brick = await this.postService.saveInsightBrick(value, this.reference, fields);
        this.insight.bricks = [brick, ...this.insight.bricks];
        this.insight.totalBricks = this.insight.bricks.length;
      }
      else {
        const comment = await this.postService.saveInsightComment(value, this.reference);
        this.insight.comments = [comment, ...this.insight.comments];
        this.insight.totalComments = this.insight.comments.length;
      }
      this.refreshTimeline();
      this.editor.source = '';
      if (type === 'insight-brick') this.brickFields?.reset();
      this.notificationService.show(type === 'insight-brick' ? 'Brick almacenado.' : 'Comentario almacenado.');
    }
    catch (error: any) {
      this.publicationError = error.message;
      this.notificationService.showError(error.message);
    }
    finally {
      this.saving = false;
    }
  }

  editInsightEventHandler(): void {
    if (this.loading || this.saving || !this.insight.uid) return;
    this.postEditModal.open(this.insight, { type: 'insight', parentUid: this.insight.parentUid });
  }

  timelineNextEventHandler(): void {
    // The insight endpoint already returns all insight comments and bricks.
    if (!this.loading) {
      this.timeline?.complete();
    }
  }


  editReplyEventHandler(reply: BasePostDTO): void {
    if (this.loading || this.saving || !this.insight.uid) return;
    // Membership in the parent collections determines the endpoint, not optional DTO metadata.
    const type = this.insight.bricks.some(brick => brick.uid === reply.uid)
      ? 'insight-brick'
      : this.insight.comments.some(comment => comment.uid === reply.uid)
        ? 'insight-comment'
        : undefined;
    if (!type) return;
    this.postEditModal.open(reply, { type, parentUid: this.insight.uid });
  }

  async updatedInsightEventHandler(): Promise<void> {
    await this.fetchData();
  }

  selectionReplyTypeEventHandler(replyTypeEvent: PostInsightTypeEvent): void {
    this.publicationType = replyTypeEvent.value as InsightReplyType;
    if (this.publicationType === 'insight-brick') this.brickFieldsInitialized = true;
    this.publicationError = '';
  }

  async brickTimeEventHandler(event: BrickTimeEvent): Promise<void> {
    if (this.loading || this.saving || !this.insight.bricks.some(row => row.uid === event.brick.uid)) return;
    this.saving = true;
    try {
      const brick = await this.postService.updateBrickTime(event.brick.uid, this.insight.uid, event.action, event.measurementIndex);
      this.insight.bricks = this.insight.bricks.map(row => row.uid === brick.uid ? brick : row);
      this.refreshTimeline();
    }
    catch (error: any) { this.notificationService.showError(error.message); }
    finally { this.saving = false; }
  }

  // #endregion EVENTS

}
