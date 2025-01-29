import hre, { ethers } from "hardhat";
import { Signer } from "ethers";
import { expect } from "chai";
import { deploy, TacLocalTestSdk, JettonInfo, TokenMintInfo, TokenUnlockInfo } from "tac-l2-ccl";
import { TestProxy,  } from "../typechain-types";
import { TestToken } from "../typechain-types";
import { InvokeWithCallbackEvent } from "../typechain-types/contracts/TestProxy";

describe("TestProxy with tac-l2-ccl", () => {
  let admin: Signer;
  let testSdk: TacLocalTestSdk;
  let proxyContract: TestProxy;
  let existedToken: TestToken;

  before(async () => {
    [admin] = await ethers.getSigners();

    // Initialize local test SDK
    testSdk = new TacLocalTestSdk();
    const crossChainLayerAddress = testSdk.create(ethers.provider);

    // Deploy a sample ERC20 token
    existedToken = await deploy<TestToken>(
      admin,
      hre.artifacts.readArtifactSync("TestToken"),
      ["TestToken", "TTK"],
      undefined,
      false
    );

    // Deploy the proxy contract
    proxyContract = await deploy<TestProxy>(
      admin,
      hre.artifacts.readArtifactSync("TestProxy"),
      [crossChainLayerAddress],
      undefined,
      false
    );
  });

  it("Should correctly handle invokeWithCallback", async () => {
    // Prepare call parameters
    // define query id
    const queryId = 1n;
    // define operation id (it'll be created by tac infrasctaucture, but here you can define any string)
    const operationId = ethers.encodeBytes32String("operationId");
    // define untrusted extra data by executor (it's not implemented yet on tac infrasctaucture - just empty bytes)
    const extraData = "0x";

    // define timestamp, when message was created on TVM
    const timestamp = BigInt(Math.floor(Date.now() / 1000));

    // define tvm wallet address who sent message
    const tvmWalletCaller = "TVMCallerAddress";

    const jettonInfo: JettonInfo = {
      tvmAddress: "JettonMinterAddress", // jetton minter contract address
      name: "TestJetton",
      symbol: "TJT",
      decimals: 9n,
      description: "Test Jetton",
      image: "https://jetton-image.com/logo.png",
    };

    // mint jetton
    const tokenMintInfo: TokenMintInfo = {
      info: jettonInfo,
      mintAmount: 10n ** 9n,
    };

    // unlock original evm token
    const tokenUnlockInfo: TokenUnlockInfo = {
      evmAddress: await existedToken.getAddress(),
      unlockAmount: 10n ** 18n,
    };
  
    // lock existed token on cross-chain layer contract, like it was bridged from EVM previously
    await (await existedToken.mint(testSdk.getCrossChainLayerAddress(), tokenUnlockInfo.unlockAmount)).wait();

    // Calculate the EVM address of the bridged Jetton
    const bridgedJettonAddress = testSdk.getEVMJettonAddress(jettonInfo.tvmAddress);

    // Prepare method call
    const target = await proxyContract.getAddress();
    const methodName = "invokeWithCallback(bytes,bytes)";

    // Prepare TokenAmount[] as [[address, amount], [address, amount]]
    const receivedTokens = [
      [bridgedJettonAddress, tokenMintInfo.mintAmount],
      [tokenUnlockInfo.evmAddress, tokenUnlockInfo.unlockAmount]
    ];
    const encodedArguments = ethers.AbiCoder.defaultAbiCoder().encode(
      ["tuple(address,uint256)[]"],
      [receivedTokens]
    );

    // Send the message
    const { receipt, deployedTokens, outMessages } = await testSdk.sendMessage(
      queryId,
      target,
      methodName,
      encodedArguments,
      tvmWalletCaller,
      [tokenMintInfo],
      [tokenUnlockInfo],
      0n,
      extraData,
      operationId,
      timestamp
    );

    expect(receipt.status).to.equal(1);

    // Verify deployed tokens
    expect(deployedTokens.length).to.equal(1);
    expect(deployedTokens[0].evmAddress).to.equal(bridgedJettonAddress);

    // Check outMessages
    expect(outMessages.length).to.equal(1);
    const outMessage = outMessages[0];
    expect(outMessage.queryId).to.equal(queryId);
    expect(outMessage.operationId).to.equal(operationId);
    expect(outMessage.callerAddress).to.equal(await proxyContract.getAddress());
    expect(outMessage.targetAddress).to.equal(tvmWalletCaller);

    // Verify tokens in outMessage
    expect(outMessage.tokensBurned.length).to.equal(1);
    expect(outMessage.tokensBurned[0].evmAddress).to.equal(bridgedJettonAddress);
    expect(outMessage.tokensBurned[0].amount).to.equal(tokenMintInfo.mintAmount);
    expect(outMessage.tokensLocked.length).to.equal(1);
    expect(outMessage.tokensLocked[0].evmAddress).to.equal(tokenUnlockInfo.evmAddress);
    expect(outMessage.tokensLocked[0].amount).to.equal(tokenUnlockInfo.unlockAmount);

    // Check the event
    let eventFound = false;
    receipt.logs.forEach((log) => {
        const parsed = proxyContract.interface.parseLog(log);
        if (parsed && parsed.name === "InvokeWithCallback") {
          eventFound = true;
          const typedEvent = parsed as unknown as InvokeWithCallbackEvent.LogDescription;
          expect(typedEvent.args.queryId).to.equal(queryId);
          expect(typedEvent.args.timestamp).to.equal(timestamp);
          expect(typedEvent.args.operationId).to.equal(operationId);
          expect(typedEvent.args.tvmCaller).to.equal(tvmWalletCaller);
          expect(typedEvent.args.extraData).to.equal(extraData);
          expect(typedEvent.args.receivedTokens.length).to.equal(2);
          expect(typedEvent.args.receivedTokens[0].l2Address).to.equal(bridgedJettonAddress);
          expect(typedEvent.args.receivedTokens[1].l2Address).to.equal(tokenUnlockInfo.evmAddress);
        }
    });
    expect(eventFound).to.be.true;
  });
});
