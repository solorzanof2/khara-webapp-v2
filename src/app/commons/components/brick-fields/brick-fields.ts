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
      <p
        *ngIf="legacy"
        class="text-muted small"
      >Este brick no tiene mediciones. Puedes conservarlo así o completar la categoría.</p>
      <div class="row g-2">
        <div class="col-12 col-md-6 position-relative">
          <label class="form-label" [for]="id + '-category'">Categoría</label>
          <input
            class="form-control"
            type="text"
            autocomplete="off"
            [id]="id + '-category'"
            role="combobox"
            aria-autocomplete="list"
            [attr.aria-expanded]="listOpen"
            [attr.aria-controls]="id + '-options'"
            [ngModel]="query"
            (ngModelChange)="search($event)"
            [ngModelOptions]="{standalone: true}"
            (focus)="openOptions()"
            (click)="openOptions()"
            (keydown.escape)="listOpen = false"
            (keydown.enter)="chooseFromKeyboard($event)"
            placeholder="Seleccionar o escribir categoría"
            maxlength="128"
            [disabled]="disabled"
          >
          <div
            *ngIf="listOpen && !loading"
            class="list-group shadow-sm category-options"
            role="listbox"
            [id]="id + '-options'"
          >
            <button
              *ngFor="let category of filtered"
              type="button"
              class="list-group-item list-group-item-action"
              role="option"
              [attr.aria-selected]="selected?.id === category.id"
              (click)="select(category)"
              [disabled]="disabled"
            >
              {{category.name}}
            </button>
            <button
              type="button"
              class="list-group-item list-group-item-action small"
              (click)="listOpen = false"
            >Cerrar opciones</button>
          </div>
          <small
            *ngIf="loading"
            class="text-muted"
          >Cargando categorías…</small>
          <button
            *ngIf="loadFailed"
            type="button"
            class="btn btn-link btn-sm"
            (click)="load()"
          >Reintentar categorías</button>
        </div>
      </div>
      <small
        *ngIf="attributes?.time?.totals as time"
        class="text-muted d-block mt-1"
      >Tiempo guardado: {{time.label}}</small>
      <p
        *ngIf="editing && attributes?.time"
        class="text-muted small mt-1 mb-0"
      >El historial de tiempos se gestiona desde el brick.</p>
      <p
        *ngIf="error"
        class="text-danger small mt-2 mb-0"
        role="alert"
      >{{error}}</p>
    </fieldset>
  `,
  styles: [`
  .category-options {
    position: absolute;
    z-index: 1056;
    left: .5rem;
    right: .5rem;
    max-height: 16rem;
    overflow: auto;
    }
  `],
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

  categories: BrickCategoryDTO[] = [];
  selected?: BrickCategoryDTO;

  query = '';
  error = '';

  listOpen = false;
  loading = false;
  loadFailed = false;

  private loadVersion = 0;
  private filtering = false;

  constructor(private postService: PostService) { }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (!changes['insightUid'] && !changes['attributes'] && !changes['legacy'] && !changes['category']) {
      return;
    }

    this.selected = undefined;
    this.query = this.category || '';

    if (this.insightUid) {
      void this.load();
    }
  }

  private key(value: string): string {
    return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
  }

  get filtered(): BrickCategoryDTO[] {
    return this.categories
      .filter(row => !this.filtering || this.key(row.name).includes(this.key(this.query)));
  }

  openOptions(): void {
    this.filtering = false;
    this.listOpen = true;
  }

  async load(): Promise<void> {
    const version = ++this.loadVersion;
    this.loading = true; this.loadFailed = false; this.error = '';
    try {
      const categories = await this.postService.fetchBrickCategories(this.insightUid);

      if (version !== this.loadVersion) {
        return;
      }

      this.categories = categories;

      if (this.query) {
        this.selected = categories.find(row => this.key(row.name) === this.key(this.query));
      }

      if (!this.selected && !this.legacy && !this.query) {
        const general = categories.find(row => this.key(row.name) === 'general');
        if (general) this.select(general);
      }
    }
    catch (error: any) {
      if (version === this.loadVersion) {
        this.error = error.message; this.loadFailed = true;
      }
    }
    finally {
      if (version === this.loadVersion) {
        this.loading = false;
      }
    }
  }

  search(value: string): void {
    this.query = value;
    this.filtering = true;
    this.listOpen = true;
    this.error = '';
    this.selected = this.categories.find(row => this.key(row.name) === this.key(value));
  }

  select(category: BrickCategoryDTO): void {
    this.selected = category;
    this.query = category.name;
    this.listOpen = false;
    this.error = '';
  }

  chooseFromKeyboard(event: Event): void {
    event.preventDefault();
    if (this.disabled) return;
    const exact = this.categories.find(row => this.key(row.name) === this.key(this.query));
    if (exact) this.select(exact);
    else this.listOpen = false;
  }

  read(): BrickInput {
    this.error = '';

    if (this.legacy && !this.selected && !this.query.trim()) {
      return {};
    }

    if (!this.query.trim() || this.query.trim().length > 128) {
      this.error = 'Selecciona o escribe una categoría de hasta 128 caracteres.';
    }

    if (this.error) {
      throw new Error(this.error);
    }

    return {
      category: this.selected?.name ?? this.query.trim()
    };
  }

  reset(): void {
    this.error = '';
    this.query = '';
    this.selected = undefined;
    this.listOpen = false;
    this.filtering = false;
    const general = this.categories.find(row => this.key(row.name) === 'general');
    if (general) this.select(general);
  }
}

@NgModule({
  declarations: [BrickFieldsComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [BrickFieldsComponent]
})
export class BrickFieldsModule { }
