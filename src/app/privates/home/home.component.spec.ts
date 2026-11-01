import { HomeComponent } from './home.component';
import { PostService } from '../../commons/services/post.service';
import { NotificationService } from '../../commons/services/notification.service';
import { PostEditorComponent } from '../../commons/components/post-editor/post-editor';
import { Router } from '@angular/router';

describe('HomeComponent publication', () => {
  let component: HomeComponent;
  let posts: jasmine.SpyObj<PostService>;
  let notifications: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    posts = jasmine.createSpyObj('PostService', ['save']);
    posts.save.and.resolveTo();
    notifications = jasmine.createSpyObj('NotificationService', ['show', 'showWarning', 'showError']);
    component = new HomeComponent({} as Router, notifications, posts);
    component.postEditor = { source: 'borrador' } as PostEditorComponent;
    spyOn(component, 'fetchData').and.resolveTo();
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
