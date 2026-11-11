
import { test, describe } from 'node:test'
import { equal } from 'node:assert'


import { ElementdemoSDK } from '..'


describe('exists', async () => {

  test('test-mode', () => {
    const testsdk = ElementdemoSDK.test()
    equal(testsdk instanceof ElementdemoSDK, true,
      'ElementdemoSDK.test() must return a client synchronously')
  })

})
