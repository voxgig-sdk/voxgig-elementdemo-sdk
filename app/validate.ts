#!/usr/bin/env node

// Same PORT/HOST the runner script binds to. Hardcoding localhost:8902 would
// mean `PORT=9123 npm run validate:full` started a server on 9123, waited for
// 9123, and then validated against 8902 — passing against a different server,
// or failing for the wrong reason.
const BASE_URL =
  process.env.VALIDATE_BASE_URL ||
  `http://${process.env.HOST || 'localhost'}:${process.env.PORT || '8902'}`

// The account every path is scoped to, and the long-lived secret that buys
// access tokens for it. Defaults match app/src/config.ts's own defaults, so
// `npm run validate` works against a server started with no environment at
// all; override both when validating against a server that was.
const ACCOUNT_ID = process.env.ACCOUNT_ID || 'acc01'
const REFRESH_TOKEN = process.env.REFRESH_TOKEN || 'rt-elementdemo-dev-refresh-token'

// The account-scoped base every API call below is relative to. This is
// exactly the URL a generated SDK builds from the OpenAPI server template
// `http://localhost:8902/api/{account_id}` and its `account_id` option.
const API_URL = `${BASE_URL}/api/${ACCOUNT_ID}`

let accessToken: string | null = null
let refreshCount = 0

