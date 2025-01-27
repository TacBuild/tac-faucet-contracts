// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

//Standard Proxy Imports:
import { AppProxy } from "contracts/proxy/AppProxy.sol";
import { OutMessage, TokenAmount, TacHeaderV1 } from "tac-l2-ccl/contracts/L2/Structs.sol";

//Faucet Proxy Imports:
import { ITreasurySwap } from "contracts/interfaces/ITreasurySwap.sol";
import { TransferHelper } from "contracts/helpers/TransferHelper.sol";

struct MintArguments {
    address to;
    uint256 wTONamt;
}

struct BurnArguments {
    address to;
    uint256 amount;
}

/**
 * @title TreasurySwapProxy
 * @dev Proxy contract for TreasurySwap
 */
contract TreasurySwapProxy is AppProxy {

    address public wTON;
    /**
     * @dev Constructor function to initialize the contract with initial state.
     * @param appAddress Application address.
     * @param settingsAddress Settings address.
     */
    constructor(address appAddress, address _wTON, address settingsAddress) AppProxy(appAddress, settingsAddress) {
      wTON = _wTON;
    }

    function _mint(
        MintArguments memory arguments
    ) internal returns (TokenAmount[] memory) {
        // grant token approvals
        TransferHelper.safeApprove(wTON, _appAddress, arguments.wTONamt);

        // proxy call
        uint256 receivedAmount = ITreasurySwap(_appAddress).mint(arguments.to, arguments.wTONamt);

        // bridge remaining tokens to TON
        TokenAmount[] memory tokensToBridge = new TokenAmount[](1);

        tokensToBridge[0] = TokenAmount(ITreasurySwap(_appAddress).token(), receivedAmount);

        return tokensToBridge;
    }

    /**
     * @dev A proxy to TreasurySwap.mint(...).
     */
    function mint(
        bytes calldata tacHeader,
        bytes calldata arguments
    ) external payable onlyCrossChainLayer {

        MintArguments memory args = abi.decode(arguments, (MintArguments));
        TokenAmount[] memory tokensToBridge = _mint(args);

        uint i;
        for (; i < tokensToBridge.length;) {
            TransferHelper.safeApprove(tokensToBridge[i].l2Address, getCrossChainLayerAddress(), tokensToBridge[i].amount);
            unchecked {
                i++;
            }
        }

        // CCL TAC->TON callback
        TacHeaderV1 memory header = _decodeTacHeader(tacHeader);
        OutMessage memory message = OutMessage({
            queryId: header.queryId,
            tvmTarget: header.tvmCaller,
            tvmPayload: "",
            toBridge: tokensToBridge
        });

        sendMessage(message, 0);
    }

    function _burn(
        BurnArguments memory arguments
    ) internal returns (TokenAmount[] memory) {
        // grant token approvals
        TransferHelper.safeApprove(ITreasurySwap(_appAddress).token(), _appAddress, arguments.amount);

        // proxy call
        uint256 receivedAmount = ITreasurySwap(_appAddress).burn(arguments.to, arguments.amount);

        // bridge remaining tokens to TON
        TokenAmount[] memory tokensToBridge = new TokenAmount[](1);
        tokensToBridge[0] = TokenAmount(wTON, receivedAmount);

        return tokensToBridge;
    }

    /**
     * @dev A proxy to TreasurySwap.burn(...).
     */
    function burn(
        bytes calldata tacHeader,
        bytes calldata arguments
    ) external payable onlyCrossChainLayer {

        BurnArguments memory args = abi.decode(arguments, (BurnArguments));
        TokenAmount[] memory tokensToBridge = _burn(args);

        uint i;
        for (; i < tokensToBridge.length;) {
            TransferHelper.safeApprove(tokensToBridge[i].l2Address, getCrossChainLayerAddress(), tokensToBridge[i].amount);
            unchecked {
                i++;
            }
        }

        // CCL TAC->TON callback
        TacHeaderV1 memory header = _decodeTacHeader(tacHeader);
        OutMessage memory message = OutMessage({
            queryId: header.queryId,
            tvmTarget: header.tvmCaller,
            tvmPayload: "",
            toBridge: tokensToBridge
        });

        sendMessage(message, 0);    
    }
}
