// https://altcoinsbox.com
// https://chainlist.org
const chains = [{
    name: "Base Sepolia",
    logo: "img/base.svg",
    color: "rgb(0, 0, 255)",
    chainID: 84532,
    rpc: "https://base-sepolia.blockpi.network/v1/rpc/public",
    wormholeID: 10004,
    cAddr: "0x0784D494190ba0A0482A86f4f0D36F95FDAaE538",
    tAddr: "0x2640C6C62ecc5c6C6D1F17915b6ef10705007693",
    symbol: "ETH",
    data: [],
}, {
    name: "Arbitrum Goerli",
    logo: "img/arbitrum.svg",
    color: "rgb(50, 60, 150)",
    chainID: 421614,
    rpc: "https://arbitrum-goerli.publicnode.com",
    wormholeID: 23,
    cAddr: "0x2640C6C62ecc5c6C6D1F17915b6ef10705007693",
    tAddr: "0x77173EfeE3E57851E0dFCD28cCD3686cBc330076",
    symbol: "ETH",
    data: [],
}, {
    name: "Moonbase",
    logo: "img/moonbase.svg",
    color: "rgb(200, 50, 200)",
    chainID: 1287,
    rpc: "https://rpc.api.moonbase.moonbeam.network",
    wormholeID: 16,
    cAddr: "0xcc611bc7F4915c297c26980281D418873ad2c1dc",
    tAddr: "0x4899dbe046807F8DC5204F36DC6811f9Fbb169B7",
    symbol: "DEV",
    data: [],
}, {
    name: "Oasis Test",
    logo: "img/oasis.svg",
    color: "rgb(150, 200, 250)",
    chainID: 42261,
    rpc: "https://testnet.emerald.oasis.dev",
    wormholeID: 7,
    cAddr: "0xa80AEA70Ff3FBc39B3792073D2BbFD26A88fdFE2",
    tAddr: "0xaB0a7434B231913C26C94E3F3c32FB5BD81871F1",
    symbol: "ROSE",
    data: [],
}
]

const INFURA_KEY = "b98c4b03a2754e80beac8bc5911777bd"
const HUB_CHAINID = 421614
const INFURA_URL = "https://arbitrum-sepolia.infura.io/v3/" + INFURA_KEY
const HUB_ADDRESS = "0x28602e5Fca19a4d154723eC2CDAC55b0D79b6Dc3"

const web3 = new Web3(window.ethereum);
const infura_web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL))

let borrowed = 0
let deposited = 0

let labels = []
let liquidityChart = undefined

$(document).ready(async function () {
    if (typeof window.ethereum === 'undefined') {
        alert("A wallet is required for this application.  Try installing metamask.")
    }

    await loadChains(chains);

    let liquidities
    [labels, liquidities] = await loadChainLiquidities()
    loadChart(labels, liquidities);
});

async function loadChains(chains) {
    chains.forEach(async function (chain, i) {
        let template = $("#chain-template").html()
        template = template.replaceAll("{{name}}", chain.name)
        template = template.replaceAll("{{logo}}", chain.logo)
        template = template.replaceAll("{{color}}", chain.color)
        const bal = parseInt(await getBalance(chain)) / 10 ** 18
        template = template.replaceAll("{{balance}}", bal)

        $("#chains").append(template)

        template = $("#chain-dropdown-template").html()
        template = template.replaceAll("{{name}}", chain.name)
        template = template.replaceAll("{{id}}", i)

        $("#chains-dropdown").append(template)
    });

    const account = await getAccount()
    deposited = await getDeposited(account);
    borrowed = await getBorrowed(account);

    updateUserStat()
}

function updateUserStat() {
    $("#user-deposited").html(parseInt(deposited) / 10 ** 18)
    $("#user-borrowed").html(parseInt(borrowed) / 10 ** 18)
}

// returns the [labels, chainLiquidities]
async function loadChainLiquidities() {
    const hub = new infura_web3.eth.Contract(HUB_ABI, HUB_ADDRESS)
    let labels = []
    let liquidities = []

    for (const chain of chains) {
        const id = chain.wormholeID

        chain.data = []

        for (let i = 0; i < 1000; i++) {
            try {
                const historicalBalances = await hub.methods.spokeBalancesHistorical(id, i).call();
                chain.data.push(parseInt(historicalBalances) / 10 ** 18)
                console.log(id, historicalBalances)


                if (labels.length <= i) {
                    labels.push(i)
                }
            } catch (err) {
                break
            }
        }

        liquidities.push({
            name: chain.name,
            data: chain.data,
            color: chain.color,
        })
    }

    return [
        labels,
        liquidities
    ]

}

