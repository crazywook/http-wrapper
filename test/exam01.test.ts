import { expect } from 'chai';
import http from './https';


describe('fetch wrapper test', () => {
  it('get test', async () => {

    const result = await http.get('https://jsonplaceholder.typicode.com/todos')
    console.log('result', result[0])
    expect(result).to.be.instanceof(Array);
  });
});

// mocha -r ts-node/register ./test/exam01.test.ts