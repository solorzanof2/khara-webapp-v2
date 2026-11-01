import { Injectable } from '@angular/core';
import { BaseService, QueryString } from './base.service';
import { RestService } from './rest.service';
import { ApiResponse, PaginatedResponse } from '../models/interfaces/responses/api.response';
import { BasePostDTO, FullPostDTO, InsightPostDTO } from '../models/interfaces/responses/post.response';
import { Exception } from '../utils/error.utils';
import { IdentityService } from './identity.service';


@Injectable()
export class PostService extends BaseService {

  constructor(
    private restService: RestService,
    private identityService: IdentityService,
  ) {
    super();
  }

  // async fetchAllPaginated(page: number = 0, perPage: number = 10): Promise<PaginatedResponse<FullPostDTO>> {
  //   try {
  //     const queryBuilder = {
  //       page: `${page}`,
  //       perPage: `${perPage}`,
  //     } as QueryString;

  //     const {
  //       status, payload,
  //     } = await this.restService.get<ApiResponse<PaginatedResponse<FullPostDTO>>>(`v1/posts/collection?${this.buildQueryString(queryBuilder)}`);

  //     console.log({paginatedPosts: payload});

  //     Exception.isDefaultErrorStatus(status);
  //     Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
  //     Exception.isNotFoundStatus(status, 'El project definido no existe o el mismo se ha eliminado.');

  //     return this.ok(paginated);
  //   }
  //   catch (error: any) {
  //     return this.error(error);
  //   }
  // }

  async fetchAllPaginatedByProjectUid(value: string, page: number = 0, perPage: number = 10): Promise<PaginatedResponse<FullPostDTO>> {
    try {
      const queryBuilder = {
        page: `${page}`,
        perPage: `${perPage}`,
        ref: value
      } as QueryString;

      const {
        status, payload,
      } = await this.restService.get<ApiResponse<PaginatedResponse<FullPostDTO>>>(`v1/posts/collection?${this.buildQueryString(queryBuilder)}`);

      console.log({paginatedPosts: payload});

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El project definido no existe o el mismo se ha eliminado.');

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async fetchPostByUid(value: string): Promise<FullPostDTO> {
    try {
      const {
        status, payload,
      } = await this.restService.get<ApiResponse<FullPostDTO>>(`v1/posts/single?ref=${value}`);

      // TODO manejar aquí los errores;
      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'La publicación no existe, la misma está eliminada o no es accesible.');

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async save(value: string, projectUid?: string): Promise<void> {
    try {
      const workspace = this.identityService.getWorkspace();

      const request = {
        content: value,
        projectUid,
        workspaceUid: workspace.uid,
      };

      const {
        status, payload,
      } = await this.restService.post<any>('v1/posts', request);

      // TODO manejar aquí los errores;
      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El Workspace, El proyecto o La mención no existe, la misma está eliminada o no es accesible.');

      return this.noContent();
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async update(value: string, uidReference: string): Promise<void> {
    try {

    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async saveComment(value: string, postUid: string/* , projectUid: string */): Promise<BasePostDTO> {
    try {
      const workspace = this.identityService.getWorkspace();

      const request = {
        content: value,
        // projectUid,
        workspaceUid: workspace.uid,
        parentUid: postUid,
      };

      const {
        status, payload,
      } = await this.restService.post<ApiResponse<BasePostDTO>>('v1/posts/comments', request);

      // TODO manejar aquí los errores;
      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El Workspace, El proyecto o La mención no existe, la misma está eliminada o no es accesible.');

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async saveInsight(value: string, postUid: string): Promise<InsightPostDTO> {
    try {
      const workspace = this.identityService.getWorkspace();

      const request = {
        content: value,
        // projectUid,
        workspaceUid: workspace.uid,
        parentUid: postUid,
      };

      const {
        status, payload,
      } = await this.restService.post<ApiResponse<BasePostDTO>>('v1/posts/insights', request);

      // TODO manejar aquí los errores;
      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El Workspace, El proyecto o La mención no existe, la misma está eliminada o no es accesible.');

      return this.ok(payload as InsightPostDTO);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async saveInsightComment(value: string, insightUid: string): Promise<BasePostDTO> {
    try {
      const workspace = this.identityService.getWorkspace();

      const request = {
        content: value,
        // projectUid,
        workspaceUid: workspace.uid,
        parentUid: insightUid,
      };

      const {
        status, payload,
      } = await this.restService.post<ApiResponse<BasePostDTO>>('v1/posts/insights/comment', request);

      // TODO manejar aquí los errores;
      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El Workspace, El proyecto o La mención no existe, la misma está eliminada o no es accesible.');

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async saveInsightBrick(value: string, insightUid: string): Promise<void> {
    try {

    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async fetchAllPaginatedByUserUid(page: number = 0, perPage: number = 10): Promise<PaginatedResponse<FullPostDTO>> {
    try {
      const queryBuilder = {
        page: `${page}`,
        perPage: `${perPage}`,
      } as QueryString;

      const {
        status, payload,
      } = await this.restService.get<ApiResponse<PaginatedResponse<FullPostDTO>>>(`v1/posts/collection/owner?${this.buildQueryString(queryBuilder)}`);

      console.log({paginatedPosts: payload});

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El project definido no existe o el mismo se ha eliminado.');

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

}

