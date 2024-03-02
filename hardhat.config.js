/**
* @type import('hardhat/config').HardhatUserConfig
*/

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");


const { API_URL_SEPOLIA, API_URL_MUMBAI, API_URL_FUJI, API_URL_ALFAJORES, API_URL_ARBITRUM_SEPOLIA, API_URL_ARBITRUM_GOERLI, API_URL_BASE_SEPOLIA, API_URL_OASIS_EMERALD_TESTNET, API_URL_MOONBASE_ALPHA, API_URL_HEDERA, PRIVATE_KEY, POLYGON_MUMBIA_ETHERSCAN_API_KEY, ARBISCAN_API_KEY, BASESCAN_API_KEY, MOONBASE_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      arbitrumSepolia: `${ARBISCAN_API_KEY}`,
      arbitrum_goerli: `${ARBISCAN_API_KEY}`,
      polygon_mumbai: `${POLYGON_MUMBIA_ETHERSCAN_API_KEY}`,
      base_sepolia: `${BASESCAN_API_KEY}`,
      moonbaseAlpha: `${MOONBASE_API_KEY}`,
    },
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: API_URL_SEPOLIA,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    mumbai: {
      url: API_URL_MUMBAI,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    fuji: {
      url: API_URL_FUJI,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    alfajores: {
      url: API_URL_ALFAJORES,
      accounts: [`0x${PRIVATE_KEY}`]
    },
    arbitrum_sepolia: {
      url: API_URL_ARBITRUM_SEPOLIA,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    arbitrum_goerli: {
      url: API_URL_ARBITRUM_GOERLI,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    base_sepolia: {
      url: API_URL_BASE_SEPOLIA,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    oasis_emerald_testnet: {
      url: API_URL_OASIS_EMERALD_TESTNET,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    moonbase_alpha: {
      url: API_URL_MOONBASE_ALPHA,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    hedera_testnet: {
      url: API_URL_HEDERA,
      accounts: [`0x${PRIVATE_KEY}`],
    }
  },
}