type plain = string | number
interface Data {
  [index: string]: plain
}

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

export enum ContentType {
  JSON = 'application/json',
  MULTIPART = 'multipart/form-data',
  text = 'text/plain',
}

export interface HttpRequestOptions {

  url: string;
  method: string;
  headers: any;
}

export interface HttpRequestInfo {
  data?: Data
  contentType?: ContentType
}

export interface HttpInterface {

  host: string

  request(url: string, init: RequestInit): Promise<unknown>
  get(
    url: string,
    requestInfo?: HttpRequestInfo,
  ): Promise<unknown>
  post(
    url: string,
    requestInfo?: HttpRequestInfo,
  ): Promise<unknown>
  delete(url: string, payload?: Data): Promise<unknown>
  put(url: string, payload?: Data): Promise<unknown>
}
