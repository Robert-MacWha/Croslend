// https://altcoinsbox.com
// https://chainlist.org
const chains = [
    {
        name: "Arbitrum Test",
        logo: "img/arbitrum.svg",
        color: "rgb(50, 60, 100)",
        chainID: 421614,
        rpc: "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
        symbol: "ETH",
    }, {
        name: "Base Test",
        logo: "img/base.svg",
        color: "rgb(0, 0, 255)",
        chainID: 84532,
        rpc: "https://base-sepolia.blockpi.network/v1/rpc/public",
        symbol: "ETH",
    }, {
        name: "Linea Test",
        logo: "img/linea.svg",
        color: "rgb(50, 200, 255)",
        chainID: 59140,
        rpc: "https://rpc.goerli.linea.build",
        symbol: "ETH",
    },
]

const web3 = new Web3(window.ethereum);

$(document).ready(() => {
    if (typeof window.ethereum === 'undefined') {
        alert("A wallet is required for this application.  Try installing metamask.")
    }

    loadChains(chains);

    const [labels, liquidities] = loadChainLiquidities()
    loadChart(labels, liquidities);
});

function loadChains(chains) {
    chains.forEach((chain, i) => {
        let template = $("#chain-template").html()
        template = template.replaceAll("{{name}}", chain.name)
        template = template.replaceAll("{{logo}}", chain.logo)
        template = template.replaceAll("{{color}}", chain.color)

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
    $("#act").toggleClass("active");
    $("#overlay").toggleClass("active");

    $("#act h5").html("Deposit")
    $("#act #execute-btn").html("Deposit").attr('onClick', 'deposit(event);');
}

function showWithdraw() {
    $("#act").toggleClass("active");
    $("#overlay").toggleClass("active");

    $("#act h5").html("Withdraw")
    $("#act #execute-btn").html("Withdraw").attr('onClick', 'withdraw(event);');
}

function showBorrow() {
    $("#act").toggleClass("active");
    $("#overlay").toggleClass("active");

    $("#act h5").html("Borrow")
    $("#act #execute-btn").html("Borrow").attr('onClick', 'borrow(event);');
}

function showRepay() {
    $("#act").toggleClass("active");
    $("#overlay").toggleClass("active");

    $("#act h5").html("Repay")
    $("#act #execute-btn").html("Repay").attr('onClick', 'repay(event);');
}

async function deposit(e) {
    e.preventDefault()

    let amount = $("#act #amount").val()
    let chainIndex = $("#act #chains-dropdown").val()
    let chain = chains[chainIndex]

    await switchChain(chain)


    hideAct()
}

async function withdraw(e) {
    e.preventDefault()

    let amount = $("#act #amount").val()
    let chainIndex = $("#act #chains-dropdown").val()
    let chain = chains[chainIndex]

    await switchChain(chain)


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

    await switchChain(chain)

    
    hideAct()
}

async function switchChain(chain) {

    const chainIDHex = "0x" + chain.chainID.toString(16)
    
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
    } catch(err) {
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
        } catch(err) {
            console.log("error adding chain: ", err)
        }
    }
}

function hideAct() {
    $("#act").toggleClass("active");
    $("#overlay").toggleClass("active");
}