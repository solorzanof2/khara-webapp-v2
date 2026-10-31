import { Injectable } from "@angular/core";
import { StorageService } from './storage.service';
import { AuthResponse } from '../models/interfaces/responses/auth.response';


@Injectable()
export class IdentityService {

  readonly NowIndex: string = 'storage.data.time.now';
  readonly TimeLoggerUserIndex: string = 'storage.data.identity.session';
  readonly HistoryDateIndex: string = 'storage.data.history.date';
  readonly SessionTokenIndex: string = 'storage.data.token.session';
  readonly UserLoggedIndex: string = 'storage.data.user.logged';
  readonly UserUidIndex: string = 'storage.data.user.uid';
  readonly StationIndex: string = 'storage.data.station';
  readonly RoleIndex: string = 'storage.data.role';

  constructor(
    private storageService: StorageService
  ) { }

  setUserSession(user: AuthResponse): void {
    this.storageService.setObject(this.UserLoggedIndex, user);
    this.storageService.set(this.SessionTokenIndex, user.token);
    this.storageService.set(this.UserUidIndex, user.uid);
  }

  getLoggedUser(): AuthResponse | null {
    return this.storageService.getSessionObject<AuthResponse>(this.UserLoggedIndex);
  }

  removeUserSession(): void {
    this.storageService.removeSessionData(this.UserLoggedIndex);
    this.storageService.removeSessionData(this.SessionTokenIndex);
    this.storageService.removeSessionData(this.UserUidIndex);
  }

  setObject(key: string, value: any): void {
    this.storageService.setObject(key, value);
  }

  getObject(value: string): any {
    return this.storageService.getObject(value);
  }

  getToken(): string {
    return this.storageService.get(this.SessionTokenIndex) ?? '';
  }

  getWorkspace(): any {
    const user = this.getObject(this.UserLoggedIndex);

    return user.workspace;
  }

  getPerson(): any {
    const user = this.getObject(this.UserLoggedIndex);

    return user.person;
  }

  // getUser(): AuthUserResponse | undefined {
  //   const loggedUser = this.getLoggedUser();
  //   if (!loggedUser) {
  //     return undefined;
  //   }
  //   return loggedUser.user;
  // }
}
