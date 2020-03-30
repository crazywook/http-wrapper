import FetchWrapper from '../src/http/fetchWrapper';
import dotenv from 'dotenv'

dotenv.config()

const host = process.env.BASE_HOST
if (!host) {
  throw new Error('need process.env.BASE_HOST')
}

const http = new FetchWrapper(host)
export default http
