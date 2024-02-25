// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LendingSpoke {
    address crossChainMessageAddr;

    mapping(address => uint256) public approvedBorrows;
    mapping(address => uint256) public approvedWithdraws;

    constructor(address _crossChainMessageAddr) {
        crossChainMessageAddr = _crossChainMessageAddr;
    }

    // Allows users to deposit ETH into the contract
    function deposit() external payable {
        address user = msg.sender;
        uint256 amount = msg.value;

        // TODO: Send message to hub to update deposits
        //? deposit(user, amount);
    }

    function repayBorrow() external payable {
        address user = msg.sender;
        uint256 amount = msg.value;

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

        approvedBorrows[user] = amount;
    }

    function approveBorrow(address user, uint256 amount) external {
        require(msg.sender == crossChainMessageAddr, "Only crossChainMessage can call approveBorrow");

        approvedWithdraws[user] = amount;
    }

    function withdraw() external {
        require(approvedWithdraws[msg.sender] > 0, "No approved withdraws");
        payable(msg.sender).transfer(approvedWithdraws[msg.sender]);
    }

    function borrow() external {
        require(approvedBorrows[msg.sender] > 0, "No approved borrows");
        payable(msg.sender).transfer(approvedBorrows[msg.sender]);
    }

    function bridgeToSpoke(uint256 spokeID, address spokeAddr, uint256 amount) external {
        require(msg.sender == crossChainMessageAddr, "Only crossChainMessage can call bridgeToSpoke");

        // TODO: Bridge amount to spokeAdd on chain spokeID
    }
}
