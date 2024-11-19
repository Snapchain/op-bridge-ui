"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WalletIcon, MoonIcon, SunIcon, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { ethers } from "ethers";
import {
  useAccount,
  useConnect,
  useBalance,
  useSwitchChain,
  useDisconnect,
  Connector,
} from "wagmi";
import {
  NEXT_PUBLIC_L1_CHAIN_ID,
  NEXT_PUBLIC_L2_CHAIN_ID,
  NEXT_PUBLIC_L1_CHAIN_NAME,
  NEXT_PUBLIC_L2_CHAIN_NAME,
  l2Chain,
} from "./config";
import useChainConfigs from "../hooks/useChainConfigs";
import { truncateAddress } from "@/lib/utils";
import Image from "next/image";
import { getL2TransactionHashes } from "viem/op-stack";
import { db, WithdrawState, WithdrawStatus } from "@/store/db";
import WithdrawTxStatus from "@/components/WithdrawTxStatus";

export default function Bridge() {
  // React state
  const [amount, setAmount] = useState("");
  const [errorInput, setErrorInput] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<WithdrawStatus | null>(
    null
  );
  const [withdrawData, setWithdrawData] = useState<WithdrawState | null>(null);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupDescription, setPopupDescription] = useState("");

  // Wagmi hooks
  const { address, isConnected, connector, chainId } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: l1Balance, refetch: refetchl1Balance } = useBalance({
    address: address,
    chainId: Number(NEXT_PUBLIC_L1_CHAIN_ID),
  });
  const { data: l2Balance, refetch: refetchl2Balance } = useBalance({
    address: address,
    chainId: Number(NEXT_PUBLIC_L2_CHAIN_ID),
  });
  const { publicClientL1, publicClientL2, walletClientL1, walletClientL2 } =
    useChainConfigs();

  // Handlers
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setAmount("");
    setIsLoading(false);
    setWithdrawStatus(null);
    setWithdrawData(null);
  };

  const handleOpenWalletModal = () => {
    setIsWalletModalOpen(true);
  };

  const handleConnect = (connector: Connector) => {
    connect({ connector });
    setIsWalletModalOpen(false);
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDisconnectOpen(false);
  };

  const handleActionButton = () => {
    if (!amount || !isConnected || isLoading) {
      return;
    }
    if (activeTab === "deposit") {
      setIsConfirmationOpen(true);
    }
    if (activeTab === "withdraw") {
      switch (withdrawStatus) {
        case "ready_to_prove":
          handleWithdrawProve();
        case "proved":
          handleWithdrawFinalize();
        default:
          setIsConfirmationOpen(true);
      }
      return;
    }
  };

  const handleConfirm = () => {
    setIsConfirmationOpen(false);
    if (activeTab === "deposit") {
      handleDeposit();
    } else {
      handleWithdraw();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const depositCap = parseFloat(process.env.NEXT_PUBLIC_DEPOSIT_CAP || "0.1");
    if (activeTab === "deposit" && parseFloat(value) > depositCap) {
      setPopupTitle("Deposit cap reached");
      setPopupDescription(
        `We are currently capping deposits at ${depositCap} ETH, as Tohma Devnet may be discontinued at any time. Only deposit funds you are willing to lose.`
      );
      return;
    }
    setAmount(value);
  };

  const handleDeposit = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        setErrorInput("Invalid amount");
        return;
      }
      if (!connector || !address) {
        setErrorInput("Please connect your wallet");
        return;
      }
      if (!publicClientL2) {
        setErrorInput("L2 client not found");
        return;
      }
      setIsLoading(true);
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log({ account });
      // Build params for deposit (bridge) tx on L2
      const args = await publicClientL2.buildDepositTransaction({
        account,
        mint: ethers.utils.parseEther(amount).toBigInt(),
        to: account,
      });
      console.log({ args });

      // Execute deposit tx on L2 and wait for tx be processed
      const hash = await walletClientL1.depositTransaction(args);
      console.log({ hash });
      const receipt = await publicClientL1.waitForTransactionReceipt({
        hash,
      });
      console.log({ receipt });

      // get l2 tx hashes from l1 tx receipt and wait for l2 tx to be processed
      const [l2Hash] = getL2TransactionHashes(receipt);
      console.log({ l2Hash });
      const l2Receipt = await publicClientL2.waitForTransactionReceipt({
        hash: l2Hash,
      });
      console.log({ l2Receipt });
      // set state once tx processed
      if (l2Receipt) {
        setIsLoading(false);
        setAmount("");
        setErrorInput("");
        refetchl1Balance();
        refetchl2Balance();
        setPopupTitle("Deposit successful");
        setPopupDescription("Refresh the page to view your updated balance.");
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleWithdrawInitiate = async () => {
    try {
      setIsLoading(true);

      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log({ account });
      // Build params for withdraw tx on L1
      const args = await publicClientL1.buildInitiateWithdrawal({
        account,
        to: account,
        value: ethers.utils.parseEther(amount).toBigInt(),
      });
      console.log({ args });

      // Execute withdraw tx on L2 and wait for tx be processed
      const hash = await walletClientL2.initiateWithdrawal(args);

      // Store to local db
      const withdraw = {
        withdrawalHash: hash,
        address: account,
        status: "initiating" as WithdrawStatus,
        args,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.withdraws.add(withdraw);

      setWithdrawData(withdraw);
      setWithdrawStatus("initiating");
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleWithdrawAddInitiateReceipt = async () => {
    setIsLoading(true);
    if (!withdrawData || !withdrawData.withdrawalHash) {
      setErrorInput("Failed to initiate withdrawal, missing tx hash");
      return;
    }
    const receipt = await publicClientL2.waitForTransactionReceipt({
      hash: withdrawData.withdrawalHash,
    });
    console.log({ receipt });

    db.withdraws
      .where("withdrawalHash")
      .equals(withdrawData.withdrawalHash)
      .modify({
        status: "initiated",
        withdrawalReceipt: receipt,
        updatedAt: new Date(),
      });

    setWithdrawStatus("initiated");
    setWithdrawData({
      ...withdrawData,
      status: "initiated",
      withdrawalReceipt: receipt,
      updatedAt: new Date(),
    });
    setPopupTitle("Withdraw initiated");
    setPopupDescription(
      "To withdraw funds on L1, you will need to prove that the withdraw request was included in an L2 block. Check back in ~1 hour once the transaction is ready to prove."
    );
  };

  const handleWithdrawWaitTillReadyToProve = async () => {
    if (
      !withdrawData ||
      !withdrawData.withdrawalHash ||
      !withdrawData.withdrawalReceipt
    ) {
      setErrorInput(
        "Failed while waiting for withdrawal to be ready to prove, missing tx hash or receipt"
      );
      return;
    }
    setIsLoading(true);
    const { output, withdrawal } = await publicClientL1.waitToProve({
      receipt: withdrawData.withdrawalReceipt,
      targetChain: l2Chain,
    });
    console.log({ output, withdrawal });

    db.withdraws
      .where("withdrawalHash")
      .equals(withdrawData.withdrawalHash)
      .modify({
        status: "ready_to_prove",
        output: output,
        withdrawal: withdrawal,
        updatedAt: new Date(),
      });

    setWithdrawStatus("ready_to_prove");
    setWithdrawData({
      ...withdrawData,
      status: "ready_to_prove",
      output: output,
      withdrawal: withdrawal,
      updatedAt: new Date(),
    });
    setIsLoading(false);
  };

  const handleWithdrawProve = async () => {
    if (
      !withdrawData ||
      !withdrawData.withdrawalHash ||
      !withdrawData.output ||
      !withdrawData.withdrawal
    ) {
      setErrorInput(
        "Failed to prove withdrawal, missing tx hash, output or withdrawal data"
      );
      return;
    }
    try {
      setIsLoading(true);

      const proveArgs = await publicClientL2.buildProveWithdrawal({
        output: withdrawData.output,
        withdrawal: withdrawData.withdrawal,
      });
      console.log({ proveArgs });

      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // request switch to L1
      await switchChain({
        chainId: Number(NEXT_PUBLIC_L1_CHAIN_ID),
      });

      const proveHash = await walletClientL1.proveWithdrawal({
        ...proveArgs,
        authorizationList: [],
        account,
      });
      console.log({ proveHash });

      db.withdraws
        .where("withdrawalHash")
        .equals(withdrawData.withdrawalHash)
        .modify({
          status: "proving",
          proveArgs: proveArgs,
          proveHash: proveHash,
          updatedAt: new Date(),
        });

      setWithdrawStatus("proving");

      setWithdrawData({
        ...withdrawData,
        status: "proving",
        proveArgs: proveArgs,
        proveHash: proveHash,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleWithdrawAddProveReceipt = async () => {
    if (
      !withdrawData ||
      !withdrawData.withdrawalHash ||
      !withdrawData.proveHash
    ) {
      setErrorInput(
        "Failed to add prove receipt, missing withdraw or proving tx hash"
      );
      return;
    }
    setIsLoading(true);
    const proveReceipt = await publicClientL1.waitForTransactionReceipt({
      hash: withdrawData.proveHash,
    });
    console.log({ proveReceipt });

    db.withdraws
      .where("withdrawalHash")
      .equals(withdrawData.withdrawalHash)
      .modify({
        status: "proved",
        proveReceipt: proveReceipt,
        updatedAt: new Date(),
      });

    setWithdrawStatus("proved");
    setWithdrawData({
      ...withdrawData,
      status: "proved",
      proveReceipt: proveReceipt,
      updatedAt: new Date(),
    });
    setIsLoading(false);
  };

  const handleWithdrawFinalize = async () => {
    if (
      !withdrawData ||
      !withdrawData.withdrawalHash ||
      !withdrawData.withdrawal
    ) {
      setErrorInput(
        "Failed to finalize withdrawal, missing tx hash or withdrawal data"
      );
      return;
    }
    try {
      setIsLoading(true);
      // request switch to L1
      await switchChain({
        chainId: Number(NEXT_PUBLIC_L1_CHAIN_ID),
      });
      // Wait until the withdrawal tx is ready to finalize
      await publicClientL1.waitToFinalize({
        targetChain: l2Chain,
        withdrawalHash: withdrawData.withdrawalHash,
      });
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // waitToFinalize is buggy, so add a delay to wait before finalizing tx (12 secs for testnet)
      // TODO: refactor as env var if withdraw window is changed
      // await new Promise((resolve) => setTimeout(resolve, 12000));

      // Finalize the withdrawal
      const finalizeHash = await walletClientL1.finalizeWithdrawal({
        targetChain: l2Chain,
        withdrawal: withdrawData.withdrawal,
        authorizationList: [],
        account,
      });
      console.log({ finalizeHash });

      db.withdraws
        .where("withdrawalHash")
        .equals(withdrawData.withdrawalHash)
        .modify({
          status: "finalizing",
          finalizeHash: finalizeHash,
          updatedAt: new Date(),
        });

      setWithdrawStatus("finalizing");

      setWithdrawData({
        ...withdrawData,
        status: "finalizing",
        finalizeHash: finalizeHash,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleWithdrawAddFinalizeReceipt = async () => {
    if (
      !withdrawData ||
      !withdrawData.withdrawalHash ||
      !withdrawData.finalizeHash
    ) {
      setErrorInput(
        "Failed to add finalize receipt, missing withdraw or finalizing tx hash"
      );
      return;
    }
    setIsLoading(true);

    const finalizeReceipt = await publicClientL1.waitForTransactionReceipt({
      hash: withdrawData.finalizeHash,
    });
    console.log({ finalizeReceipt });

    db.withdraws
      .where("withdrawalHash")
      .equals(withdrawData.withdrawalHash)
      .modify({
        status: "finalized",
        finalizeReceipt: finalizeReceipt,
        updatedAt: new Date(),
      });

    setWithdrawStatus("finalized");

    setWithdrawData({
      ...withdrawData,
      status: "finalized",
      finalizeReceipt: finalizeReceipt,
      updatedAt: new Date(),
    });
    setIsLoading(false);
  };

  const resumeWithdraw = async () => {
    if (!address) {
      return {
        withdrawStatus: null,
        withdrawData: null,
        withdrawAmount: null,
      };
    }
    const withdraws = await db.withdraws.toArray();
    // filter for withdraw from connected account
    const withdrawsForAddress = withdraws.filter(
      (withdraw) =>
        withdraw.address.toLowerCase() === address.toLowerCase() &&
        withdraw.status !== "finalized"
    );
    if (withdrawsForAddress.length > 0) {
      setPopupTitle("Resuming withdraw");
      setPopupDescription(
        `Resuming withdraw tx ${truncateAddress(
          withdrawsForAddress[0].withdrawalHash as `0x${string}`
        )} (status: ${withdrawsForAddress[0].status.replace(/_/g, " ")})`
      );
      setWithdrawStatus(withdrawsForAddress[0].status);
      setWithdrawData(withdrawsForAddress[0]);
      const withdrawAmount = ethers.utils.formatEther(
        withdrawsForAddress[0].args.request.value
      );
      setAmount(withdrawAmount);
      return {
        withdrawStatus: withdrawsForAddress[0].status,
        withdrawData: withdrawsForAddress[0],
        withdrawAmount,
      };
    } else {
      return {
        withdrawStatus: null,
        withdrawData: null,
        withdrawAmount: null,
      };
    }
  };

  useEffect(() => {
    const asyncResumeWithdraw = async () => {
      if (!address || !connector) {
        return;
      }
      if (activeTab === "withdraw") {
        await resumeWithdraw();
      }
    };
    asyncResumeWithdraw();
  }, [address, connector, activeTab]);

  const handleWithdraw = async () => {
    try {
      if (!amount || parseFloat(amount) <= 0) {
        setErrorInput("Invalid amount");
        return;
      }
      if (!address || !connector) {
        setErrorInput("Please connect your wallet");
        return;
      }

      // Initiate
      if (withdrawStatus === null) {
        await handleWithdrawInitiate();
      }

      if (withdrawStatus === "initiating") {
        await handleWithdrawAddInitiateReceipt();
      }

      if (!withdrawData || !withdrawData.withdrawalHash) {
        console.log("No withdraw data found");
        return;
      }

      // Wait until the withdrawal tx is ready to prove
      if (withdrawStatus === "initiated") {
        await handleWithdrawWaitTillReadyToProve();
      }

      // Prove the withdrawal tx on L2
      // if (withdrawStatus === "ready_to_prove") {
      //   await handleWithdrawProve();
      // }

      if (withdrawStatus === "proving") {
        await handleWithdrawAddProveReceipt();
      }

      // if (withdrawStatus === "proved") {
      //   await handleWithdrawFinalize();
      // }

      if (withdrawStatus === "finalizing") {
        await handleWithdrawAddFinalizeReceipt();
      }

      if (withdrawStatus === "finalized") {
        setPopupTitle("Withdraw completed");
        setPopupDescription("Refresh the page to view your updated balance.");
        setIsLoading(false);
        setAmount("");
        setErrorInput("");
        refetchl1Balance();
        refetchl2Balance();
        setWithdrawStatus(null);
        setWithdrawData(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Resume withdraw and trigger handleWithdraw() again whenever the withdraw status updates
  useEffect(() => {
    if (withdrawStatus !== null && withdrawData !== null && !!amount) {
      handleWithdraw();
    }
  }, [withdrawStatus, withdrawData, amount]);

  // Use memo
  const expectedChainId = useMemo(() => {
    if (activeTab === "deposit") {
      return Number(NEXT_PUBLIC_L1_CHAIN_ID);
    } else if (activeTab === "withdraw") {
      if (
        withdrawStatus === "ready_to_prove" ||
        withdrawStatus === "proving" ||
        withdrawStatus === "proved" ||
        withdrawStatus === "finalizing" ||
        withdrawStatus === "finalized"
      ) {
        return Number(NEXT_PUBLIC_L1_CHAIN_ID);
      }
      return Number(NEXT_PUBLIC_L2_CHAIN_ID);
    } else {
      return undefined;
    }
  }, [activeTab, withdrawStatus]);

  const actionButtonText = useMemo(() => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {activeTab === "deposit" ? "Depositing..." : "Withdrawing..."}
        </>
      );
    }
    if (activeTab === "deposit") {
      if (isLoading) {
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Depositing...
          </>
        );
      }
      return "Deposit";
    }
    if (activeTab === "withdraw") {
      switch (withdrawStatus) {
        case "initiating":
          return "Withdrawing...";
        case "initiated":
          return "Withdrawing...";
        case "ready_to_prove":
          return "Prove withdrawal";
        case "proving":
          return "Proving withdrawal...";
        case "proved":
          return "Finalize withdrawal";
        case "finalizing":
          return "Finalizing withdrawal...";
        case "finalized":
          return "Finalizing withdrawal...";
        default:
          return "Withdraw";
      }
    }
  }, [activeTab, withdrawStatus, isLoading]);

  // Use effects
  useEffect(() => {
    setMounted(true);
  }, []);

  // Render UI
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background pt-16">
      <header className="fixed top-0 left-0 right-0 bg-background z-10 shadow-sm">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Image src="/icon.png" alt="Snapchain" width={32} height={32} />
              <h1 className="hidden sm:block text-2xl font-bold">
                {NEXT_PUBLIC_L2_CHAIN_NAME} Bridge
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <SunIcon className="h-4 w-4" />
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
                <MoonIcon className="h-4 w-4" />
              </div>
              {isConnected ? (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setIsDisconnectOpen(true)}
                >
                  {truncateAddress(address)}
                </Button>
              ) : (
                <Button className="w-full" onClick={handleOpenWalletModal}>
                  {isWalletModalOpen ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 max-w-md flex flex-col space-y-8">
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger
              value="deposit"
              onClick={() => handleTabChange("deposit")}
            >
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              onClick={() => handleTabChange("withdraw")}
            >
              Withdraw
            </TabsTrigger>
          </TabsList>
          <TabsContent value="deposit">
            <p className="text-sm text-muted-foreground">
              Deposit ETH from {NEXT_PUBLIC_L1_CHAIN_NAME} to{" "}
              {NEXT_PUBLIC_L2_CHAIN_NAME}.
            </p>
          </TabsContent>
          <TabsContent value="withdraw">
            <p className="text-sm text-muted-foreground">
              Withdraw ETH from {NEXT_PUBLIC_L2_CHAIN_NAME} to{" "}
              {NEXT_PUBLIC_L1_CHAIN_NAME}.
            </p>
          </TabsContent>
        </Tabs>

        <div className="space-y-3">
          <Label htmlFor="amount">Amount (ETH)</Label>
          <Input
            autoFocus
            id="amount"
            placeholder="0.0"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            disabled={activeTab === "withdraw" && withdrawStatus !== null}
          />
          {isConnected && (
            <div className={`flex flex-col space-y-1`}>
              <p className="text-sm text-muted-foreground">
                {activeTab === "deposit" ? "Sepolia" : "Tohma"} Balance:{" "}
                {activeTab === "deposit"
                  ? l1Balance?.formatted ?? "0"
                  : l2Balance?.formatted ?? "0"}{" "}
                ETH
              </p>
              <p className="text-sm text-muted-foreground">
                {activeTab === "withdraw" ? "Sepolia" : "Tohma"} Balance:{" "}
                {activeTab === "withdraw"
                  ? l1Balance?.formatted ?? "0"
                  : l2Balance?.formatted ?? "0"}{" "}
                ETH
              </p>
            </div>
          )}
        </div>

        {withdrawStatus && activeTab === "withdraw" && (
          <WithdrawTxStatus
            currentStep={withdrawStatus}
            withdrawalHash={withdrawData?.withdrawalHash}
            proveHash={withdrawData?.proveHash}
            finalizeHash={withdrawData?.finalizeHash}
            isLoading={isLoading}
          />
        )}

        <div className="flex flex-col space-y-2">
          {!isConnected ? (
            <Button
              className="w-full"
              size="lg"
              onClick={handleOpenWalletModal}
            >
              {isWalletModalOpen ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet
                </>
              )}
            </Button>
          ) : chainId === expectedChainId ? (
            <Button
              className="w-full"
              size="lg"
              onClick={handleActionButton}
              disabled={!amount || isLoading}
            >
              {actionButtonText}
            </Button>
          ) : (
            <Button
              className="w-full"
              size="lg"
              onClick={() =>
                expectedChainId
                  ? switchChain({ chainId: expectedChainId })
                  : null
              }
            >
              Switch Network
            </Button>
          )}
          {errorInput && <p className="text-sm text-red-500">{errorInput}</p>}
        </div>

        <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm {activeTab}</DialogTitle>
              <DialogDescription>
                You are about to {activeTab} {amount} ETH{" "}
                {activeTab === "deposit" ? "to" : "from"} Tohma Devnet.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmationOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDisconnectOpen} onOpenChange={setIsDisconnectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Disconnect Wallet</DialogTitle>
              <DialogDescription>
                Are you sure you want to disconnect your wallet?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDisconnectOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleDisconnect}>Disconnect</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isWalletModalOpen} onOpenChange={setIsWalletModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect Wallet</DialogTitle>
              <DialogDescription>
                Choose a wallet provider to connect.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {connectors.map((connector: Connector) => (
                <Button
                  key={connector.name}
                  variant="outline"
                  className="w-full flex space-x-2 justify-start"
                  onClick={() => handleConnect(connector)}
                >
                  {connector.icon && (
                    <img
                      src={connector.icon}
                      alt={connector.name}
                      width={20}
                      height={20}
                    />
                  )}
                  <span>{connector.name}</span>
                </Button>
              ))}
              {!connectors.length && (
                <p className="text-sm text-muted-foreground">
                  No connectors found.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!popupTitle} onOpenChange={() => setPopupTitle("")}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{popupTitle}</DialogTitle>
              <DialogDescription>{popupDescription}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setPopupTitle("");
                  setPopupDescription("");
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
