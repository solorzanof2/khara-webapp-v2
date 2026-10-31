import { ApiResponse } from '../models/interfaces/responses/api.response';


export class Exception {
  static readonly DefaultError: 'No se pudo completar la solicitud, por favor intenta más tarde.';

  static readonly ErrorStatus = 500;
  static readonly BadRequestStatus = 400;
  static readonly NotFoundStatus = 404;
  static readonly ConflictStatus = 409;

  static getDefault(): Error {
    return new Error(Exception.DefaultError);
  }

  /**
   * ### Devuelve un error genérico si el status recibido es 500
   * @param value payload.status de la respuesta de la API;
   * @returns Una excepción con un mensaje genérico;
   */
  static isDefaultErrorStatus(value: number): void {
    if (value !== Exception.ErrorStatus) {
      return;
    }

    throw Exception.getDefault();
  }

  static getError(message: string): Error {
    return new Error(message);
  }

  static isBadRequest(value: number, message: string): void {
    if (value !== Exception.BadRequestStatus) {
      return;
    }

    throw Exception.getError(message);
  }

  static isNotFoundStatus(value: number, message: string): void {
    if (value !== Exception.NotFoundStatus) {
      return;
    }

    throw Exception.getError(message);
  }

  static isConflictStatus<T>(value: ApiResponse<T>): void {
    if (value.status !== Exception.ConflictStatus || (typeof value.payload !== 'string')) {
      return;
    }

    throw Exception.getError(`${value.payload}`);
  }
}

