import { BrickFieldsComponent } from '../../../commons/components/brick-fields/brick-fields';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PostInsightComponent } from './post-insight.component';
import { FullInsightDTO, BasePostDTO } from '../../../commons/models/interfaces/responses/post.response';
import { PostService } from '../../../commons/services/post.service';
import { NotificationService } from '../../../commons/services/notification.service';
import { TimelineComponent } from '../../../commons/components/timeline';
import { PostEditorComponent } from '../../../commons/components/post-editor';
import { PostEditModalComponent } from '../../../commons/components/post-edit-modal';

describe('PostInsightComponent', () => {
  let component: PostInsightComponent;
  let service: jasmine.SpyObj<PostService>;
  let notifications: jasmine.SpyObj<NotificationService>;
  beforeEach(() => {
    service = jasmine.createSpyObj('PostService', ['fetchInsightByUid', 'saveInsightComment', 'saveInsightBrick', 'updateBrickTime']);
    notifications = jasmine.createSpyObj('NotificationService', ['show', 'showError', 'showWarning']);
    component = new PostInsightComponent(notifications, { params: of({ ref: 'insight' }) } as unknown as ActivatedRoute, service);
    component.timeline = jasmine.createSpyObj<TimelineComponent>('Timeline', ['complete']);
    component.editor = { source: 'Borrador' } as PostEditorComponent;
    component.postEditModal = jasmine.createSpyObj<PostEditModalComponent>('Modal', ['open']);
    component.insight = { uid: 'insight', parentUid: 'post', comments: [], bricks: [], totalComments: 0, totalBricks: 0 } as unknown as FullInsightDTO;
    component.brickFields = { read: () => ({ category: 'General', duration: { amount: '1,5', unit: 'hours' } }), reset: jasmine.createSpy('reset') } as unknown as BrickFieldsComponent;
    component.loading = false;
  });
  it('loads the insight, combines its children by date, and keeps the draft during refresh', async () => {
    const comment = { uid: 'comment', created: 10 } as BasePostDTO;
    const brick = { uid: 'brick', created: 20 } as BasePostDTO;
    service.fetchInsightByUid.and.resolveTo({ ...component.insight, comments: [comment], bricks: [brick] });
    await component.updatedInsightEventHandler();
    expect(service.fetchInsightByUid).toHaveBeenCalledOnceWith('insight');
    expect(component.replies).toEqual([brick, comment]);
    expect(component.editor.source).toBe('Borrador');
  });
  it('initializes brick fields only after choosing Brick and retains them when switching back', () => {
    expect(component.brickFieldsInitialized).toBeFalse();
    component.selectionReplyTypeEventHandler({ value: 'insight-brick' });
    expect(component.brickFieldsInitialized).toBeTrue();
    component.selectionReplyTypeEventHandler({ value: 'insight-comment' });
    expect(component.brickFieldsInitialized).toBeTrue();
  });
  it('does not submit invalid brick fields or clear the description', async () => {
    component.publicationType = 'insight-brick';
    spyOn(component.brickFields!, 'read').and.throwError('Duración inválida');
    await component.saveEventHandler('Texto');
    expect(service.saveInsightBrick).not.toHaveBeenCalled();
    expect(component.editor.source).toBe('Borrador');
    expect(component.publicationError).toBe('Duración inválida');
  });
  it('preserves description and fields when publishing a brick fails', async () => {
    component.publicationType = 'insight-brick';
    service.saveInsightBrick.and.rejectWith(new Error('Falló'));
    await component.saveEventHandler('Borrador');
    expect(component.brickFields!.reset).not.toHaveBeenCalled();
    expect(component.editor.source).toBe('Borrador');
    expect(component.publicationError).toBe('Falló');
  });
  it('updates only the targeted brick after a timer action and preserves the editor draft', async () => {
    const original = { uid: 'brick', type: 'insight-brick' } as BasePostDTO;
    const updated = { ...original, category: 'General' };
    component.insight.bricks = [original]; service.updateBrickTime.and.resolveTo(updated);
    await component.brickTimeEventHandler({ brick: original, action: 'finish' });
    expect(service.updateBrickTime).toHaveBeenCalledOnceWith('brick', 'insight', 'finish', undefined);
    expect(component.insight.bricks).toEqual([updated]);
    expect(component.editor.source).toBe('Borrador');
    expect(component.saving).toBeFalse();
  });
  it('keeps the displayed data on a failed timer action', async () => {
    const brick = { uid: 'brick' } as BasePostDTO; component.insight.bricks = [brick];
    service.updateBrickTime.and.rejectWith(new Error('Conflicto'));
    await component.brickTimeEventHandler({ brick, action: 'start' });
    expect(component.insight.bricks).toEqual([brick]);
    expect(notifications.showError).toHaveBeenCalledWith('Conflicto');
  });
  it('normalizes missing child collections', async () => {
    service.fetchInsightByUid.and.resolveTo({ uid: 'insight' } as FullInsightDTO);
    await component.fetchData();
    expect(component.replies).toEqual([]);
    expect(component.hasReplies).toBeFalse();
  });
  for (const type of ['insight-comment', 'insight-brick'] as const) {
    it('creates ' + type + ' through its endpoint and updates its own counter', async () => {
      component.publicationType = type;
      const reply = { uid: 'reply', type, created: 10 } as BasePostDTO;
      const save = type === 'insight-brick' ? service.saveInsightBrick : service.saveInsightComment;
      save.and.resolveTo(reply);
      await component.saveEventHandler('Contenido');
      if (type === 'insight-brick') expect(save).toHaveBeenCalledOnceWith('Contenido', 'insight', { category: 'General', duration: { amount: '1,5', unit: 'hours' } });
      else expect(save).toHaveBeenCalledOnceWith('Contenido', 'insight');
      expect(component.replies).toEqual([reply]);
      expect(component.insight.totalComments).toBe(type === 'insight-comment' ? 1 : 0);
      expect(component.insight.totalBricks).toBe(type === 'insight-brick' ? 1 : 0);
      expect(component.editor.source).toBe('');
      expect(notifications.show).toHaveBeenCalledWith(type === 'insight-brick' ? 'Brick almacenado.' : 'Comentario almacenado.');
    });
    it('edits ' + type + ' using collection membership and the insight UID', () => {
      const reply = { uid: 'reply' } as BasePostDTO;
      component.insight.comments = type === 'insight-comment' ? [reply] : [];
      component.insight.bricks = type === 'insight-brick' ? [reply] : [];
      component.editReplyEventHandler(reply);
      expect(component.postEditModal.open).toHaveBeenCalledOnceWith(reply, { type, parentUid: 'insight' });
    });
  }
  it('edits the main insight using its original post as parent', () => {
    component.editInsightEventHandler();
    expect(component.postEditModal.open).toHaveBeenCalledOnceWith(component.insight, { type: 'insight', parentUid: 'post' });
  });
  it('preserves the draft and collections when saving fails', async () => {
    service.saveInsightComment.and.rejectWith(new Error('Falló'));
    await component.saveEventHandler('Borrador');
    expect(component.editor.source).toBe('Borrador');
    expect(component.replies).toEqual([]);
    expect(component.saving).toBeFalse();
    expect(notifications.showError).toHaveBeenCalledWith('Falló');
  });
  it('prevents duplicate submissions and rejects whitespace', async () => {
    await component.saveEventHandler('   ');
    expect(service.saveInsightComment).not.toHaveBeenCalled();
    let resolve!: (reply: BasePostDTO) => void;
    service.saveInsightComment.and.returnValue(new Promise(done => resolve = done));
    const saving = component.saveEventHandler('Texto');
    await component.saveEventHandler('Texto');
    expect(service.saveInsightComment).toHaveBeenCalledTimes(1);
    resolve({ uid: 'reply' } as BasePostDTO);
    await saving;
  });
});
