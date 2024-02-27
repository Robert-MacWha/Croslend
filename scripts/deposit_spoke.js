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

    const signer = (await hre.ethers.getSigners())[0];

    // const tokenContract = await hre.ethers.getContractAt("BridgeERC20", deployedContracts.tokens[chainID]);
    // txn = await tokenContract.approve(deployedContracts.spoke[chainID], 10);
    // await txn.wait();
    // console.log("Approved Spoke to spend 10 tokens at", txn.hash)


    const spokeContract = await hre.ethers.getContractAt("LendingSpoke", deployedContracts.spoke[chainID]);

    var transaction = await signer.sendTransaction({
        to: spokeContract.address,
        value: hre.ethers.utils.parseEther("0.04")
    });
    await transaction.wait();

    const cost = await spokeContract.quoteCrossChainCost(hubChainID);
    console.log("Cost to cross chain:", cost.toString());

    txn = await spokeContract.deposit(1);
    await txn.wait();
    console.log("Deposited 10 tokens at", txn.hash)


}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
