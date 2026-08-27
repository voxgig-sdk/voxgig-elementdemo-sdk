// `bash`'s test-suite emitter, dispatched as `cmp/<t>/Test_<t>`.
//
// Emits test/run.sh from the generic harness fragment: the harness knows
// how to drive ANY entity's generated functions against the offline
// store; this component contributes the one line per active entity naming
// its operations and parent id fields, plus which entity the elementcard
// pipeline check can safely load (the first one with a load op and no
// ancestors).
//
// Reads the same filtered entity view the emitters use — never the raw
// model.main.kit.entity map.

import * as Path from 'node:path'

import { cmp, each, Folder, File, Content, Fragment } from '@voxgig/sdkgen'

import { KIT, getModelPath } from '@voxgig/apidef'


const Test = cmp(function Test(props: any) {
  const { model } = props.ctx$

  const entities = each(getModelPath(model, `main.${KIT}.entity`))
    .filter((e: any) => false !== e.active)
    .sort((a: any, b: any) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)

  const parentsOf = (e: any) =>
    ((e.relations || {}).ancestors || [])
      .flat()
      .map((a: string) => a + '_id')

  const cardEntity = entities.find((e: any) =>
    null != (e.op || {}).load && 0 === parentsOf(e).length)

  Folder({ name: 'test' }, () => {
    File({ name: 'run.sh' }, () => {
      Fragment({
        from: Path.normalize(
          __dirname + '/../../../src/cmp/bash/fragment/test-run.sh'),
        replace: {
          ...props.ctx$.stdrep,
          SDKENTRY: model.name + '.sh',
          CARD_ENTITY: cardEntity ? cardEntity.name : '',

          '#ENTITY_CASES': ({ indent }: any) => {
            each(entities, (entity: any) => {
              const ops = each(entity.op || {}).map((o: any) => o.name).sort()
              Content({ indent },
                'test_entity ' + entity.name +
                ' "' + ops.join(' ') + '"' +
                ' "' + parentsOf(entity).join(' ') + '"\n')
            })
          },
        }
      })
    })
  })
})


export {
  Test
}
