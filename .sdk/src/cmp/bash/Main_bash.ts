// `bash`'s whole-package emitter, dispatched as `cmp/<t>/Main_<t>`.
//
// Copies the static template tree (core, features, README, LICENSE), then
// emits the two files only the model can write: the entry script that
// wires the pieces together, and the CLI. Per-entity functions come from
// Entity_bash; the offline test runner from Test_bash.
//
// Emitted Content interpolates the RESOLVED names (stdrep values), never
// placeholder strings — Content is verbatim, only Copy/Fragment replace.

import * as Path from 'node:path'

import {
  cmp, File, Content, Copy, Folder, Fragment, packageVersion,
  isAuthActive, resolveAuthPrefix, serverVariables,
} from '@voxgig/sdkgen'

import { KIT } from '@voxgig/apidef'


const Main = cmp(function Main(props: any) {
  const { target } = props
  const { model } = props.ctx$

  const name = model.name
  const stdrep = props.ctx$.stdrep || {}
  const UP = stdrep['PROJECT' + 'NAME'] || String(name).toUpperCase()
  const info = model.main[KIT].info || {}
  const base = (info.servers && info.servers[0] && info.servers[0].url) || ''

  // The two API facts the transport cannot guess, emitted here because
  // only the model knows them.
  //
  // Server variables: the spec may template its server URL
  // (http://host/api/{account_id}), and every {name} in it has to be
  // substituted before a request goes out — core.sh does the substituting,
  // this names what to substitute and where the value comes from.
  const svars = serverVariables(model)
  const svarNames = svars.map((v: any) => v.name)

  // The Authorization prefix: 'Bearer' for an http/bearer scheme, '' for a
  // raw apiKey. Empty when the spec declares no auth at all, which is what
  // tells core.sh to send no credential.
  const authPrefix = isAuthActive(model) ? resolveAuthPrefix(model) : ''

  // The static tree: transport core, per-feature sources (already trimmed
  // to the model's selection at add time), README, LICENSE.
  Copy({
    from: 'tm/' + target.name,
    replace: {
      ...stdrep,
    }
  })

  File({ name: 'VERSION' }, () => {
    Content(packageVersion(model, target.name) + '\n')
  })

  // The entry script: source it and the whole SDK is in scope. Only the
  // model knows the default base URL and the project name, so this file is
  // emitted rather than copied.
  File({ name: name + '.' + target.ext }, () => {
    Content(`# ${model.Name} SDK — bash entry point. GENERATED, do not edit.
#
#   source ${target.name}/${name}.${target.ext}
#
# Loads the core, every generated entity, and every generated feature.

${UP}_SDK_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"

# The model's server URL — override per environment with ${UP}_BASE.
${UP}_SDK_DEFAULT_BASE="${base}"

# Server variables in that URL. Each {name} is replaced with
# ${UP}_SERVER_<NAME>; a placeholder with no value is a hard error, because
# the request would otherwise go to a URL with a literal brace in it.
${UP}_SDK_SERVER_VARS=(${svarNames.map((n: string) => JSON.stringify(n)).join(' ')})

# The Authorization value prefix, from the spec's security scheme. Empty
# means this API declares no auth and no credential is ever sent.
${UP}_SDK_AUTH_PREFIX="${authPrefix}"

source "\${${UP}_SDK_DIR}/core/core.${target.ext}"

for _${name}_part in "\${${UP}_SDK_DIR}"/entity/*.${target.ext}; do
  [ -e "$_${name}_part" ] && source "$_${name}_part"
done

for _${name}_part in "\${${UP}_SDK_DIR}"/feature/*.${target.ext}; do
  [ -e "$_${name}_part" ] && source "$_${name}_part"
done
unset _${name}_part
`)
  })

  Folder({ name: 'bin' }, () => {
    File({ name: name }, () => {
      Fragment({
        from: Path.normalize(
          __dirname + '/../../../src/cmp/bash/fragment/cli.sh'),
        replace: {
          ...stdrep,
          SDKENTRY: name + '.' + target.ext,
        }
      })
    })
  })
})


export {
  Main
}
