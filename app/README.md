# Periodic Table API Server

A Node.js 24 API server built with Fastify that provides RESTful operations for managing elements and isotopes of the periodic table, plus read-only reference data for groups and series. Data is stored in memory and loaded from a JSON file on startup.

## Requirements

- Node.js 24.x or higher
- npm

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode (auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run unit tests
npm test

# Run API validation tests (requires server running)
npm run validate

# Run full validation (auto starts/stops server)
npm run validate:full
```

The server will start on `http://localhost:8902` by default.

## API Endpoints

| Method | Path                                              | Description                            |
| ------ | ------------------------------------------------- | -------------------------------------- |
| GET    | `/api/element`                                    | List all elements                      |
| POST   | `/api/element`                                    | Create an element                      |
| GET    | `/api/element/{element_id}`                       | Get an element                         |
| PUT    | `/api/element/{element_id}`                       | Update an element                      |
| DELETE | `/api/element/{element_id}`                       | Delete an element (cascades to isotopes) |
| POST   | `/api/element/{element_id}/ionize`                | Ionize an element                      |
| GET    | `/api/element/{element_id}/isotope`               | List isotopes of an element            |
| POST   | `/api/element/{element_id}/isotope`               | Create an isotope                      |
| GET    | `/api/element/{element_id}/isotope/{isotope_id}`  | Get an isotope                         |
| PUT    | `/api/element/{element_id}/isotope/{isotope_id}`  | Update an isotope                      |
| DELETE | `/api/element/{element_id}/isotope/{isotope_id}`  | Delete an isotope                      |
| POST   | `/api/element/{element_id}/isotope/{isotope_id}/decay` | Decay an isotope                  |
| GET    | `/api/group`                                      | List all groups (read-only)            |
| GET    | `/api/group/{group_id}`                           | Get a group (read-only)                |
| GET    | `/api/series`                                     | List all series (read-only)            |
| GET    | `/api/series/{series_id}`                         | Get a series (read-only)               |

Groups and series are **read-only**: the OpenAPI definition has no create,
update or delete for them, so those routes do not exist — a write request
answers 404 in the standard error envelope, like any other unmatched route.

### Elements

#### List all elements
```bash
curl http://localhost:8902/api/element
```

**Response:** Array of element objects

#### Get a specific element
```bash
curl http://localhost:8902/api/element/fe
```

**Response:** Element object
```json
{
  "id": "fe",
  "name": "Iron",
  "symbol": "Fe",
  "number": 26,
  "period": 4,
  "block": "d",
  "series_id": "transition-metal",
  "mass": 55.845,
  "group": 8,
  "phase": "solid"
}
```

#### Create a new element
```bash
curl -X POST http://localhost:8902/api/element \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uue",
    "name": "Ununennium",
    "symbol": "Uue",
    "number": 119,
    "period": 8,
    "block": "s",
    "series_id": "alkali-metal",
    "mass": 315
  }'
```

**Response:** Created element object (201)

#### Update an element
```bash
curl -X PUT http://localhost:8902/api/element/uue \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uue",
    "name": "Ununennium (Eka-francium)",
    "symbol": "Uue",
    "number": 119,
    "period": 8,
    "block": "s",
    "series_id": "alkali-metal",
    "mass": 315
  }'
```

**Response:** Updated element object (200)

#### Delete an element
```bash
curl -X DELETE http://localhost:8902/api/element/uue
```

**Response:** No content (204)

**Note:** Deleting an element will cascade delete all its isotopes.

#### Ionize an element
Build the ion notation for an element and a charge (default `1`).

```bash
# Fe with charge 3
curl -X POST http://localhost:8902/api/element/fe/ionize \
  -H "Content-Type: application/json" \
  -d '{"charge": 3}'

# O with charge -2
curl -X POST http://localhost:8902/api/element/o/ionize \
  -H "Content-Type: application/json" \
  -d '{"charge": -2}'
```

**Response:**
```json
{
  "ok": true,
  "ion": "Fe3+"
}
```

The magnitude is omitted when it is one (`H+`, `Cl-`). A charge of `0` is no
ion at all: `{ "ok": false, "ion": "Fe" }`.

### Isotopes

#### List isotopes of an element
```bash
curl http://localhost:8902/api/element/h/isotope
```

**Response:** Array of isotope objects

#### Get a specific isotope
```bash
curl http://localhost:8902/api/element/h/isotope/h-2
```

**Response:** Isotope object
```json
{
  "id": "h-2",
  "element_id": "h",
  "name": "Hydrogen-2",
  "mass_number": 2,
  "mass": 2.014102,
  "stable": true,
  "abundance": 0.000115
}
```

#### Create a new isotope
```bash
curl -X POST http://localhost:8902/api/element/c/isotope \
  -H "Content-Type: application/json" \
  -d '{
    "id": "c-11",
    "element_id": "c",
    "name": "Carbon-11",
    "mass_number": 11,
    "mass": 11.011433,
    "stable": false,
    "halflife": "20.4 min",
    "mode": "beta+",
    "product": "b-11"
  }'
```

**Response:** Created isotope object (201)

**Note:** The `element_id` in the body must match the `element_id` in the URL path.

#### Update an isotope
```bash
curl -X PUT http://localhost:8902/api/element/c/isotope/c-11 \
  -H "Content-Type: application/json" \
  -d '{
    "id": "c-11",
    "element_id": "c",
    "name": "Carbon-11 (PET tracer)",
    "mass_number": 11,
    "mass": 11.011433,
    "stable": false
  }'
```

**Response:** Updated isotope object (200)

#### Delete an isotope
```bash
curl -X DELETE http://localhost:8902/api/element/c/isotope/c-11
```

**Response:** No content (204)

#### Decay an isotope
Walk the decay chain, at most `steps` decays (default `1`). Each step turns
the isotope into its `product`; the walk continues only while the product is
itself a record in the store AND unstable, so a missing or stable product
ends the chain early. The response reports the mode of the last step that
applied and the final product id.

```bash
# One step: c-14 -> n-14
curl -X POST http://localhost:8902/api/element/c/isotope/c-14/decay \
  -H "Content-Type: application/json" \
  -d '{}'

# Three requested, two applied: ra-226 -> rn-222 -> po-218 (not a record)
curl -X POST http://localhost:8902/api/element/ra/isotope/ra-226/decay \
  -H "Content-Type: application/json" \
  -d '{"steps": 3}'
```

**Response:**
```json
{
  "ok": true,
  "mode": "beta-",
  "product": "n-14"
}
```

A stable isotope does not decay, however many steps are asked for:
```json
{
  "ok": false,
  "mode": "stable"
}
```

### Groups (read-only)

#### List all groups
```bash
curl http://localhost:8902/api/group
```

**Response:** Array of group objects

#### Get a specific group
```bash
curl http://localhost:8902/api/group/g1
```

**Response:** Group object
```json
{
  "id": "g1",
  "number": 1,
  "cas": "IA",
  "name": "alkali metals"
}
```

### Series (read-only)

#### List all series
```bash
curl http://localhost:8902/api/series
```

**Response:** Array of series objects

#### Get a specific series
```bash
curl http://localhost:8902/api/series/alkali-metal
```

**Response:** Series object
```json
{
  "id": "alkali-metal",
  "name": "Alkali metal",
  "color": "red",
  "description": "Soft, highly reactive metals of group 1."
}
```

## Error Responses

Every failure uses one envelope — `{ error, message }` — and `error` is always
a PascalCase name. Switch on the **status code**; treat `error` as a label for
humans reading logs, and `message` as free text that may change.

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "body must have required property 'name'"
}
```

Covers both a schema violation and a malformed JSON body.

### 404 Not Found
```json
{
  "error": "NotFoundError",
  "message": "Element with id 'unknown' not found"
}
```

Also what a write to a read-only entity gets: `POST /api/group` is an
unmatched route, so it answers
`{ "error": "NotFoundError", "message": "Route POST:/api/group not found" }`.

### 409 Conflict
```json
{
  "error": "ConflictError",
  "message": "Element with id 'fe' already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "InternalServerError",
  "message": "Something went wrong"
}
```

Server faults are logged with a stack; 4xx are not, since they are the
caller's to fix rather than this server's.

## Data Schema

### Element
```typescript
{
  id: string           // Unique identifier, the lowercase symbol
  name: string         // Element name
  symbol: string       // Chemical symbol
  number: number       // Atomic number
  period: number       // Periodic table row, 1 to 7
  block: string        // Orbital block, one of s, p, d, f
  series_id: string    // Chemical series this element belongs to
  mass: number         // Standard atomic weight in daltons
  group?: number       // Optional: column 1 to 18, absent for the f-block
  phase?: string       // Optional: phase at standard temperature and pressure
  discovered?: number  // Optional: year of discovery
}
```

### Isotope
```typescript
{
  id: string           // Unique identifier, symbol dash mass number
  element_id: string   // Parent element ID
  name: string         // Isotope name
  mass_number: number  // Total protons and neutrons
  mass: number         // Isotopic mass in daltons
  stable: boolean      // True if the isotope is stable
  abundance?: number   // Optional: natural abundance as a fraction
  halflife?: string    // Optional: half-life, absent for stable isotopes
  mode?: string        // Optional: primary decay mode
  product?: string     // Optional: primary decay product isotope
}
```

### Group (read-only)
```typescript
{
  id: string       // Group identifier, g1 to g18
  number: number   // Group number, 1 to 18
  cas: string      // CAS group designation
  name?: string    // Optional: trivial name, where one exists
}
```

### Series (read-only)
```typescript
{
  id: string           // Series identifier
  name: string         // Series name
  color: string        // Display color used by the element card renderer
  description: string  // One-line description of the series
}
```

## Development

### Project Structure
```
app/
├── src/
│   ├── server.ts           # Main server setup
│   ├── config.ts           # Configuration
│   ├── types.ts            # TypeScript types
│   ├── store/              # Data layer
│   ├── handlers/           # Request handlers
│   ├── routes/             # Route definitions
│   ├── schemas/            # JSON schemas for validation
│   └── utils/              # Utilities
├── test/
│   ├── store/              # Unit tests for stores
│   └── integration/        # Integration tests
├── element.data.json       # Initial data
└── def/                    # OpenAPI specification
```

### Scripts

**Development:**
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm run server` - Build and start production server
- `npm start` - Start production server (requires build)

