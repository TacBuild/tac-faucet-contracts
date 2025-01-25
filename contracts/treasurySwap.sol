// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract TreasurySwap is Ownable {
    address public token;
    address public wTON;
    uint256 public tokenValue;
    uint256 public upperBound;
    uint256 public lowerBound;
    uint8 _decimals;

    constructor(address _token, address _wTON, uint256 _tokenValue, uint8 _setDecimals, uint256 _upperBound, uint256 _lowerBound) {
        token = _token;
        wTON = _wTON;
        tokenValue = _tokenValue;
        _decimals = _setDecimals;
        upperBound = _upperBound;
        lowerBound = _lowerBound;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 wTONamt) public returns (uint256) {
        require(wTONamt > 0, "TreasurySwap: You need to send some wTON");

        uint256 amount = (wTONamt * tokenValue) / (10 ** 9);
        require(amount > lowerBound, "TreasurySwap: Requested balance too low");
        require(amount < upperBound, "TreasurySwap: Requested balance too high");

        uint256 allowance = IERC20(wTON).allowance(msg.sender, address(this));
        require(allowance >= wTONamt, "TreasurySwap: Check the wTON allowance");

        bool success = IERC20(wTON).transferFrom(msg.sender, address(this), wTONamt);
        require(success, "TreasurySwap: Can't take wTON from user. Likely insufficient balance");

        uint256 faucetBalance = IERC20(token).balanceOf(address(this));
        require(amount <= faucetBalance, "TreasurySwap: Not enough tokens in the treasury");

        IERC20(token).transfer(to, amount);

        return amount;
    }

    function burn(uint256 amount) public returns (uint256) {
        require(amount > 0, "TreasurySwap: You need to sell at least some tokens");
        require(amount < upperBound, "TreasurySwap: You are requesting to sell too much tokens");

        uint256 allowance = IERC20(token).allowance(msg.sender, address(this));
        require(allowance >= amount, "TreasurySwap: Check the token allowance");

        uint256 availableBalance = addressBalance(msg.sender);
        require(amount <= availableBalance, "TreasurySwap: Requested burn amount greater than current balance");

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        uint256 refundAmount = amount * 10 ** 9 / tokenValue;

        IERC20(wTON).transfer(msg.sender, refundAmount);

        return refundAmount;
    }

    function adminWithdraw(uint256 amount) public onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }

    function adminWithdrawETH(uint256 amount) public onlyOwner {
        (bool success,) = _msgSender().call{value: amount}(new bytes(0));
        require(success, "TreasurySwap: ETH Admin Withdraw failed");
    }

    function adminWithdrawTON(uint256 amount) public onlyOwner {
        IERC20(wTON).transfer(msg.sender, amount);
    }

    function treasuryERCBalance() public view returns (uint256) {
        uint256 balance = IERC20(token).balanceOf(address(this));
        return balance;
    }

    function treasurywTONBalance() public view returns (uint256) {
        uint256 balance = IERC20(wTON).balanceOf(address(this));
        return balance;
    }

    function addressBalance(address addr) public view returns (uint256) {
        uint256 balance = IERC20(token).balanceOf(address(addr));
        return balance;
    }

    receive() external payable {}

    fallback() external payable {}

}
