import { BrickCategoryDTO, BrickInput, BrickTimeInterval } from '../models/interfaces/brick';
import { Injectable } from '@angular/core';
import { BaseService, QueryString } from './base.service';
import { RestService } from './rest.service';
import { ApiResponse, PaginatedResponse } from '../models/interfaces/responses/api.response';
import { BasePostDTO, FullPostDTO, FullInsightDTO, InsightPostDTO } from '../models/interfaces/responses/post.response';
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

  async fetchInsightByUid(value: string): Promise<FullInsightDTO> {
    try {
      const { status, payload } = await this.restService.get<ApiResponse<FullInsightDTO>>(
        `v1/posts/insights/single?ref=${encodeURIComponent(value)}`);
      Exception.isDefaultErrorStatus(status);
      Exception.isBadRequest(status, 'La referencia del insight es inválida.');
      Exception.isNotFoundStatus(status, 'El insight no existe o no es accesible.');
      if (status < 200 || status >= 300 || !payload?.uid) throw new Error('No se pudo cargar el insight.');
      return this.ok(payload);
    }
    catch (error: any) { return this.error(error); }
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

  async update(value: string, uidReference: string, projectUid: string): Promise<void> {
    try {
      const workspace = this.identityService.getWorkspace();
      const request = {
        content: value,
        postUid: uidReference,
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

  async updateInsight(value: string, insightUid: string, parentUid: string): Promise<void> {
    return this.updateReply('insights', value, insightUid, parentUid);
  }

  async updateComment(value: string, commentUid: string, parentUid: string): Promise<void> {
    return this.updateReply('comments', value, commentUid, parentUid);
  }

  async updateInsightComment(value: string, commentUid: string, insightUid: string): Promise<void> {
    return this.updateReply('insights/comment', value, commentUid, insightUid);
  }

  async updateInsightBrick(value: string, brickUid: string, insightUid: string, fields: BrickInput = {}): Promise<void> {
    return this.updateReply('insights/bricks', value, brickUid, insightUid, fields);
  }

  private async updateReply(type: 'insights' | 'comments' | 'insights/comment' | 'insights/bricks', content: string, replyUid: string, parentUid: string, fields: BrickInput = {}): Promise<void> {
    try {
      const { status, payload } = await this.restService.post<ApiResponse<unknown>>(`v1/posts/${type}/update`, {
        ...fields, content, replyUid, parentUid, workspaceUid: this.identityService.getWorkspace().uid,
      });
      Exception.isDefaultErrorStatus(status);
      if (status === 400) throw new Error(typeof payload === 'string' ? payload : 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'La respuesta o su publicación principal no existe o no es accesible.');
      if (status === 403) throw new Error('No tienes permiso para editar esta respuesta.');
      if (status < 200 || status >= 300) throw new Error('No se pudo actualizar la respuesta.');
      return this.noContent();
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

      if (status < 200 || status >= 300 || !payload?.uid) {
        throw new Error('No se pudo guardar la publicación.');
      }

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

      if (status < 200 || status >= 300 || !payload?.uid) {
        throw new Error('No se pudo guardar la publicación.');
      }

      return this.ok(payload as InsightPostDTO);
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

  async saveInsightComment(value: string, insightUid: string): Promise<BasePostDTO> {
    return this.saveInsightReply('comment', value, insightUid);
  }

  async saveInsightBrick(value: string, insightUid: string, fields: BrickInput = {}): Promise<BasePostDTO> {
    return this.saveInsightReply('bricks', value, insightUid, fields);
  }

  private async saveInsightReply(type: 'comment' | 'bricks', content: string, parentUid: string, fields: BrickInput = {}): Promise<BasePostDTO> {
    try {
      const { status, payload } = await this.restService.post<ApiResponse<BasePostDTO>>(`v1/posts/insights/${type}`, {
        ...fields, content, parentUid, workspaceUid: this.identityService.getWorkspace().uid,
      });
      Exception.isDefaultErrorStatus(status);
      if (status === 400) throw new Error(typeof payload === 'string' ? payload : 'Uno o más datos enviados son inválidos.');
      Exception.isNotFoundStatus(status, 'El insight o su contexto no existe o no es accesible.');
      if (status < 200 || status >= 300 || !payload?.uid) throw new Error('No se pudo guardar la respuesta del insight.');
      return this.ok(payload);
    }
    catch (error: any) { return this.error(error); }
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

