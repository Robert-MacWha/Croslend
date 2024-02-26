/**
* @type import('hardhat/config').HardhatUserConfig
*/

require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

const { API_URL_SEPOLIA, API_URL_MUMBAI, API_URL_FUJI, API_URL_ALFAJORES, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
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
    }
  },
}