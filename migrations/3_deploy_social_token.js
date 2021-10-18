const SocialToken = artifacts.require("SocialToken");
const { settings } = require("../config");

module.exports = async function (deployer, network) {
  const setting = settings[network];

  deployer.deploy(
    SocialToken,
    setting.ammType, // AMM type
    setting.tradingSpread, // trading spread
    setting.tokenName, // token name: "Social Token",
    setting.tokenSymbol, // token symbol: "SCT",
    setting.initialSupply, // initial supply:  1000 * 10**18,
    setting.targetPrice, // target price: 10
    setting.targetSupply, // target supply: 1000
    setting.fundingToken // funding token
  );
};
