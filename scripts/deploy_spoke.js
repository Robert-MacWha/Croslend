const fs = require("fs");

async function main() {
    const chainID = 10003;

    const configPath = "./wormhole_config.json";
    const configData = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(configData);

    let chainInfo = null;

    for (const chain of config) {
        if (chain.chainId == chainID) {
            chainInfo = chain;
        }
    }

    const deployedContractsPath = "./deployed_contracts.json";
    const deployedContractsData = fs.readFileSync(deployedContractsPath, "utf8");
    const deployedContracts = JSON.parse(deployedContractsData);

    var hubInfo = deployedContracts.hub;
    var hubChainID = hubInfo[0];
    var hubAddress = hubInfo[1];

    const token = await hre.ethers.deployContract("BridgeERC20", []);
    await token.deployed();
    console.log("BridgeERC20 deployed to:", token.address, "on chain", chainID);
    deployedContracts.tokens[chainID] = token.address;



    const spoke = await hre.ethers.deployContract("LendingSpoke", [token.address, chainInfo.wormholeRelayer, chainID, hubChainID, hubAddress]);
    await spoke.deployed();
    console.log("LendingSpoke deployed to:", spoke.address, "on chain", chainID);
    deployedContracts.spoke[chainID] = spoke.address;

    const signer = (await hre.ethers.getSigners())[0];

    var transaction = await signer.sendTransaction({
        to: spoke.address,
        value: hre.ethers.utils.parseEther("0.02")
    });
    await transaction.wait();

    await token.addOwner(spoke.address);
    console.log("Spoke added as owner of token");

    fs.writeFileSync(deployedContractsPath, JSON.stringify(deployedContracts, null, 4));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
