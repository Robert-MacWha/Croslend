const fs = require("fs");

async function main() {
    const chainID = 5;

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

    const signer = (await hre.ethers.getSigners())[0];

    var transaction = await signer.sendTransaction({
        to: hubAddress,
        value: hre.ethers.utils.parseEther("0.1")
    });
    await transaction.wait();
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
