// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LendingHub is IWormholeReceiver {
    uint256 constant GAS_LIMIT = 500_000;
    IWormholeRelayer public immutable wormholeRelayer;
    uint16 hubChainID;

    // mapping of borrowers and depositers, and the amounts they borrowed / deposited
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrows;

    // value contained in each of the spoke contracts
    uint256[] public spokes;
    mapping(uint256 => uint256) public spokeBalances;

    event Deposit(uint256 spoke, address user, uint256 amount, uint256 balance);
    event Withdraw(uint256 spoke, address user, uint256 amount, uint256 balance);
    event Borrow(uint256 spoke, address user, uint256 amount);
    event Repay(uint256 spoke, address user, uint256 amount, uint256 remaining);

    constructor(address _wormholeRelayer, uint16 _hubChainID) {
        wormholeRelayer = IWormholeRelayer(_wormholeRelayer);
        hubChainID = _hubChainID;
    }

    function deposit(uint256 spoke, address user, uint256 amount) internal {
        deposits[user] += amount;
        spokeBalances[spoke] += amount;

        emit Deposit(spoke, user, amount, deposits[user]);
    }

    // Allows users to repay their borrowed ETH
    // 
    // This doesn't return in a faliure case, so if a user tries to repay more 
    // than they owe or if they don't have any outstanding borrows, their funds
    // will be locked in the contract.
    function repayBorrow(uint256 spoke, address user, uint256 amount) internal {
        uint256 borrowedAmount = borrows[user];

        require(borrowedAmount > 0, "No outstanding borrow");
        require(amount <= borrowedAmount, "Repayment exceeds borrowed amount");
        
        borrows[user] -= amount;
        spokeBalances[spoke] += amount;

        emit Repay(spoke, user, amount, borrows[user]);
    }

    function requestWithdraw(uint256 spoke, address user, uint256 amount) internal {
        require(deposits[user] >= amount, "Insufficient balance");
        deposits[user] -= amount;
        
        withdrawSpoke(spoke, amount);

        // TODO: send cross-chain message to allow withdraw on the requesting spoke.

        emit Withdraw(spoke, user, amount, deposits[user]);
    }

    function requestBorrow(uint256 spoke, address user, uint256 amount) internal {
        require(deposits[user] / 2 >= borrows[user] + amount, "Not enough collateral");
        
        withdrawSpoke(spoke, amount);
        borrows[user] += amount;

        // TODO: send cross-chain message to allow borrow on the requesting spoke.

        emit Borrow(spoke, user, amount);
    }

    function receiveWormholeMessages(
        bytes memory payload,
        bytes[] memory, // additionalVaas
        bytes32, // address that called 'sendPayloadToEvm' (HelloWormhole contract address)
        uint16 sourceChain,
        bytes32 // unique identifier of delivery
    ) public payable override {
        require(msg.sender == address(wormholeRelayer), "Only relayer allowed");

        // Parse the payload and do the corresponding actions!
        (string memory functionName, bytes memory infoPayload) = abi.decode(
            payload,
            (string, bytes)
        );

        if (keccak256(abi.encodePacked(functionName)) == keccak256(abi.encodePacked("deposit"))) {
            (uint256 spoke, address user, uint256 amount) = abi.decode(
                infoPayload,
                (uint256, address, uint256)
            );
            deposit(spoke, user, amount);
        } else if (keccak256(abi.encodePacked(functionName)) == keccak256(abi.encodePacked("repayBorrow"))) {
            (uint256 spoke, address user, uint256 amount) = abi.decode(
                infoPayload,
                (uint256, address, uint256)
            );
            repayBorrow(spoke, user, amount);
        } else if (keccak256(abi.encodePacked(functionName)) == keccak256(abi.encodePacked("requestWithdraw"))) {
            (uint256 spoke, address user, uint256 amount) = abi.decode(
                infoPayload,
                (uint256, address, uint256)
            );
            requestWithdraw(spoke, user, amount);
        } else if (keccak256(abi.encodePacked(functionName)) == keccak256(abi.encodePacked("requestBorrow"))) {
            (uint256 spoke, address user, uint256 amount) = abi.decode(
                infoPayload,
                (uint256, address, uint256)
            );
            requestBorrow(spoke, user, amount);
        }
    }

    // withdrawSpoke withdraws an amount from a spoke.  If that spoke can't pay 
    // the amount, re-distributes liquidity so that it has enough.
    function withdrawSpoke(uint256 spoke, uint256 amount) internal {
        if (spokeBalances[spoke] < amount) {
            redistributeValueToSpoke(spoke, amount);
        }

        spokeBalances[spoke] -= amount;
    }

    // redistributeValueToSpoke distributes the liquidity from all spokes into 
    // a target spoke, making sure that the selected spoke has a given amount
    // of liquidity 
    function redistributeValueToSpoke(uint256 dSpoke, uint256 targetAmount) internal {
        require(spokeBalances[dSpoke] < targetAmount, "Spoke already has enough liquidity");

        // calculate the desired value per spoke
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < spokes.length; i++) {
            totalAmount += spokeBalances[spokes[i]];
        }
        uint256 desiredSpokeValue = totalAmount / spokes.length;

        // calculate how much to re-distribute to the target spoke
        uint256 deltaSpokeValue = desiredSpokeValue - spokeBalances[dSpoke];
        deltaSpokeValue = max(targetAmount, deltaSpokeValue);

        // re-distribute from all spokes to the target spoke
        for (uint256 i = 0; i < spokes.length; i++) {
            uint256 tSpoke = spokes[i];
            if (tSpoke == dSpoke) {
                continue;
            }

            uint256 transferAmount = min(deltaSpokeValue, spokeBalances[tSpoke] - desiredSpokeValue);

            // transfer the transferAmount from the target spoke to the destination spoke
            deltaSpokeValue -= transferAmount;
        }
    }

    function sendBridgeRequest(uint256 tSpoke, uint256 dSpoke, uint256 amount) internal {
        require(spokeBalances[tSpoke] >= amount, "Insufficient balance");

        spokeBalances[tSpoke] -= amount;
        spokeBalances[dSpoke] += amount;

        // TODO: send the request to tSpoke to bridge the tokens to tSpoke
    }

    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a >= b ? a : b;
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
