import { defineConfig } from '@wagmi/cli'
import { hardhat } from '@wagmi/cli/plugins'
import { config as dotenvConfig } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenvConfig({ path: resolve(__dirname, '.env.local') })

export default defineConfig({
  out: 'src/lib/generated.ts',
  contracts: [],
  plugins: [
    hardhat({
      project: '../',
      deployments: {
        SupplyChain: {
          1337: process.env.NEXT_PUBLIC_SUPPLY_CHAIN_ADDRESS as `0x${string}`,
        },
        Escrow: {
          1337: process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`,
        },
        Reputation: {
          1337: process.env.NEXT_PUBLIC_REPUTATION_ADDRESS as `0x${string}`,
        },
      },
      include: [
        'SupplyChain.json',
        'Escrow.json',
        'Reputation.json',
      ].map((name) => `contracts/**/${name}`),
    }),
  ],
})
