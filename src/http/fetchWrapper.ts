import qs from 'qs'
import {
  HttpInterface, HttpMethod, ContentType,
  HttpRequestInfo,
} from './types'

type HeadersInit = Headers | string[][] | { [key: string]: string };

interface Headers extends Iterable<[string, string]> {
    forEach(callback: (value: string, name: string) => void): void;
    append(name: string, value: string): void;
    delete(name: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    raw(): { [k: string]: string[] };
    set(name: string, value: string): void;
}

interface HeadersConstructor {
  new (init: HeadersInit): Headers
}

export default class FetchWrapper implements HttpInterface {

  private fetch: any
  private Headers: any

  constructor(
    readonly host: string
  ) {
    this.fetch = typeof fetch === 'undefined'
      ? require('node-fetch')
      : window.fetch
    this.Headers = typeof Headers === 'undefined'
      ? this.fetch.Headers
      : window.Headers
  }

  getDefaultRequestInitByMethod(method: HttpMethod, Headers: HeadersConstructor) {

    return {
      method,
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
    }
  }

  get(
    url: string,
    requestData?: HttpRequestInfo,
  ): Promise<any> {

    const requestInit = this.getDefaultRequestInitByMethod(HttpMethod.GET, this.Headers)

    if (!requestData || !requestData.data || !requestData.contentType) {
      return this.request(url, requestInit)
    }

    requestInit.headers.set('Content-Type', requestData.contentType)

    const queryParam = qs.stringify(requestData.data)

    return this.request(
      `${this.host}/${url}/${queryParam}`,
      requestInit,
    )
  }

  async post(url: string, requestData?: HttpRequestInfo) {

    const requestInit = this.getDefaultRequestInitByMethod(HttpMethod.POST, this.Headers)

    if (!requestData) {
      return 
    }

    return this.request(url, {
      ...requestInit,
      body: JSON.stringify(requestData.data)
    })
  }

  delete(url: string, requestData?: HttpRequestInfo): Promise<any> {

    const requestInit = this.getDefaultRequestInitByMethod(HttpMethod.DELETE, this.Headers)

    return this.request(url, requestInit)
  }

  put(url: string, requestData?: HttpRequestInfo): Promise<any> {

    const requestInit = this.getDefaultRequestInitByMethod(HttpMethod.PUT, this.Headers)

    return this.request(url, requestInit)
  }

  request(url: string, init: any) {
  // request(url: string, init: RequestInit & { data?: { [index: string]: any } }) {

    if (!init.data) {
      return this.fetch(url, {
        ...init,
      }).then((r: Response) => {

        const contentType = r.headers.get('Content-Type')
        console.log('contentType', contentType)
        if (!contentType || !contentType.includes('application/json')) {
          return r
        }
        
        return r.json()
      })
    }

    return this.fetch(url, {
      ...init,
      body: JSON.stringify(init.data)
    }).then((r: Response) => {

      const contentType = r.headers.get('Content-Type')
      console.log('contentType', contentType)
      if (!contentType || !contentType.includes('application/json')) {
       return r
     }
      
      return r.json()
    })
  }
}

// mocha 