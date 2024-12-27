import { ethers, run, hre } from "hardhat";

async function main() {
  const tokens = [
      {
        "tokenName": "USDT",
        "tokenAddress": "0xa4014D04BF612709A2657E1d6f21DF6b02B55d79",
        "tokenValue": "6400000",
        "upperBound": "10000000000",
        "lowerBound": "50000",
        "decimals": 6
      },
      {
        "tokenName": "USDE",
        "tokenAddress": "0xd98BaAeAb71f090d753DCC299Ce5f27C5B8A961E",
        "tokenValue": "6400000000000000000",
        "upperBound": "10000000000000000000000",
        "lowerBound": "50000000000000000",
        "decimals": 18
      },
      {
        "tokenName": "WETH",
        "tokenAddress": "0xa48fA4354B908377bc76D44AF91A249CCE49cd19",
        "tokenValue": "165000000000000",
        "upperBound": "10000000000000000000",
        "lowerBound": "50000000000000",
        "decimals": 18
      },
      {
        "tokenName": "EETH",
        "tokenAddress": "0xF488700B5201E263542015dDDf8B4F8FF699766b",
        "tokenValue": "150000000000000",
        "upperBound": "10000000000000000000",
        "lowerBound": "50000000000000",
        "decimals": 18
      },
      {
        "tokenName": "EZETH",
        "tokenAddress": "0x17cc516AD8e9d8aAf0438Ab2194847E3c4cb3Cb4",
        "tokenValue": "150000000000000",
        "upperBound": "10000000000000000000",
        "lowerBound": "50000000000000",
        "decimals": 18
      },
      {
        "tokenName": "WBTC",
        "tokenAddress": "0x79bE9577B5Ee6B8591Fc46f4aE234BE841c52a86",
        "tokenValue": "64000000000000",
        "upperBound": "1000000000000000000",
        "lowerBound": "500000000000",
        "decimals": 18
      },
      {
        "tokenName": "LBTC",
        "tokenAddress": "0xF6B54A9AF48879d724960997BBB6d6D6f7020820",
        "tokenValue": "64000000000000",
        "upperBound": "1000000000000000000",
        "lowerBound": "500000000000",
        "decimals": 18
      },
      {
        "tokenName": "tgBTC",
        "tokenAddress": "0x43b25dFFcb5D8D9ed621eEaaCbE066d2EBc40D83",
        "tokenValue": "64000",
        "upperBound": "1000000000",
        "lowerBound": "5000",
        "decimals": 9
      },
      {
        "tokenName": "NOT",
        "tokenAddress": "0x2FBb3f5173304E678753c28BEd1129c281810e58",
        "tokenValue": "711000000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "HMSTR",
        "tokenAddress": "0xD2430c19e6d320997b406D4e7a7d761aEf23a2c9",
        "tokenValue": "1730000000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "DOGS",
        "tokenAddress": "0x5B37a43f79FBEeD56d7dEEd5fFBA45c94Bcce7ed",
        "tokenValue": "8530000000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "tsTON",
        "tokenAddress": "0x56e2F5F1Dcd25b37A0d2FB3c91cB5EE2Bab60EdB",
        "tokenValue": "1000000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "REDO",
        "tokenAddress": "0xe4999e568260fDbaD746c31F4Afd6cA2DF0769F6",
        "tokenValue": "21000000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "CATS",
        "tokenAddress": "0x07B17926D461bfb0DF5A87b8a47e8480Eb6ED30d",
        "tokenValue": "190000000000000",
        "upperBound": "10000000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "CATI",
        "tokenAddress": "0x3A77c5566E459082f2d07dBa3c49411F52f54593",
        "tokenValue": "13000000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "stTON",
        "tokenAddress": "0x2b57898AEc43c8e9438daC7b9fa7dBD0758173D4",
        "tokenValue": "1000000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "STORM",
        "tokenAddress": "0x57252EB4e3D2d97A0295Cba7aca0188A0a1cDCDe",
        "tokenValue": "210000000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "DUREV",
        "tokenAddress": "0x47053DC4D6725ca60DEF821398c7662f24a87f70",
        "tokenValue": "320000000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "NikoAI",
        "tokenAddress": "0x33e226830b6B84D539d590043Bfe7eB7213A20C6",
        "tokenValue": "375000000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
      {
        "tokenName": "STON",
        "tokenAddress": "0x05Da2695ff741F5C15419FF02619b353E1151401",
        "tokenValue": "1300000000",
        "upperBound": "10000000000000000",
        "lowerBound": "500000000",
        "decimals": 9
      },
  ]

  for(const token of tokens) {
    console.log("Starting with "+token.tokenName);
    await deployToken(token.tokenAddress, token.tokenValue, token.decimals, token.upperBound, token.lowerBound);
    console.log("Done with "+token.tokenName+", moving next");
  }

}

async function deployToken(tokenAddress, tokenValue, decimals, upperBound, lowerBound) {
  const wTON = "0x5a56a653e2e1b29caF9d892a27cCaE7aa6007efd";
  const TreasurySwap = await ethers.getContractFactory("TreasurySwap");
  const treasury = await TreasurySwap.deploy(tokenAddress, wTON, tokenValue, decimals, upperBound, lowerBound, {});
  await treasury.deployed();
  console.log("Successful deployment");
  console.log("Contract address: ", treasury.address);

  console.log("Starting verification...");
  await run("verify:verify", {
    address: treasury.address,
    constructorArguments: [tokenAddress, wTON, tokenValue, decimals, upperBound, lowerBound],
  });
  console.log("Verification done.");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
