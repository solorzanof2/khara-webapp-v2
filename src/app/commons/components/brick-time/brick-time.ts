import { Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BasePostDTO } from '../../models/interfaces/responses/post.response';
import { BrickMeasurement, BrickTimeInterval } from '../../models/interfaces/brick';

export interface BrickTimeEvent { brick: BasePostDTO; action: 'start' | 'finish' | 'report' | 'add'; measurementIndex?: number; interval?: BrickTimeInterval; }
@Component({
  selector: 'app-brick-time', standalone: false,
  template: `
    <section class="border p-2 mt-2" aria-label="Control de tiempo del brick">
      <div class="time-header d-flex flex-wrap justify-content-between gap-2 align-items-center" (click)="collapsed = !collapsed">
        <button
          type="button"
          class="time-summary"
          [attr.aria-expanded]="!collapsed"
          [attr.aria-controls]="'brick-time-details-' + brick.uid"
        >
          <small><i class="zmdi" [class.zmdi-chevron-right]="collapsed" [class.zmdi-chevron-down]="!collapsed" aria-hidden="true"></i> &nbsp;
          <strong>{{brick.category || 'Sin categoría'}}</strong> · Total: {{brick.attributes?.time?.totals?.label || '0s'}}
          · Reportado: {{brick.attributes?.time?.totals?.reported || '0s'}}
          </small>
        </button>
        <div class="d-flex gap-2" (click)="$event.stopPropagation()">
          <button
            type="button"
            class="btn-xs"
            [disabled]="disabled"
            (click)="emit(active ? 'finish' : 'start')"
          >
            <small *ngIf="!active"><i class="zmdi zmdi-play-circle"></i> &nbsp; Iniciar</small>
            <small *ngIf="active"><i class="zmdi zmdi-stop"></i> &nbsp; Finalizar</small>
            <!-- <small>{{active ? 'Finalizar' : 'Iniciar'}}</small> -->
          </button>
          <button
            type="button"
            class="btn-xs"
            [disabled]="disabled || !hasUnreported"
            (click)="emit('report')"
          >
            <small><i class="zmdi zmdi-check-all"></i> &nbsp; Marcar todo Reportado</small>
          </button>
        </div>
      </div>
      <div class="mt-2" [hidden]="collapsed" [id]="'brick-time-details-' + brick.uid">
        <small
          *ngIf="active"
          class="text-success d-block mt-1"
          role="status"
        >En curso: {{elapsedLabel}}</small>
        <div class="table-responsive">
          <table class="table table-sm small mb-0">
            <thead>
              <tr>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Tiempo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="!measurements.length"><td colspan="4" class="text-muted">Sin tiempos registrados.</td></tr>
              <tr
                *ngFor="let measurement of measurements; let index = index"
              >
                <td>{{measurement.startedAt | date:'dd/MM/yyyy HH:mm:ss'}}</td>
                <td>{{measurement.finishedAt === null ? 'En curso' : (measurement.finishedAt | date:'dd/MM/yyyy HH:mm:ss')}}</td>
                <td>{{measurement.finishedAt === null ? elapsedLabel : measurement.label}}</td>
                <td>
                  <span *ngIf="measurement.reported">Reportado</span>
                  <button
                    *ngIf="!measurement.reported && measurement.finishedAt !== null"
                    class="btn-xs"
                    [disabled]="disabled"
                    (click)="emit('report', index)"
                  >
                    <small>Reportado</small>
                  </button>
                  <span *ngIf="measurement.finishedAt === null">En curso</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>
                  <input
                    type="datetime-local"
                    step="1"
                    class="form-control form-control-sm"
                    [(ngModel)]="manualStart"
                    [ngModelOptions]="{standalone: true}"
                    [disabled]="disabled"
                  >
                  <!-- <label class="d-block">Fecha/hora de inicio</label> -->
                </td>
                <td>
                  <input
                    type="datetime-local"
                    step="1"
                    class="form-control form-control-sm"
                    [(ngModel)]="manualFinish"
                    [ngModelOptions]="{standalone: true}"
                    [disabled]="disabled"
                  >
                  <!-- <label class="d-block">Fecha/hora de fin</label> -->
                </td>
                <td colspan="2" class="align-bottom">
                  <div class="save-action-wrapper">
                    <button
                      type="button"
                      class="btn-xs"
                      [disabled]="disabled"
                      (click)="addInterval()"
                    >Guardar intervalo</button>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <small class="text-muted">Ingresa las fechas en tu hora local. La duración se calcula al guardar.</small>
        <p *ngIf="manualError" class="text-danger small mb-0" role="alert">{{manualError}}</p>
      </div>
    </section>
  `,
  styles: [`
  [hidden] {
    transition: all .5s;
  }

  .time-header {
    cursor: pointer;
  }

  .time-summary {
    flex: 1;
    border: 0;
    padding: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }

  .table, td {
    vertical-align: middle !important;
  }
  `]
})
export class BrickTimeComponent implements OnInit, OnDestroy {
  @Input() brick!: BasePostDTO;
  @Input() disabled = false;
  @Output() actionEvent = new EventEmitter<BrickTimeEvent>();

  collapsed = true;

  manualStart = '';
  manualFinish = '';
  manualError = '';
  now = Date.now();

  private ticker?: ReturnType<typeof setInterval>;

  get measurements(): BrickMeasurement[] {
    return this.brick.attributes?.time?.measurements || [];
  }

  get active(): BrickMeasurement | undefined {
    return this.measurements.find(row => row.finishedAt === null);
  }

  get hasUnreported(): boolean {
    return this.measurements.some(row => row.finishedAt !== null && !row.reported);
  }

  get elapsedLabel(): string {
    const seconds = Math.max(0, Math.floor((this.now - (this.active?.startedAt ?? this.now)) / 1000));
    return Math.floor(seconds / 3600) + 'h ' + Math.floor(seconds % 3600 / 60) + 'min ' + seconds % 60 + 's';
  }

  ngOnInit(): void {
    this.ticker = setInterval(() => this.now = Date.now(), 1000);
  }

  ngOnDestroy(): void {
    if (this.ticker) clearInterval(this.ticker);
  }

  addInterval(): void {
    if (this.disabled) return;
    this.manualError = '';
    const startedAt = this.manualStart ? new Date(this.manualStart).getTime() : NaN;
    const finishedAt = this.manualFinish ? new Date(this.manualFinish).getTime() : NaN;
    if (!Number.isSafeInteger(startedAt) || !Number.isSafeInteger(finishedAt) || startedAt < 0 || finishedAt <= startedAt) {
      this.manualError = 'Ingresa fechas válidas; el fin debe ser posterior al inicio.';
      return;
    }
    this.actionEvent.emit({ brick: this.brick, action: 'add', interval: { startedAt, finishedAt } });
  }

  emit(action: BrickTimeEvent['action'], measurementIndex?: number): void {
    if (this.disabled) {
      return;
    }

    this.actionEvent.emit({ brick: this.brick, action, ...(measurementIndex === undefined ? {} : { measurementIndex }) });
  }
}

@NgModule({
  declarations: [
    BrickTimeComponent
  ],
  imports: [
    CommonModule, FormsModule
  ],
  exports: [
    BrickTimeComponent
  ]
})
export class BrickTimeModule { }
