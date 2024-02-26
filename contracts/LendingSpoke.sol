// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./IWormholeRelayer.sol";
import "./IWormholeReceiver.sol";

contract LendingSpoke is IWormholeReceiver {
    uint256 constant GAS_LIMIT = 500_000;
    IWormholeRelayer public immutable wormholeRelayer;
    uint16 spokeChainID;
    uint16 hubChainID;
    address hubAddress;


    address crossChainMessageAddr;
    IERC20 public token;

    mapping(address => uint256) public approvedWithdraws;
    mapping(address => uint256) public approvedBorrows;

    constructor(address _tokenAddr, address _wormholeRelayer, uint16 _spokeChainID, uint16 _hubChainID, address _hubAddress) {
        token = IERC20(_tokenAddr);
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
        spokeChainID = _spokeChainID;
        hubChainID = _hubChainID;
        hubAddress = _hubAddress;
    }

    function quoteCrossChainCost(
        uint16 targetChain
    ) public view returns (uint256 cost) {
        (cost, ) = wormholeRelayer.quoteEVMDeliveryPrice(
            targetChain,
            0,
            GAS_LIMIT
        );
    }

    // deposit(uint256 spoke, address user, uint256 amount)
    // Allows users to deposit ETH into the contract
    function deposit(uint256 amount) external {
        address user = msg.sender;

        require(token.transferFrom(user, address(this), amount), "Transfer failed");

        uint256 cost = quoteCrossChainCost(hubChainID);

        // Info payload is the bytes of the information that's actually valuable
        bytes memory infoPayload = abi.encode(spokeChainID, user, amount);
        // Main payload just contains which function to call
        bytes memory mainPayload = abi.encode("deposit", infoPayload);
        
        wormholeRelayer.sendPayloadToEvm{value: cost}(
            hubChainID,
            hubAddress,
            mainPayload,
            0,
            GAS_LIMIT
        );
    }

    // repayBorrow(uint256 spoke, address user, uint256 amount)
    function repayBorrow(uint256 amount) external {
        address user = msg.sender;

        require(token.transferFrom(user, address(this), amount), "Transfer failed");

        uint256 cost = quoteCrossChainCost(hubChainID);

        // Info payload is the bytes of the information that's actually valuable
        bytes memory infoPayload = abi.encode(spokeChainID, user, amount);
        // Main payload just contains which function to call
        bytes memory mainPayload = abi.encode("repayBorrow", infoPayload);

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            hubChainID,
            hubAddress,
            mainPayload,
            0,
            GAS_LIMIT
        );
    }

    // requestWithdraw(uint256 spoke, address user, uint256 amount)
    function requestWithdraw(uint256 amount) external {
        address user = msg.sender;

        uint256 cost = quoteCrossChainCost(hubChainID);

        // Info payload is the bytes of the information that's actually valuable
        bytes memory infoPayload = abi.encode(spokeChainID, user, amount);
        // Main payload just contains which function to call
        bytes memory mainPayload = abi.encode("requestWithdraw", infoPayload);

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            hubChainID,
            hubAddress,
            mainPayload,
            0,
            GAS_LIMIT
        );
    }

    // requestBorrow(uint256 spoke, address user, uint256 amount)
    function requestBorrow(uint256 amount) external {
        address user = msg.sender;

        uint256 cost = quoteCrossChainCost(hubChainID);

        // Info payload is the bytes of the information that's actually valuable
        bytes memory infoPayload = abi.encode(spokeChainID, user, amount);
        // Main payload just contains which function to call
        bytes memory mainPayload = abi.encode("requestBorrow", infoPayload);

        wormholeRelayer.sendPayloadToEvm{value: cost}(
            hubChainID,
            hubAddress,
            mainPayload,
            0,
            GAS_LIMIT
        );
    }

    
    function approveWithdraw(address user, uint256 amount) internal {
        approvedWithdraws[user] = amount;
    }

    function approveBorrow(address user, uint256 amount) internal {
        approvedBorrows[user] = amount;
    }

    function withdraw() internal {
        require(approvedWithdraws[msg.sender] > 0, "No approved withdraws");
        uint256 withdrawAmount = approvedWithdraws[msg.sender];
        approvedWithdraws[msg.sender] = 0;
        
        token.transfer(msg.sender, withdrawAmount);
    }

    function borrow() internal {
        require(approvedBorrows[msg.sender] > 0, "No approved borrows");
        uint256 borrowAmount = approvedBorrows[msg.sender];
        approvedBorrows[msg.sender] = 0;
        token.transfer(msg.sender, borrowAmount);
    }

    function bridgeToSpoke(uint256 spokeID, address spokeAddr, uint256 amount) external {
        require(msg.sender == crossChainMessageAddr, "Only crossChainMessage can call bridgeToSpoke");

        // TODO: Bridge amount to spokeAdd on chain spokeID
    }

    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory, // additionalVaas
        bytes32, // address that called 'sendPayloadToEvm' (HelloWormhole contract address)
        uint16 sourceChain,
        bytes32 // unique identifier of delivery
    ) public payable override {
        // TODO
    }
}
