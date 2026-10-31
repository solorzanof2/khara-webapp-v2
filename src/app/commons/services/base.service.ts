

export class BaseService {

  constructor() { }

  protected error(error: Error) {
    return Promise.reject(new Error(error.message));
  }

  protected ok<T>(payload: T): Promise<T> {
    return Promise.resolve(payload);
  }

  protected noContent(): Promise<void> {
    return Promise.resolve();
  }

  protected buildQueryString(data: QueryString): string {
    if (!Object.keys(data).length) {
      return '';
    }

    let tuples = new Array<string>();
    for (const property in data) {
      tuples.push(`${property}=${data[property]}`);
    }

    return tuples.join('&');
  }

  protected getPaginationQueryString(size: number, offset: string = '', query: string = ''): string {
    const queryData = {
      type: 'page',
      size: `${size}`,
    } as QueryString;

    if (offset) {
      queryData['offset'] = offset;
    }

    if (query) {
      queryData['query'] = query;
    }

    return this.buildQueryString(queryData);
  }

}

export interface QueryString {
  [name: string]: string;
}
