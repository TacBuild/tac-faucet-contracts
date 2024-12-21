// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import { ISettings } from "tac-l2-ccl/contracts/interfaces/ISettings.sol";
import { ICrossChainLayer } from "tac-l2-ccl/contracts/interfaces/ICrossChainLayer.sol";
import { OutMessage } from "tac-l2-ccl/contracts/L2/Structs.sol";


/**
 * @title AppProxy
 * @dev A base contract for application proxies.
 */
abstract contract AppProxy {
    // State variables
    address internal immutable _appAddress;
    ISettings internal immutable _settings;

    /**
     * @dev Constructor function to initialize the contract with initial state.
     * @param appAddress Application address.
     * @param settingsAddress Settings address.
     */
    constructor(address appAddress, address settingsAddress) {
        _appAddress = appAddress;
       _settings = ISettings(settingsAddress);
    }

    /**
     * @dev Sens a callback message to Cross-Chain Layer.
     * @param message Callback message to send via Cross-Chain Layer.
     */
    function sendMessage(OutMessage memory message, uint256 value) internal {
        ICrossChainLayer(getCrossChainLayerAddress()).sendMessage{value: value}(message);
    }

    // View methods

    /**
     * @dev Returns Cross-Chain Layer address.
     * @return address Cross-Chain Layer address.
     */
    function getCrossChainLayerAddress() public view returns (address) {
        return _settings.getAddressSetting(keccak256("CrossChainLayerAddress"));
    }

    /**
     * @dev Returns dApp address.
     * @return address dApp address.
     */
    function getAppAddress() external view returns (address) {
        return _appAddress;
    }
}
