import { http, createConfig } from "wagmi";
import { defineChain } from "viem";

const NEXT_PUBLIC_L1_CHAIN_NAME = process.env
  .NEXT_PUBLIC_L1_CHAIN_NAME as string;
const NEXT_PUBLIC_L1_CHAIN_ID = process.env.NEXT_PUBLIC_L1_CHAIN_ID as string;
const NEXT_PUBLIC_L1_RPC_URL = process.env.NEXT_PUBLIC_L1_RPC_URL as string;
const NEXT_PUBLIC_L1_EXPLORER_URL = process.env
  .NEXT_PUBLIC_L1_EXPLORER_URL as string;
const NEXT_PUBLIC_L2_CHAIN_NAME = process.env
  .NEXT_PUBLIC_L2_CHAIN_NAME as string;
const NEXT_PUBLIC_L2_CHAIN_ID = process.env.NEXT_PUBLIC_L2_CHAIN_ID as string;
const NEXT_PUBLIC_L2_RPC_URL = process.env.NEXT_PUBLIC_L2_RPC_URL as string;
const NEXT_PUBLIC_L2_EXPLORER_URL = process.env
  .NEXT_PUBLIC_L2_EXPLORER_URL as string;
const NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY = process.env
  .NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY as string;
const NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY = process.env
  .NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY as string;
const NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY = process.env
  .NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY as string;
const NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY = process.env
  .NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY as string;
const NEXT_PUBLIC_DISPUTE_GAME_FACTORY_PROXY = process.env
  .NEXT_PUBLIC_DISPUTE_GAME_FACTORY_PROXY as string;

if (!NEXT_PUBLIC_L1_CHAIN_NAME) {
  throw new Error("NEXT_PUBLIC_L1_CHAIN_NAME is not set");
}
if (!NEXT_PUBLIC_L1_CHAIN_ID) {
  throw new Error("NEXT_PUBLIC_L1_CHAIN_ID is not set");
}
if (!NEXT_PUBLIC_L1_RPC_URL) {
  throw new Error("NEXT_PUBLIC_L1_RPC_URL is not set");
}
if (!NEXT_PUBLIC_L1_EXPLORER_URL) {
  throw new Error("NEXT_PUBLIC_L1_EXPLORER_URL is not set");
}
if (!NEXT_PUBLIC_L2_CHAIN_NAME) {
  throw new Error("NEXT_PUBLIC_L2_CHAIN_NAME is not set");
}
if (!NEXT_PUBLIC_L2_CHAIN_ID) {
  throw new Error("NEXT_PUBLIC_L2_CHAIN_ID is not set");
}
if (!NEXT_PUBLIC_L2_RPC_URL) {
  throw new Error("NEXT_PUBLIC_L2_RPC_URL is not set");
}
if (!NEXT_PUBLIC_L2_EXPLORER_URL) {
  throw new Error("NEXT_PUBLIC_L2_EXPLORER_URL is not set");
}
if (!NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY) {
  throw new Error("NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY is not set");
}
if (!NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY) {
  throw new Error("NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY is not set");
}
if (!NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY) {
  throw new Error("NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY is not set");
}
// if (!NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY) {
//   throw new Error("NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY is not set");
// }
// if (!NEXT_PUBLIC_DISPUTE_GAME_FACTORY_PROXY) {
//   throw new Error("NEXT_PUBLIC_DISPUTE_GAME_FACTORY_PROXY is not set");
// }

const l1Chain = defineChain({
  id: Number(NEXT_PUBLIC_L1_CHAIN_ID),
  name: NEXT_PUBLIC_L1_CHAIN_NAME,
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [NEXT_PUBLIC_L1_RPC_URL],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: NEXT_PUBLIC_L1_EXPLORER_URL },
  },
});

const l2Chain = defineChain({
  id: Number(NEXT_PUBLIC_L2_CHAIN_ID),
  name: NEXT_PUBLIC_L2_CHAIN_NAME,
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [NEXT_PUBLIC_L2_RPC_URL],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: NEXT_PUBLIC_L2_EXPLORER_URL },
  },
  contracts: {
    portal: {
      [l1Chain.id]: {
        address: NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY as `0x${string}`,
      },
    },
    disputeGameFactory: {
      [l1Chain.id]: {
        address: NEXT_PUBLIC_DISPUTE_GAME_FACTORY_PROXY as `0x${string}`,
      },
    },
    l2OutputOracle: {
      [l1Chain.id]: {
        address: NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY as `0x${string}`,
      },
    },
    l1StandardBridge: {
      [l1Chain.id]: {
        address: NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY as `0x${string}`,
      },
    },
    l2StandardBridge: {
      [l1Chain.id]: {
        address: NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY as `0x${string}`,
      },
    },
  },
});

const chains = [l1Chain, l2Chain] as const;

const config = createConfig({
  chains: chains,
  connectors: [],
  transports: {
    [l1Chain.id]: http(),
    [l2Chain.id]: http(),
  },
});

export {
  NEXT_PUBLIC_L1_CHAIN_ID,
  NEXT_PUBLIC_L2_CHAIN_ID,
  NEXT_PUBLIC_L1_CHAIN_NAME,
  NEXT_PUBLIC_L2_CHAIN_NAME,
  config,
  l1Chain,
  l2Chain,
};