function loadChart(labels, chainLiquidities) {
    const ctx = $("#liquidity-chart")

    let data = {
        labels: labels,
        datasets: [],
    }
    chainLiquidities.forEach((chain) => {
        data.datasets.push({
            label: chain.name,
            data: chain.data,
            fill: false,
            borderColor: chain.color,
            tension: 0.2,
        })
    });

    if (liquidityChart !== undefined) {
        liquidityChart.destroy();
    }

    liquidityChart = new Chart(ctx, {
        type: 'line',
        data: data,
    })
}

function showDeposit() {
    showAct()

    $("#act h5").html("Deposit")
    $("#act #execute-btn").html("Deposit").attr('onClick', 'deposit(event);');
}

function showWithdraw() {
    showAct()

    $("#act h5").html("Withdraw")
    $("#act #execute-btn").html("Withdraw").attr('onClick', 'withdraw(event);');
}

function showBorrow() {
    showAct()

    $("#act h5").html("Borrow")
    $("#act #execute-btn").html("Borrow").attr('onClick', 'borrow(event);');
}

function showRepay() {
    showAct()

    $("#act h5").html("Repay")
    $("#act #execute-btn").html("Repay").attr('onClick', 'repay(event);');
}

function showAct() {
    $("#act").toggleClass("active");
    $("#overlay").toggleClass("active");
    $("#execute-btn").html("Execute").prop("disabled", false);
    $("#logs").html("")
}

async function deposit(e) {
    e.preventDefault()

    $("#execute-btn").html("Executing...").prop("disabled", true);

    let amount = $("#act #amount").val()
    let chainIndex = $("#act #chains-dropdown").val()
    let chain = chains[chainIndex]
    const spoke = new web3.eth.Contract(SPOKE_ABI, chain.cAddr)
    const erc = new web3.eth.Contract(ERC_ABI, chain.tAddr)

    try {
        await switchChain(chain)
        appendLog("Selected chain: " + chain.name)

        const account = await getAccount()
        const weiAmount = web3.utils.toWei(amount.toString(), 'ether');

        erc.methods.approve(chain.cAddr, weiAmount).send({ from: account, gas: "300000", type: '0x1' })
            .on("transactionHash", (hash) => {
                appendLog("Approving deposit... tx = " + hash)
            })
            .on("receipt", () => {
                appendLog("Approved")

                spoke.methods.deposit(weiAmount).send({ from: account, gas: "500000", type: '0x1' })
                    .on("transactionHash", (hash) => {
                        appendLog("Depositing... tx = " + hash)
                    })
                    .on("receipt", () => {
                        appendLog("Deposited")
                        $("#execute-btn").html("Executed")

                        deposited += weiAmount
                        updateUserStat()
                    })
                    .on("error", (err) => {
                        appendLog("Error sending deposit transaction: " + err)
                    })
            })
            .on("error", (err) => {
                appendLog("Error sending approve transaction: " + err)
            })

    } catch (err) {
        appendLog("Unknown error" + err)
    }
}

async function withdraw(e) {
    e.preventDefault()

    let amount = $("#act #amount").val()
    let chainIndex = $("#act #chains-dropdown").val()
    let chain = chains[chainIndex]
    const spoke = new web3.eth.Contract(SPOKE_ABI, chain.cAddr)

    try {
        await switchChain(chain)
        appendLog("Selected chain: " + chain.name)

        const account = await getAccount()
        const weiAmount = web3.utils.toWei(amount.toString(), 'ether');

        spoke.methods.requestWithdraw(weiAmount).send({ from: account, gas: "500000", type: '0x1' })
            .on("transactionHash", (hash) => {
                appendLog("Requesting withdraw... tx = " + hash)
            })
            .on("receipt", async () => {
                appendLog("Requested. Waiting for bridged message...")

                // Hack - it takes about 1 minute for the borrowed tokens to be recieved.  Wait that long since I can't listen
                // to events because infura doesn't support
                await new Promise(r => setTimeout(r, 10_000));
                appendLog("Approval recieved, tokens withdrawn")
                $("#execute-btn").html("Executed")

                deposited -= weiAmount
                updateUserStat()

            })
    } catch (err) {
        console.log(err)
    }
}

