import { PostService } from './post.service';
import { RestService } from './rest.service';
import { IdentityService } from './identity.service';

describe('PostService update', () => {
  let rest: jasmine.SpyObj<RestService>;
  let service: PostService;
  beforeEach(() => {
    rest = jasmine.createSpyObj('RestService', ['post']);
    const identity = jasmine.createSpyObj('IdentityService', ['getWorkspace']);
    identity.getWorkspace.and.returnValue({ uid: 'workspace-1' });
    service = new PostService(rest, identity);
  });
  for (const type of ['insight', 'comment'] as const) {
    it(`envía el contrato de actualización de ${type} sin exigir project`, async () => {
      rest.post.and.resolveTo({ status: 200 });
      await (type === 'insight' ? service.updateInsight('Texto', 'reply-1', 'parent-1') : service.updateComment('Texto', 'reply-1', 'parent-1'));
      expect(rest.post).toHaveBeenCalledOnceWith(`v1/posts/${type === 'insight' ? 'insights' : 'comments'}/update`, {
        content: 'Texto', replyUid: 'reply-1', parentUid: 'parent-1', workspaceUid: 'workspace-1',
      });
    });
    it(`propaga errores al actualizar ${type}`, async () => {
      for (const status of [400, 403, 404, 500]) {
        rest.post.and.resolveTo({ status });
        await expectAsync(type === 'insight' ? service.updateInsight('Texto', 'reply', 'parent') : service.updateComment('Texto', 'reply', 'parent')).toBeRejected();
      }
    });
  }

  it('envía el contrato esperado por UpdatePostHandler', async () => {
    rest.post.and.resolveTo({ status: 200 });
    await service.update('**Markdown**', 'post-1', 'project-1');
    expect(rest.post).toHaveBeenCalledOnceWith('v1/posts/update', {
      content: '**Markdown**', postUid: 'post-1', projectUid: 'project-1', workspaceUid: 'workspace-1',
    });
  });
  it('rechaza respuestas de error de la API', async () => {
    for (const status of [400, 404, 403, 500]) {
      rest.post.and.resolveTo({ status });
      await expectAsync(service.update('texto', 'post-1', 'project-1')).toBeRejected();
    }
  });
});
