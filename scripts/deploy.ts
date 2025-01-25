import { ethers, run } from "hardhat";
import * as fs from "fs";
import tokens from "../tokens.json";

const wTON = "0x5a56a653e2e1b29caF9d892a27cCaE7aa6007efd";

export function saveContractAddress(addressesFilePath: string, name: string, address: string) {
    let addressData: { [contractName: string]: string } = {};
    if (fs.existsSync(addressesFilePath)) {
        addressData = JSON.parse(fs.readFileSync(addressesFilePath, 'utf8'));
    }
    addressData[name] = address;
    fs.writeFileSync(addressesFilePath, JSON.stringify(addressData, null, 2));
}

async function deployToken(tokenName: string, tokenSymbol: string, decimals: number) {
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

    return await treasury.getAddress();
}

async function deployTreasury(tokenAddress: string, tokenValue: string, decimals: number, upperBound: string, lowerBound: string) {
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

    return await treasury.getAddress();
}

async function deployProxy(treasuryAddress: string) {
    const FaucetProxy = await ethers.getContractFactory("FaucetProxy");
    const tacContractsSettings = "0x0928d67A277891832c743F8179bf2035D0025392";

    const proxy = await FaucetProxy.deploy(treasuryAddress, wTON, tacContractsSettings, {});

    console.log("Waiting for deployment");
    await proxy.deployed();
    console.log("Successful deployment");
    console.log("Contract address: ", proxy.address);

    console.log("Starting verification...");
    await run("verify:verify", {
        address: proxy.address,
        constructorArguments: [treasuryAddress, wTON, tacContractsSettings],
    });
    console.log("Verification done.");

    return await proxy.getAddress();
}

async function main() {
    const addressesFilePath = "../addresses.json";

    for (const token of tokens) {
        console.log("Start deployment for token: ", token.tokenName);

        const tokenAddress = await deployToken(token.tokenName, token.tokenSymbol, token.decimals);
        saveContractAddress(addressesFilePath, `${token.tokenSymbol}_Token`, tokenAddress);

        const treasuryAddress = await deployTreasury(tokenAddress, token.tokenValue, token.decimals, token.upperBound, token.lowerBound);
        saveContractAddress(addressesFilePath, `${token.tokenSymbol}_Treasury`, treasuryAddress);

        const proxyAddress = await deployProxy(treasuryAddress);
        saveContractAddress(addressesFilePath, `${token.tokenSymbol}_Proxy`, proxyAddress);

        console.log("Done with ", token.tokenName);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
