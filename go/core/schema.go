package core

import (
	"encoding/json"
)

// Elementdemo Go SDK: generated schemas. Do not edit.
//
// Generated from the model: `main.kit.optspec` and each feature's
// `config.options` for OPTSPEC; entity `fields{}.type` for ENTITYSPEC.

const optspecJSON = "{\"allow\":{\"method\":\"GET,PUT,POST,PATCH,DELETE,OPTIONS\",\"op\":\"create,update,patch,load,list,remove,command,direct,graphql\"},\"apikey\":\"\",\"auth\":{\"basic\":false,\"in\":\"\",\"name\":\"\",\"prefix\":\"\"},\"base\":\"http://localhost:8000\",\"clean\":{\"active\":true,\"hint\":\"0\",\"keys\":\"key,secret,token,password,passwd,authorization,cookie,credential,signature\",\"mask\":\"[redacted]\",\"min\":\"4\",\"values\":\"\"},\"entity\":{\"`$CHILD`\":{\"`$OPEN`\":true,\"active\":false,\"alias\":{}}},\"extend\":\"`$ANY`\",\"headers\":{\"`$CHILD`\":\"`$STRING`\"},\"prefix\":\"\",\"secret\":\"\",\"server\":{\"`$CHILD`\":\"\"},\"suffix\":\"\",\"system\":{\"fetch\":\"`$ANY`\"},\"test\":{\"active\":false,\"entity\":{\"`$OPEN`\":true}},\"utility\":{},\"feature\":{\"`$CHILD`\":{\"`$OPEN`\":true,\"active\":false},\"debug\":[\"`$NOF`\",{\"min\":1},{\"`$OPEN`\":true,\"active\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"max\":[\"`$NOF`\",{\"min\":1},\"`$NUMBER`\",\"`$NIL`\"],\"redact\":[\"`$NOF`\",{\"min\":1},\"`$LIST`\",\"`$NIL`\"],\"now\":[\"`$NOF`\",{\"min\":1},\"`$FUNCTION`\",\"`$NIL`\"],\"onEntry\":[\"`$NOF`\",{\"min\":1},\"`$FUNCTION`\",\"`$NIL`\"]},\"`$NIL`\"],\"elementcard\":[\"`$NOF`\",{\"min\":1},{\"`$OPEN`\":true,\"active\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"print\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"]},\"`$NIL`\"],\"idempotency\":[\"`$NOF`\",{\"min\":1},{\"`$OPEN`\":true,\"active\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"header\":[\"`$NOF`\",{\"min\":1},\"`$STRING`\",[\"`$EXACT`\",\"\"],\"`$NIL`\"],\"methods\":[\"`$NOF`\",{\"min\":1},\"`$LIST`\",\"`$NIL`\"],\"ops\":[\"`$NOF`\",{\"min\":1},\"`$LIST`\",\"`$NIL`\"],\"keygen\":[\"`$NOF`\",{\"min\":1},\"`$FUNCTION`\",\"`$NIL`\"]},\"`$NIL`\"],\"metrics\":[\"`$NOF`\",{\"min\":1},{\"`$OPEN`\":true,\"active\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"now\":[\"`$NOF`\",{\"min\":1},\"`$FUNCTION`\",\"`$NIL`\"]},\"`$NIL`\"],\"paging\":[\"`$NOF`\",{\"min\":1},{\"`$OPEN`\":true,\"active\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"afterVar\":[\"`$NOF`\",{\"min\":1},\"`$STRING`\",[\"`$EXACT`\",\"\"],\"`$NIL`\"],\"cursorParam\":[\"`$NOF`\",{\"min\":1},\"`$STRING`\",[\"`$EXACT`\",\"\"],\"`$NIL`\"],\"firstVar\":[\"`$NOF`\",{\"min\":1},\"`$STRING`\",[\"`$EXACT`\",\"\"],\"`$NIL`\"],\"limitParam\":[\"`$NOF`\",{\"min\":1},\"`$STRING`\",[\"`$EXACT`\",\"\"],\"`$NIL`\"],\"pageParam\":[\"`$NOF`\",{\"min\":1},\"`$STRING`\",[\"`$EXACT`\",\"\"],\"`$NIL`\"],\"startPage\":[\"`$NOF`\",{\"min\":1},\"`$NUMBER`\",\"`$NIL`\"],\"limit\":[\"`$NOF`\",{\"min\":1},\"`$NUMBER`\",\"`$NIL`\"],\"ops\":[\"`$NOF`\",{\"min\":1},\"`$LIST`\",\"`$NIL`\"]},\"`$NIL`\"],\"ratelimit\":[\"`$NOF`\",{\"min\":1},{\"`$OPEN`\":true,\"active\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"burst\":[\"`$NOF`\",{\"min\":1},\"`$NUMBER`\",\"`$NIL`\"],\"rate\":[\"`$NOF`\",{\"min\":1},\"`$NUMBER`\",\"`$NIL`\"],\"now\":[\"`$NOF`\",{\"min\":1},\"`$FUNCTION`\",\"`$NIL`\"],\"sleep\":[\"`$NOF`\",{\"min\":1},\"`$FUNCTION`\",\"`$NIL`\"]},\"`$NIL`\"],\"retry\":[\"`$NOF`\",{\"min\":1},{\"`$OPEN`\":true,\"active\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"factor\":[\"`$NOF`\",{\"min\":1},\"`$NUMBER`\",\"`$NIL`\"],\"maxDelay\":[\"`$NOF`\",{\"min\":1},\"`$NUMBER`\",\"`$NIL`\"],\"minDelay\":[\"`$NOF`\",{\"min\":1},\"`$NUMBER`\",\"`$NIL`\"],\"retries\":[\"`$NOF`\",{\"min\":1},\"`$NUMBER`\",\"`$NIL`\"],\"statuses\":[\"`$NOF`\",{\"min\":1},\"`$LIST`\",\"`$NIL`\"],\"jitter\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"sleep\":[\"`$NOF`\",{\"min\":1},\"`$FUNCTION`\",\"`$NIL`\"]},\"`$NIL`\"],\"secrets\":[\"`$NOF`\",{\"min\":1},{\"`$OPEN`\":true,\"active\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"cache\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"exchange\":[\"`$NOF`\",{\"min\":1},\"`$MAP`\",\"`$NIL`\"],\"name\":[\"`$NOF`\",{\"min\":1},\"`$STRING`\",[\"`$EXACT`\",\"\"],\"`$NIL`\"],\"providers\":[\"`$NOF`\",{\"min\":1},\"`$LIST`\",\"`$NIL`\"]},\"`$NIL`\"],\"test\":[\"`$NOF`\",{\"min\":1},{\"`$OPEN`\":true,\"active\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"entity\":[\"`$NOF`\",{\"min\":1},\"`$MAP`\",\"`$NIL`\"],\"net\":[\"`$NOF`\",{\"min\":1},\"`$MAP`\",\"`$NIL`\"]},\"`$NIL`\"],\"timeout\":[\"`$NOF`\",{\"min\":1},{\"`$OPEN`\":true,\"active\":[\"`$NOF`\",{\"min\":1},\"`$BOOLEAN`\",\"`$NIL`\"],\"ms\":[\"`$NOF`\",{\"min\":1},\"`$NUMBER`\",\"`$NIL`\"],\"clearTimer\":[\"`$NOF`\",{\"min\":1},\"`$FUNCTION`\",\"`$NIL`\"],\"now\":[\"`$NOF`\",{\"min\":1},\"`$FUNCTION`\",\"`$NIL`\"],\"setTimer\":[\"`$NOF`\",{\"min\":1},\"`$FUNCTION`\",\"`$NIL`\"]},\"`$NIL`\"]}}"

const entityspecJSON = "{}"

// Parsed ONCE, at package init. The spec is read on every client
// construction and never mutated, so a per-call parse would be pure waste —
// and a shared map is safe here for the same reason the spec is a constant:
// MakeOptions validates AGAINST it and writes into the options, never into
// the spec.
var (
	OPTSPEC    = mustSpec(optspecJSON)
	ENTITYSPEC = mustSpec(entityspecJSON)
)

func mustSpec(src string) map[string]any {
	var out map[string]any
	if err := json.Unmarshal([]byte(src), &out); err != nil {
		// Unreachable: generated by json.Marshal's counterpart and never
		// edited by hand. Panic rather than hand back an empty spec, which
		// would validate everything and fail far from the cause.
		panic("Elementdemo: embedded schema is not valid JSON: " + err.Error())
	}
	return out
}
