"use client";

import { useState, useEffect } from "react";
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
import { WalletIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { ethers, Provider } from "ethers";
import optimismSDK from "@eth-optimism/sdk";
import {
  useAccount,
  useConnect,
  useBalance,
  useSwitchChain,
  useDisconnect,
} from "wagmi";
import {
  opStackL1Contracts,
  bridges,
  NEXT_PUBLIC_L1_CHAIN_ID,
  NEXT_PUBLIC_L2_CHAIN_ID,
} from "./config";
import { truncateAddress } from "@/lib/utils";

export default function Bridge() {
  // React state
  const [amount, setAmount] = useState("");
  const [errorInput, setErrorInput] = useState("");
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("deposit");
  const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loader, setLoader] = useState(false);
  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { chains, switchChain } = useSwitchChain();
  const { data: l1Balance } = useBalance({
    address: address,
    chainId: Number(NEXT_PUBLIC_L1_CHAIN_ID),
  });
  const { data: l2Balance } = useBalance({
    address: address,
    chainId: Number(NEXT_PUBLIC_L2_CHAIN_ID),
  });

  // Handlers
  const handleConnect = () => {
    connect({ connector: connectors[0] }); // TODO: add menu to select connector
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleBridge = () => {
    if (amount && isConnected) {
      setIsConfirmationOpen(true);
    }
  };

  const handleConfirm = () => {
    // Simulating bridging process
    console.log(`${activeTab}ing ${amount} ETH`);
    setIsConfirmationOpen(false);
    if (activeTab === "deposit") {
      handleDeposit();
    } else if (activeTab === "withdraw") {
      // TODO: handle withdraw
    }
    setAmount("");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleDeposit = async () => {
    try {
      if (!amount) {
        setErrorInput("Please enter the amount");
      } else {
        if (parseFloat(amount) <= 0) {
          setErrorInput("Invalid Amount Entered!");
        } else {
          const provider =
            (await connectors[0].getProvider()) as optimismSDK.SignerOrProviderLike; // TODO: generalize this
          const crossChainMessenger = new optimismSDK.CrossChainMessenger({
            contracts: {
              l1: opStackL1Contracts,
            },
            bridges: bridges,
            l1ChainId: Number(NEXT_PUBLIC_L1_CHAIN_ID),
            l2ChainId: Number(NEXT_PUBLIC_L2_CHAIN_ID),
            l1SignerOrProvider: provider,
            l2SignerOrProvider: provider,
            bedrock: true,
          });
          const weiValue = parseInt(ethers.parseEther(amount).toString(), 16);
          setLoader(true);
          var depositETHEREUM = await crossChainMessenger.depositETH(
            weiValue.toString()
          );
          const receiptETH = await depositETHEREUM.wait();
          if (receiptETH) {
            setLoader(false);
            setAmount("");
          }
        }
      }
    } catch (error) {
      console.log(error);
      setLoader(false);
    }
  };

  // Use effects
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background pt-16">
      {" "}
      {/* Added pt-16 for header space */}
      <header className="fixed top-0 left-0 right-0 bg-background z-10 shadow-sm">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Tohma Devnet Bridge</h1>
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
                  size="sm"
                  onClick={() => setIsDisconnectOpen(true)}
                >
                  {truncateAddress(address)}
                </Button>
              ) : (
                <Button className="w-full" onClick={handleConnect}>
                  <WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 max-w-md">
        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="deposit"
              onClick={() => setActiveTab("deposit")}
            >
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value="withdraw"
              onClick={() => setActiveTab("withdraw")}
            >
              Withdraw
            </TabsTrigger>
          </TabsList>
          <TabsContent value="deposit">
            <p className="text-sm text-muted-foreground mb-4">
              Deposit ETH from Sepolia to your custom devnet.
            </p>
          </TabsContent>
          <TabsContent value="withdraw">
            <p className="text-sm text-muted-foreground mb-4">
              Withdraw ETH from your custom devnet to Sepolia.
            </p>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (ETH)</Label>
            <Input
              id="amount"
              placeholder="0.0"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {!isConnected ? (
            <Button className="w-full" onClick={handleConnect}>
              <WalletIcon className="mr-2 h-4 w-4" /> Connect Wallet
            </Button>
          ) : (
            <Button
              className="w-full"
              onClick={handleBridge}
              disabled={!amount}
            >
              Bridge {activeTab === "deposit" ? "to" : "from"} Devnet
            </Button>
          )}
        </div>

        <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm {activeTab}</DialogTitle>
              <DialogDescription>
                You are about to {activeTab} {amount} ETH{" "}
                {activeTab === "deposit" ? "to" : "from"} your custom devnet.
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
      </main>
    </div>
  );
}