// Buy an access token with the refresh token.
async function refreshAccessToken(): Promise<string> {
  const res = await fetch(`${API_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: REFRESH_TOKEN }),
  })

  if (!res.ok) {
    throw new Error(
      `could not obtain an access token: ${res.status} ${await res.text()}`)
  }

  const body = await res.json()
  accessToken = body.access_token
  refreshCount++

  return accessToken as string
}

// Every API call in this script goes through here.
//
// An access token serves FOUR requests and is then invalidated by the
// server, and this script makes far more than four — so a 401 is retried
// ONCE against a freshly bought token. That single retry is the entire
// client-side obligation this API's auth imposes, and it is what the
// generated SDK's tokenauth feature does for a caller.
//
// One retry, not a loop: a second 401 on a token just issued means the
// credential or the account is wrong, and looping would turn a clear
// failure into a hang.
async function api(path: string, init?: RequestInit): Promise<Response> {
  if (null == accessToken) {
    await refreshAccessToken()
  }

  const send = () => fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const res = await send()

  if (401 !== res.status) {
    return res
  }

  await refreshAccessToken()
  return send()
}

interface TestResult {
  name: string
  passed: boolean
  message?: string
}

const results: TestResult[] = []

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
}

async function test(name: string, fn: () => Promise<void>) {
  process.stdout.write(`\n=== ${name} ===\n`)
  try {
    await fn()
    results.push({ name, passed: true })
    console.log('✓ PASSED')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    results.push({ name, passed: false, message })
    console.log(`✗ FAILED: ${message}`)
  }
}

async function main() {
  console.log('🚀 Starting API Validation Tests\n')
  console.log(`Base URL: ${API_URL}\n`)

  // Test 0: the credential round trip, before anything that depends on it.
  //
  // Placed first and asserted explicitly because every test after it hides
  // the flow behind api(): if the exchange or the expiry were broken, the
  // rest of this script would still fail — but on whatever call happened to
  // be fifth, blaming the periodic table.
  await test('0. Refresh token buys an access token that expires after 4 requests', async () => {
    const res = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: REFRESH_TOKEN }),
    })
    assert(res.ok, `Expected 200 from the token endpoint, got ${res.status}`)

    const body = await res.json()
    assert('string' === typeof body.access_token, 'Expected an access_token')
    assert(body.token_type === 'Bearer', `Expected Bearer, got ${body.token_type}`)

    const uses = body.expires_in_requests
    assert(0 < uses, `Expected a positive expires_in_requests, got ${uses}`)

    // Spend the token down and prove the next request is refused. Uses the
    // raw fetch, not api(): the whole point is to SEE the 401 that api()
    // exists to absorb.
    const probe = () => fetch(`${API_URL}/element/fe`, {
      headers: { Authorization: `Bearer ${body.access_token}` },
    })

    for (let i = 1; i <= uses; i++) {
      const ok = await probe()
      assert(ok.status === 200, `Request ${i} of ${uses} should succeed, got ${ok.status}`)
    }

    const spent = await probe()
    assert(spent.status === 401,
      `Request ${uses + 1} should be refused, got ${spent.status}`)

    const err = await spent.json()
    assert(err.error === 'AuthError', `Expected AuthError, got ${err.error}`)

    console.log(`   Access token served ${uses} requests, then 401 as designed`)
  })

  await test('0b. An unauthenticated request is refused', async () => {
    const res = await fetch(`${API_URL}/element`)
    assert(res.status === 401, `Expected 401, got ${res.status}`)
    const body = await res.json()
    assert(body.error === 'AuthError', `Expected AuthError, got ${body.error}`)
    console.log('   No credential, no data')
  })

  await test('0c. A wrong refresh token is refused', async () => {
    const res = await fetch(`${API_URL}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: 'not-the-refresh-token' }),
    })
    assert(res.status === 401, `Expected 401, got ${res.status}`)
    console.log('   Bad refresh token rejected')
  })

  // Test 1: List all elements
  await test('1. List all elements', async () => {
    const res = await api(`/element`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const elements = await res.json()
    assert(Array.isArray(elements), 'Expected array')
    assert(elements.length === 118, `Expected 118 elements, got ${elements.length}`)
    console.log(`   Found ${elements.length} elements`)
  })

  // Test 2: Get specific element (Iron)
  await test('2. Get specific element (Iron)', async () => {
    const res = await api(`/element/fe`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const element = await res.json()
    assert(element.id === 'fe', `Expected id 'fe', got '${element.id}'`)
    assert(element.name === 'Iron', `Expected name 'Iron', got '${element.name}'`)
    assert(element.symbol === 'Fe', `Expected symbol 'Fe', got '${element.symbol}'`)
    assert(element.number === 26, `Expected number 26, got ${element.number}`)
    assert(element.mass === 55.845, `Expected mass 55.845, got ${element.mass}`)
    console.log(`   Element: ${element.name} (${element.symbol}), number ${element.number}`)
  })

  // Test 3: Create a new element (Ununennium)
  await test('3. Create a new element (Ununennium)', async () => {
    const res = await api(`/element`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'uue',
        name: 'Ununennium',
        symbol: 'Uue',
        number: 119,
        period: 8,
        block: 's',
        series_id: 'alkali-metal',
        mass: 315,
      }),
    })
    assert(res.status === 201, `Expected 201, got ${res.status}`)
    const element = await res.json()
    assert(element.id === 'uue', 'Element ID mismatch')
    console.log(`   Created: ${element.name}`)
  })

  // Test 4: Update element (Ununennium)
  await test('4. Update element (Ununennium)', async () => {
    const res = await api(`/element/uue`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'uue',
        name: 'Ununennium (Eka-francium)',
        symbol: 'Uue',
        number: 119,
        period: 8,
        block: 's',
        series_id: 'alkali-metal',
        mass: 315,
      }),
    })
    assert(res.ok, `Expected 200, got ${res.status}`)
    const element = await res.json()
    assert(
      element.name === 'Ununennium (Eka-francium)',
      `Expected name 'Ununennium (Eka-francium)', got '${element.name}'`
    )
    console.log(`   Updated name to: ${element.name}`)
  })

  // Test 5: Ionize iron with charge 3
  await test('5. Ionize iron with charge 3', async () => {
    const res = await api(`/element/fe/ionize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charge: 3 }),
    })
    assert(res.ok, `Expected 200, got ${res.status}`)
    const result = await res.json()
    assert(result.ok === true, 'Expected ok: true')
    assert(result.ion === 'Fe3+', `Expected ion 'Fe3+', got '${result.ion}'`)
    console.log(`   Ion: ${result.ion}`)
  })

  // Test 6: Ionize oxygen with charge -2
  await test('6. Ionize oxygen with charge -2', async () => {
    const res = await api(`/element/o/ionize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charge: -2 }),
    })
    assert(res.ok, `Expected 200, got ${res.status}`)
    const result = await res.json()
    assert(result.ok === true, 'Expected ok: true')
    assert(result.ion === 'O2-', `Expected ion 'O2-', got '${result.ion}'`)
    console.log(`   Ion: ${result.ion}`)
  })

  // Test 7: Ionize hydrogen with the default charge
  await test('7. Ionize hydrogen with the default charge', async () => {
    const res = await api(`/element/h/ionize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    assert(res.ok, `Expected 200, got ${res.status}`)
    const result = await res.json()
    assert(result.ok === true, 'Expected ok: true')
    assert(result.ion === 'H+', `Expected ion 'H+', got '${result.ion}'`)
    console.log(`   Ion: ${result.ion}`)
  })

  // Test 8: Ionize with charge 0 is no ion at all
  await test('8. Ionize with charge 0 is no ion at all', async () => {
    const res = await api(`/element/fe/ionize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charge: 0 }),
    })
    assert(res.ok, `Expected 200, got ${res.status}`)
    const result = await res.json()
    assert(result.ok === false, 'Expected ok: false')
    assert(result.ion === 'Fe', `Expected ion 'Fe', got '${result.ion}'`)
    console.log(`   No ion: ${result.ion}`)
  })

  // Test 9: Ionize a non-existent element
  await test('9. Ionize a non-existent element returns 404', async () => {
    const res = await api(`/element/unobtainium/ionize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charge: 1 }),
    })
    assert(res.status === 404, `Expected 404, got ${res.status}`)
    console.log(`   Correctly returned 404`)
  })

  // Test 10: List isotopes of hydrogen
  await test('10. List isotopes of hydrogen', async () => {
    const res = await api(`/element/h/isotope`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const isotopes = await res.json()
    assert(Array.isArray(isotopes), 'Expected array')
    assert(isotopes.length === 3, `Expected 3 isotopes, got ${isotopes.length}`)
    console.log(`   Found ${isotopes.length} isotopes: ${isotopes.map((i: any) => i.id).join(', ')}`)
  })

  // Test 11: Get specific isotope (Hydrogen-2)
  await test('11. Get specific isotope (Hydrogen-2)', async () => {
    const res = await api(`/element/h/isotope/h-2`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const isotope = await res.json()
    assert(isotope.id === 'h-2', `Expected id 'h-2', got '${isotope.id}'`)
    assert(isotope.name === 'Hydrogen-2', `Expected name 'Hydrogen-2', got '${isotope.name}'`)
    assert(isotope.element_id === 'h', `Expected element_id 'h', got '${isotope.element_id}'`)
    assert(isotope.stable === true, `Expected stable true, got ${isotope.stable}`)
    console.log(`   Isotope: ${isotope.name}, mass ${isotope.mass}`)
  })

  // Test 12: Create a new isotope for carbon
  await test('12. Create a new isotope for carbon', async () => {
    const res = await api(`/element/c/isotope`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'c-11',
        element_id: 'c',
        name: 'Carbon-11',
        mass_number: 11,
        mass: 11.011433,
        stable: false,
        halflife: '20.4 min',
        mode: 'beta+',
        product: 'b-11',
      }),
    })
    assert(res.status === 201, `Expected 201, got ${res.status}`)
    const isotope = await res.json()
    assert(isotope.id === 'c-11', 'Isotope ID mismatch')
    console.log(`   Created: ${isotope.name}`)
  })

  // Test 13: Update isotope (Carbon-11)
  await test('13. Update isotope (Carbon-11)', async () => {
    const res = await api(`/element/c/isotope/c-11`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'c-11',
        element_id: 'c',
        name: 'Carbon-11 (PET tracer)',
        mass_number: 11,
        mass: 11.011433,
        stable: false,
      }),
    })
    assert(res.ok, `Expected 200, got ${res.status}`)
    const isotope = await res.json()
    assert(
      isotope.name === 'Carbon-11 (PET tracer)',
      `Expected name 'Carbon-11 (PET tracer)', got '${isotope.name}'`
    )
    console.log(`   Updated name to: ${isotope.name}`)
  })

  // Test 14: Verify carbon has 4 isotopes
  await test('14. Verify carbon has 4 isotopes', async () => {
    const res = await api(`/element/c/isotope`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const isotopes = await res.json()
    assert(isotopes.length === 4, `Expected 4 isotopes, got ${isotopes.length}`)
    console.log(`   Carbon now has ${isotopes.length} isotopes`)
  })

  // Test 15: Delete isotope (Carbon-11)
  await test('15. Delete isotope (Carbon-11)', async () => {
    const res = await api(`/element/c/isotope/c-11`, {
      method: 'DELETE',
    })
    assert(res.status === 204, `Expected 204, got ${res.status}`)

    const gone = await api(`/element/c/isotope/c-11`)
    assert(gone.status === 404, `Expected 404 after delete, got ${gone.status}`)
    console.log(`   Carbon-11 deleted successfully`)
  })

  // Test 16: Decay carbon-14
  await test('16. Decay carbon-14', async () => {
    const res = await api(`/element/c/isotope/c-14/decay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    assert(res.ok, `Expected 200, got ${res.status}`)
    const result = await res.json()
    assert(result.ok === true, 'Expected ok: true')
    assert(result.mode === 'beta-', `Expected mode 'beta-', got '${result.mode}'`)
    assert(result.product === 'n-14', `Expected product 'n-14', got '${result.product}'`)
    console.log(`   c-14 --${result.mode}--> ${result.product}`)
  })

  // Test 17: Decay a stable isotope (helium-4)
  await test('17. Decay a stable isotope (helium-4)', async () => {
    const res = await api(`/element/he/isotope/he-4/decay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps: 3 }),
    })
    assert(res.ok, `Expected 200, got ${res.status}`)
    const result = await res.json()
    assert(result.ok === false, 'Expected ok: false')
    assert(result.mode === 'stable', `Expected mode 'stable', got '${result.mode}'`)
    console.log(`   he-4 is ${result.mode}: no decay`)
  })

  // Test 18: Decay uranium-238 with steps 3 (chain leaves the store)
  await test('18. Decay uranium-238 with steps 3 stops where the store ends', async () => {
    // u-238's product th-234 is not a record, so only one step can apply.
    const res = await api(`/element/u/isotope/u-238/decay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps: 3 }),
    })
    assert(res.ok, `Expected 200, got ${res.status}`)
    const result = await res.json()
    assert(result.ok === true, 'Expected ok: true')
    assert(result.mode === 'alpha', `Expected mode 'alpha', got '${result.mode}'`)
    assert(result.product === 'th-234', `Expected product 'th-234', got '${result.product}'`)
    console.log(`   u-238 --${result.mode}--> ${result.product} (chain left the store)`)
  })

  // Test 19: Decay radium-226 with steps 3 (a real multi-step walk)
  await test('19. Decay radium-226 with steps 3 walks two steps', async () => {
    // ra-226 -> rn-222 (a record, unstable) -> po-218 (not a record).
    const res = await api(`/element/ra/isotope/ra-226/decay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps: 3 }),
    })
    assert(res.ok, `Expected 200, got ${res.status}`)
    const result = await res.json()
    assert(result.ok === true, 'Expected ok: true')
    assert(result.mode === 'alpha', `Expected mode 'alpha', got '${result.mode}'`)
    assert(result.product === 'po-218', `Expected product 'po-218', got '${result.product}'`)
    console.log(`   ra-226 --> rn-222 --${result.mode}--> ${result.product}`)
  })

  // Test 20: Decay a non-existent isotope
  await test('20. Decay a non-existent isotope returns 404', async () => {
    const res = await api(`/element/h/isotope/h-99/decay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    assert(res.status === 404, `Expected 404, got ${res.status}`)
    console.log(`   Correctly returned 404`)
  })

  // Test 21: List all groups
  await test('21. List all groups', async () => {
    const res = await api(`/group`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const groups = await res.json()
    assert(Array.isArray(groups), 'Expected array')
    assert(groups.length === 18, `Expected 18 groups, got ${groups.length}`)
    console.log(`   Found ${groups.length} groups`)
  })

  // Test 22: Get specific group (g1)
  await test('22. Get specific group (g1)', async () => {
    const res = await api(`/group/g1`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const group = await res.json()
    assert(group.id === 'g1', `Expected id 'g1', got '${group.id}'`)
    assert(group.cas === 'IA', `Expected cas 'IA', got '${group.cas}'`)
    assert(group.name === 'alkali metals', `Expected name 'alkali metals', got '${group.name}'`)
    console.log(`   Group ${group.number} (${group.cas}): ${group.name}`)
  })

  // Test 23: Groups are read-only
  await test('23. Groups are read-only: POST /api/group is not a route', async () => {
    const res = await api(`/group`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'g19', number: 19, cas: 'XXB' }),
    })
    assert(res.status === 404, `Expected 404, got ${res.status}`)
    const error = await res.json()
    assert(error.error === 'NotFoundError', 'Expected NotFoundError')
    console.log(`   Correctly returned 404: ${error.message}`)
  })

  // Test 24: List all series
  await test('24. List all series', async () => {
    const res = await api(`/series`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const series = await res.json()
    assert(Array.isArray(series), 'Expected array')
    assert(series.length === 10, `Expected 10 series, got ${series.length}`)
    console.log(`   Found ${series.length} series`)
  })

  // Test 25: Get specific series (alkali-metal)
  await test('25. Get specific series (alkali-metal)', async () => {
    const res = await api(`/series/alkali-metal`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const series = await res.json()
    assert(series.id === 'alkali-metal', `Expected id 'alkali-metal', got '${series.id}'`)
    assert(series.name === 'Alkali metal', `Expected name 'Alkali metal', got '${series.name}'`)
    assert(series.color === 'red', `Expected color 'red', got '${series.color}'`)
    console.log(`   Series: ${series.name} (${series.color})`)
  })

  // Test 26: Series are read-only
  await test('26. Series are read-only: DELETE /api/series/:id is not a route', async () => {
    const res = await api(`/series/alkali-metal`, {
      method: 'DELETE',
    })
    assert(res.status === 404, `Expected 404, got ${res.status}`)
    console.log(`   Correctly returned 404`)
  })

  // Test 27: Test 404 - Non-existent element
  await test('27. Test 404 - Non-existent element', async () => {
    const res = await api(`/element/nonexistent`)
    assert(res.status === 404, `Expected 404, got ${res.status}`)
    const error = await res.json()
    assert(error.error === 'NotFoundError', 'Expected NotFoundError')
    assert(
      error.message.includes('not found'),
      `Expected 'not found' in message, got '${error.message}'`
    )
    console.log(`   Correctly returned 404: ${error.message}`)
  })

  // Test 28: Test validation error - Missing required field
  await test('28. Test validation error - Missing required field', async () => {
    const res = await api(`/element`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'test', name: 'Test' }),
    })
    assert(res.status === 400, `Expected 400, got ${res.status}`)
    const error = await res.json()
    assert(error.message.includes('symbol'), `Expected 'symbol' in error message, got '${error.message}'`)
    console.log(`   Correctly returned 400: ${error.message}`)
  })

  // Test 29: Count uranium's isotopes before delete
  let uraniumIsotopeCount = 0
  await test('29. Count uranium isotopes before delete', async () => {
    const res = await api(`/element/u/isotope`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const isotopes = await res.json()
    uraniumIsotopeCount = isotopes.length
    assert(uraniumIsotopeCount > 0, `Expected uranium to have isotopes, got ${uraniumIsotopeCount}`)
    console.log(`   Uranium has ${uraniumIsotopeCount} isotopes`)
  })

  // Test 30: Delete uranium (cascade delete test)
  await test('30. Delete uranium (cascade delete test)', async () => {
    const res = await api(`/element/u`, {
      method: 'DELETE',
    })
    assert(res.status === 204, `Expected 204, got ${res.status}`)
    console.log(`   Uranium deleted successfully`)
  })

  // Test 31: Verify uranium is deleted
  await test('31. Verify uranium is deleted', async () => {
    const res = await api(`/element/u`)
    assert(res.status === 404, `Expected 404, got ${res.status}`)
    console.log(`   Uranium correctly returns 404`)
  })

  // Test 32: Verify uranium's isotopes were cascade deleted
  await test('32. Verify uranium isotopes cascade deleted', async () => {
    const res = await api(`/element/u/isotope/u-238`)
    assert(res.status === 404, `Expected 404 for deleted isotope, got ${res.status}`)
    console.log(`   Uranium's isotopes correctly cascade deleted`)
  })

  // Test 33: Delete Ununennium (cleanup)
  await test('33. Delete Ununennium (cleanup)', async () => {
    const res = await api(`/element/uue`, {
      method: 'DELETE',
    })
    assert(res.status === 204, `Expected 204, got ${res.status}`)
    console.log(`   Ununennium deleted successfully`)
  })

  // Test 34: Final state - Count remaining elements
  await test('34. Final state - Count remaining elements', async () => {
    const res = await api(`/element`)
    assert(res.ok, `Expected 200, got ${res.status}`)
    const elements = await res.json()
    assert(
      elements.length === 117,
      `Expected 117 elements (118 + Uue - U - Uue), got ${elements.length}`
    )
    console.log(`   ${elements.length} elements remaining`)
  })

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('VALIDATION SUMMARY')
  console.log('='.repeat(60))

  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  console.log(`\nTotal Tests: ${results.length}`)
  console.log(`Access tokens bought: ${refreshCount} ` +
    `(one per 4 requests — the SDK's refresh path, exercised)`)
  console.log(`✓ Passed: ${passed}`)
  console.log(`✗ Failed: ${failed}`)

  if (failed > 0) {
    console.log('\nFailed Tests:')
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ✗ ${r.name}`)
        console.log(`    ${r.message}`)
      })
  }

  console.log('\n' + '='.repeat(60))

  if (failed > 0) {
    process.exit(1)
  } else {
    console.log('\n🎉 All validation tests passed!\n')
    process.exit(0)
  }
}

main().catch((error) => {
  console.error('\n❌ Validation script error:', error)
  process.exit(1)
})
