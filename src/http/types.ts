type plain = string | number
interface Data {
  [index: string]: plain
}

export interface SuccessResponse<T> { 
  code: ResponseCode.SUCCESS
  data: T,
  message: string,
}

export interface NotSuccessResponse<T> { 
  code: Exclude<ResponseCode, ResponseCode.SUCCESS>
  data?: null,
  message: string,
}

export type RequestResponse<T = unknown> = Promise<
  SuccessResponse<T>
  | NotSuccessResponse<T>
>

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
}

export enum ContentType {
  JSON = 'application/json',
  MULTIPART = 'multipart/form-data',
  URLENCODED = 'application/x-www-form-urlencoded',
  text = 'text/plain',
}

export interface HttpRequestOptions {

  url: string
  data?: Data
  headers?: any
}

export interface HttpInterface {

  host: string

  request<T = any>(url: string, init: RequestInit): RequestResponse<T>
  get<T = any>(request: HttpRequestOptions): RequestResponse<T>
  get<T = any>(
    url: string,
    requestInfo?: Data,
  ): RequestResponse<T>
  post<T = any>(request: HttpRequestOptions): RequestResponse<T>
  post<T = any>(
    url: string,
    requestInfo?: Data,
  ): RequestResponse<T>
  delete<T = any>(url: string, payload?: Data): RequestResponse<T>
  put<T = any>(url: string, payload?: Data): RequestResponse<T>
}

export enum ResponseCode {

  SUCCESS,
  FAILED,
  INVALID_INPUT_VALUE,
  LOGIN_INPUT_INVALID,
  USER_ID_DUPLICATED,
  USER_EMAIL_DUPLICATED,
  BANK_CLIENT_DUPLICATED,
  NOT_AUTHENTICATED,
  METHOD_NOT_ALLOWED,
  HANDLE_ACCESS_DENIED,
  RESOURCE_NOT_FOUND,
  LOAN_NOT_FOUND,
  NOT_FOUNDED,
  OVER_LIMITATION_OF_EXCEL_ROWS,
  INTERNAL_ERROR,
  TOO_LARGE_LENGTH,
}
