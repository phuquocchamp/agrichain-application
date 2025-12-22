import { createConfig, http } from "wagmi";
import { polygonAmoy, hardhat } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";

// Get contract addresses from environment
const SUPPLY_CHAIN_ADDRESS = process.env
  .NEXT_PUBLIC_SUPPLY_CHAIN_ADDRESS as `0x${string}`;
const ESCROW_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_ADDRESS as `0x${string}`;
const REPUTATION_ADDRESS = process.env
  .NEXT_PUBLIC_REPUTATION_ADDRESS as `0x${string}`;

// Determine if we're using localhost or Amoy
const isLocalhost = process.env.NEXT_PUBLIC_NETWORK_NAME === "localhost";

if (!SUPPLY_CHAIN_ADDRESS || !ESCROW_ADDRESS || !REPUTATION_ADDRESS) {
  throw new Error("Missing contract addresses in environment variables");
}

// Define localhost chain (Hardhat)
const localhost = {
  ...hardhat,
  id: 1337,
  name: "Hardhat Local",
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
  },
} as const;

// Select chain based on environment
const activeChain = isLocalhost ? localhost : polygonAmoy;

// Wagmi configuration
export const config = createConfig({
  chains: [localhost, polygonAmoy],
  connectors: [injected(), metaMask()],
  transports: {
    [localhost.id]: http("http://127.0.0.1:8545"),
    [polygonAmoy.id]: http(),
  },
});

// Contract addresses
export const contractAddresses = {
  supplyChain: SUPPLY_CHAIN_ADDRESS,
  escrow: ESCROW_ADDRESS,
  reputation: REPUTATION_ADDRESS,
} as const;

// Chain configuration
export const chainConfig = {
  id: activeChain.id,
  name: activeChain.name,
  nativeCurrency: activeChain.nativeCurrency,
  rpcUrls: activeChain.rpcUrls,
} as const;

