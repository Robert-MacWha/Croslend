/**
* @type import('hardhat/config').HardhatUserConfig
*/

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { API_URL_SEPOLIA, API_URL_MUMBAI, API_URL_FUJI, API_URL_ALFAJORES, API_URL_ARBITRUM_SEPOLIA, API_URL_base_sepolia, API_URL_OASIS_EMERALD_TESTNET, API_URL_MOONBASE_ALPHA, PRIVATE_KEY, POLYGON_MUMBIA_ETHERSCAN_API_KEY, ARBISCAN_API_KEY, BASESCAN_API_KEY } = process.env;

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      arbitrum_sepolia: `${ARBISCAN_API_KEY}`,
      polygon_mumbai: `${POLYGON_MUMBIA_ETHERSCAN_API_KEY}`,
      base_sepolia: `${BASESCAN_API_KEY}`,
      oasis_emerald_testnet: `${LINEA_ETHERSCAN_API_KEY}`,
      moonbase_alpha: `${ZKSYNC_ETHERSCAN_API_KEY}`,
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
  },
}