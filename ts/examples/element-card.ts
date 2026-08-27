// Elementdemo SDK — the elementcard feature, fully offline.
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
