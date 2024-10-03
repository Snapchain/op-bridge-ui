import { http, createConfig } from "wagmi";
import { sepolia, optimismSepolia } from "wagmi/chains";
import { defineChain } from "viem";

const NEXT_PUBLIC_L2_RPC_URL = process.env.NEXT_PUBLIC_L2_RPC_URL as string;
const NEXT_PUBLIC_L2_WS_URL = process.env.NEXT_PUBLIC_L2_WS_URL as string;
const NEXT_PUBLIC_L1_CHAIN_ID = process.env.NEXT_PUBLIC_L1_CHAIN_ID as string;
const NEXT_PUBLIC_L2_CHAIN_ID = process.env.NEXT_PUBLIC_L2_CHAIN_ID as string;
const NEXT_PUBLIC_L2_EXPLORER_URL = process.env
  .NEXT_PUBLIC_L2_EXPLORER_URL as string;
const NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = process.env
  .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string;
const NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY = process.env
  .NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY as string;
const NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY = process.env
  .NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY as string;
const NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY = process.env
  .NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY as string;
const NEXT_PUBLIC_DISPUTE_GAME_FACTORY = process.env
  .NEXT_PUBLIC_DISPUTE_GAME_FACTORY as string;
const NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY = process.env
  .NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY as string;

if (!NEXT_PUBLIC_L2_RPC_URL) {
  console.log({ NEXT_PUBLIC_L2_RPC_URL });
  throw new Error("NEXT_PUBLIC_L2_RPC_URL is not set");
}
if (!NEXT_PUBLIC_L2_WS_URL) {
  throw new Error("NEXT_PUBLIC_L2_WS_URL is not set");
}
if (!NEXT_PUBLIC_L1_CHAIN_ID) {
  throw new Error("NEXT_PUBLIC_L1_CHAIN_ID is not set");
}
if (!NEXT_PUBLIC_L2_CHAIN_ID) {
  throw new Error("NEXT_PUBLIC_L2_CHAIN_ID is not set");
}
if (!NEXT_PUBLIC_L2_EXPLORER_URL) {
  throw new Error("NEXT_PUBLIC_L2_EXPLORER_URL is not set");
}
if (!NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
  throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set");
}
if (!NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY) {
  throw new Error("NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY is not set");
}
if (!NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY) {
  throw new Error("NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY is not set");
}
if (!NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY) {
  throw new Error("NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY is not set");
}
if (!NEXT_PUBLIC_DISPUTE_GAME_FACTORY) {
  throw new Error("NEXT_PUBLIC_DISPUTE_GAME_FACTORY is not set");
}
if (!NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY) {
  throw new Error("NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY is not set");
}

export const tohma = defineChain({
  id: Number(NEXT_PUBLIC_L2_CHAIN_ID),
  name: "Tohma",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [NEXT_PUBLIC_L2_RPC_URL],
      webSocket: [NEXT_PUBLIC_L2_WS_URL], // TODO: configure this in Cloudflare + nginx
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: NEXT_PUBLIC_L2_EXPLORER_URL },
  },
});

export const chains = [sepolia, tohma, optimismSepolia] as const;

export const config = createConfig({
  chains: chains,
  connectors: [],
  transports: {
    [sepolia.id]: http(),
    [tohma.id]: http(),
    [optimismSepolia.id]: http(),
  },
});

export const opStackL1Contracts = {
  L1CrossDomainMessenger: NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY,
  L1StandardBridge: NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY,
  OptimismPortal: NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY,
  DisputeGameFactory: NEXT_PUBLIC_DISPUTE_GAME_FACTORY,
};

export {
  NEXT_PUBLIC_L2_RPC_URL,
  NEXT_PUBLIC_L2_WS_URL,
  NEXT_PUBLIC_L1_CHAIN_ID,
  NEXT_PUBLIC_L2_CHAIN_ID,
  NEXT_PUBLIC_L2_EXPLORER_URL,
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY,
  NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY,
  NEXT_PUBLIC_L1_OPTIMISM_PORTAL_PROXY,
  NEXT_PUBLIC_DISPUTE_GAME_FACTORY,
  NEXT_PUBLIC_L2_STANDARD_BRIDGE_PROXY,
};
