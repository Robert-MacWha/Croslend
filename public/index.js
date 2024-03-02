// https://altcoinsbox.com
// https://chainlist.org
const chains = [{
    name: "Base Sepolia",
    logo: "img/base.svg",
    color: "rgb(0, 0, 255)",
    chainID: 84532,
    rpc: "https://base-sepolia.blockpi.network/v1/rpc/public",
    wormholeID: 10004,
    cAddr: "0x8f973e6291701D0A334cAC146D1C9f0Bd7bA3da7",
    tAddr: "0xfB84746E9A350739DEE3Fd2555171C09a48c522E",
}, {
    name: "Arbitrum Goreli",
    logo: "img/arbitrum.svg",
    color: "rgb(50, 60, 150)",
    chainID: 421614,
    rpc: "https://arbitrum-goerli.publicnode.com",
    wormholeID: 23,
    cAddr: "0xa80AEA70Ff3FBc39B3792073D2BbFD26A88fdFE2",
    tAddr: "0xaB0a7434B231913C26C94E3F3c32FB5BD81871F1",
}, {
    name: "Moonbase",
    logo: "img/moonbase.svg",
    color: "rgb(200, 50, 200)",
    chainID: 1287,
    rpc: "https://rpc.testnet.moonbeam.network",
    wormholeID: 16,
    cAddr: "0x8f973e6291701D0A334cAC146D1C9f0Bd7bA3da7",
    tAddr: "0xfB84746E9A350739DEE3Fd2555171C09a48c522E",
}, {
    name: "Oasis Test",
    logo: "img/oasis.svg",
    color: "rgb(150, 200, 250)",
    chainID: 42261,
    rpc: "https://testnet.emerald.oasis.dev",
    wormholeID: 7,
    cAddr: "0x8f973e6291701D0A334cAC146D1C9f0Bd7bA3da7",
    tAddr: "0xfB84746E9A350739DEE3Fd2555171C09a48c522E",
}
    // }, {
    //     name: "Linea Test",
    //     logo: "img/linea.svg",
    //     color: "rgb(50, 200, 255)",
    //     chainID: 59140,
    //     rpc: "https://rpc.goerli.linea.build",
    //     symbol: "ETH",
    // },
]

const INFURA_KEY = "b98c4b03a2754e80beac8bc5911777bd"
const HUB_CHAINID = 421614
const INFURA_URL = "https://arbitrum-sepolia.infura.io/v3/" + INFURA_KEY
const HUB_ADDRESS = "0xcA8a5E83E0D96C8Da506d1F7412fae0248021B98"

const web3 = new Web3(window.ethereum);
const infura_web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL))

$(document).ready(async function () {
    if (typeof window.ethereum === 'undefined') {
        alert("A wallet is required for this application.  Try installing metamask.")
    }

    await loadChains(chains);

    const [labels, liquidities] = loadChainLiquidities()
    loadChart(labels, liquidities);
});

async function loadChains(chains) {
    chains.forEach(async function (chain, i) {
        let template = $("#chain-template").html()
        template = template.replaceAll("{{name}}", chain.name)
        template = template.replaceAll("{{logo}}", chain.logo)
        template = template.replaceAll("{{color}}", chain.color)
        const bal = parseInt(await getBalance(chain)) / 10**18
        template = template.replaceAll("{{balance}}", bal)


        $("#chains").append(template)

        template = $("#chain-dropdown-template").html()
        template = template.replaceAll("{{name}}", chain.name)
        template = template.replaceAll("{{id}}", i)

        $("#chains-dropdown").append(template)
    });
}

// returns the [labels, chainLiquidities]
function loadChainLiquidities() {
    let labels = []
    let liquidities = []

    return [
        ["1", "2", "3", "4", "5"],
        [{
            name: "Test",
            data: [0.1, 0.2, 0.3, 0.2, 0.1],
            color: "rgb(50, 200, 255)",
        }]
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

    new Chart(ctx, {
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
        const account = await getAccount()
        const weiAmount = web3.utils.toWei(amount.toString(), 'ether');

        const approveReceipt = await erc.methods.approve(chain.cAddr, weiAmount).send({ from: account, gas: "200000" })
        await new Promise(r => setTimeout(r, 5000));
        const depositReceipt = await spoke.methods.deposit(weiAmount).send({ from: account, gas: "200000" })

        console.log("approve:", approveReceipt)
        console.log("deposit:", depositReceipt)
    } catch (err) {
        console.log(err);
    }

    hideAct()
}

async function withdraw(e) {
    e.preventDefault()

    hideAct()
}

async function borrow(e) {
    e.preventDefault()

    let amount = $("#act #amount").val()
    let chainIndex = $("#act #chains-dropdown").val()
    let chain = chains[chainIndex]

    await switchChain(chain)


    hideAct()
}

async function repay(e) {
    e.preventDefault()

    let amount = $("#act #amount").val()
    let chainIndex = $("#act #chains-dropdown").val()
    let chain = chains[chainIndex]

    const contract = new web3.eth.Contract(SPOKE_ABI, chain.cAddr);

    try {
        await switchChain(chain)
        const account = await getAccount()
        const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
        const receipt = await contract.methods.repayBorrow(weiAmount).send({ from: account, gas: "200000" });
        console.log("receipt:", receipt)
    } catch (err) {
        console.log(err);
    }


    hideAct()
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
                        symbol: "ETH",
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