# Hardhat project for all the Solidity contracts used to implement the ERC20 Faucet on TAC Turin.

There are 3 sets of contracts:

- Vanilla ERC20 with AccessControl (testnetERC20.sol)
- a Treasury Contract (treasurySwap.sol) used in the Faucet. Drip method: users lock some wTON tokens (ERC20) and get an equivalent amount of the ERC20. They can burn the ERC20 tokens to get back wTON. The swap is done at a fixed rate (like wETH) that is set in the config file and it's static. It's an anti-abuse mechanism, does not require any throttling or ratelimit.
- A ProxyApp to work with the TAC Adapter (CCL) and let transaction flowing from and to TON wallets.

Relationship between contract is 1:1:1. It needs a deployment of:
- ERC20 contract
- Associated TreasurySwap contract
- ProxyApp Associated to the TreasurySwap
for each ERC20 Token included in the faucet.

Deployment scripts must be run manually and modified according to the output of the previous run.

This software is provided as it is, being a testnet project this code was not audited. Use it at your own risk.

# Instructions to deploy:

1) git clone this repo

2) npm i

3) EXPORT MNEMONIC = "test test test test test test test test test test test junk"

4) npx hardhat run deploy/1_deploy_Token.ts --network tacTurin

5) Now change all tokenAddress of contracts in the deploy/2_deploy_treasury.ts script with the one deployed in step 4)

6) npx hardhat run deploy/2_deploy_treasury.ts --network tacTurin

7) Now change all the treasuryAddress in the deploy/3_deploy_proxy.ts script with the one deployed in step 6)

8) npx hardhat run deploy/3_deploy_proxy.ts --network tacTurin

step 3 gives ERC20 token addresses -> this is needed to calculate the JettonAddress (TVMTokenAddress) with the TAC SDK. JettonAddress are required in the TAC SDK for the Crosschain operations with tokens.

step 6 gives all the TreasurySwap addresses for each ERC20 deployed -> this is not used in the TAC SDK

step 8 gives all the ProxyApp addresses for each TreasurySwap deployed -> this is needed in the TAC SDK (EVMProxyApp)
