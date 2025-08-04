const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleDEX", function () {
  const { parseEther } = ethers;

  let owner, user1, tokenA, tokenB, dex;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    tokenA = await MockERC20.deploy("Token A", "TKA", parseEther("10000"));
    tokenB = await MockERC20.deploy("Token B", "TKB", parseEther("10000"));

    const tokenAAddress = await tokenA.getAddress();
    const tokenBAddress = await tokenB.getAddress();

    const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
    dex = await SimpleDEX.deploy(tokenAAddress, tokenBAddress);

    await tokenA.transfer(user1.address, parseEther("1000"));
    await tokenB.transfer(user1.address, parseEther("1000"));
  });

  describe("Deployment", function () {
    it("Should set the correct token addresses and owner", async function () {
      expect(await dex.tokenA()).to.equal(await tokenA.getAddress());
      expect(await dex.tokenB()).to.equal(await tokenB.getAddress());
      expect(await dex.owner()).to.equal(owner.address);
    });

    it("Should fail if token addresses are the same", async function () {
      const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
      const tokenAAddress = await tokenA.getAddress();
      await expect(
        SimpleDEX.deploy(tokenAAddress, tokenAAddress)
      ).to.be.revertedWith("Token addresses must be different");
    });
  });

  describe("Liquidity Management", function () {
    beforeEach(async function () {
      const dexAddress = await dex.getAddress();
      await tokenA.approve(dexAddress, parseEther("200"));
      await tokenB.approve(dexAddress, parseEther("400"));
    });

    it("Should allow the owner to add initial liquidity", async function () {
      await expect(dex.addLiquidity(parseEther("200"), parseEther("400")))
        .to.emit(dex, "LiquidityAdded")
        .withArgs(owner.address, parseEther("200"), parseEther("400"));

      expect(await dex.reserveA()).to.equal(parseEther("200"));
      expect(await dex.reserveB()).to.equal(parseEther("400"));
      expect(await tokenA.balanceOf(await dex.getAddress())).to.equal(parseEther("200"));
    });

    it("Should fail if a non-owner tries to add liquidity", async function () {
      // CORREÇÃO FINAL: Verificar o erro customizado em vez da string
      await expect(
        dex.connect(user1).addLiquidity(parseEther("10"), parseEther("10"))
      ).to.be.revertedWithCustomError(dex, "OwnableUnauthorizedAccount")
       .withArgs(user1.address);
    });
    
    it("Should fail to add liquidity with incorrect ratio", async function () {
        await dex.addLiquidity(parseEther("100"), parseEther("200"));
        
        const dexAddress = await dex.getAddress();
        await tokenA.approve(dexAddress, parseEther("50"));
        await tokenB.approve(dexAddress, parseEther("50"));

        await expect(
            dex.addLiquidity(parseEther("50"), parseEther("50"))
        ).to.be.revertedWith("Token ratio mismatch");
    });

    it("Should allow the owner to remove liquidity", async function () {
        await dex.addLiquidity(parseEther("200"), parseEther("400"));
        const ownerBalanceABefore = await tokenA.balanceOf(owner.address);

        await expect(dex.removeLiquidity(parseEther("50"), parseEther("100")))
            .to.emit(dex, "LiquidityRemoved")
            .withArgs(owner.address, parseEther("50"), parseEther("100"));
        
        expect(await dex.reserveA()).to.equal(parseEther("150"));
        expect(await dex.reserveB()).to.equal(parseEther("300"));

        const ownerBalanceAAfter = await tokenA.balanceOf(owner.address);
        expect(ownerBalanceAAfter).to.be.gt(ownerBalanceABefore);
    });
  });

  describe("Swapping", function () {
    beforeEach(async function () {
      const dexAddress = await dex.getAddress();
      await tokenA.approve(dexAddress, parseEther("500"));
      await tokenB.approve(dexAddress, parseEther("1000"));
      await dex.addLiquidity(parseEther("500"), parseEther("1000"));
    });

    it("Should allow a user to swap Token A for Token B", async function () {
      const amountIn = parseEther("50");
      await tokenA.connect(user1).approve(await dex.getAddress(), amountIn);

      const userBalanceBBefore = await tokenB.balanceOf(user1.address);
      
      await expect(dex.connect(user1).swapAforB(amountIn))
            .to.emit(dex, "Swapped");

      const userBalanceBAfter = await tokenB.balanceOf(user1.address);
      
      expect(userBalanceBAfter).to.be.gt(userBalanceBBefore);
      expect(await tokenA.balanceOf(user1.address)).to.equal(parseEther("950"));
    });

    it("Should allow a user to swap Token B for Token A", async function () {
        const amountIn = parseEther("100");
        await tokenB.connect(user1).approve(await dex.getAddress(), amountIn);
        const userBalanceABefore = await tokenA.balanceOf(user1.address);

        await dex.connect(user1).swapBforA(amountIn);

        const userBalanceAAfter = await tokenA.balanceOf(user1.address);
        expect(userBalanceAAfter).to.be.gt(userBalanceABefore);
        expect(await tokenB.balanceOf(user1.address)).to.equal(parseEther("900"));
    });

    it("Should fail swap if liquidity is not enough", async function () {
        const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
        const emptyDex = await SimpleDEX.deploy(await tokenA.getAddress(), await tokenB.getAddress());

        await expect(emptyDex.connect(user1).swapAforB(parseEther("10"))).to.be.revertedWith("Not enough liquidity");
    });
  });

  describe("Price Calculation", function () {
      it("Should return correct price after liquidity is added", async function () {
        const dexAddress = await dex.getAddress();
        await tokenA.approve(dexAddress, parseEther("200"));
        await tokenB.approve(dexAddress, parseEther("100"));
        await dex.addLiquidity(parseEther("200"), parseEther("100"));

        const priceA = await dex.getPrice(await tokenA.getAddress());
        expect(priceA).to.equal(parseEther("0.5"));

        const priceB = await dex.getPrice(await tokenB.getAddress());
        expect(priceB).to.equal(parseEther("2"));
      });

      it("Should revert when getting price without liquidity", async function () {
          await expect(dex.getPrice(await tokenA.getAddress())).to.be.revertedWith("No liquidity");
      });

      it("Should revert when getting price for an invalid token address", async function() {
        const dexAddress = await dex.getAddress();
        await tokenA.approve(dexAddress, parseEther("10"));
        await tokenB.approve(dexAddress, parseEther("10"));
        await dex.addLiquidity(parseEther("10"), parseEther("10"));
        
        await expect(dex.getPrice(user1.address)).to.be.revertedWith("Invalid token address");
      })
  });
});