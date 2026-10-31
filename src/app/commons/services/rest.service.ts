import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
// import { environment } from "src/environments/environment";
import { ApiResponse } from "../models/interfaces/responses/api.response";
import { BaseRequest } from "../models/interfaces/requests/api.request";
import { environment } from '../../../environments/environment.development';
import { IdentityService } from './identity.service';


interface HttpOptions {
  headers: HttpHeaders;
  withCredentials: boolean;
}


@Injectable()
export class RestService {

  private UnprotectedRoutes: string[] = [
    "users/signin",
    "users/signup",
    "users/signup/org",
    "users/forgot-password",
  ];

  constructor(
    private http: HttpClient,
    private identityService: IdentityService,
  ) { }

  private isProtectedRoute (value: string) {
    let response = true;

    for (const route of this.UnprotectedRoutes) {
      if (!value.includes(route)) {
        continue;
      }

      response = false;
      break;
    }

    return response;
  }

  private urlComposer(endpoint: string): string {
    return `${environment.apiURL}${endpoint}`;
  }

  private getHttpOptions(secure: boolean): Object {
    let httpOptions: HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-api-key': environment.apiKey,
        'x-requested-with': 'webclient',
      }),
      withCredentials: false,
    };

    if (secure) {
      const token = this.identityService.getToken();
      httpOptions.headers = httpOptions.headers.set('Authorization', `Bearer ${token}`);
    }

    return httpOptions;
  }

  private getOptions(multipart: boolean, secure: boolean): Object {
    return multipart ? this.getHttpOptionsMultipart(secure) : this.getHttpOptions(secure);
  }

  private getHttpOptionsMultipart(secure: boolean): Object {
    const httpOptions: HttpOptions = {
      headers: new HttpHeaders({
        'x-api-key': environment.apiKey,
      }),
      withCredentials: false,
    };

    if (secure) {
      const token = this.identityService.getToken();
      httpOptions.headers = httpOptions.headers.set('Authorization', `Bearer ${token}`);
    }

    return httpOptions;
  }

  post<T>(endpoint: string, data: BaseRequest, multipart: boolean = false): Promise<T> {
    return new Promise((resolve, reject) => {
      const successCallback = (apiResponse: any) => {
        try {
          // this.checkResponseStatus(apiResponse as ApiResponse);
          resolve(apiResponse as T);
          this.reset();
        }
        catch (error: any) {
          reject(new Error(error.message));
          this.reset();
        }
      }

      const errorCallback = (error: HttpErrorResponse) => {
        reject(new Error(error.message));
        this.reset();
      }

      const injectToken = this.isProtectedRoute(endpoint);

      this.http.post(this.urlComposer(endpoint), data, this.getOptions(multipart, injectToken)).subscribe({
        next: successCallback,
        error: errorCallback,
      });
    });
  }

  get<T>(endpoint: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const successCallback = (apiResponse: any) => {
        try {
          // this.checkResponseStatus(apiResponse as ApiResponse);
          resolve(apiResponse as T);
          this.reset();
        }
        catch (error: any) {
          reject(new Error(error.message));
          this.reset();
        }
      }

      const errorCallback = (error: HttpErrorResponse) => {
        reject(new Error(error.error.message));
        this.reset();
      }

      const injectToken = this.isProtectedRoute(endpoint);

      this.http.get(this.urlComposer(endpoint), this.getHttpOptions(injectToken)).subscribe({
        next: successCallback,
        error: errorCallback,
      });
    });
  }

  put<T>(endpoint: string, payload: BaseRequest, multipart: boolean = false): Promise<T> {
    return new Promise((resolve, reject) => {
      const successCallback = (apiResponse: any) => {
        try {
          // this.checkResponseStatus(apiResponse as ApiResponse);
          resolve(apiResponse as T);
          this.reset();
        }
        catch (error: any) {
          reject(new Error(error.message));
          this.reset();
        }
      }

      const errorCallback = (error: HttpErrorResponse) => {
        reject(new Error(error.error.message));
        this.reset();
      };

      const injectToken = this.isProtectedRoute(endpoint);

      this.http.put(this.urlComposer(endpoint), payload, this.getOptions(multipart, injectToken)).subscribe({
        next: successCallback,
        error: errorCallback,
      });
    });
  }

  patch<T>(endpoint: string, payload: BaseRequest, multipart: boolean = false): Promise<T> {
    return new Promise((resolve, reject) => {
      const successCallback = (apiResponse: any) => {
        try {
          // this.checkResponseStatus(apiResponse as ApiResponse);
          resolve(apiResponse as T);
          this.reset();
        }
        catch (error: any) {
          reject(new Error(error.message));
          this.reset();
        }
      }

      const errorCallback = (error: HttpErrorResponse) => {
        reject(new Error(error.error.message));
        this.reset();
      };

      const injectToken = this.isProtectedRoute(endpoint);

      this.http.patch(this.urlComposer(endpoint), payload, this.getOptions(multipart, injectToken)).subscribe({
        next: successCallback,
        error: errorCallback,
      });
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return new Promise((resolve, reject) => {
      const successCallback = (apiResponse: any) => {
        try {
          // this.checkResponseStatus(apiResponse as ApiResponse);
          resolve(apiResponse);
          this.reset();
        }
        catch (error: any) {
          reject(new Error(error.message));
          this.reset();
        }
      }

      const errorCallback = (error: HttpErrorResponse) => {
        reject(new Error(error.error.message));
        this.reset();
      };

      const injectToken = this.isProtectedRoute(endpoint);

      this.http.delete(this.urlComposer(endpoint), this.getHttpOptions(injectToken)).subscribe({
        next: successCallback,
        error: errorCallback,
      });
    });
  }

  /**
   * @deprecated
   * @description Esta verificación debería ser utilizada sólo para errores HTTP y no para errores controlados de la API;
   * */
  private checkResponseStatus(data: any): void {
    if (500 === data.status) {
      throw new Error(data.payload);
    }
    if (404 === data.status) {
      throw new Error(data.payload);
    }
    if (400 === data.status) {
      throw new Error(data.payload);
    }
    if (409 === data.status) {
      throw new Error(data.payload);
    }
    else if(data.status >= 400 && data.status <= 599) {
      throw new Error(data.payload)
    }
  }

  private reset(): void {
  }
}
