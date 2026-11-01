import { PostService } from './post.service';
import { RestService } from './rest.service';
import { IdentityService } from './identity.service';

describe('PostService update', () => {
  let rest: jasmine.SpyObj<RestService>;
  let service: PostService;
  beforeEach(() => {
    rest = jasmine.createSpyObj('RestService', ['post', 'get']);
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

  it('reads an insight through its own endpoint and escapes its UID', async () => {
    const payload = { uid: 'insight' };
    rest.get.and.resolveTo({ status: 200, payload });
    expect(await service.fetchInsightByUid('insight&other=1')).toEqual(payload as any);
    expect(rest.get).toHaveBeenCalledOnceWith('v1/posts/insights/single?ref=insight%26other%3D1');
  });
  for (const type of ['comment', 'brick'] as const) {
    it('creates an insight ' + type + ' through its dedicated route', async () => {
      rest.post.and.resolveTo({ status: 200, payload: { uid: 'child' } });
      const result = type === 'brick' ? await service.saveInsightBrick('Texto', 'insight') : await service.saveInsightComment('Texto', 'insight');
      expect(result.uid).toBe('child');
      expect(rest.post).toHaveBeenCalledOnceWith('v1/posts/insights/' + (type === 'brick' ? 'bricks' : 'comment'), {
        content: 'Texto', parentUid: 'insight', workspaceUid: 'workspace-1',
      });
    });
    it('updates an insight ' + type + ' through its dedicated route', async () => {
      rest.post.and.resolveTo({ status: 200 });
      if (type === 'brick') await service.updateInsightBrick('Texto', 'child', 'insight');
      else await service.updateInsightComment('Texto', 'child', 'insight');
      expect(rest.post).toHaveBeenCalledOnceWith('v1/posts/insights/' + (type === 'brick' ? 'bricks' : 'comment') + '/update', {
        content: 'Texto', replyUid: 'child', parentUid: 'insight', workspaceUid: 'workspace-1',
      });
    });
    it('rejects unsuccessful or empty creation responses for insight ' + type, async () => {
      for (const status of [200, 400, 403, 404, 500]) {
        rest.post.and.resolveTo({ status });
        await expectAsync(type === 'brick' ? service.saveInsightBrick('Texto', 'insight') : service.saveInsightComment('Texto', 'insight')).toBeRejected();
      }
    });
  }

  it('sends structured measurements without composing the description in frontend', async () => {
    rest.post.and.resolveTo({ status: 200, payload: { uid: 'brick' } });
    await service.saveInsightBrick('Texto original', 'insight', { category: 'Testing', duration: { amount: '1,5', unit: 'hours' } });
    expect(rest.post).toHaveBeenCalledOnceWith('v1/posts/insights/bricks', {
      content: 'Texto original', parentUid: 'insight', workspaceUid: 'workspace-1', category: 'Testing', duration: { amount: '1,5', unit: 'hours' },
    });
  });
  it('saves edited brick measurements along with its original description', async () => {
    rest.post.and.resolveTo({ status: 200 });
    await service.updateInsightBrick('Editado', 'brick', 'insight', { category: 'Testing', duration: { amount: 45, unit: 'minutes' } });
    expect(rest.post).toHaveBeenCalledOnceWith('v1/posts/insights/bricks/update', {
      content: 'Editado', replyUid: 'brick', parentUid: 'insight', workspaceUid: 'workspace-1', category: 'Testing', duration: { amount: 45, unit: 'minutes' },
    });
  });
  it('surfaces the server validation message', async () => {
    rest.post.and.resolveTo({ status: 400, payload: 'La duración debe ser positiva.' });
    await expectAsync(service.saveInsightBrick('Texto', 'insight')).toBeRejectedWithError('La duración debe ser positiva.');
  });
  it('sends a report command for a specific measurement without changing the description', async () => {
    const payload = { uid: 'brick' }; rest.post.and.resolveTo({ status: 200, payload });
    expect(await service.updateBrickTime('brick', 'insight', 'report', 1)).toEqual(payload as any);
    expect(rest.post).toHaveBeenCalledOnceWith('v1/posts/insights/bricks/time', {
      replyUid: 'brick', parentUid: 'insight', workspaceUid: 'workspace-1', action: 'report', measurementIndex: 1,
    });
  });
  it('surfaces timer conflicts so the displayed totals are not replaced', async () => {
    rest.post.and.resolveTo({ status: 409, payload: 'El brick cambió en otra sesión.' });
    await expectAsync(service.updateBrickTime('brick', 'insight', 'start')).toBeRejectedWithError('El brick cambió en otra sesión.');
  });
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
