import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { AppModule } from '../../../app.module';
import { BrickTimeComponent, BrickTimeModule } from './brick-time';
import { BasePostDTO } from '../../models/interfaces/responses/post.response';

describe('BrickTimeComponent', () => {
  let component: BrickTimeComponent;
  beforeEach(() => {
    component = new BrickTimeComponent();
    component.brick = { uid: 'brick', category: 'General', attributes: { time: {
      measurements: [{ startedAt: 1000, finishedAt: 7201000, millis: 7200000, label: '2h', createdAt: 1000, reported: true },
        { startedAt: 9000000, finishedAt: null, millis: 0, label: '0s', createdAt: 9000000, reported: false }],
      totals: { millis: 7200000, label: '2h', reported: '2h', createdAt: 1000, updatedAt: 9000000 },
    } } } as BasePostDTO;
  });
  it('restores an active timer from the persisted history', () => {
    component.now = 9000000 + 10800000;
    expect(component.active!.startedAt).toBe(9000000);
    expect(component.elapsedLabel).toBe('3h 0min 0s');
    expect(component.hasUnreported).toBeFalse();
  });
  it('emits start, finish and report commands without client timestamps', () => {
    spyOn(component.actionEvent, 'emit');
    component.emit('finish');
    expect(component.actionEvent.emit).toHaveBeenCalledWith({ brick: component.brick, action: 'finish' });
    component.emit('report', 0);
    expect(component.actionEvent.emit).toHaveBeenCalledWith({ brick: component.brick, action: 'report', measurementIndex: 0 });
  });
  it('blocks duplicate clicks while saving', () => {
    component.disabled = true; spyOn(component.actionEvent, 'emit'); component.emit('start');
    expect(component.actionEvent.emit).not.toHaveBeenCalled();
  });
  it('counts only completed unreported measurements as reportable', () => {
    component.measurements[0].reported = false;
    expect(component.hasUnreported).toBeTrue();
  });
  it('converts local start/end dates to timestamps, including an overnight interval', () => {
    component.manualStart = '2026-10-31T23:30:00';
    component.manualFinish = '2026-11-01T01:00:00';
    spyOn(component.actionEvent, 'emit');
    component.addInterval();
    expect(component.actionEvent.emit).toHaveBeenCalledOnceWith({ brick: component.brick, action: 'add', interval: {
      startedAt: new Date(2026, 9, 31, 23, 30).getTime(), finishedAt: new Date(2026, 10, 1, 1).getTime(),
    } });
    expect(component.manualStart).toBe('2026-10-31T23:30:00');
  });
  for (const [start, finish] of [['', ''], ['invalid', '2026-11-01T10:00'],
    ['2026-11-01T10:00', '2026-11-01T10:00'], ['2026-11-01T11:00', '2026-11-01T10:00']]) {
    it('rejects invalid manual interval ' + start + ' / ' + finish, () => {
      component.manualStart = start; component.manualFinish = finish;
      spyOn(component.actionEvent, 'emit'); component.addInterval();
      expect(component.actionEvent.emit).not.toHaveBeenCalled();
      expect(component.manualError).toContain('fin debe ser posterior');
    });
  }
  it('does not submit manual intervals while disabled', () => {
    component.manualStart = '2026-11-01T09:00'; component.manualFinish = '2026-11-01T10:00';
    component.disabled = true; spyOn(component.actionEvent, 'emit'); component.addInterval();
    expect(component.actionEvent.emit).not.toHaveBeenCalled();
  });
  it('clears its interval when destroyed', () => {
    jasmine.clock().install();
    try {
      component.ngOnInit(); component.ngOnDestroy(); const now = component.now;
      jasmine.clock().tick(2000); expect(component.now).toBe(now);
    }
    finally { jasmine.clock().uninstall(); }
  });
});

describe('BrickTimeComponent dates with the application locale', () => {
  it('renders start and end dates with es-AR and keeps an open measurement in progress', async () => {
    await TestBed.configureTestingModule({ imports: [AppModule, BrickTimeModule] }).compileComponents();
    expect(TestBed.inject(LOCALE_ID)).toBe('es-AR');
    const fixture = TestBed.createComponent(BrickTimeComponent);
    const startedAt = new Date(2026, 10, 1, 9, 30).getTime();
    const finishedAt = new Date(2026, 10, 1, 11, 30).getTime();
    fixture.componentInstance.brick = { uid: 'brick', attributes: { time: {
      measurements: [
        { startedAt, finishedAt, millis: 7200000, label: '2h', createdAt: startedAt, reported: true },
        { startedAt: finishedAt, finishedAt: null, millis: 0, label: '0s', createdAt: finishedAt, reported: false },
      ],
      totals: { millis: 7200000, label: '2h', reported: '2h', createdAt: startedAt, updatedAt: finishedAt },
    } } } as BasePostDTO;
    expect(() => fixture.detectChanges()).not.toThrow();
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    expect(rows[0].children[0].textContent).toContain('01/11/2026 09:30:00');
    expect(rows[0].children[1].textContent).toContain('01/11/2026 11:30:00');
    expect(rows[1].children[1].textContent).toContain('En curso');
    fixture.destroy();
  });
});
