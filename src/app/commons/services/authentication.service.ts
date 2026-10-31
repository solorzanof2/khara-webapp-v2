import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { RestService } from './rest.service';
import { IdentityService } from './identity.service';
import { AuthResponse } from '../models/interfaces/responses/auth.response';
import { ApiResponse, ResultResponse } from '../models/interfaces/responses/api.response';
import { Exception } from '../utils/error.utils';


@Injectable()
export class AuthenticationService extends BaseService {

  constructor(
    private restService: RestService,
    private identityService: IdentityService,
  ) {
    super();
  }

  async doLogin(username: string, password: string): Promise<any> {
    try {
      const {
        status, payload,
      } = await this.restService.post<ApiResponse<AuthResponse>>('v1/users/signin', { username, password });

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'El usuario o la contraseña es inválido.');
      Exception.isConflictStatus({ status, payload });

      this.identityService.setUserSession(payload);

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async signup(values: SignupForm): Promise<any> {
    try {
      const {
        status, payload,
      } = await this.restService.post<ApiResponse<AuthResponse | string>>('v1/users/signup', values);

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Los datos enviados son inválidos.');
      Exception.isConflictStatus({ status, payload });

      this.identityService.setUserSession(payload as AuthResponse);

      return this.ok(payload as AuthResponse);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async checkEmailOrUsernameExistence(value: string, type: 'email' | 'username' = 'email'): Promise<string> {
    try {
      const request = { reference: value, type };

      const {
        status, payload,
      } = await this.restService.post<ApiResponse<ResultResponse>>('v1/users/signup/check-availability', request);

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Los datos enviados son inválidos.');

      return this.ok(`${payload.result}`);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

}


export interface LoginForm {
  username: string;
  password: string;
}


export interface SignupForm {
  username: string;
  email: string;
  password: string;
  name: string;
  lastname: string;
}

