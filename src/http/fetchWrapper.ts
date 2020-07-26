import { RequestResponse, ResponseCode } from './types'
import qs from 'qs'
import {
  HttpInterface,
  HttpMethod,
  ContentType,
  HttpRequestOptions,
} from './types'

type plain = string | number
type Data = {
  [index: string]: plain | null | undefined | {}
}

function convertToFormData(data : {[index: string]: any }) {

  const formData: FormData = new FormData()

  Object.keys(data).forEach(key => {

    if (data[key] instanceof Array) {
      data[key].forEach((nData: Object) => {

        if (nData instanceof File || typeof nData === 'string' ) {
          formData.append(key, nData)
          return
        }
        formData.append(key, JSON.stringify(nData))
      })

    } else {
      formData.append(key, data[key])
    }
  })

  return formData
}

export default class FetchWrapper implements HttpInterface {

  static getDefaultRequestInitBy({
    method,
    headers,
  }: {
    method: HttpMethod | string,
    headers?: {
      contentType: string
    }
  }) {
    return {
      method,
      headers: new Headers({
        'Content-Type': headers?.contentType || ContentType.JSON
      }),
    }
  }

  constructor(
    readonly host: string
  ) {}

  createFullUrl(url: string): string {
    return `${this.host}${url}`
  }

  createFullUrlIncludedQueryParam(url: string, queryParam?: string): string {
    return `${this.host}${url}?${queryParam}`
  }

  get<T>(request: HttpRequestOptions): RequestResponse<T>;
  get<T>(url: string, data?: Data): RequestResponse<T>;
  get<T>(
    ...arg: any
  ): RequestResponse<T> {

    if (typeof arg[0] === 'string') {

      return this.getBiparam<T>(arg[0], arg[1])
    }
    if (arg[1]) {
      console.error('Expected 1 argument but 2 or more')
      throw new Error('')
    }
    if (typeof arg[0] === 'object') {

      return this.getUniparam<T>(arg[0])
    }
    throw new Error('Cannot support arguments')
  }
  private getUniparam<T>(request: HttpRequestOptions): RequestResponse<T> {

    const requestInit = FetchWrapper.getDefaultRequestInitBy({
      method: HttpMethod.GET,
      headers: request.headers,
    })
    request.headers.contentType && requestInit.headers.set('Content-Type', request.headers.contentType)

    const fullUrl = this.createFullUrl(request.url)

    if (!request.data) {
      return this.request<T>(fullUrl, requestInit)
    }

    const queryParam = qs.stringify(request.data)

    return this.request<T>(
      `${fullUrl}?${queryParam}`,
      requestInit,
    )
  }
  private getBiparam<T>(url: string, data?: Data): RequestResponse<T> {

    const requestInit = FetchWrapper.getDefaultRequestInitBy({
      method: HttpMethod.GET
    })
    const fullUrl = this.createFullUrl(url)

    if (!data) {
      return this.request(fullUrl, requestInit)
    }

    const queryParam = qs.stringify(data)

    return this.request(
      `${fullUrl}?${queryParam}`,
      requestInit,
    )
  }

  post<T = any>(request: HttpRequestOptions): RequestResponse<T>
  post<T = any>(
    url: string,
    requestInfo?: Data,
  ): RequestResponse<T>
  post<T = any>(...arg: any): RequestResponse<T> {

    return this.processPostOverloading<T>(...arg, HttpMethod.POST)
  }
  processPostOverloading<T = any>(...arg: any): RequestResponse<T> {

    if (typeof arg[0] === 'string' && arg[1]) {

      if (typeof arg[1] !== 'object') {
        return this.postBiparamType<T>(arg[0], undefined, arg[1])
      }

      return this.postBiparamType<T>(arg[0], arg[1], arg[2])
    }
    
    if (typeof arg[0] === 'object') {

      return this.postUniparamType<T>(arg[0], arg[1])
    }
    throw new Error('first argument must be string or object')
  }
  private postUniparamType<T = any>(request: HttpRequestOptions, method: HttpMethod): RequestResponse<T> {

    const requestInit = FetchWrapper.getDefaultRequestInitBy({
      method,
      headers: request.headers,
    })

    return this.request<T>(
      this.createFullUrl(request.url),
      {
        ...requestInit,
        data: request.data,
      },
    )
  }
  private async postBiparamType<T = any>(url: string, data: Data | undefined, method: HttpMethod): RequestResponse<T> {

    const requestInit = FetchWrapper.getDefaultRequestInitBy({
      method,
    })

    return this.request<T>(
      this.createFullUrl(url),
      {
        ...requestInit,
        data
      }
    )
  }

  delete<T = any>(request: HttpRequestOptions): RequestResponse<T>
  delete<T = any>(
    url: string,
    requestInfo?: Data,
  ): RequestResponse<T>
  delete<T = any>(...arg: any): RequestResponse<T> {
    return this.processPostOverloading<T>(...arg, HttpMethod.DELETE)
  }

  put<T = any>(request: HttpRequestOptions): RequestResponse<T>
  put<T = any>(
    url: string,
    requestInfo?: Data,
  ): RequestResponse<T>
  put<T = any>(...arg: any): RequestResponse<T> {
    return this.processPostOverloading<T>(...arg, HttpMethod.PUT)
  }

  request<T = any>(url: string, init: RequestInit & { data?: { [index: string]: any } }): RequestResponse<T> {

    const { data } = init

    if (!data) {
      return fetch(url, {
        ...init,
      }).then(this.processResponse)
      .catch((e: any) => ({
          code: e.status,
          message: e.message,
          data: [] as unknown as T
        })
      )
    }

    const contentType = (init.headers as Headers)?.get('content-type')

    if (contentType === ContentType.MULTIPART) {

      const formData = convertToFormData(data)

      const options = {
        ...init,
        method: init.method,
        headers: new Headers({}),
        body: formData,
      }

      return fetch(
        url,
        options,
      ).then(this.processResponse)
      .catch((e: any) => {
        console.log('error', e)
        return {
          code: e.status,
          message: e.message,
          data: [] as unknown as T
        }
      })
    }

    return fetch(
      url,
      {
        ...init,
        body: JSON.stringify(init.data)
      }).then(this.processResponse)
      .catch((e: any) => ({
          code: e.status,
          message: e.message,
          data: [] as unknown as T
        })
      )
  }

  async processResponse<T = any>(r: Response): RequestResponse<T> {

    const contentType = r.headers.get('Content-Type')

    // If you use NGINX, following show file limit error
    // if (!contentType?.includes('application/json')) {
    //   const text = await r.text()
    //   console.log('text', text)
    //   const match = text.match(/<title>(.*)<\/title>/)
    //   if (!match) {
    //     return {} as any
    //   }
    //   return {
    //     code: ResponseCode.TOO_LARGE_LENGTH,
    //     data: null,
    //     message: match[1],
    //   }
    // }

    return r.json()
  }
}
