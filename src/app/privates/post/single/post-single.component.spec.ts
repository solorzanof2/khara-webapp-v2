import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { TimelineComponent } from '../../../commons/components/timeline';
import { PostEditModalComponent } from '../../../commons/components/post-edit-modal';
import { PostEditorComponent } from '../../../commons/components/post-editor';
import { BasePostDTO, FullPostDTO } from '../../../commons/models/interfaces/responses/post.response';
import { NotificationService } from '../../../commons/services/notification.service';
import { PostService } from '../../../commons/services/post.service';
import { PostSingleComponent } from './post-single.component';

describe('PostSingleComponent: Posts hijos', () => {
  let component: PostSingleComponent;
  let service: jasmine.SpyObj<PostService>;
  let notifications: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;
  const child = { uid: 'child', created: 20, type: 'post' } as BasePostDTO;
  const full = (childs: BasePostDTO[] = []): FullPostDTO => ({ uid: 'parent', project: { uid: 'project' }, childs, totalChilds: childs?.length ?? 0 } as FullPostDTO);
  beforeEach(() => {
    service = jasmine.createSpyObj('PostService', ['fetchPostByUid', 'save']);
    service.save.and.resolveTo();
    service.fetchPostByUid.and.resolveTo(full());
    notifications = jasmine.createSpyObj('NotificationService', ['showError', 'showWarning', 'show']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    component = new PostSingleComponent(jasmine.createSpyObj<Location>('Location', ['back']), router, notifications, { params: of({ ref: 'parent' }) } as unknown as ActivatedRoute, service);
    component.reference = 'parent';
    component.post = full();
    component.loading = false;
    component.timeline = jasmine.createSpyObj<TimelineComponent>('Timeline', ['complete']);
    component.editor = { source: 'Borrador' } as PostEditorComponent;
    component.postEditModal = jasmine.createSpyObj<PostEditModalComponent>('Modal', ['open']);
  });
  afterEach(() => component.ngOnDestroy());

  it('usa childs y los ordena por fecha sin modificar la colección recibida', fakeAsync(() => {
    const older = { uid: 'older', created: 10 } as BasePostDTO;
    const response = full([older, child]);
    service.fetchPostByUid.and.resolveTo(response);
    void component.fetchData();
    flushMicrotasks();
    tick(300);
    expect(component.posts).toEqual([child, older]);
    expect(response.childs).toEqual([older, child]);
    expect(component.hasPosts).toBeTrue();
    expect(component.timeline.complete).toHaveBeenCalled();
  }));
  for (const missing of [undefined, null]) {
    it('normaliza una colección de hijos vacía: ' + missing, async () => {
      service.fetchPostByUid.and.resolveTo(full(missing as any));
      await component.fetchData();
      expect(component.post.childs).toEqual([]);
      expect(component.posts).toEqual([]);
    });
  }
  it('crea un Post enviando el UID padre y recarga el DTO del servidor', async () => {
    service.fetchPostByUid.and.resolveTo(full([child]));
    await component.saveEventHandler('Respuesta');
    expect(service.save).toHaveBeenCalledOnceWith('Respuesta', 'project', 'parent');
    expect(service.fetchPostByUid).toHaveBeenCalledOnceWith('parent');
    expect(component.posts).toEqual([child]);
    expect(component.post.totalChilds).toBe(1);
    expect(component.editor.source).toBe('');
    expect(notifications.show).toHaveBeenCalledWith('Publicación almacenada.');
    expect(component.saving).toBeFalse();
  });
  it('conserva el borrador cuando falla la creación', async () => {
    service.save.and.rejectWith(new Error('Sin conexión'));
    await component.saveEventHandler('Respuesta');
    expect(component.editor.source).toBe('Borrador');
    expect(service.fetchPostByUid).not.toHaveBeenCalled();
    expect(notifications.showError).toHaveBeenCalledWith('Sin conexión');
    expect(component.saving).toBeFalse();
  });
  it('rechaza blanco y bloquea envíos duplicados', async () => {
    await component.saveEventHandler('   ');
    expect(service.save).not.toHaveBeenCalled();
    let finish!: () => void;
    service.save.and.returnValue(new Promise<void>(resolve => { finish = resolve; }));
    const pending = component.saveEventHandler('Texto');
    await component.saveEventHandler('Duplicado');
    expect(service.save).toHaveBeenCalledTimes(1);
    finish();
    await pending;
  });
  it('abre todos los hijos en el detalle de Posts', () => {
    component.selectedPostEventHandler(child);
    expect(router.navigate).toHaveBeenCalledOnceWith(['webapp', 'posts', 'child']);
  });
  it('edita un hijo con contexto genérico de proyecto y padre', () => {
    component.post = full([child]);
    component.editPostEventHandler(child);
    expect(component.postEditModal.open).toHaveBeenCalledOnceWith(child, { type: 'post', projectUid: 'project', parentUid: 'parent' });
  });
  it('no edita publicaciones ajenas a los hijos del detalle', () => {
    component.editPostEventHandler(child);
    expect(component.postEditModal.open).not.toHaveBeenCalled();
  });
  it('edita el Post principal con el mismo modal', () => {
    component.editClickEventHandler(component.post);
    expect(component.postEditModal.open as jasmine.Spy).toHaveBeenCalledOnceWith(component.post);
  });
  it('recargar tras editar conserva el borrador de una respuesta', async () => {
    await component.updatedPostEventHandler();
    expect(component.editor.source).toBe('Borrador');
  });
  it('recarga al navegar de padre a hijo usando la misma instancia', async () => {
    const params = new Subject<{ ref: string }>();
    component.ngOnDestroy();
    component = new PostSingleComponent({ back() {} } as Location, router, notifications, { params } as unknown as ActivatedRoute, service);
    component.ngOnInit();
    params.next({ ref: 'parent' });
    await Promise.resolve();
    params.next({ ref: 'child' });
    await Promise.resolve();
    expect(service.fetchPostByUid.calls.allArgs()).toEqual([['parent'], ['child']]);
    expect(component.reference).toBe('child');
  });
  it('descarta respuestas tardías de una publicación anterior', async () => {
    let finish!: (post: FullPostDTO) => void;
    service.fetchPostByUid.and.returnValue(new Promise(resolve => { finish = resolve; }));
    const first = component.fetchData();
    component.reference = 'child';
    service.fetchPostByUid.and.resolveTo({ ...full(), uid: 'child' });
    await component.fetchData();
    finish(full());
    await first;
    expect(component.post.uid).toBe('child');
  });
});
