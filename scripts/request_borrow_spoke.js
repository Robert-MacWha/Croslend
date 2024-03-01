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

    const spokeContract = await hre.ethers.getContractAt("LendingSpoke", deployedContracts.spoke[chainID]);

    const cost = await spokeContract.quoteCrossChainCost(hubChainID);
    console.log("Cost to cross chain:", cost.toString());

    txn = await spokeContract.requestBorrow(10000000000000000000n);
    await txn.wait();
    console.log("Requesting Borrow of 10 tokens at", txn.hash)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
