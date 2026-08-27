// PROJECT-ADDITIVE component: ts examples.
//
// This file is NOT part of the sdkgen scaffold. It is this project's own
// addition, wired through `registerComponent('Examples')` in src/Root.ts,
// which is the supported way to extend a target: `voxgig-sdkgen doctor`
// reports it as `additive` and a `target add ts` resync leaves it alone,
// where a modified copy of a scaffold component would be reverted.
//
// It emits a runnable example into the generated ts SDK. Regeneration
// keeps the example in step with the model, which is the point of making
// it a component rather than a hand-written file in generated output.

import { cmp, Folder, File, Content } from '@voxgig/sdkgen'


const Examples = cmp(function Examples(_props: any) {

  Folder({ name: 'examples' }, () => {
    File({ name: 'element-card.ts' }, () => {
      Content(`// Elementdemo SDK — the elementcard feature, fully offline.
//
//   cd ts && npx tsx examples/element-card.ts
//
// The test feature serves the seeded record with no server and no
// network; the elementcard feature renders it as a periodic-table tile
// (print: true writes it to the console).

import { ElementdemoSDK } from '../src/ElementdemoSDK'


async function main() {
  const client = ElementdemoSDK.test(
    {
      entity: {
        element: {
          fe: {
            id: 'fe', name: 'Iron', symbol: 'Fe', number: 26,
            mass: 55.845, period: 4, block: 'd',
            series_id: 'transition-metal',
          },
        },
      },
    },
    { feature: { elementcard: { active: true, print: true } } },
  )

  const el = await client.Element().load({ id: 'fe' })
  console.log('loaded: ' + (el.data() as any).name)
}


main().catch((err) => {
  console.error(err)
  process.exit(1)
})
`)
    })
  })
})


export {
  Examples
}
