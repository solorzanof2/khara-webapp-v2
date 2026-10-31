import { Injectable } from '@angular/core';
import { BaseService, QueryString } from './base.service';
import { Exception } from '../utils/error.utils';
import { Project } from '../models/interfaces/responses/project.response';
import { ApiResponse, PaginatedResponse } from '../models/interfaces/responses/api.response';
import { RestService } from './rest.service';
import { IdentityService } from './identity.service';


@Injectable()
export class ProjectService extends BaseService {

  constructor(
    private restService: RestService,
    private identityService: IdentityService,
  ) {
    super();
  }

  async fetchAllPaginatedByWorkspaceUID(page: number = 0, perPage: number = 10, value: string = ''): Promise<PaginatedResponse<Project>> {
    try {
      if (!value) {
        const workspace = this.identityService.getWorkspace();
        value = workspace.uid;
      }

      const queryBuilder = {
        page: `${page}`,
        perPage: `${perPage}`,
        ref: value,
      } as QueryString;

      const {
        status, payload,
      } = await this.restService.get<ApiResponse<PaginatedResponse<Project>>>(`v1/projects/collection?${this.buildQueryString(queryBuilder)}`);

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El workspace definido no existe.');

      console.log({paginated: payload});

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async fetchByUid(value: string): Promise<Project> {
    try {
      const {
        status, payload
      } = await this.restService.get<ApiResponse<Project>>(`v1/projects/single?ref=${value}`);

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'El identificador del proyecto es inválido.');
      Exception.isNotFoundStatus(status, 'El proyecto no existe o es inválido.');

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async save(form: ProjectForm): Promise<void> {
    try {
      const workspace = this.identityService.getWorkspace();
      const person = this.identityService.getPerson();

      const request = {
        ...form,
        workspaceUid: workspace.uid,
        companyUid: person.uid,
      } as const;

      const {
        status, payload,
      } = await this.restService.post<ApiResponse<any>>(`v1/projects/create`, request);

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El workspace o la company no existe.');
      Exception.isConflictStatus({ status, payload });

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async update(form: ProjectForm): Promise<void> {
    try {
      const workspace = this.identityService.getWorkspace();
      const person = this.identityService.getPerson();

      const request = {
        ...form,
        workspaceUid: workspace.uid,
        companyUid: person.uid,
      } as const;

      const {
        status, payload,
      } = await this.restService.post<ApiResponse<any>>(`v1/projects/update`, request);

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El workspace o la company no existe.');
      Exception.isConflictStatus({ status, payload });

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async updateStatusByUid(value: string, statusValue: string): Promise<void> {
    try {
      const request = {
        uid: value, status: statusValue,
      };

      const {
        status, payload,
      } = await this.restService.post<ApiResponse<any>>(`v1/projects/update-status`, request);

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El proyecto no existe. o ya fue eliminado previamente.');
      Exception.isConflictStatus({ status, payload });

      return this.noContent();
    }
    catch (error: any) {
      return this.error(error);
    }
  }

}


export interface ProjectForm {
  name: string;
  key: string;
  visibility: string;
}