**Testing:**
- `npm test` - Run all unit/integration tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:watch` - Run tests in watch mode

**Validation:**
- `npm run validate` - Run API validation tests (server must be running)
- `npm run validate:full` - Build, start server, validate, and cleanup automatically

**Utilities:**
- `npm run typecheck` - Type check without emitting files
- `npm run clean` - Remove dist folder

### Testing

The project uses Node.js built-in test runner (node:test) with two types of tests:

**Unit Tests:** Test individual components in isolation
```bash
npm run test:unit
```

**Integration Tests:** Test full API workflows
```bash
npm run test:integration
```

### API Validation

The project includes a comprehensive validation script (`validate.ts`) that tests all API endpoints using fetch:

**Run with server already running:**
```bash
# Terminal 1: Start server
npm run server

# Terminal 2: Run validation
npm run validate
```

**Run with automatic server management:**
```bash
npm run validate:full
```

The validation script tests:
- ✓ All CRUD operations for elements and isotopes
- ✓ Custom operations (ionize, decay — including multi-step decay chains)
- ✓ Read-only groups and series (and that their write routes are absent)
- ✓ Error handling (404, 400)
- ✓ Cascade deletes
- ✓ Request validation

**Output:** 34 validation tests covering all API functionality.

### Environment Variables

- `HOST` - Server host (default: localhost)
- `PORT` - Server port (default: 8902)
- `DEBUG_ROUTE` - Force `GET /debug` on (`true`) or off (`false`). Unset, it
  follows the bind address: served on loopback, absent otherwise.
- `LOG_LEVEL` - Logging level (default: `error`). Deliberately quiet: the
  test suites do not set it, so a chattier default would put request logs
  through every `npm test` and CI run. Set `LOG_LEVEL=info` when running
  the server by hand.
- `NODE_ENV` - Environment (development, production)
- `DATA_PATH` - Path to data file (default: ./element.data.json)

## Architecture

### Data Storage
- In-memory storage using Map data structures
- Repository pattern for data access
- Data loaded from `element.data.json` on server startup
- Cascade delete: removing an element removes all its isotopes
- Groups and series are read-only: their stores expose only seed/list/load

### Validation
- JSON Schema validation using Fastify's built-in Ajv integration
- Request body, params, and response validation
- OpenAPI 3.0 compliant schemas

### Error Handling
- Custom error classes with HTTP status codes
- Centralized error handler
- Proper error responses with consistent format

## Initial Data

The server comes pre-loaded with:
- 118 elements (hydrogen through oganesson)
- 46 notable isotopes across various elements
- 18 groups (g1 to g18)
- 10 series (alkali metals through actinoids)

## License

ISC
