import { createStore } from "@udecode/zustood";
import { createJSONStorage } from "zustand/middleware";

type Theme = "light" | "dark";

export interface WithdrawState {
  address: string;
  status:
    | "initiating"
    | "initiated"
    | "ready_to_prove"
    | "proved"
    | "finalizing"
    | "finalized";
  args: any;
  withdrawalHash?: string;
  withdrawalReceipt?: any;
  output?: any;
  withdrawal?: any;
  proveArgs?: any;
  proveHash?: string;
  proveReceipt?: any;
  finalizeHash?: string;
  finalizeReceipt?: any;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawsSlice = createStore("withdraws")<WithdrawState>(
  {
    address: "",
    status: "initiated",
    args: {},
    withdrawalHash: "",
    withdrawalReceipt: {},
    output: {},
    withdrawal: {},
    proveArgs: {},
    proveHash: "",
    finalizeHash: "",
    finalizeReceipt: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    persist: {
      name: "withdraws", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      enabled: true,
    },
  }
).extendActions((set, get) => ({
  initiate: (address: string, args: any, hash: string) => {
    set.state((draft) => {
      draft.address = address;
      draft.status = "initiating";
      draft.args = args;
      draft.withdrawalHash = hash;
    });
  },
  addInitiateReceipt: (withdrawalReceipt: any) => {
    set.state((draft) => {
      draft.withdrawalReceipt = withdrawalReceipt;
      draft.status = "initiated";
      draft.updatedAt = new Date();
    });
  },
  prove: (output: any, withdrawal: any, proveArgs: any, proveHash: string) => {
    set.state((draft) => {
      draft.output = output;
      draft.withdrawal = withdrawal;
      draft.proveArgs = proveArgs;
      draft.proveHash = proveHash;
      draft.status = "ready_to_prove";
      draft.updatedAt = new Date();
    });
  },
  addProveReceipt: (proveReceipt: any) => {
    set.state((draft) => {
      draft.proveReceipt = proveReceipt;
      draft.status = "proved";
      draft.updatedAt = new Date();
    });
  },
  finalize: (finalizeHash: string) => {
    set.state((draft) => {
      draft.finalizeHash = finalizeHash;
      draft.status = "finalizing";
      draft.updatedAt = new Date();
    });
  },
  addFinalizeReceipt: (finalizeReceipt: any) => {
    set.state((draft) => {
      draft.finalizeReceipt = finalizeReceipt;
      draft.status = "finalized";
      draft.updatedAt = new Date();
    });
  },
  getWithdraw: () => {
    return get.state();
  },
}));

export default withdrawsSlice;
