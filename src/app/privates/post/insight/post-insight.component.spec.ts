import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { PostInsightComponent } from './post-insight.component';
import { FullPostDTO } from '../../../commons/models/interfaces/responses/post.response';
import { PostService } from '../../../commons/services/post.service';
import { NotificationService } from '../../../commons/services/notification.service';
import { PostEditorComponent } from '../../../commons/components/post-editor';

describe('Ruta antigua de insights', () => {
  it('carga y responde con el mismo contrato genérico de Post', async () => {
    const service = jasmine.createSpyObj<PostService>('PostService', ['fetchPostByUid', 'save']);
    service.fetchPostByUid.and.resolveTo({ uid: 'child', project: { uid: 'project' }, childs: [], totalChilds: 0 } as unknown as FullPostDTO);
    service.save.and.resolveTo();
    const notifications = jasmine.createSpyObj<NotificationService>('Notifications', ['show', 'showWarning', 'showError']);
    const component = new PostInsightComponent({ back() {} } as Location, {} as Router, notifications, { params: of({ ref: 'child' }) } as unknown as ActivatedRoute, service);
    component.reference = 'child';
    component.editor = { source: 'Respuesta' } as PostEditorComponent;
    await component.fetchData();
    await component.saveEventHandler('Respuesta');
    expect(service.fetchPostByUid).toHaveBeenCalledWith('child');
    expect(service.save).toHaveBeenCalledOnceWith('Respuesta', 'project', 'child');
    expect(component.editor.source).toBe('');
    component.ngOnDestroy();
  });
});
