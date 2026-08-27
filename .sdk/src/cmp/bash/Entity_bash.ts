// `bash`'s per-entity emitter, dispatched as `cmp/<t>/Entity_<t>`.
//
// One file per ACTIVE entity, one function per operation, generated from
// the model's operation points: the path template, the named parameters
// and their required flags, and the HTTP method all come from the point.
// A point carrying `select.$action` is a non-CRUD action and becomes its
// own <entity>_<action> function.
//
// Emitted content interpolates RESOLVED names (Content is verbatim; only
// Copy/Fragment replace placeholders).

import { cmp, each, Folder, File, Content } from '@voxgig/sdkgen'


// The path template as a bash expression: literal parts verbatim, `{x}`
// parts URL-encoded from the function's named arguments.
function pathExpr(parts: string[], enc: string): string {
  return parts.map((part) => {
    const m = part.match(/^\{(.+)\}$/)
    return m ? `/$(${enc} "$${m[1]}")` : '/' + part
  }).join('')
}


// One generated function: parse k=v arguments (declared names bind
// locals, anything else becomes a query parameter), enforce required
// parameters, read the body from stdin for body-carrying methods, then
// hand the request to the core transport.
function opFunction(spec: {
  fname: string
  label: string
  entity: string
  op: string
  method: string
  parts: string[]
  params: Array<{ name: string, reqd: boolean }>
  prefix: string
}): string {
  const { fname, label, entity, op, method, parts, params, prefix } = spec

  const enc = '_' + prefix + 'encode'
  const err = '_' + prefix + 'error'
  const request = prefix + 'request'

  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method)

  const locals = params.map((p) => `  local ${p.name}=""`).join('\n')

  const cases = params.map((p) =>
    `      ${p.name}=*) ${p.name}="\${_kv#${p.name}=}" ;;`).join('\n')

  const required = params.filter((p) => p.reqd).map((p) => `  [ -n "$${p.name}" ] || { ${err} "required" "${label}: ${p.name} is required"; return 2; }`).join('\n')

  const argjq = 0 < params.length ?
    `  _args=$(jq -n ${params.map((p) => `--arg ${p.name} "$${p.name}"`).join(' ')} \\
    '{${params.map((p) => `${p.name}: $${p.name}`).join(', ')}} | with_entries(select(.value != ""))')` :
    `  _args='{}'`

  const body = hasBody ? `
  local _body=""
  if [ ! -t 0 ]; then
    _body=$(cat)
  fi
  [ -n "$_body" ] || _body='{}'` : ''

  return `
# ${label}
${fname}() {
${locals}${0 < params.length ? '\n' : ''}  local _query="" _kv _args
  for _kv in "$@"; do
    case "$_kv" in
${cases}${0 < params.length ? '\n' : ''}      *=*) _query="\${_query:+\${_query}&}\${_kv%%=*}=$(${enc} "\${_kv#*=}")" ;;
      *) ${err} "bad_arg" "${label}: arguments are name=value pairs, got: $_kv"; return 2 ;;
    esac
  done
${required}${0 < required.length ? '\n' : ''}${argjq}${body}
  ${request} ${method} "${pathExpr(parts, enc)}" "${hasBody ? '$_body' : ''}" "$_query" "${entity}" "${op}" "$_args"
}
`
}


const Entity = cmp(function Entity(props: any) {
  const { target, entity } = props
  const { model } = props.ctx$

  const prefix = (props.ctx$.stdrep || {})['projectname'] + '_'

  const fns: string[] = []

  each(entity.op || {}, (op: any) => {
    const points = op.points || []

    const plain = points.filter((p: any) => null == (p.select || {})['$action'])
    const actions = points.filter((p: any) => null != (p.select || {})['$action'])

    if (0 < plain.length) {
      const point = plain[0]
      fns.push(opFunction({
        fname: prefix + entity.name + '_' + op.name,
        label: entity.name + ' ' + op.name,
        entity: entity.name,
        op: op.name,
        method: point.method,
        parts: point.parts || [],
        params: each((point.args || {}).params || [])
          .map((p: any) => ({ name: p.name, reqd: !!p.reqd })),
        prefix,
      }))
    }

    for (const point of actions.sort((a: any, b: any) =>
      String(a.select['$action']).localeCompare(String(b.select['$action'])))) {
      const action = String(point.select['$action'])
      fns.push(opFunction({
        fname: prefix + entity.name + '_' + action,
        label: entity.name + ' ' + action + ' (action)',
        entity: entity.name,
        op: action,
        method: point.method,
        parts: point.parts || [],
        params: each((point.args || {}).params || [])
          .map((p: any) => ({ name: p.name, reqd: !!p.reqd })),
        prefix,
      }))
    }
  })

  Folder({ name: 'entity' }, () => {
    File({ name: entity.name + '.' + target.ext }, () => {
      Content(`# ${model.Name} SDK — ${entity.name} operations. GENERATED, do not edit.
#
# Arguments are name=value pairs; unknown names become query parameters.
# Body-carrying operations read the JSON record from stdin. Results are
# JSON on stdout; errors are JSON on stderr with a non-zero return.
${fns.join('')}`)
    })
  })
})


export {
  Entity
}
