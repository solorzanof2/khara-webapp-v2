import { Component, Input, NgModule, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrickAttributes, BrickCategoryDTO, BrickInput } from '../../models/interfaces/brick';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-brick-fields', standalone: false,
  template: `
    <fieldset class="mt-3 px-2" [disabled]="disabled">
      <legend class="fs-6">Datos del brick</legend>
      <p *ngIf="legacy" class="text-muted small">Este brick no tiene mediciones. Puedes conservarlo así o completar categoría y duración.</p>
      <div class="row g-2">
        <div class="col-12 col-md-6 position-relative">
          <label class="form-label" [for]="id + '-category'">Categoría</label>
          <input class="form-control" type="text" autocomplete="off" [id]="id + '-category'"
            role="combobox" aria-autocomplete="list" [attr.aria-expanded]="listOpen" [attr.aria-controls]="id + '-options'"
            [ngModel]="query" (ngModelChange)="search($event)" [ngModelOptions]="{standalone: true}"
            (focus)="listOpen = true" (keydown.escape)="listOpen = false"
            (keydown.enter)="chooseFromKeyboard($event)" placeholder="Buscar o crear categoría"
            [disabled]="loading || creating || disabled">
          <div *ngIf="listOpen && !loading" class="list-group shadow-sm category-options" role="listbox" [id]="id + '-options'">
            <button *ngFor="let category of filtered" type="button" class="list-group-item list-group-item-action"
              role="option" [attr.aria-selected]="selected?.id === category.id" (click)="select(category)" [disabled]="disabled || creating">
              {{category.name}}
            </button>
            <button *ngIf="canCreate" type="button" role="option" class="list-group-item list-group-item-action text-primary"
              (click)="create()" [disabled]="disabled || creating">{{creating ? 'Creando…' : 'Crear categoría «' + query.trim() + '»'}}</button>
            <button type="button" class="list-group-item list-group-item-action small" (click)="listOpen = false">Cerrar opciones</button>
          </div>
          <small *ngIf="loading" class="text-muted">Cargando categorías…</small>
          <button *ngIf="loadFailed" type="button" class="btn btn-link btn-sm" (click)="load()">Reintentar categorías</button>

        </div>
        <div class="col-6 col-md-3" *ngIf="!editing || !attributes?.time">
          <label class="form-label" [for]="id + '-amount'">{{editing && !attributes?.time ? 'Duración inicial (opcional)' : 'Duración'}}</label>
          <input class="form-control" type="text" inputmode="decimal" [id]="id + '-amount'"
            [(ngModel)]="amount" [ngModelOptions]="{standalone: true}" placeholder="Ej.: 1,5" [disabled]="disabled">
        </div>
        <div class="col-6 col-md-3">
          <label class="form-label" [for]="id + '-unit'">Unidad</label>
          <select class="form-select" [id]="id + '-unit'" [(ngModel)]="unit" [ngModelOptions]="{standalone: true}" [disabled]="disabled">
            <option value="minutes">Minutos</option><option value="hours">Horas</option>
          </select>
        </div>
      </div>
      <small *ngIf="attributes?.time?.totals as time" class="text-muted d-block mt-1">Tiempo guardado: {{time.label}}</small>
      <label *ngIf="!editing || !attributes?.time" class="d-block small mt-2">
        <input type="checkbox" [(ngModel)]="reported" [ngModelOptions]="{standalone: true}" [disabled]="disabled"> Tiempo inicial ya reportado
      </label>
      <p *ngIf="editing && attributes?.time" class="text-muted small mt-1 mb-0">El historial de tiempos se gestiona desde el brick.</p>
      <p *ngIf="error" class="text-danger small mt-2 mb-0" role="alert">{{error}}</p>
    </fieldset>
  `,
  styles: [`.category-options { position: absolute; z-index: 1056; left: .5rem; right: .5rem; max-height: 16rem; overflow: auto; }`],
})
export class BrickFieldsComponent implements OnChanges {
  private static nextId = 0;
  readonly id = 'brick-fields-' + BrickFieldsComponent.nextId++;
  @Input() insightUid = '';
  @Input() disabled = false;
  @Input() attributes?: BrickAttributes;
  @Input() legacy = false;
  @Input() category = '';
  @Input() editing = false;
  reported = false;
  categories: BrickCategoryDTO[] = [];
  selected?: BrickCategoryDTO;
  query = '';
  amount = '';
  unit: 'minutes' | 'hours' = 'minutes';
  listOpen = false;
  loading = false;
  creating = false;
  loadFailed = false;
  error = '';
  private loadVersion = 0;

