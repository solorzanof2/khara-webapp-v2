

export type SwalSeverityType = 'question' | 'error' | 'info' | 'warning' | 'success';

export type SwalResult = {
  isConfirmed: boolean;
};

export interface SwalApi {
  fire(text: string): void;
  fire(title: string, text: string, icon: SwalSeverityType): void;
  fire(options: SwalOptions): Promise<SwalResult>;
}

export interface SwalOptions {
  title: string,
  text: string,
  icon: SwalSeverityType,
  showCancelButton: boolean,
  confirmButtonColor: string,
  cancelButtonColor: string,
  confirmButtonText: string,
}