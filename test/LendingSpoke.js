const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingSpoke", function () {
  let lendingSpoke;
  let lendingSpokeAddr;
  let owner;
  let crossChainBridge;
  let user1;
  let user2;
  let depositAmount; // 1 ETH
  const spoke = 0;

  beforeEach(async function () {
    const LendingSpoke = await ethers.getContractFactory("LendingSpoke");
    [owner, crossChainBridge, user1, user2] = await ethers.getSigners();
    depositAmount = ethers.parseEther("1");
    lendingSpoke = await LendingSpoke.deploy(crossChainBridge);
    await lendingSpoke.waitForDeployment();
    lendingSpokeAddr = await lendingSpoke.getAddress();
  });

  describe("deposit", () => {
    it("should let the user deposit funds", async() => {
        await lendingSpoke.connect(user1).deposit({ value: depositAmount });

        const cBal = await ethers.provider.getBalance(lendingSpokeAddr);

        expect(cBal).to.equal(depositAmount);
    })
  });

  describe("approveWithdraw", function () {
    it("should approve a withdrawal for a user", async function () {
      await lendingSpoke.connect(crossChainBridge).approveWithdraw(user1.address, depositAmount);
      expect(await lendingSpoke.approvedWithdraws(user1.address)).to.equal(depositAmount);
    });
  });

  describe("approveBorrow", () => {
    it("should approve a borrow for a user", async () => {
      await lendingSpoke.connect(crossChainBridge).approveBorrow(user1.address, depositAmount);
      expect(await lendingSpoke.approvedBorrows(user1.address)).to.equal(depositAmount);
    });
  });

  describe("withdraw", () => {
    it("should let user withdraw funds after approving", async () => {
        // First, deposit ETH into the contract to ensure it has a balance
        await lendingSpoke.connect(user1).deposit({ value: depositAmount });

        // Approve the withdrawal
        await lendingSpoke.connect(crossChainBridge).approveWithdraw(user1.address, depositAmount);
        
        // Attempt to withdraw
        await lendingSpoke.connect(user1).withdraw();

        expect(await lendingSpoke.approvedWithdraws(user1.address), "withdraws should be 0").to.equal(0);
        expect(await ethers.provider.getBalance(lendingSpokeAddr), "balance should be 0").to.equal(0);
    });
  });

  describe("borrow", () => {
    it("should let user borrow funds after approving", async () => {
        // First, deposit ETH into the contract to ensure it has a balance
        await lendingSpoke.connect(user1).deposit({ value: depositAmount });

        // Approve the borrow
        await lendingSpoke.connect(crossChainBridge).approveBorrow(user1.address, depositAmount);
        
        // Attempt to borrow
        await lendingSpoke.connect(user1).borrow();

        expect(await lendingSpoke.approvedBorrows(user1.address), "borrows should be 0").to.equal(0);
        expect(await ethers.provider.getBalance(lendingSpokeAddr), "balance should be 0").to.equal(0);
    });
  });
});