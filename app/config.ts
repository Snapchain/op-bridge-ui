import { http, createConfig } from "wagmi";
import { sepolia, optimismSepolia } from "wagmi/chains";
import { injected, metaMask, safe, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";
import optimismSDK from "@eth-optimism/sdk";

export const {
  NEXT_PUBLIC_L2_RPC_URL,
  NEXT_PUBLIC_L2_WS_URL,
  NEXT_PUBLIC_L1_CHAIN_ID,
  NEXT_PUBLIC_L2_CHAIN_ID,
  NEXT_PUBLIC_L2_EXPLORER_URL,
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  NEXT_PUBLIC_ADDRESS_MANAGER,
  NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY,
  NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY,
  NEXT_PUBLIC_OPTIMISM_PORTAL_PROXY,
  NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY,
  NEXT_PUBLIC_L2_STANDARD_BRIDGE,
} = process.env;

if (!NEXT_PUBLIC_L2_RPC_URL) {
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
if (!NEXT_PUBLIC_ADDRESS_MANAGER) {
  throw new Error("NEXT_PUBLIC_ADDRESS_MANAGER is not set");
}
if (!NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY) {
  throw new Error("NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY is not set");
}
if (!NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY) {
  throw new Error("NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY is not set");
}
if (!NEXT_PUBLIC_OPTIMISM_PORTAL_PROXY) {
  throw new Error("NEXT_PUBLIC_OPTIMISM_PORTAL_PROXY is not set");
}
if (!NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY) {
  throw new Error("NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY is not set");
}
if (!NEXT_PUBLIC_L2_STANDARD_BRIDGE) {
  throw new Error("NEXT_PUBLIC_L2_STANDARD_BRIDGE is not set");
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
  connectors: [
    injected(),
    walletConnect({ projectId: NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID }),
    metaMask(),
    safe(),
  ],
  transports: {
    [sepolia.id]: http(),
    [tohma.id]: http(),
    [optimismSepolia.id]: http(),
  },
});

const zeroAddr = "0x".padEnd(42, "0");

export const opStackL1Contracts = {
  StateCommitmentChain: zeroAddr,
  CanonicalTransactionChain: zeroAddr,
  BondManager: zeroAddr,
  AddressManager: NEXT_PUBLIC_ADDRESS_MANAGER,
  L1CrossDomainMessenger: NEXT_PUBLIC_L1_CROSS_DOMAIN_MESSANGER_PROXY,
  L1StandardBridge: NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY,
  OptimismPortal: NEXT_PUBLIC_OPTIMISM_PORTAL_PROXY,
  L2OutputOracle: NEXT_PUBLIC_L2_OUTPUT_ORACLE_PROXY,
};

export const bridges = {
  Standard: {
    l1Bridge: NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY,
    l2Bridge: NEXT_PUBLIC_L2_STANDARD_BRIDGE,
    Adapter: optimismSDK.StandardBridgeAdapter,
  },
  ETH: {
    l1Bridge: NEXT_PUBLIC_L1_STANDARD_BRIDGE_PROXY,
    l2Bridge: NEXT_PUBLIC_L2_STANDARD_BRIDGE,
    Adapter: optimismSDK.ETHBridgeAdapter,
  },
};
