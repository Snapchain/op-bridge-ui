import Dexie, { Table } from "dexie";

export type WithdrawStatus =
  | "initiating"
  | "initiated"
  | "ready_to_prove"
  | "proving"
  | "proved"
  | "finalizing"
  | "finalized";

export interface WithdrawState {
  withdrawalHash: string;
  address: string;
  status: WithdrawStatus;
  args: any;
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

export class WithdrawDb extends Dexie {
  withdraws!: Table<WithdrawState>;

  constructor() {
    super("snapchain");
    this.version(2).stores({
      withdraws:
        "&withdrawalHash, address, status, args, withdrawalReceipt, output, withdrawal, proveArgs, proveHash, proveReceipt, finalizeHash, finalizeReceipt, createdAt, updatedAt",
    });
  }
}

export const db = new WithdrawDb();
