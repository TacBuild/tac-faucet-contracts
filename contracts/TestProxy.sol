// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ICrossChainLayer } from "tac-l2-ccl/contracts/interfaces/ICrossChainLayer.sol";
import { OutMessage, TacHeaderV1, TokenAmount } from "tac-l2-ccl/contracts/L2/Structs.sol";
import { TacProxyV1 } from "tac-l2-ccl/contracts/proxies/TacProxyV1.sol";

contract TestProxy is TacProxyV1 {

    ICrossChainLayer public crossChainLayer;

    event InvokeWithCallback(
        uint64 queryId,
        uint256 timestamp,
        string operationId,
        string tvmCaller,
        bytes extraData,
        TokenAmount[] receivedTokens
    );

    constructor(ICrossChainLayer _crossChainLayer) {
        crossChainLayer = _crossChainLayer;
    }

    modifier onlyCrossChainLayer() {
        require(msg.sender == address(crossChainLayer), "Only the CrossChainLayer can call this function");
        _;
    }

    function invokeWithCallback(bytes calldata tacHeader, bytes calldata arguments)
        external
        onlyCrossChainLayer
    {
        // Decode the header
        TacHeaderV1 memory header = _decodeTacHeader(tacHeader);

        // Decode the token list
        TokenAmount[] memory receivedTokens = abi.decode(arguments, (TokenAmount[]));

        // there you can call dapp contract

        // Emit the event (optional - for your internal logging)
        emit InvokeWithCallback(
            header.queryId,
            header.timestamp,
            header.operationId,
            header.tvmCaller,
            header.extraData,
            receivedTokens
        );

        // Approve and send tokens back through the cross-chain layer
        for (uint i = 0; i < receivedTokens.length; i++) {
            IERC20(receivedTokens[i].l2Address).approve(
                address(crossChainLayer),
                receivedTokens[i].amount
            );
        }

        crossChainLayer.sendMessage(
            OutMessage(
                header.queryId,
                header.tvmCaller,
                "",
                receivedTokens
            )
        );
    }
}
