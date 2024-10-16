import { createPublicClient, createWalletClient, custom, http } from "viem";
import { useEffect, useState } from "react";
import { l1Chain, l2Chain } from "@/app/config";
import {
  publicActionsL1,
  publicActionsL2,
  walletActionsL1,
  walletActionsL2,
} from "viem/op-stack";

declare global {
  interface Window {
    ethereum: any;
  }
}

type EthereumProvider = { request(...args: any): Promise<any> };

const useChainConfigs = () => {
  const [ethereumProvider, setEthereumProvider] =
    useState<EthereumProvider | null>(null);
  const [walletClientL1, setWalletClientL1] = useState<any>(null);
  const [walletClientL2, setWalletClientL2] = useState<any>(null);
  const [publicClientL1, setPublicClientL1] = useState<any>(null);
  const [publicClientL2, setPublicClientL2] = useState<any>(null);

  useEffect(() => {
    const provider = typeof window !== "undefined" ? window.ethereum : null;
    if (!provider) {
      console.error(
        "Ethereum provider is not available. Please install MetaMask or another Ethereum wallet."
      );
      return;
    }
    setEthereumProvider(provider as EthereumProvider);
  }, []);

  useEffect(() => {
    if (!ethereumProvider) return;

    const publicClientL1 = createPublicClient({
      chain: l1Chain,
      transport: http(),
    }).extend(publicActionsL1());

    const publicClientL2 = createPublicClient({
      chain: l2Chain,
      transport: http(),
    }).extend(publicActionsL2());

    const walletClientL1 = createWalletClient({
      chain: l1Chain,
      transport: custom(ethereumProvider),
    }).extend(walletActionsL1());

    const walletClientL2 = createWalletClient({
      chain: l2Chain,
      transport: custom(ethereumProvider),
    }).extend(walletActionsL2());

    setPublicClientL1(publicClientL1);
    setPublicClientL2(publicClientL2);
    setWalletClientL1(walletClientL1);
    setWalletClientL2(walletClientL2);
  }, [ethereumProvider, l1Chain, l2Chain]);

  return {
    walletClientL1,
    walletClientL2,
    publicClientL1,
    publicClientL2,
  };
};

export default useChainConfigs;
