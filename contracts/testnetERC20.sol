// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract TestnetERC20 is ERC20, AccessControl {

    uint8 immutable _decimals;

    uint256 public constant ONE_ETH = 10 ** 18;
    bytes32 public constant ADMINS = keccak256("ADMINS");

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 decimals_
    ) public ERC20(_name, _symbol) {
        _decimals = decimals_;

        _setRoleAdmin(ADMINS, ADMINS);
        _setupRole(ADMINS, _msgSender());
    }

    function mint(address to, uint256 amount) external onlyRole(ADMINS) {
        _mint(to, amount);
    }

    function burn(uint256 amount) external onlyRole(ADMINS) {
        _burn(_msgSender(), amount);
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}
