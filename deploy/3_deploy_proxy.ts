import { ethers, run, hre } from "hardhat";

async function main() {
  const tokens = [
      {
        "tokenName": "USDT",
        "treasuryAddress": "0xF7167a58c13Bd65296842Fe77C6cD2c5d897243c"
      },
      {
        "tokenName": "USDE",
        "treasuryAddress": "0xF03b996Cc7c9C9644ceD829A46135D992F612A4a"
      },
      {
        "tokenName": "WETH",
        "treasuryAddress": "0x627CEFcD39b773d873D75614b5dbb28c9a1Ee7E4"
      },
      {
        "tokenName": "EETH",
        "treasuryAddress": "0x249630238CCE8c5F3201b87b7eD65cC818b14c3C"
      },
      {
        "tokenName": "EZETH",
        "treasuryAddress": "0x0102060a5c22D690eD7412d6Accc081648c5334F"
      },
      {
        "tokenName": "WBTC",
        "treasuryAddress": "0x943266153371FF247A3E670fC11EE83a1790f832"
      },
      {
        "tokenName": "LBTC",
        "treasuryAddress": "0x2848FcC84541297946f6E2f465fB29bc0D8cdEdb"
      },
      {
        "tokenName": "tgBTC",
        "treasuryAddress": "0x80f6D9AA191Fee381CB5689a3BF76cc476d8FFC7"
      },
      {
        "tokenName": "NOT",
        "treasuryAddress": "0x6d86ef430fd35F7FdafE9873430C3b7303A9DcfB"
      },
      {
        "tokenName": "HMSTR",
        "treasuryAddress": "0x910C0DEA60185708FAF89098872480C81BC0aDBD"
      },
      {
        "tokenName": "DOGS",
        "treasuryAddress": "0xf33b9fd6D08A099cD3FDd60f0A6b4c19BBf6dB6b"
      },
      {
        "tokenName": "tsTON",
        "treasuryAddress": "0x77958703d7ef3cc12d1e7207C2072a4Cc4a77B41"
      },
      {
        "tokenName": "REDO",
        "treasuryAddress": "0x0c90Ad8cFEc63479EA1F80bF8c2942e4F4B9Df9c"
      },
      {
        "tokenName": "CATS",
        "treasuryAddress": "0x4d8BB48e7E9A3Ffe09AAA7d1cd21d8F687a113fA"
      },
      {
        "tokenName": "CATI",
        "treasuryAddress": "0x65950Fd666C26fd0ffCF1D1B1543b8089eEbf7eB"
      },
      {
        "tokenName": "stTON",
        "treasuryAddress": "0x5f35E3B6248705b03Fd92Bf60092a904d9795ba4"
      },
      {
        "tokenName": "STORM",
        "treasuryAddress": "0x01F791E6D736Ae52739631B41ce699D32644c18b"
      },
      {
        "tokenName": "DUREV",
        "treasuryAddress": "0xCC35630B7F92931BC823D0035371c6a7D8dCCF19"
      },
      {
        "tokenName": "NikoAI",
        "treasuryAddress": "0xE8A158B38AfDa81bB5d223584cb1266DEab1b204"
      },
      {
        "tokenName": "STON",
        "treasuryAddress": "0xc10EC2026a07790ECE7412DcC0e459bF930F8D66"
      },
  ]

  for(const token of tokens) {
    console.log("Starting with "+token.tokenName);
    await deployToken(token.treasuryAddress);
    console.log("Done with "+token.tokenName+", moving next");
  }

}

async function deployToken(treasuryAddress) {
  //const [deployer] = await ethers.getSigners();

  const faucetTreasuryAddress = treasuryAddress
  const tacContractsSettings = "0x0928d67A277891832c743F8179bf2035D0025392";
  const wTONAddress = "0x5a56a653e2e1b29caF9d892a27cCaE7aa6007efd";

  //const faucetProxy = await deploy<FaucetProxy>(deployer, hre.artifacts.readArtifactSync('FaucetProxy'), [faucetTreasuryAddress, tacContractsSettings], undefined, true);
  const FaucetProxy = await ethers.getContractFactory("FaucetProxy");

  const proxy = await FaucetProxy.deploy(faucetTreasuryAddress, wTONAddress, tacContractsSettings, {});

  console.log("waiting for deployment");

  await proxy.deployed();
  console.log("Successful deployment");
  console.log("Contract address: ", proxy.address);

  console.log("Starting verification...");
  await run("verify:verify", {
    address: proxy.address,
    constructorArguments: [faucetTreasuryAddress, wTONAddress, tacContractsSettings],
  });
  console.log("Verification done.");

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
