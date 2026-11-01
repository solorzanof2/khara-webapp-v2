import { BrickFieldsComponent } from './brick-fields';
import { PostService } from '../../services/post.service';
import { SimpleChange } from '@angular/core';

const general = { id: 1, name: 'General' };
const analysis = { id: 4, name: 'Análisis' };
describe('BrickFieldsComponent', () => {
  let component: BrickFieldsComponent;
  let service: jasmine.SpyObj<PostService>;
  beforeEach(() => {
    service = jasmine.createSpyObj('PostService', ['fetchBrickCategories']);
    service.fetchBrickCategories.and.resolveTo([general, analysis]);
    component = new BrickFieldsComponent(service);
    component.insightUid = 'insight';
  });
  it('defaults new bricks to General without requiring a duration', async () => {
    await component.load();
    expect(component.selected).toEqual(general);
    expect(component.read()).toEqual({ category: 'General' });
  });
  it('searches without accent/case differences and does not offer duplicate categories', async () => {
    await component.load(); component.search(' ANALISIS ');
    expect(component.selected).toEqual(analysis);
    expect(component.filtered).toEqual([analysis]);
  });
  it('shows the whole dictionary when opening a prefilled control', async () => {
    await component.load(); component.openOptions();
    expect(component.filtered).toEqual([general, analysis]);
    component.search('anal'); expect(component.filtered).toEqual([analysis]);
    component.openOptions(); expect(component.filtered).toEqual([general, analysis]);
  });
  it('accepts a custom category without modifying the dictionary', async () => {
    await component.load(); component.search(' Documentación propia ');
    component.chooseFromKeyboard(new Event('keydown'));
    expect(component.read()).toEqual({ category: 'Documentación propia' });
    expect(component.categories).toEqual([general, analysis]);
    expect(component.selected).toBeUndefined();
  });
  it('requires a nonempty category of at most 128 characters', async () => {
    await component.load(); component.search(' '); expect(() => component.read()).toThrow();
    component.search('x'.repeat(128)); expect(component.read().category).toBe('x'.repeat(128));
    component.search('x'.repeat(129)); expect(() => component.read()).toThrow();
  });
  it('keeps custom categories when editing', async () => {
    component.category = 'Soporte propio';
    component.ngOnChanges({ category: new SimpleChange(undefined, component.category, true) });
    await component.load();
    expect(component.read()).toEqual({ category: 'Soporte propio' });
  });
  it('allows manual input when the dictionary cannot load', async () => {
    service.fetchBrickCategories.and.rejectWith(new Error('Sin conexión'));
    await component.load(); component.search('Soporte propio');
    expect(component.read()).toEqual({ category: 'Soporte propio' });
  });
  it('preloads the category name and keeps saved history outside the editable duration fields', async () => {
    component.category = 'Análisis'; component.editing = true;
    component.attributes = { time: { measurements: [], totals: { millis: 5400000, label: '1h 30min', createdAt: 1, updatedAt: 1, reported: '0s' } } };
    component.ngOnChanges({ attributes: new SimpleChange(undefined, component.attributes, true) });
    await component.load();
    expect(component.selected).toEqual(analysis);
    expect(component.read()).toEqual({ category: 'Análisis' });
  });
  it('edits an old brick category without forcing an invented initial time', async () => {
    component.editing = true; component.legacy = true; component.category = 'General';
    component.ngOnChanges({ category: new SimpleChange(undefined, 'General', true) });
    await component.load();
    expect(component.read()).toEqual({ category: 'General' });
  });
  it('keeps legacy bricks without category until the user explicitly fills it', async () => {
    component.legacy = true; await component.load();
    expect(component.selected).toBeUndefined();
    expect(component.read()).toEqual({});
    component.search('Unknown');
    expect(component.read()).toEqual({ category: 'Unknown' });
  });
  it('can retry when category loading fails', async () => {
    service.fetchBrickCategories.and.rejectWith(new Error('Sin conexión'));
    await component.load();
    expect(component.error).toBe('Sin conexión');
    expect(component.loadFailed).toBeTrue();
    service.fetchBrickCategories.and.resolveTo([general]); await component.load();
    expect(component.selected).toEqual(general);
  });
});
