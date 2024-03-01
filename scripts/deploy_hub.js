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

    const hub = await hre.ethers.deployContract("LendingHub", [chainInfo.wormholeRelayer, chainID]);
    await hub.deployed();

    const signer = (await hre.ethers.getSigners())[0];

    var transaction = await signer.sendTransaction({
        to: hub.address,
        value: hre.ethers.utils.parseEther("0.35")
    });
    await transaction.wait();

    console.log("LendingHub deployed to:", hub.address, "on chain", chainID);

    const deployedContractsPath = "./deployed_contracts.json";
    const deployedContractsData = fs.readFileSync(deployedContractsPath, "utf8");
    const deployedContracts = JSON.parse(deployedContractsData);

    deployedContracts.hub = [chainID, hub.address];

    fs.writeFileSync(deployedContractsPath, JSON.stringify(deployedContracts, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
