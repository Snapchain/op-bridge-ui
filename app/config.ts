import { http, createConfig } from "wagmi";
import { sepolia, optimismSepolia } from "wagmi/chains";
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
const NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = process.env
  .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;
const NEXT_PUBLIC_ADDRESS_MANAGER = process.env
  .NEXT_PUBLIC_ADDRESS_MANAGER as string;
const NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY = process.env
  .NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY as string;
const NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY = process.env
  .NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY as string;
const NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY = process.env
  .NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY as string;
const NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY = process.env
  .NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY as string;
const NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY = process.env
  .NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY as string;

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
if (!NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set");
}
if (!NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY) {
  throw new Error("NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY is not set");
}
if (!NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY) {
  throw new Error("NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY is not set");
}
if (!NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY) {
  throw new Error("NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY is not set");
}
if (!NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY) {
  throw new Error("NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY is not set");
}

export const l1Chain = defineChain({
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

export const l2Chain = defineChain({
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
});

export const chains = [l1Chain, l2Chain, optimismSepolia] as const;

export const config = createConfig({
  chains: chains,
  connectors: [],
  transports: {
    [l1Chain.id]: http(),
    [l2Chain.id]: http(),
    [optimismSepolia.id]: http(),
  },
});

const zeroAddr = "0x".padEnd(42, "0");

export const opStackL1Contracts = {
  StateCommitmentChain: zeroAddr,
  CanonicalTransactionChain: zeroAddr,
  BondManager: zeroAddr,
  AddressManager: NEXT_PUBLIC_ADDRESS_MANAGER || zeroAddr,
  L1CrossDomainMessenger: NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY,
  L1StandardBridge: NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY,
  OptimismPortal: NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY,
  L2OutputOracle: NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY || zeroAddr,
};

export {
  NEXT_PUBLIC_L2_RPC_URL,
  NEXT_PUBLIC_L1_CHAIN_ID,
  NEXT_PUBLIC_L2_CHAIN_ID,
  NEXT_PUBLIC_L1_CHAIN_NAME,
  NEXT_PUBLIC_L2_CHAIN_NAME,
  NEXT_PUBLIC_L2_EXPLORER_URL,
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY,
  NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY,
  NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY,
  NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY,
};
