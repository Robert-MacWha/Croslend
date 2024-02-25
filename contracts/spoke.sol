// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LendingSpoke {
    // Allows users to deposit ETH into the contract
    function deposit() external payable {
        deposits[msg.sender] += msg.value;
    }

    // Allows users to withdraw their deposited ETH
    function withdraw(uint256 amount)  {
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        deposits[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    // Allows users to borrow ETH based on their deposits
    function borrow(uint256 amount)  {
        require(deposits[msg.sender] * 2 >= borrows[msg.sender] + amount, "Not enough collateral");
        require(address(this).balance >= amount, "Insufficient funds in contract");
        borrows[msg.sender] += amount;
        payable(msg.sender).transfer(amount);
    }

    // Allows users to repay their borrowed ETH
    function repayBorrow() external payable nonReentrant {
        uint256 borrowedAmount = borrows[msg.sender];
        require(borrowedAmount > 0, "No outstanding borrow");
        require(msg.value <= borrowedAmount, "Repayment exceeds borrowed amount");
        borrows[msg.sender] -= msg.value;
    }

    // Utility functions to check deposited and borrowed amounts
    function getDepositedAmount(address user) external view returns (uint256) {
        return deposits[user];
    }

    function getBorrowedAmount(address user) external view returns (uint256) {
        return borrows[user];
    }
}
