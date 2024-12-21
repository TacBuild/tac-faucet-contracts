import { ethers, run, hre } from "hardhat";

async function main() {
  const tokens = [
      {
        "tokenName": "Tether USD",
        "tokenSymbol": "USDT",
        "decimals": 6
      },
      {
        "tokenName": "Ethena USD",
        "tokenSymbol": "USDE",
        "decimals": 18
      },
      {
        "tokenName": "WrappedETH",
        "tokenSymbol": "WETH",
        "decimals": 18
      },
      {
        "tokenName": "Ether.Fi ETH",
        "tokenSymbol": "EETH",
        "decimals": 18
      },
      {
        "tokenName": "Renzo ETH",
        "tokenSymbol": "ezETH",
        "decimals": 18
      },
      {
        "tokenName": "Wrapped BTC",
        "tokenSymbol": "wBTC",
        "decimals": 18
      },
      {
        "tokenName": "Lombard BTC",
        "tokenSymbol": "LBTC",
        "decimals": 18
      },
      {
        "tokenName": "Teleport BTC",
        "tokenSymbol": "tgBTC",
        "decimals": 9
      },
      {
        "tokenName": "Notcoin",
        "tokenSymbol": "NOT",
        "decimals": 9
      },
      {
        "tokenName": "Hamster Kombat",
        "tokenSymbol": "HMSTR",
        "decimals": 9
      },
      {
        "tokenName": "DOGS",
        "tokenSymbol": "DOGS",
        "decimals": 9
      },
      {
        "tokenName": "Bemo Staked TON",
        "tokenSymbol": "stTON",
        "decimals": 9
      },
      {
        "tokenName": "TonStakers Staked TON",
        "tokenSymbol": "tsTON",
        "decimals": 9
      },
      {
        "tokenName": "Resistance DOG",
        "tokenSymbol": "REDO",
        "decimals": 9
      },
      {
        "tokenName": "Catizen",
        "tokenSymbol": "CATI",
        "decimals": 9
      },
      {
        "tokenName": "Cats",
        "tokenSymbol": "CATS",
        "decimals": 9
      },
      {
        "tokenName": "Storm Finance",
        "tokenSymbol": "STORM",
        "decimals": 9
      },
      {
        "tokenName": "DUREV",
        "tokenSymbol": "DUREV",
        "decimals": 9
      },
      {
        "tokenName": "NikoAI",
        "tokenSymbol": "NikoAI",
        "decimals": 9
      },
      {
        "tokenName": "Ston.fi",
        "tokenSymbol": "STON",
        "decimals": 9
      }
    ]

    for(const token of tokens) {
      console.log("Starting with "+token.tokenName);
      await deployToken(token.tokenName, token.tokenSymbol, token.decimals);
      console.log("Done with "+token.tokenName+", moving next");
    }

}

async function deployToken(tokenName, tokenSymbol, decimals) {
    const TestnetERC20 = await ethers.getContractFactory("TestnetERC20");
    const treasury = await TestnetERC20.deploy(tokenName, tokenSymbol, decimals, {});
    await treasury.deployed();
    console.log("Successful deployment");
    console.log("Contract address: ", treasury.address);

    console.log("Starting verification...");
    await run("verify:verify", {
      address: treasury.address,
      constructorArguments: [tokenName, tokenSymbol, decimals],
    });
    console.log("Verification done.");

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
