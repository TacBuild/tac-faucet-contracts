// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

interface ITreasurySwap {
    function token() external view returns (address);
    function tokenValue() external view returns (uint256);
    function upperBound() external view returns (uint256);
    function lowerBound() external view returns (uint256);

    function decimals() external view returns (uint8);

    function mint(address to, uint256 wTONamt) external;

    function burn(uint256 amount) external;
}
