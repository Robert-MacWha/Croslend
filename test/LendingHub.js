const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LendingHub", function () {
  let LendingHub;
  let lendingHub;
  let owner;
  let user1;
  let user2;
  let depositAmount; // 1 ETH
  const spoke = 0;

  beforeEach(async () =>{
    LendingHub = await ethers.getContractFactory("LendingHub");
    [owner, user1, user2] = await ethers.getSigners();
    tenEth = ethers.parseEther("10");
    oneEth = ethers.parseEther("1");
    lendingHub = await LendingHub.deploy();
  });

  describe("deposit", () => {
    it("should allow a user to deposit ETH", async () => {
      await lendingHub.connect(user1).deposit(spoke, user1.address, tenEth);
      expect(await lendingHub.deposits(user1.address)).to.equal(tenEth);
    });
  });

  describe("requestWithdraw", () => {
    it("should allow a user to request a withdraw", async () => {
      await lendingHub.connect(user1).deposit(spoke, user1.address, tenEth);
      await lendingHub.connect(user1).requestWithdraw(spoke, user1.address, oneEth);

      expect(await lendingHub.deposits(user1.address)).to.equal(tenEth - oneEth);
    });
  });

  describe("requestHighWithdraw", () => {
    it("should not allow a user to withdraw more than they have", async () => {
      await lendingHub.connect(user1).deposit(spoke, user1.address, oneEth);

      await expect(lendingHub.connect(user1).requestWithdraw(spoke, user1.address, tenEth)).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("requestBorrow", () => {
    it("should allow a user to request a borrow", async () => {
      await lendingHub.connect(user1).deposit(spoke, user1.address, tenEth);
      await lendingHub.connect(user1).requestBorrow(spoke, user1.address, oneEth);

      expect(await lendingHub.borrows(user1.address)).to.equal(oneEth);
    });
  });

  describe("requestHighBorrow", () => {
    it("should not allow a user to borrow more than half their collateral", async () => {
      await lendingHub.connect(user1).deposit(spoke, user1.address, tenEth);
      await expect(lendingHub.connect(user1).requestBorrow(spoke, user1.address, tenEth)).to.be.revertedWith("Not enough collateral");
    });
  });

  describe("repayBorrow", () => {
    if("should allow a user to repay a borrow", async () => {
      await lendingHub.connect(user1).deposit(spoke, user1.address, tenEth);
      await lendingHub.connect(user1).requestBorrow(spoke, user1.address, oneEth);

      await lendingHub.connect(user1).repayBorrow(spoke, user1.address, oneEth);

      expect(await lendingHub.borrows(user1.address)).to.equal(0);
    });
  });
});