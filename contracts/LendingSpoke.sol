// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LendingSpoke {
    address crossChainMessageAddr;
    IERC20 public token;

    mapping(address => uint256) public approvedWithdraws;
    mapping(address => uint256) public approvedBorrows;

    constructor(address _crossChainMessageAddr, address _tokenAddr) {
        crossChainMessageAddr = _crossChainMessageAddr;
        token = IERC20(_tokenAddr);
    }

    // Allows users to deposit ETH into the contract
    function deposit(uint256 amount) external {
        address user = msg.sender;

        require(token.transferFrom(user, address(this), amount), "Transfer failed");

        // TODO: Send message to hub to update deposits
        //? deposit(user, amount);
    }

    function repayBorrow(uint256 amount) external {
        address user = msg.sender;

        require(token.transferFrom(user, address(this), amount), "Transfer failed");

        // TODO: Send message to hub to update borrows
        //? repayBorrow(user, amount);
    }

    function requestWithdraw(uint256 amount) external {
        address user = msg.sender;

        // TODO: Send message to hub to request withdraw
        //? requestWithdraw(user, amount);
    }

    function requestBorrow(uint256 amount) external {
        address user = msg.sender;

        // TODO: Send message to hub to request borrow
        //? requestBorrow(user, amount);
    }

    function approveWithdraw(address user, uint256 amount) external {
        require(msg.sender == crossChainMessageAddr, "Only crossChainMessage can call approveWithdraw");
        approvedWithdraws[user] = amount;
    }

    function approveBorrow(address user, uint256 amount) external {
        require(msg.sender == crossChainMessageAddr, "Only crossChainMessage can call approveBorrow");
        approvedBorrows[user] = amount;
    }

    function withdraw() external {
        require(approvedWithdraws[msg.sender] > 0, "No approved withdraws");
        uint256 withdrawAmount = approvedWithdraws[msg.sender];
        approvedWithdraws[msg.sender] = 0;
        
        token.transfer(msg.sender, withdrawAmount);
    }

    function borrow() external {
        require(approvedBorrows[msg.sender] > 0, "No approved borrows");
        uint256 borrowAmount = approvedBorrows[msg.sender];
        approvedBorrows[msg.sender] = 0;
        token.transfer(msg.sender, borrowAmount);
    }

    function bridgeToSpoke(uint256 spokeID, address spokeAddr, uint256 amount) external {
        require(msg.sender == crossChainMessageAddr, "Only crossChainMessage can call bridgeToSpoke");

        // TODO: Bridge amount to spokeAdd on chain spokeID
    }
}
