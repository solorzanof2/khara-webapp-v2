import { HomeComponent } from './home.component';
import { PostService } from '../../commons/services/post.service';
import { NotificationService } from '../../commons/services/notification.service';
import { PostEditorComponent } from '../../commons/components/post-editor/post-editor';
import { FullPostDTO } from '../../commons/models/interfaces/responses/post.response';
import { PostEditModalComponent } from '../../commons/components/post-edit-modal';
import { Router } from '@angular/router';

describe('HomeComponent publication', () => {
  let component: HomeComponent;
  let posts: jasmine.SpyObj<PostService>;
  let notifications: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    posts = jasmine.createSpyObj('PostService', ['save', 'fetchPostByUid']);
    posts.save.and.resolveTo();
    notifications = jasmine.createSpyObj('NotificationService', ['show', 'showWarning', 'showError']);
    component = new HomeComponent({} as Router, notifications, posts);
    component.postEditor = { source: 'borrador' } as PostEditorComponent;
    spyOn(component, 'fetchData').and.resolveTo();
  });

  it('abre la publicación seleccionada en el modal', () => {
    const open = jasmine.createSpy('open');
    component.postEditModal = { open } as unknown as PostEditModalComponent;
    const selected = { uid: 'post-1', rawContent: '**Original**' } as FullPostDTO;
    component.editPostEventHandler(selected);
    expect(open).toHaveBeenCalledOnceWith(selected);
  });

  it('refresca solo la tarjeta editada y conserva el borrador de publicación', async () => {
    const first = { uid: 'post-1', rawContent: 'Original' } as FullPostDTO;
    const second = { uid: 'post-2' } as FullPostDTO;
    const updated = { ...first, rawContent: 'Editado', htmlContent: '<p>Editado</p>' };
    component.posts = [first, second];
    posts.fetchPostByUid.and.resolveTo(updated);
    await component.updatedPostEventHandler('post-1');
    expect(component.posts).toEqual([updated, second]);
    expect(component.postEditor.source).toBe('borrador');
    expect(component.fetchData).not.toHaveBeenCalled();
  });

  it('publica sin projectUid y limpia el editor tras guardar', async () => {
    await component.savePostEventHandler('Una publicación');
    expect(posts.save).toHaveBeenCalledOnceWith('Una publicación');
    expect(component.postEditor.source).toBe('');
    expect(component.fetchData).toHaveBeenCalledTimes(1);
    expect(component.isPublishing).toBeFalse();
  });

  it('conserva el borrador si falla el guardado', async () => {
    posts.save.and.rejectWith(new Error('falló'));
    await component.savePostEventHandler('Una publicación');
    expect(component.postEditor.source).toBe('borrador');
    expect(component.fetchData).not.toHaveBeenCalled();
    expect(notifications.showError).toHaveBeenCalledWith('falló');
    expect(component.isPublishing).toBeFalse();
  });

  it('rechaza publicaciones vacías', async () => {
    await component.savePostEventHandler('   ');
    expect(posts.save).not.toHaveBeenCalled();
    expect(notifications.showWarning).toHaveBeenCalled();
  });

  it('evita publicaciones duplicadas mientras hay un envío pendiente', async () => {
    let finish!: () => void;
    posts.save.and.returnValue(new Promise<void>(resolve => { finish = resolve; }));
    const pending = component.savePostEventHandler('Una publicación');
    await component.savePostEventHandler('Una publicación');
    expect(posts.save).toHaveBeenCalledTimes(1);
    finish();
    await pending;
  });
});
