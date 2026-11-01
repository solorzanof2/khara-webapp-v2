import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TimelineComponent } from '../../../commons/components/timeline';
import { PostEditorComponent } from '../../../commons/components/post-editor';
import { BasePostDTO, FullPostDTO, InsightPostDTO } from '../../../commons/models/interfaces/responses/post.response';
import { NotificationService } from '../../../commons/services/notification.service';
import { PostService } from '../../../commons/services/post.service';
import { PostSingleComponent } from './post-single.component';

describe('PostSingleComponent', () => {
  let component: PostSingleComponent;
  let postService: jasmine.SpyObj<PostService>;
  let notifications: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    postService = jasmine.createSpyObj<PostService>('PostService', [
      'fetchPostByUid', 'fetchAllPaginatedByUserUid', 'saveComment', 'saveInsight',
    ]);
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', ['showError', 'showWarning', 'show']);
    component = new PostSingleComponent(
      jasmine.createSpyObj<Router>('Router', ['navigate']),
      notifications,
      { params: of({ ref: 'post-uid' }) } as unknown as ActivatedRoute,
      postService,
    );
    component.timeline = jasmine.createSpyObj<TimelineComponent>('TimelineComponent', ['complete']);
    component.editor = { source: 'Borrador' } as PostEditorComponent;
  });

  it('ignores timeline load events while the post is still loading', async () => {
    let resolvePost!: (post: FullPostDTO) => void;
    postService.fetchPostByUid.and.returnValue(new Promise(resolve => { resolvePost = resolve; }));

    const loading = component.fetchData();
    expect(component.hasPosts).toBeFalse();
    component.timelineNextEventHandler();
    expect(notifications.showError).not.toHaveBeenCalled();
    expect(postService.fetchAllPaginatedByUserUid).not.toHaveBeenCalled();

    resolvePost({ comments: [], insights: [] } as unknown as FullPostDTO);
    await loading;
    expect(component.timeline.complete).toHaveBeenCalled();
  });

  for (const missingValue of [undefined, null]) {
    it(`renders an empty timeline when the response collections are ${missingValue}`, async () => {
      postService.fetchPostByUid.and.resolveTo({
        uid: 'post-uid', comments: missingValue, insights: missingValue,
      } as unknown as FullPostDTO);

      await component.fetchData();

      expect(component.post.uid).toBe('post-uid');
      expect(component.post.comments).toEqual([]);
      expect(component.post.insights).toEqual([]);
      expect(component.hasPosts).toBeFalse();
      expect(component.posts).toEqual([]);
      expect(component.timeline.complete).toHaveBeenCalled();
      expect(notifications.showError).not.toHaveBeenCalled();
    });
  }

  it('preserves comments and insights in the mapped timeline', async () => {
    const comment = { uid: 'comment-uid' } as BasePostDTO;
    const insight = { uid: 'insight-uid' } as InsightPostDTO;
    postService.fetchPostByUid.and.resolveTo({
      comments: [comment], insights: [insight],
    } as FullPostDTO);

    await component.fetchData();

    expect(component.hasPosts).toBeTrue();
    expect(component.posts).toEqual([comment, insight]);
    expect(component.timeline.complete).toHaveBeenCalled();
    expect(notifications.showError).not.toHaveBeenCalled();
  });

  it('replaces the timeline on repeated loads without requesting unrelated user posts', async () => {
    postService.fetchPostByUid.and.resolveTo({ comments: [{ uid: 'one' }], insights: [] } as unknown as FullPostDTO);
    await component.fetchData();
    await component.fetchData();
    component.timelineNextEventHandler();
    expect(component.posts.length).toBe(1);
    expect(postService.fetchAllPaginatedByUserUid).not.toHaveBeenCalled();
  });

  for (const type of ['comment', 'insight'] as const) {
    it(`saves a ${type}, updates the timeline and counter, and clears the editor`, async () => {
      component.loading = false;
      component.post = { uid: 'post-uid', comments: [], insights: [], totalComments: 0, totalInsights: 0 } as unknown as FullPostDTO;
      component.publicationType = type;
      const created = { uid: 'new', created: 123, type } as InsightPostDTO;
      postService.saveComment.and.resolveTo(created);
      postService.saveInsight.and.resolveTo(created);

      await component.saveEventHandler('Hola');

      expect(type === 'comment' ? postService.saveComment : postService.saveInsight).toHaveBeenCalledOnceWith('Hola', 'post-uid');
      expect(type === 'comment' ? postService.saveInsight : postService.saveComment).not.toHaveBeenCalled();
      expect(component.posts).toEqual([created]);
      expect(type === 'comment' ? component.post.totalComments : component.post.totalInsights).toBe(1);
      expect(component.editor.source).toBe('');
      expect(component.saving).toBeFalse();
    });
  }

  it('preserves the draft and timeline when saving fails', async () => {
    component.loading = false;
    component.post = { uid: 'post-uid', comments: [], insights: [] } as unknown as FullPostDTO;
    postService.saveComment.and.rejectWith(new Error('Falló el guardado'));
    await component.saveEventHandler('Borrador');
    expect(component.editor.source).toBe('Borrador');
    expect(component.posts).toEqual([]);
    expect(component.saving).toBeFalse();
    expect(notifications.showError).toHaveBeenCalledWith('Falló el guardado');
  });

  it('rejects blank content and ignores duplicate submissions while saving', async () => {
    component.loading = false;
    component.post = { uid: 'post-uid', comments: [], insights: [] } as unknown as FullPostDTO;
    await component.saveEventHandler('   ');
    expect(notifications.showWarning).toHaveBeenCalled();
    expect(postService.saveComment).not.toHaveBeenCalled();

    let resolveSave!: (post: BasePostDTO) => void;
    postService.saveComment.and.returnValue(new Promise(resolve => { resolveSave = resolve; }));
    const saving = component.saveEventHandler('Borrador');
    await component.saveEventHandler('Borrador');
    expect(postService.saveComment).toHaveBeenCalledTimes(1);
    resolveSave({ uid: 'new' } as BasePostDTO);
    await saving;
  });
});
