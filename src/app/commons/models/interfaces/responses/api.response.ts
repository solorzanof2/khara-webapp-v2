

export interface ApiResponse<T> {

  status: number;
  payload: T;

}


export interface PaginatedResponse<T> {
  collection: T[];
  hasNext: boolean;
  hasPrevious: boolean;
  length: number;
  page: number;
  perPage: number;
  totalPages: number;
  totalRows: number;
}


export interface ResultResponse {
  result: string;
}