  constructor(private postService: PostService) {}

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (!changes['insightUid'] && !changes['attributes'] && !changes['legacy'] && !changes['category']) return;
    this.selected = undefined;
    this.query = this.category || '';
    this.unit = 'minutes';
    this.amount = '';
    this.reported = false;
    if (this.insightUid) void this.load();
  }

  private key(value: string): string {
    return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  }
  get filtered(): BrickCategoryDTO[] { return this.categories.filter(row => this.key(row.name).includes(this.key(this.query))); }
  get canCreate(): boolean { return !!this.query.trim() && !this.categories.some(row => this.key(row.name) === this.key(this.query)); }

  async load(): Promise<void> {
    const version = ++this.loadVersion;
    this.loading = true; this.loadFailed = false; this.error = '';
    try {
      const categories = await this.postService.fetchBrickCategories(this.insightUid);
      if (version !== this.loadVersion) return;
      this.categories = categories;
      if (this.query) this.selected = categories.find(row => this.key(row.name) === this.key(this.query));
      if (!this.selected && !this.legacy && !this.query) {
        const general = categories.find(row => this.key(row.name) === 'general');
        if (general) this.select(general);
      }
    }
    catch (error: any) { if (version === this.loadVersion) { this.error = error.message; this.loadFailed = true; } }
    finally { if (version === this.loadVersion) this.loading = false; }
  }

  search(value: string): void {
    this.query = value; this.listOpen = true; this.error = '';
    this.selected = this.categories.find(row => this.key(row.name) === this.key(value));
  }
  select(category: BrickCategoryDTO): void {
    this.selected = category; this.query = category.name; this.listOpen = false; this.error = '';
  }
  chooseFromKeyboard(event: Event): void {
    event.preventDefault();
    if (this.disabled || this.loading || this.creating) return;
    const exact = this.categories.find(row => this.key(row.name) === this.key(this.query));
    if (exact) this.select(exact);
    else if (this.canCreate) void this.create();
  }
  async create(): Promise<void> {
    if (this.disabled || this.creating || !this.canCreate) return;
    this.creating = true; this.error = '';
    try {
      const category = await this.postService.createBrickCategory(this.insightUid, this.query.trim());
      if (!this.categories.some(row => row.id === category.id)) this.categories = [...this.categories, category];
      this.select(category);
    }
    catch (error: any) { this.error = error.message; }
    finally { this.creating = false; }
  }

  read(): BrickInput {
    this.error = '';
    if (this.legacy && !this.selected && !this.query.trim() && !this.amount.trim()) return {};
    if (this.loading || this.creating) this.error = 'Espera a que termine la carga de categorías.';
    else if (!this.selected) this.error = 'Selecciona una categoría o créala desde el buscador.';
    else if ((!this.editing || (!this.attributes?.time && !!this.amount.trim())) && (!/^\d+(?:[.,]\d+)?$/.test(this.amount.trim())
      || !Number.isFinite(Number(this.amount.replace(',', '.')))
      || Math.round(Number(this.amount.replace(',', '.')) * (this.unit === 'hours' ? 3600000 : 60000)) <= 0
      || !Number.isSafeInteger(Math.round(Number(this.amount.replace(',', '.')) * (this.unit === 'hours' ? 3600000 : 60000))))) {
      this.error = 'Ingresa una duración positiva en minutos u horas (ej.: 1,5).';
    }
    if (this.error) throw new Error(this.error);
    return { category: this.selected!.name, ...(!this.editing || (!this.attributes?.time && !!this.amount.trim())
      ? { duration: { amount: this.amount.trim(), unit: this.unit }, reported: this.reported } : {}) };
  }
  reset(): void {
    this.amount = ''; this.unit = 'minutes'; this.reported = false; this.error = '';
    const general = this.categories.find(row => this.key(row.name) === 'general');
    if (general) this.select(general);
  }
}

@NgModule({ declarations: [BrickFieldsComponent], imports: [CommonModule, FormsModule], exports: [BrickFieldsComponent] })
export class BrickFieldsModule {}
