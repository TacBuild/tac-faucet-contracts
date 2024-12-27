// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

//Standard Proxy Imports:
import { AppProxy } from "contracts/L2/AppProxy.sol";
import { OutMessage, TokenAmount } from "tac-l2-ccl/contracts/L2/Structs.sol";
import { ICrossChainLayer } from "tac-l2-ccl/contracts/interfaces/ICrossChainLayer.sol";

//Faucet Proxy Imports:
import { IERC20 } from 'contracts/proxies/Faucet/IERC20.sol';
import { ITreasurySwap } from 'contracts/proxies/Faucet/ITreasurySwap.sol';
import { TransferHelper } from 'contracts/helpers/TransferHelper.sol';

/**
 * @title FaucetProxy
 * @dev Proxy contract for TreasurySwap
 */
contract FaucetProxy is AppProxy {

    address public wTON;
    /**
     * @dev Constructor function to initialize the contract with initial state.
     * @param appAddress Application address.
     * @param settingsAddress Settings address.
     */
    constructor(address appAddress, address _wTON, address settingsAddress) AppProxy(appAddress, settingsAddress) {
      wTON = _wTON;
    }

    /**
     * @dev A proxy to TreasurySwap.mint(...).
     */
    function mint(
        address to,
        uint256 wTONamt
    ) public {
        // grant token approvals
        TransferHelper.safeApprove(wTON, _appAddress, wTONamt);
        // proxy call
        ITreasurySwap(_appAddress).mint(to, wTONamt);

        //calculate CCL amount to send back to TON Network
        uint256 tokenValue = ITreasurySwap(_appAddress).tokenValue();
        uint256 amount = (wTONamt * tokenValue) / (10 ** 9);

        // tokens to L2->L1 transfer (lock)
        address tokenAddressReceived = ITreasurySwap(_appAddress).token();
        // grant token approvals
        TransferHelper.safeApprove(tokenAddressReceived, getCrossChainLayerAddress(), amount);
        TokenAmount[] memory tokensToLock = new TokenAmount[](1);
        tokensToLock[0] = TokenAmount(tokenAddressReceived, amount);

        // CCL L2->L1 callback
        OutMessage memory message = OutMessage({
            queryId: 0,
            timestamp: block.timestamp,
            target: "",
            methodName: "",
            arguments: new bytes(0),
            caller: address(this),
            burn: new TokenAmount[](0),
            lock: tokensToLock
        });
        sendMessage(message, 0);
    }

    /**
     * @dev A proxy to TreasurySwap.burn(...).
     */
    function burn(
        uint256 amount
    ) public {
        // grant token approvals
        TransferHelper.safeApprove(ITreasurySwap(_appAddress).token(), _appAddress, amount);

        // proxy call
        ITreasurySwap(_appAddress).burn(amount);
        uint256 tokenValue = ITreasurySwap(_appAddress).tokenValue();
        uint256 refundAmount = amount * 10 ** 9 / tokenValue;

        // CCL L2->L1 callback
        OutMessage memory message = OutMessage({
            queryId: 0,
            timestamp: block.timestamp,
            target: "",
            methodName: "",
            arguments: new bytes(0),
            caller: address(this),
            burn: new TokenAmount[](0),
            lock: new TokenAmount[](0)
        });
        sendMessage(message, refundAmount);
    }
}
