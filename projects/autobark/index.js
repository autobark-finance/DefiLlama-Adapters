const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform, getFixBalances } = require("../helper/portedTokens");
const utils = require("../helper/utils");
const { vaultsBase } = require("./autobark-vault-utils");
const url = "https://www.avault.network/media/get-vaults.json";
const ethers = require("ethers")
const { config } = require('@defillama/sdk/build/api');

config.setProvider("dogechain", new ethers.providers.StaticJsonRpcProvider(
  "https://dogechain.ankr.com",
  {
    name: "dogechain",
    chainId: 2000,
  }
))

async function tvl(chainBlocks) {
  const balances = {};
  // const vaultsInfo = (await utils.fetchURL(url)).data;
  const vaultsInfo = {
    dogechain: {
      aUsdcUsdtYode: "0x7b9E22a16CF358D4793b26266c19C674fa708738",
      aUsdcWbtcYode: "0x9EedA0ecB5167f154C85662427d5d230f1b359e7",
    },
  };
  const chainArr = Object.keys(vaultsInfo);
  const chain = "dogechain";
  const chainLocal = chain === "dogechain" ? "dogechain" : chainArr[i];
  const fixBalances = await getFixBalances(chainLocal);
  const vaultAddressArr = Object.values(vaultsInfo[chainLocal]);
  const transformAddress = await getChainTransform(chainLocal);
  const { wantedLocked, wantedAddresses, vaultName } = await vaultsBase(
    chainLocal,
    vaultAddressArr,
    chainBlocks
  );

  const lpPositions = [];
  for (let k = 0; k < wantedLocked.length; k++) {
    if (vaultName[k].toLowerCase().endsWith(" lp")) {
      lpPositions.push({
        token: wantedAddresses[k],
        balance: wantedLocked[k],
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `${chainLocal}:${wantedAddresses[k]}`,
        wantedLocked[k]
      );
    }
  }
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chainLocal],
    chainLocal,
    transformAddress
  );
  fixBalances(balances);

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "AutoBark - The Best Yield Aggregator on DogeChain network",
  dogechain: {
    tvl: tvl,
  },
};
