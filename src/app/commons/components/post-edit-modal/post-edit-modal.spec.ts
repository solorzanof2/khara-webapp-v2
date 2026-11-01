import { ChangeDetectorRef, ElementRef } from '@angular/core';
import { PostEditModalComponent } from './post-edit-modal';
import { BasePostDTO, FullPostDTO } from '../../models/interfaces/responses/post.response';
import { PostService } from '../../services/post.service';
import { NotificationService } from '../../services/notification.service';

describe('PostEditModalComponent', () => {
  let component: PostEditModalComponent;
  let posts: jasmine.SpyObj<PostService>;
  let modal: { show: jasmine.Spy; hide: jasmine.Spy; dispose: jasmine.Spy };
  let element: HTMLDivElement;
  let changes: jasmine.SpyObj<ChangeDetectorRef>;
  const selected = { uid: 'post-1', rawContent: '**Original**', project: { uid: 'project-1' } } as FullPostDTO;

  beforeEach(() => {
    element = document.createElement('div');
    modal = jasmine.createSpyObj('Modal', ['show', 'hide', 'dispose']);
    modal.hide.and.callFake(() => {
      if (element.dispatchEvent(new Event('hide.bs.modal', { cancelable: true }))) {
        element.dispatchEvent(new Event('hidden.bs.modal'));
      }
    });
    const doc = { defaultView: { bootstrap: { Modal: function () { return modal; } } }, activeElement: null } as unknown as Document;
    posts = jasmine.createSpyObj('PostService', ['update', 'updateInsight', 'updateComment']);
    posts.update.and.resolveTo();
    posts.updateInsight.and.resolveTo();
    posts.updateComment.and.resolveTo();
    changes = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);
    const notifications = jasmine.createSpyObj('NotificationService', ['show', 'showError']);
    component = new PostEditModalComponent(doc, changes, posts, notifications);
    component.modalElement = new ElementRef(element);
  });
  afterEach(() => component.ngOnDestroy());

  for (const type of ['insight', 'comment'] as const) {
    it(`edita un ${type} sin project usando el padre y su endpoint específico`, async () => {
      const reply = { uid: 'reply-1', rawContent: 'Original' } as BasePostDTO;
      component.open(reply, { type, parentUid: 'parent-1' });
      expect(component.title).toBe(type === 'insight' ? 'Editar insight' : 'Editar comentario');
      spyOn(component.updatedEvent, 'emit');
      await component.save('Editado');
      expect(type === 'insight' ? posts.updateInsight : posts.updateComment).toHaveBeenCalledOnceWith('Editado', 'reply-1', 'parent-1');
      expect(type === 'insight' ? posts.updateComment : posts.updateInsight).not.toHaveBeenCalled();
      expect(posts.update).not.toHaveBeenCalled();
      expect(component.updatedEvent.emit).toHaveBeenCalledOnceWith('reply-1');
      component.open(selected);
      await component.save('Post editado');
      expect(posts.update).toHaveBeenCalledOnceWith('Post editado', 'post-1', 'project-1');
    });
    it(`conserva el editor de ${type} tras un error sin emitir actualización`, async () => {
      const reply = { uid: 'reply-1', rawContent: 'Original' } as BasePostDTO;
      const update = type === 'insight' ? posts.updateInsight : posts.updateComment;
      update.and.rejectWith(new Error('Error al actualizar'));
      component.open(reply, { type, parentUid: 'parent-1' });
      spyOn(component.updatedEvent, 'emit');
      await component.save('Editado');
      expect(component.post).toBe(reply);
      expect(component.errorMessage).toBe('Error al actualizar');
      expect(component.updatedEvent.emit).not.toHaveBeenCalled();
      expect(component.isSaving).toBeFalse();
    });
  }
  it('no abre una respuesta sin padre ni un post sin proyecto', () => {
    component.open({ uid: 'reply-1' } as BasePostDTO, { type: 'comment', parentUid: '' });
    expect(modal.show).not.toHaveBeenCalled();
    component.open({ uid: 'post-1' } as FullPostDTO);
    expect(modal.show).not.toHaveBeenCalled();
  });

  it('carga rawContent y descarta el borrador al cancelar sin modificar la publicación', () => {
    component.open(selected);
    expect(component.post?.rawContent).toBe('**Original**');
    expect(modal.show).toHaveBeenCalled();
    component.close();
    expect(component.post).toBeUndefined();
    expect(posts.update).not.toHaveBeenCalled();
    component.open({ ...selected, uid: 'post-2', rawContent: 'Otro texto' });
    expect(component.post?.rawContent).toBe('Otro texto');
    expect(selected.rawContent).toBe('**Original**');
  });
  it('bloquea doble envío y cierre mientras se guarda y emite la publicación actualizada', async () => {
    let finish!: () => void;
    posts.update.and.returnValue(new Promise<void>(resolve => { finish = resolve; }));
    spyOn(component.updatedEvent, 'emit');
    component.open(selected);
    const pending = component.save('**Editado**');
    await component.save('duplicado');
    component.close();
    expect(element.dispatchEvent(new Event('hide.bs.modal', { cancelable: true }))).toBeFalse();
    expect(component.post).toBe(selected);
    expect(posts.update).toHaveBeenCalledOnceWith('**Editado**', 'post-1', 'project-1');
    finish();
    await pending;
    expect(component.post).toBeUndefined();
    expect(component.updatedEvent.emit).toHaveBeenCalledOnceWith('post-1');
  });
  it('mantiene el editor abierto si falla y permite reintentar', async () => {
    component.open(selected);
    posts.update.and.rejectWith(new Error('Sin conexión'));
    await component.save('Editado');
    expect(component.post).toBe(selected);
    expect(component.errorMessage).toBe('Sin conexión');
    expect(component.isSaving).toBeFalse();
    expect(modal.hide).not.toHaveBeenCalled();
    posts.update.and.resolveTo();
    await component.save('Editado');
    expect(component.post).toBeUndefined();
  });
  it('rechaza contenido en blanco', async () => {
    component.open(selected);
    await component.save('   ');
    expect(posts.update).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('en blanco');
  });
  it('libera el modal al destruir el componente con un envío pendiente', async () => {
    let finish!: () => void;
    posts.update.and.returnValue(new Promise<void>(resolve => { finish = resolve; }));
    spyOn(component.updatedEvent, 'emit');
    component.open(selected);
    const pending = component.save('Editado');
    component.ngOnDestroy();
    expect(modal.hide).toHaveBeenCalled();
    expect(modal.dispose).toHaveBeenCalled();
    finish();
    await pending;
    expect(component.updatedEvent.emit).not.toHaveBeenCalled();
  });
});
