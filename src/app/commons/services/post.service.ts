import { BrickCategoryDTO, BrickTimeInterval } from '../models/interfaces/brick';
import { Injectable } from '@angular/core';
import { BaseService, QueryString } from './base.service';
import { RestService } from './rest.service';
import { ApiResponse, PaginatedResponse } from '../models/interfaces/responses/api.response';
import { BasePostDTO, FullPostDTO } from '../models/interfaces/responses/post.response';
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
      } = await this.restService.get<ApiResponse<FullPostDTO>>(`v1/posts/single?ref=${encodeURIComponent(value)}`);

      // TODO manejar aquí los errores;
      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'La publicación no existe, la misma está eliminada o no es accesible.');
      if (status < 200 || status >= 300 || !payload?.uid) throw new Error('No se pudo cargar la publicación.');

      return this.ok(payload);
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async save(value: string, projectUid?: string, parentUid?: string): Promise<void> {
    try {
      const request = {
        content: value,
        projectUid,
        workspaceUid: this.identityService.getWorkspace().uid,
        ...(parentUid ? { parentUid } : {}),
      };
      const { status, payload } = await this.restService.post<ApiResponse<{ uid: string }>>('v1/posts', request);
      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'La publicación padre, el proyecto o el workspace no existe o no es accesible.');
      if (status < 200 || status >= 300 || !payload?.uid) throw new Error('No se pudo guardar la publicación.');
      return this.noContent();
    }
    catch (error: any) { return this.error(error); }
  }

  async update(value: string, uidReference: string, projectUid: string, parentUid?: string): Promise<void> {
    try {
      const workspace = this.identityService.getWorkspace();
      const request = {
        content: value,
        postUid: uidReference,
        ...(parentUid ? { parentUid } : {}),
        projectUid,
        workspaceUid: workspace.uid,
      };
      const { status } = await this.restService.post<ApiResponse<unknown>>('v1/posts/update', request);

      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'La publicación, el proyecto o el workspace no existe o no es accesible.');
      if (status < 200 || status >= 300) {
        throw new Error('No se pudo actualizar la publicación.');
      }
      return this.noContent();
    }
    catch (error: any) {
      return this.error(error);
    }
  }

  async fetchBrickCategories(insightUid: string): Promise<BrickCategoryDTO[]> {
    const query = this.buildQueryString({ ref: encodeURIComponent(insightUid), workspaceUid: encodeURIComponent(this.identityService.getWorkspace().uid) });
    const { status, payload } = await this.restService.get<ApiResponse<BrickCategoryDTO[]>>(`v1/posts/insights/bricks/categories?${query}`);
    if (status < 200 || status >= 300 || !Array.isArray(payload)) throw new Error('No se pudo cargar el diccionario de categorías.');
    return payload;
  }

  async updateBrickTime(brickUid: string, insightUid: string, action: 'start' | 'finish' | 'report' | 'add', measurementIndex?: number, interval?: BrickTimeInterval): Promise<BasePostDTO> {
    const { status, payload } = await this.restService.post<ApiResponse<BasePostDTO>>('v1/posts/insights/bricks/time', {
      replyUid: brickUid, parentUid: insightUid, workspaceUid: this.identityService.getWorkspace().uid, action,
      ...(measurementIndex === undefined ? {} : { measurementIndex }),
      ...(action === 'add' ? interval : {}),
    });
    if (status < 200 || status >= 300 || !payload?.uid) {
      throw new Error(typeof payload === 'string' ? payload : 'No se pudo actualizar el tiempo del brick.');
    }
    return payload;
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