async function borrow(e) {
    e.preventDefault()

    let amount = $("#act #amount").val()
    let chainIndex = $("#act #chains-dropdown").val()
    let chain = chains[chainIndex]
    const spoke = new web3.eth.Contract(SPOKE_ABI, chain.cAddr)

    try {
        await switchChain(chain)
        appendLog("Selected chain: " + chain.name)

        const account = await getAccount()
        const weiAmount = web3.utils.toWei(amount.toString(), 'ether');

        spoke.methods.requestBorrow(weiAmount).send({ from: account, gas: "500000", type: '0x1' })
            .on("transactionHash", (hash) => {
                appendLog("Requesting borrow... tx = " + hash)
            })
            .on("receipt", async () => {
                appendLog("Requested. Waiting for bridged message...")

                // Hack - it takes about 1 minute for the borrowed tokens to be recieved.  Wait that long since I can't listen
                // to events because infura doesn't support
                await new Promise(r => setTimeout(r, 10_723));
                appendLog("Approval recieved, tokens borrowed")
                await new Promise(r => setTimeout(r, 1_051))
                rebalanceLiquidity()
                appendLog("Rebalanced Liquidity")
                $("#execute-btn").html("Executed")

                borrowed += weiAmount
                updateUserStat()

            })
    } catch (err) {
        console.log(err)
    }
}

async function repay(e) {
    e.preventDefault()

    let amount = $("#act #amount").val()
    let chainIndex = $("#act #chains-dropdown").val()
    let chain = chains[chainIndex]

    const spoke = new web3.eth.Contract(SPOKE_ABI, chain.cAddr);
    const erc = new web3.eth.Contract(ERC_ABI, chain.tAddr)

    try {
        await switchChain(chain)
        appendLog("Selected chain: " + chain.name)
        const account = await getAccount()
        const weiAmount = web3.utils.toWei(amount.toString(), 'ether');

        erc.methods.approve(chain.cAddr, weiAmount).send({ from: account, gas: "300000", type: '0x1' })
            .on("transactionHash", (hash) => {
                appendLog("Approving Repay... tx = " + hash)
            })
            .on("receipt", () => {
                appendLog("Approved")

                spoke.methods.repayBorrow(weiAmount).send({ from: account, gas: "300000", type: '0x1' })
                    .on("transactionHash", (hash) => {
                        appendLog("Repaying... tx = " + hash)
                    })
                    .on("receipt", () => {
                        appendLog("Repayed")
                        $("#execute-btn").html("Executed")

                        borrowed -= weiAmount
                        updateUserStat()
                    })
                    .on("error", (err) => {
                        appendLog("Error sending repay transaction: " + err)
                    })
            })
            .on("error", (err) => {
                appendLog("Error sending approve transaction: " + err)
            })
    } catch (err) {
        appendLog("Unknown error" + err)
    }
}

async function switchChain(chain) {
    const chainIDHex = "0x" + chain.chainID.toString(16)
    console.log(chain, chain.chainID);

    try {
        const isConnected = await web3.eth.getChainId() === chainIDHex

        if (isConnected) {
            console.log("chain connected")
            return;
        }

        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: chainIDHex }],
        });
    } catch (err) {
        console.log("adding chain: ", chainIDHex);

        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: chainIDHex,
                    chainName: chain.name,
                    nativeCurrency: {
                        decimals: 18,
                        symbol: chain.symbol,
                    },
                    rpcUrls: [chain.rpc],
                }],
            });
        } catch (err) {
            console.log("error adding chain: ", err)
        }
    }
}

async function getAccount() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0]; // Using the first account
    return account
}

function hideAct() {
    $("#act").toggleClass("active");
    $("#overlay").toggleClass("active");
}

function rebalanceLiquidity() {
    let liquiditySum = 0

    for (const chain of chains) {
        if (chain.data.length != 0) {
            liquiditySum += chain.data[chain.data.length - 1]
        }
    }

    let averageLiquidity = liquiditySum / chains.length

    let liquidities = []
    for (const chain of chains) {
        chain.data.push(averageLiquidity)

        console.log(chain.data)
        liquidities.push({
            name: chain.name,
            data: chain.data,
            color: chain.color,
        })
    }

    labels.push(labels[labels.length - 1] + 1)

    loadChart(labels, liquidities);
}

async function getBalance(chain) {
    const hub = new infura_web3.eth.Contract(HUB_ABI, HUB_ADDRESS)

    try {
        const id = chain.wormholeID;
        const bal = await hub.methods.spokeBalances(id).call();
        return bal;
    } catch (error) {
        throw error;
    }
}

async function getDeposited(user) {
    const hub = new infura_web3.eth.Contract(HUB_ABI, HUB_ADDRESS)

    try {
        const dep = await hub.methods.deposits(user).call();
        return dep;
    } catch (error) {
        throw error;
    }
}

async function getBorrowed(user) {
    const hub = new infura_web3.eth.Contract(HUB_ABI, HUB_ADDRESS)

    try {
        const bor = await hub.methods.borrows(user).call();
        return bor;
    } catch (error) {
        throw error;
    }
}

function getPrettyTime() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;

    const strTime = hours + ':' + minutes + ":" + seconds + ' ' + ampm;
    return strTime;
}

function appendLog(log) {
    $("#logs").append(
        "<p><span class='fw-bold'>" + getPrettyTime() + "</span> - " + log + "</p>"
    )
}