# Tohma Devnet Bridge

This repo implements a simple bridging interface for depositing to and withdrawing from Tohma L2 devnet.

## Installation and setup

### Define env vars

Clone `.env.example` to `.env` and set the environment variables for L1 and L2 chains.

```bash
cp .env.example .env
```

Note `NEXT_PUBLIC_L1_MULTICALL3_ADDRESS` is set in the next step.

### Installing `multicall3`

The `withdraw` call uses [`multicall3](https://github.com/mds1/multicall) to batch multiple methods in a single call.

To deploy the contract, first install [Foundry](https://book.getfoundry.sh/cast/):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Clone the `multicall3` repo and build the contract:

```
git clone https://github.com/mds1/multicall.git
cd multicall
forge build
```

Deploy the contract, specifying the L1 RPC URL and private key of the funded L1 deployer:

```bash
forge create --rpc-url $L1_RPC_URL --private-key $PRIVATE_KEY Multicall3
```

If the deployment was successful, you should see a similar output as the following:

```bash
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployed to: 0x4C4a2f8c81640e47606d3fd77B353E87Ba015584
Transaction hash: 0xe51086815a32b04b776f1959a722298e95206d63d55dfe6e84d89b0aaa40cf61
```

Set `NEXT_PUBLIC_L1_MULTICALL3_ADDRESS` in `.env` to the address of the deployed contract.

### Starting the bridging app.

Install dependencies and run the development server.

```bash
yarn install
yarn dev
```

To build and run the app:

```bash
yarn build
yarn start
```
