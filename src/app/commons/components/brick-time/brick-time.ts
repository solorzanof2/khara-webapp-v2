import { Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasePostDTO } from '../../models/interfaces/responses/post.response';
import { BrickMeasurement } from '../../models/interfaces/brick';

export interface BrickTimeEvent { brick: BasePostDTO; action: 'start' | 'finish' | 'report'; measurementIndex?: number; }
@Component({
  selector: 'app-brick-time', standalone: false,
  template: `
    <section class="border p-2 mt-2" aria-label="Control de tiempo del brick">
      <div class="d-flex flex-wrap justify-content-between gap-2 align-items-center">
        <small>
          <strong>{{brick.category || 'Sin categoría'}}</strong> · Total: {{brick.attributes?.time?.totals?.label || '0s'}}
          · Reportado: {{brick.attributes?.time?.totals?.reported || '0s'}}
        </small>
        <div class="d-flex gap-2">
          <button
            class="btn-xs"
            [disabled]="disabled"
            (click)="emit(active ? 'finish' : 'start')"
          >
            <small>{{active ? 'FINALIZAR' : 'INICIAR'}}</small>
          </button>
          <button
            class="btn-xs"
            [disabled]="disabled || !hasUnreported"
            (click)="emit('report')"
          >
            <small>MARCAR TODO REPORTADO</small>
          </button>
        </div>
      </div>
      <small
        *ngIf="active"
        class="text-success d-block mt-1"
        role="status"
      >En curso: {{elapsedLabel}}</small>
      <details
        *ngIf="measurements.length"
        class="mt-2"
      >
        <summary class="small">Historial de tiempos ({{measurements.length}})</summary>
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
              <tr
                *ngFor="let measurement of measurements; let index = index"
              >
                <td>{{measurement.startedAt | date:'dd/MM/yyyy HH:mm:ss'}}</td>
                <td>{{measurement.finishedAt === null ? 'En curso' : (measurement.finishedAt | date:'dd/MM/yyyy HH:mm:ss')}}</td>
                <td>{{measurement.finishedAt === null ? elapsedLabel : measurement.label}}</td>
                <td>
                  <span *ngIf="measurement.reported">Reportado</span>
                  <a
                    *ngIf="!measurement.reported && measurement.finishedAt !== null"
                    href="javascript:void(0)"
                    [attr.disabled]="disabled"
                    (click)="emit('report', index)"
                  >Reportado</a>
                  <span *ngIf="measurement.finishedAt === null">En curso</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </section>
  `,
})
export class BrickTimeComponent implements OnInit, OnDestroy {
  @Input() brick!: BasePostDTO;
  @Input() disabled = false;
  @Output() actionEvent = new EventEmitter<BrickTimeEvent>();

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
    CommonModule
  ],
  exports: [
    BrickTimeComponent
  ]
})
export class BrickTimeModule { }
