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
  it('crea publicaciones raíz con el endpoint genérico', async () => {
    rest.post.and.resolveTo({ status: 200, payload: { uid: 'root' } });
    await service.save('Texto', 'project');
    expect(rest.post).toHaveBeenCalledOnceWith('v1/posts', { content: 'Texto', projectUid: 'project', workspaceUid: 'workspace-1' });
  });
  it('crea un hijo enviando parentUid en el RequestBody', async () => {
    rest.post.and.resolveTo({ status: 200, payload: { uid: 'child' } });
    await service.save('Respuesta', 'project', 'parent');
    expect(rest.post).toHaveBeenCalledOnceWith('v1/posts', { content: 'Respuesta', projectUid: 'project', parentUid: 'parent', workspaceUid: 'workspace-1' });
  });
  it('permite heredar el proyecto del padre', async () => {
    rest.post.and.resolveTo({ status: 200, payload: { uid: 'child' } });
    await service.save('Respuesta', undefined, 'parent');
    expect(rest.post).toHaveBeenCalledOnceWith('v1/posts', { content: 'Respuesta', projectUid: undefined, parentUid: 'parent', workspaceUid: 'workspace-1' });
  });
  it('edita hijos por postUid y valida parentUid usando posts/update', async () => {
    rest.post.and.resolveTo({ status: 200 });
    await service.update('Editado', 'child', 'project', 'parent');
    expect(rest.post).toHaveBeenCalledOnceWith('v1/posts/update', { content: 'Editado', postUid: 'child', projectUid: 'project', parentUid: 'parent', workspaceUid: 'workspace-1' });
  });
  it('lee cualquier Post por el endpoint genérico y codifica el UID', async () => {
    const payload = { uid: 'child', childs: [] };
    rest.get.and.resolveTo({ status: 200, payload });
    expect(await service.fetchPostByUid('child&other=1')).toEqual(payload as any);
    expect(rest.get).toHaveBeenCalledOnceWith('v1/posts/single?ref=child%26other%3D1');
  });
  it('rechaza creaciones fallidas o sin una publicación persistida', async () => {
    for (const status of [200, 400, 403, 404, 500]) {
      rest.post.and.resolveTo({ status });
      await expectAsync(service.save('Respuesta', 'project', 'parent')).toBeRejected();
    }
  });
  it('sends manual timestamps and returns the server record', async () => {
    const payload = { uid: 'brick', attributes: { time: { totals: { label: '1h' } } } };
    rest.post.and.resolveTo({ status: 200, payload });
    const interval = { startedAt: 1000, finishedAt: 3601000 };
    expect(await service.updateBrickTime('brick', 'insight', 'add', undefined, interval)).toEqual(payload as any);
    expect(rest.post).toHaveBeenCalledOnceWith('v1/posts/insights/bricks/time', {
      replyUid: 'brick', parentUid: 'insight', workspaceUid: 'workspace-1', action: 'add', ...interval,
    });
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
