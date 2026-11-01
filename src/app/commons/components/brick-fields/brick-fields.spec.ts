import { BrickFieldsComponent } from './brick-fields';
import { PostService } from '../../services/post.service';
import { SimpleChange } from '@angular/core';

const general = { id: 1, name: 'General' };
const analysis = { id: 4, name: 'Análisis' };
describe('BrickFieldsComponent', () => {
  let component: BrickFieldsComponent;
  let service: jasmine.SpyObj<PostService>;
  beforeEach(() => {
    service = jasmine.createSpyObj('PostService', ['fetchBrickCategories', 'createBrickCategory']);
    service.fetchBrickCategories.and.resolveTo([general, analysis]);
    component = new BrickFieldsComponent(service);
    component.insightUid = 'insight';
  });
  it('defaults new bricks to General and accepts comma decimals', async () => {
    await component.load();
    expect(component.selected).toEqual(general);
    component.amount = '1,5'; component.unit = 'hours';
    expect(component.read()).toEqual({ category: 'General', duration: { amount: '1,5', unit: 'hours' }, reported: false });
  });
  it('searches without accent/case differences and does not offer duplicate categories', async () => {
    await component.load(); component.search(' ANALISIS ');
    expect(component.selected).toEqual(analysis);
    expect(component.canCreate).toBeFalse();
    expect(component.filtered).toEqual([analysis]);
  });
  it('creates and selects a category in the editor', async () => {
    await component.load(); component.search('Documentación');
    const category = { id: 5, name: 'Documentación' };
    service.createBrickCategory.and.resolveTo(category);
    await component.create();
    expect(service.createBrickCategory).toHaveBeenCalledOnceWith('insight', 'Documentación');
    expect(component.selected).toEqual(category);
    expect(component.categories).toContain(category);
    expect(component.listOpen).toBeFalse();
  });
  it('keeps duration and category text on a failed category creation', async () => {
    await component.load(); component.search('Documentación'); component.amount = '1,5';
    service.createBrickCategory.and.rejectWith(new Error('Falló'));
    await component.create();
    expect(component.query).toBe('Documentación');
    expect(component.amount).toBe('1,5');
    expect(component.error).toBe('Falló');
    expect(component.creating).toBeFalse();
  });
  for (const amount of ['', '0', '-1', 'NaN', '1e4', '1x', '0.000000000001', '9999999999999999999']) {
    it('rejects invalid duration ' + amount, async () => {
      await component.load(); component.amount = amount;
      expect(() => component.read()).toThrow();
    });
  }
  it('requires choosing or creating a category', async () => {
    await component.load(); component.search('Unknown'); component.amount = '45';
    expect(() => component.read()).toThrowError('Selecciona una categoría o créala desde el buscador.');
  });
  it('preloads the category name and keeps saved history outside the editable duration fields', async () => {
    component.category = 'Análisis'; component.editing = true;
    component.attributes = { time: { measurements: [], totals: { millis: 5400000, label: '1h 30min', createdAt: 1, updatedAt: 1, reported: '0s' } } };
    component.ngOnChanges({ attributes: new SimpleChange(undefined, component.attributes, true) });
    await component.load();
    expect(component.selected).toEqual(analysis);
    expect(component.amount).toBe('');
    expect(component.read()).toEqual({ category: 'Análisis' });
  });
  it('edits an old brick category without forcing an invented initial time', async () => {
    component.editing = true; component.legacy = true; component.category = 'General';
    component.ngOnChanges({ category: new SimpleChange(undefined, 'General', true) });
    await component.load();
    expect(component.read()).toEqual({ category: 'General' });
  });
  it('marks the manual initial time reported only when explicitly selected', async () => {
    await component.load(); component.amount = '2'; component.unit = 'hours'; component.reported = true;
    expect(component.read()).toEqual({ category: 'General', duration: { amount: '2', unit: 'hours' }, reported: true });
  });
  it('keeps legacy bricks without category and duration until the user explicitly fills them', async () => {
    component.legacy = true; await component.load();
    expect(component.selected).toBeUndefined();
    expect(component.read()).toEqual({});
    component.amount = '45';
    expect(() => component.read()).toThrow();
  });
  it('keeps draft measurements when category loading fails and can retry', async () => {
    component.amount = '45'; service.fetchBrickCategories.and.rejectWith(new Error('Sin conexión'));
    await component.load();
    expect(component.error).toBe('Sin conexión');
    expect(component.amount).toBe('45');
    expect(component.loadFailed).toBeTrue();
    service.fetchBrickCategories.and.resolveTo([general]); await component.load();
    expect(component.selected).toEqual(general);
  });
});
