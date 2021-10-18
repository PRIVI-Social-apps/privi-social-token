const { expectRevert } = require("@openzeppelin/test-helpers");
const { assert } = require("chai");
const BN = require("bn.js");
const SocialToken = artifacts.require("SocialToken");
const FundingToken = artifacts.require("FundingToken");

const setting = {
  // funding token params
  fundingTokenInitialSupply: "12500000000000000000000000",
  // social token params
  ammType: 0,
  tradingSpread: 2, // percentage
  tokenName: "Social Token",
  tokenSymbol: "SCT",
  initialSupply: "100000000000000000000",
  targetPrice: "10000000000000000000",
  targetSupply: "1000000000000000000000",
};

contract("SocialToken", ([owner, user1, user2, user3, user4]) => {
  beforeEach(async () => {
    this.fundingToken = await FundingToken.new(
      "Funding Token",
      "FDT",
      setting.fundingTokenInitialSupply,
      { from: owner }
    );

    this.sct = await SocialToken.new(
      // setting.ammType, // AMM type
      0,
      setting.tradingSpread, // trading spread
      setting.tokenName, // token name: "Social Token",
      setting.tokenSymbol, // token symbol: "SCT",
      setting.initialSupply, // initial supply:  1000 * 10**18,
      setting.targetPrice, // target price: 10
      setting.targetSupply, // target supply: 1000
      this.fundingToken.address, // funding token
      { from: owner }
    );

    this.sct1 = await SocialToken.new(
      // setting.ammType, // AMM type
      1,
      setting.tradingSpread, // trading spread
      setting.tokenName, // token name: "Social Token",
      setting.tokenSymbol, // token symbol: "SCT",
      setting.initialSupply, // initial supply:  1000 * 10**18,
      setting.targetPrice, // target price: 10
      setting.targetSupply, // target supply: 1000
      this.fundingToken.address, // funding token
      { from: owner }
    );

    this.sct2 = await SocialToken.new(
      // setting.ammType, // AMM type
      2,
      setting.tradingSpread, // trading spread
      setting.tokenName, // token name: "Social Token",
      setting.tokenSymbol, // token symbol: "SCT",
      setting.initialSupply, // initial supply:  1000 * 10**18,
      setting.targetPrice, // target price: 10
      setting.targetSupply, // target supply: 1000
      this.fundingToken.address, // funding token
      { from: owner }
    );

    // add temp tradeAccumulatedFee balance
    const MAX_APPROVE_AMOUNT =
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";
    const BUY_AMOUNT = "12000000000000000000000";

    await this.fundingToken.approve(this.sct.address, MAX_APPROVE_AMOUNT, {
      from: owner,
    });
    await this.fundingToken.approve(this.sct1.address, MAX_APPROVE_AMOUNT, {
      from: owner,
    });
    await this.fundingToken.approve(this.sct2.address, MAX_APPROVE_AMOUNT, {
      from: owner,
    });
    await this.sct.buyToken(BUY_AMOUNT, {
      from: owner,
    });
    await this.sct1.buyToken(BUY_AMOUNT, {
      from: owner,
    });
    await this.sct2.buyToken(BUY_AMOUNT, {
      from: owner,
    });
  });

  it("name() function test", async () => {
    assert.equal((await this.sct.name()).toString(), "Social Token");
  });

  it("symbol() function test", async () => {
    assert.equal((await this.sct.symbol()).toString(), "SCT");
  });

  it("owner() function test", async () => {
    assert.notEqual((await this.sct.owner()).toString(), user1);
    assert.equal((await this.sct.owner()).toString(), owner);
  });

  it("ammType() function test", async () => {
    assert.equal((await this.sct.ammType()).toString(), "0");
  });

  it("balanceOf() function test", async () => {
    assert.equal(
      (await this.sct.balanceOf(this.sct.address)).toString(),
      "100000000000000000000"
    );
    assert.equal((await this.sct.balanceOf(user1)).toString(), "0");
    assert.equal(
      (await this.sct.balanceOf(owner)).toString(),
      "12000000000000000000000"
    );
  });

  it("totalSupply() function test", async () => {
    assert.equal(
      (await this.sct.totalSupply()).toString(),
      "12100000000000000000000"
    );
  });

  // withdrawSocialToken function test
  it("withdrawSocialToken() function should be succeeded", async () => {
    const WITHDRAW_AMOUNT = "30000000000000000000";

    // before transfer
    const contractBalanceBefore = await this.sct.balanceOf(this.sct.address);
    const ownerBalanceBefore = await this.sct.balanceOf(owner);

    // after transfer
    this.sct.withdrawSocialToken(WITHDRAW_AMOUNT, {
      from: owner,
    });

    const contractBalanceAfter = await this.sct.balanceOf(this.sct.address);
    const ownerBalanceAfter = await this.sct.balanceOf(owner);

    assert.equal(
      new BN(contractBalanceAfter).toString(),
      new BN(contractBalanceBefore).sub(new BN(WITHDRAW_AMOUNT)).toString()
    );
    assert.equal(
      new BN(ownerBalanceAfter).toString(),
      new BN(ownerBalanceBefore).add(new BN(WITHDRAW_AMOUNT)).toString()
    );
  });

  it("withdrawSocialToken() function should be reverted: not owner", async () => {
    await expectRevert(
      this.sct.withdrawSocialToken("30000000000000000000", {
        from: user1,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("withdrawSocialToken() function should be reverted: not enough initial supply", async () => {
    const contractBalance = await this.sct.balanceOf(this.sct.address);

    await expectRevert(
      this.sct.withdrawSocialToken(
        new BN(contractBalance).add(new BN(10000)).toString(),
        {
          from: owner,
        }
      ),
      "Remaining Initial supply is not enough"
    );
  });

  // airDropSocialToken function test
  it("airDropSocialToken() function should be succeeded", async () => {
    const WITHDRAW_AMOUNT = "30000000000000000000";

    // before transfer
    const contractBalanceBefore = await this.sct.balanceOf(this.sct.address);
    const receiverBalanceBefore = await this.sct.balanceOf(user1);

    // after transfer
    this.sct.airDropSocialToken(WITHDRAW_AMOUNT, user1, { from: owner });

    const contractBalanceAfter = await this.sct.balanceOf(this.sct.address);
    const receiverBalanceAfter = await this.sct.balanceOf(user1);

    assert.equal(
      new BN(contractBalanceAfter).toString(),
      new BN(contractBalanceBefore).sub(new BN(WITHDRAW_AMOUNT)).toString()
    );
    assert.equal(
      new BN(receiverBalanceAfter).toString(),
      new BN(receiverBalanceBefore).add(new BN(WITHDRAW_AMOUNT)).toString()
    );
  });

  it("airDropSocialToken() function should be reverted: not owner", async () => {
    await expectRevert(
      this.sct.airDropSocialToken("30000000000000000000", user1, {
        from: user1,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("airDropSocialToken() function should be reverted: not enough initial supply", async () => {
    const contractBalance = await this.sct.balanceOf(this.sct.address);

    await expectRevert(
      this.sct.airDropSocialToken(
        new BN(contractBalance).add(new BN(10000)).toString(),
        user1,
        {
          from: owner,
        }
      ),
      "Remaining Initial supply is not enough"
    );
  });

  // withdrawFundingToken function test
  it("withdrawFundingToken() function should be succeeded", async () => {
    const WITHDRAW_AMOUNT = "1000000000000000000000";

    // before transfer
    const contractBalanceBefore = await this.fundingToken.balanceOf(
      this.sct.address
    );
    const ownerBalanceBefore = await this.fundingToken.balanceOf(owner);
    const tradeAccumulatedFeeBefore = await this.sct.tradeAccumulatedFee();

    // after transfer
    await this.sct.withdrawFundingToken(WITHDRAW_AMOUNT, {
      from: owner,
    });

    const contractBalanceAfter = await this.fundingToken.balanceOf(
      this.sct.address
    );
    const ownerBalanceAfter = await this.fundingToken.balanceOf(owner);
    const tradeAccumulatedFeeAfter = await this.sct.tradeAccumulatedFee();

    assert.equal(
      new BN(contractBalanceAfter).toString(),
      new BN(contractBalanceBefore).sub(new BN(WITHDRAW_AMOUNT)).toString()
    );
    assert.equal(
      new BN(ownerBalanceAfter).toString(),
      new BN(ownerBalanceBefore).add(new BN(WITHDRAW_AMOUNT)).toString()
    );
    assert.equal(
      new BN(tradeAccumulatedFeeAfter).toString(),
      new BN(tradeAccumulatedFeeBefore).sub(new BN(WITHDRAW_AMOUNT)).toString()
    );
  });

  it("withdrawFundingToken() function should be reverted: not owner", async () => {
    await expectRevert(
      this.sct.withdrawFundingToken("30000000000000000000", {
        from: user1,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("withdrawFundingToken() function should be reverted: not enough accumulated funding token", async () => {
    const tradeAccumulatedFee = await this.sct.tradeAccumulatedFee();

    await expectRevert(
      this.sct.withdrawFundingToken(
        new BN(tradeAccumulatedFee).add(new BN(10000)).toString(),
        {
          from: owner,
        }
      ),
      "Withdrawal amount of accumulated funding token is not sufficient"
    );
  });

  // rewardEarnings function test
  it("rewardEarnings() function should be succeeded", async () => {
    const WITHDRAW_AMOUNT = "100000000000000000000";

    // before transfer
    const contractBalanceBefore = await this.fundingToken.balanceOf(
      this.sct.address
    );
    const receiverBalanceBefore = await this.fundingToken.balanceOf(user1);
    const tradeAccumulatedFeeBefore = await this.sct.tradeAccumulatedFee();

    // after transfer
    await this.sct.rewardEarnings(WITHDRAW_AMOUNT, user1, {
      from: owner,
    });

    const contractBalanceAfter = await this.fundingToken.balanceOf(
      this.sct.address
    );
    const receiverBalanceAfter = await this.fundingToken.balanceOf(user1);
    const tradeAccumulatedFeeAfter = await this.sct.tradeAccumulatedFee();

    assert.equal(
      new BN(contractBalanceAfter).toString(),
      new BN(contractBalanceBefore).sub(new BN(WITHDRAW_AMOUNT)).toString()
    );
    assert.equal(
      new BN(receiverBalanceAfter).toString(),
      new BN(receiverBalanceBefore).add(new BN(WITHDRAW_AMOUNT)).toString()
    );
    assert.equal(
      new BN(tradeAccumulatedFeeAfter).toString(),
      new BN(tradeAccumulatedFeeBefore).sub(new BN(WITHDRAW_AMOUNT)).toString()
    );
  });

  it("rewardEarnings() function should be reverted: not owner", async () => {
    await expectRevert(
      this.sct.rewardEarnings("30000000000000000000", user1, {
        from: user1,
      }),
      "Ownable: caller is not the owner"
    );
  });

  it("rewardEarnings() function should be reverted: not enough accumulated funding token", async () => {
    const tradeAccumulatedFee = await this.sct.tradeAccumulatedFee();

    await expectRevert(
      this.sct.rewardEarnings(
        new BN(tradeAccumulatedFee).add(new BN(10000)).toString(),
        user1,
        {
          from: owner,
        }
      ),
      "Withdrawal amount of accumulated funding token is not sufficient"
    );
  });

  // buyToken function test for LINEAR AMM
  it("buyToken() LINEAR function should be succeeded", async () => {
    const BUY_AMOUNT = "12000000000000000000000";

    // before transfer
    const buyerSocialTokenBalanceBefore = await this.sct.balanceOf(owner);

    // after transfer
    await this.sct.buyToken(BUY_AMOUNT, {
      from: owner,
    });

    const buyerSocialTokenBalanceAfter = await this.sct.balanceOf(owner);

    assert.equal(
      new BN(buyerSocialTokenBalanceAfter).toString(),
      new BN(buyerSocialTokenBalanceBefore).add(new BN(BUY_AMOUNT)).toString()
    );
  });

  // buyToken function test for QUADRATIC AMM
  it("buyToken() QUADRATIC function should be succeeded", async () => {
    const BUY_AMOUNT = "12000000000000000000000";

    // before transfer
    const buyerSocialTokenBalanceBefore = await this.sct1.balanceOf(owner);

    // after transfer
    await this.sct1.buyToken(BUY_AMOUNT, {
      from: owner,
    });

    const buyerSocialTokenBalanceAfter = await this.sct1.balanceOf(owner);

    assert.equal(
      new BN(buyerSocialTokenBalanceAfter).toString(),
      new BN(buyerSocialTokenBalanceBefore).add(new BN(BUY_AMOUNT)).toString()
    );
  });

  // buyToken function test for EXPONENTIAL AMM
  it("buyToken() EXPONENTIAL function should be succeeded", async () => {
    const BUY_AMOUNT = "12000000000000000000000";

    // before transfer
    const buyerSocialTokenBalanceBefore = await this.sct2.balanceOf(owner);

    // after transfer
    await this.sct2.buyToken(BUY_AMOUNT, {
      from: owner,
    });

    const buyerSocialTokenBalanceAfter = await this.sct2.balanceOf(owner);

    assert.equal(
      new BN(buyerSocialTokenBalanceAfter).toString(),
      new BN(buyerSocialTokenBalanceBefore).add(new BN(BUY_AMOUNT)).toString()
    );
  });

  // sellToken function test for LINEAR AMM
  it("sellToken() LINEAR function should be succeeded", async () => {
    const SELL_AMOUNT = "3000000000000000000000";

    // before transfer
    const sellerSocialTokenBalanceBefore = await this.sct.balanceOf(owner);

    // after transfer
    await this.sct.sellToken(SELL_AMOUNT, {
      from: owner,
    });
    const sellerSocialTokenBalanceAfter = await this.sct.balanceOf(owner);

    assert.equal(
      new BN(sellerSocialTokenBalanceAfter).toString(),
      new BN(sellerSocialTokenBalanceBefore).sub(new BN(SELL_AMOUNT)).toString()
    );
  });

  // sellToken function test for QUADRATIC AMM
  it("sellToken() QUADRATIC function should be succeeded", async () => {
    const SELL_AMOUNT = "3000000000000000000000";

    // before transfer
    const sellerSocialTokenBalanceBefore = await this.sct1.balanceOf(owner);

    // after transfer
    await this.sct1.sellToken(SELL_AMOUNT, {
      from: owner,
    });
    const sellerSocialTokenBalanceAfter = await this.sct1.balanceOf(owner);

    assert.equal(
      new BN(sellerSocialTokenBalanceAfter).toString(),
      new BN(sellerSocialTokenBalanceBefore).sub(new BN(SELL_AMOUNT)).toString()
    );
  });

  // sellToken function test for QUADRATIC AMM
  it("sellToken() EXPONENTIAL function should be succeeded", async () => {
    const SELL_AMOUNT = "3000000000000000000000";

    // before transfer
    const sellerSocialTokenBalanceBefore = await this.sct2.balanceOf(owner);

    // after transfer
    await this.sct2.sellToken(SELL_AMOUNT, {
      from: owner,
    });
    const sellerSocialTokenBalanceAfter = await this.sct2.balanceOf(owner);

    assert.equal(
      new BN(sellerSocialTokenBalanceAfter).toString(),
      new BN(sellerSocialTokenBalanceBefore).sub(new BN(SELL_AMOUNT)).toString()
    );
  });
});
