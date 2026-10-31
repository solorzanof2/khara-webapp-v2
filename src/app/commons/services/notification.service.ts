import { Injectable } from "@angular/core";
import Swal from "sweetalert2";
import { SwalResult, SwalSeverityType } from '../utils/typings/swal';

@Injectable()
export class NotificationService {
  private readonly DefaultTitle: string = 'Aviso';

  private toast: any;

  constructor() {
    this.toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
      didOpen: (toast:any) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });
  }

  showMessage(message: string, timer: number = 500): void {
    this.toast.fire({
      title: `<div style="text-align: center;">${message}</div>`,
      position: 'bottom',
      background: '#FCF3AA',
      timer: timer,
    });
  }

  show(message: string, icon: 'success' | 'info' | 'warning' | 'error' = 'success'): void {
    this.toast.fire({
      icon,
      title: message,
    });
  }

  showInfo(message: string): void {
    this.dispatch(message, 'info');
  }

  showSuccess(message: string): void {
    this.dispatch(message, 'success', 'Operación exitosa');
  }

  showWarning(message: string): void {
    this.dispatch(message, 'warning', 'Alerta');
  }

  showError(message: string): void {
    this.dispatch(message, 'error', 'Error');
  }

  async showQuestion(message: string): Promise<boolean> {
    const result = await this.dispatchDialog(message);
    return Promise.resolve(result.isConfirmed);
  }

  private dispatch(message: string, icon: SwalSeverityType, title: string = this.DefaultTitle): void {
    Swal.fire(title, message, icon);
  }

  private async dispatchDialog(message: string): Promise<SwalResult> {
    return await Swal.fire({
      title: 'Atención',
      text: message,
      icon: 'question',
      showCancelButton: true,
      cancelButtonColor: '#eb445a',
      confirmButtonColor: '#28ba62',
      confirmButtonText: 'SI',
    });
  }

}
