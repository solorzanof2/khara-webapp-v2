import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { TimelineComponent } from '../../../commons/components/timeline';
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
      'fetchPostByUid', 'fetchAllPaginatedByUserUid',
    ]);
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', ['showError']);
    component = new PostSingleComponent(
      jasmine.createSpyObj<Router>('Router', ['navigate']),
      notifications,
      { params: of({ ref: 'post-uid' }) } as unknown as ActivatedRoute,
      postService,
    );
    component.timeline = jasmine.createSpyObj<TimelineComponent>('TimelineComponent', ['complete']);
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
});
