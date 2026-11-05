import { TestBed } from '@angular/core/testing';
import { TimelineComponent, TimelineModule } from './timeline';

describe('Timeline de Posts genéricos', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TimelineModule] }).compileComponents();
  });
  it('muestra los mismos controles de detalle y edición en todas las publicaciones', () => {
    const fixture = TestBed.createComponent(TimelineComponent);
    const first = { uid: 'root', htmlContent: '<p>Raíz</p>', totalChilds: 2 };
    const second = { uid: 'child', type: 'post', htmlContent: '<p>Hijo</p>', totalChilds: 1 };
    fixture.componentInstance.collection = [first, second];
    fixture.componentInstance.complete();
    spyOn(fixture.componentInstance.selectEvent, 'emit');
    spyOn(fixture.componentInstance.editEvent, 'emit');
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.card-white') as NodeListOf<HTMLElement>;
    expect(cards.length).toBe(2);
    for (const [index, post] of [first, second].entries()) {
      cards[index].querySelector<HTMLButtonElement>('button')!.click();
      cards[index].querySelector<HTMLAnchorElement>('[title="Editar publicación"]')!.click();
      expect(fixture.componentInstance.selectEvent.emit).toHaveBeenCalledWith(post);
      expect(fixture.componentInstance.editEvent.emit).toHaveBeenCalledWith(post);
    }
    expect(cards[0].textContent).toContain('2 Respuestas');
    expect(cards[1].textContent).toContain('1 Respuestas');
    expect(fixture.nativeElement.querySelector('.badge')).toBeNull();
    fixture.destroy();
  });
});
