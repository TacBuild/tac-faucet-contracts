import '@nomiclabs/hardhat-waffle'
import { HardhatUserConfig } from 'hardhat/config'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-etherscan'
import 'solidity-coverage'
import "@openzeppelin/hardhat-upgrades";

import * as fs from 'fs'

const mnemonicFileName = process.env.MNEMONIC_FILE ?? `${process.env.HOME}/.secret/testnet-mnemonic.txt`

const privKey = process.env.PRIV_KEY

let mnemonic = process.env.MNEMONIC ?? 'test '.repeat(11) + 'junk';

if (fs.existsSync(mnemonicFileName)) {
  mnemonic = fs.readFileSync(mnemonicFileName, 'ascii')
} else {
  mnemonic = {
      mnemonic: mnemonic,
      path: "m/44'/60'/0'/0",
      initialIndex: 1,
      count: 1
  }
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [{
      version: '0.8.25',
      settings: {
        optimizer: { enabled: true, runs: 1000000 }
      }
    }]
  },
  networks: {
    dev: {
      url: 'http://localhost:8545'
    },
    tacTurin: {
      url: `https://turin.rpc.tac.build`,
      accunts: mnemonic
    },
    // github action starts localgeth service, for gas calculations
    localgeth: {
      url: 'http://localgeth:8545'
    }
  },
  mocha: {
    timeout: 10000
  },

  etherscan: {
    apiKey: {
      goerli: 'F8EFN5FTYDIPZNVQN6V7QVPZV7V4JD5SZV',
      tacTurin: 'empty',
      polygonMumbai: 'V2B92NCKU3BXG5QK5M2NJFEYIKHB8B74Q7',
      avalancheFujiTestnet: '2SU9BEWVIWXPADNJVATUM1PUNPXJZR9JW1'
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
  }

}

// coverage chokes on the "compilers" settings
if (process.env.COVERAGE != null) {
  // @ts-ignore
  config.solidity = config.solidity.compilers[0]
}

export default config
