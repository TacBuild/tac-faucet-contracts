import * as dotenv from "dotenv";

import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { HardhatUserConfig } from "hardhat/config";
dotenv.config();

const TAC_TESTNET_URL = process.env.TAC_TESTNET_URL || "https://turin.rpc.tac.build/";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.25",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.18",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 1337,
      accounts: {
        count: 50
      },
      allowBlocksWithSameTimestamp: true
    },
    localhost: {
	    url:  "http://127.0.0.1:8545",
    },
    tac_testnet: {
      url: TAC_TESTNET_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 2390,
    },
  },
  etherscan: {
    apiKey: {
      tacTurin: 'empty',
    },
    customChains: [
      {
        network: "tacTurin",
        chainId: 2390,
        urls: {
          apiURL: "https://turin.explorer.tac.build/api",
          browserURL: "https://turin.explorer.tac.build"
        }
      }
    ]
  },
  gasReporter: {
    enabled: false,
    currency: 'ETH',
    gasPrice: 1
  }
};

export default config;

