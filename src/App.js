import * as React from 'react';
import Web3 from "web3";
import { WalletPickerModal, useMultiwallet } from '@renproject/multiwallet-ui';
import { AppBar, Tabs, Tab, TextField, Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

//components
import AppShell from './components/AppShell/AppShell';
import TabPanel from './components/TabPanel/TabPanel';

import { EthereumInjectedConnector } from '@renproject/multiwallet-ethereum-injected-connector';
import { EthereumWalletConnectConnector } from '@renproject/multiwallet-ethereum-walletconnect-connector';
import { BinanceSmartChainInjectedConnector } from '@renproject/multiwallet-binancesmartchain-injected-connector';

import MarketContractABI from "./contracts/Market-abi.json";
import './App.css';

// Replace with your contract's address.
const marketContractAddress = "0x34a747dE8fF81495433Fd5346b9B0F7BD756ba00";

const options = {
  chains: {
    ethereum: [
      {
        name: 'Metamask',
        logo: 'https://avatars1.githubusercontent.com/u/11744586?s=60&v=4',
        connector: new EthereumInjectedConnector({ debug: true }),
      },
      {
        name: 'WalletConnect',
        logo: 'https://avatars0.githubusercontent.com/u/37784886?s=60&v=4',
        connector: new EthereumWalletConnectConnector({
          rpc: {
            42: `https://kovan.infura.io/v3/0xf00`,
          },
          qrcode: true,
          debug: true,
        }),
      },
    ],
    bsc: [
      {
        name: 'BinanceSmartWallet',
        logo: 'https://avatars2.githubusercontent.com/u/45615063?s=60&v=4',
        connector: new BinanceSmartChainInjectedConnector({ debug: true }),
      },
    ],
  },
};

const WalletDemo: React.FC = () => {
  const { enabledChains } = useMultiwallet();
  
  return (
    <div className={"wallet-ui-container"}>
      {Object.entries(enabledChains).map(([chain, connector]) => (
        <Alert id={"wallet-status-text"}  severity="success" key={chain}>
          {chain}: Status <strong>CONNECTED</strong> to {connector.account}
        </Alert>
      ))}
    </div>
  );
};

function TransferNftUI(props) {

  const {web3, contract} = props;

  const [receiver, setReceiver] = React.useState("");
  const [tokenId, setTokenId] = React.useState("");

  //TODO PUT HTML INPUTS TO SET VALUES OF STATE AND BLABLA!!!!!
  
  const _handleTransferNft = async () => {
    console.log("[*] Transfer NFT")
    const myAccount = (await web3.eth.getAccounts())[0]
    console.log("MY ADDRESS", myAccount)
    console.log("METHODS", contract.methods)

    const sendTo = receiver;
    const tokenIdInput = parseInt(tokenId);

    contract.methods.safeTransferFrom(myAccount, sendTo, tokenIdInput).send({from: myAccount}, (err, res) => {
      console.log(">>SAFETRANSFER>>>", err, res)
    });

  }

  return (
    <div className={"content-card-tabpanel"}>
      <h3>Transfer an NFT</h3>
      <TextField
        id="transfer-recipient-input"
        value={receiver}
        onChange={(e) => setReceiver(e.target.value)}
        label="Receiver"
        helperText="The wallet address of the recipient"
        variant="outlined"
      />
      <div style={{height: '1rem'}} />
      <TextField
        id="transfer-tokenid-input"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        label="Token ID"
        helperText="The token ID"
        variant="outlined"
      />
      <Button className={"buy-nft-btn"} onClick={() => _handleTransferNft()} variant="contained" color="primary">
        Transfer NFT
      </Button>
    </div>
  )
}

function BuyNftUI(props) {

  const {web3, contract} = props;

  const [amount, setAmount] = React.useState(0);

  // functions
  const _handleBuyNft = async () => {
    console.log("[*] Buy an Nft")
    const myAccount = (await web3.eth.getAccounts())[0]
    console.log("MY ADDRESS", myAccount)
    console.log("AMOUNT", amount)

    const convertedAmount = parseFloat(amount) * 1000000000000000000;

    contract.methods.buyNft().send({from: myAccount, value: convertedAmount}, (err, res) => {
      console.log(">>>>>", err, res)
    });
  }

  return (
    <div className={"content-card-tabpanel"}>
      <h3>Buy an NFT</h3>
      <TextField
        id="buy-amount-input"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        label="Amount"
        helperText="The quantity of ETH to send"
        variant="outlined"
      />
      <Button className={"buy-nft-btn"} onClick={() => _handleBuyNft()} variant="contained" color="primary">
        Buy NFT
      </Button>
    </div>
  )
}

// TODO: put these components in separate files
function LoggedIn(props) {

  const {web3, contract} = props;

  const [value, setValue] = React.useState(0);

  const handleChangeValue = (e, newValue) => {
    setValue(newValue)
  }

  return (
    <div className={"loggedin-container"}>
      <WalletDemo />
      <AppBar position="static">
        <Tabs centered value={value} onChange={(e, newValue) => handleChangeValue(e, newValue)} centered aria-label="simple tabs example">
          <Tab label="Buy NFT"  />
          <Tab label="Transfer NFT" />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <BuyNftUI web3={web3} contract={contract} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TransferNftUI web3={web3} contract={contract} />
      </TabPanel>
    </div>
  )
}


function LoggedOut() {

  const [open, setOpen] = React.useState(false);
  const [chain, setChain] = React.useState('');

  const setClosed = React.useMemo(() => () => setOpen(false), [setOpen]);

  return (
    <div>
      <div className={"content-card"}>
      <button
        onClick={() => {
          setChain('ethereum');
          setOpen(true);
        }}
        className={"loggedout-connect-btn"}
      >
        Connect to Ethereum
      </button>
      <button
        onClick={() => {
          setChain('bsc');
          setOpen(true);
        }}
        className={"loggedout-connect-btn"}
      >
        Connect to BSC
      </button>
    </div>
    <div className={"connect-btn-helper-text"}>
        <p>Connect your wallet <br/> to Save The Future</p>
    </div>
    <WalletPickerModal
      open={open}
      options={{
        chain,
        onClose: setClosed,
        config: options,
        targetNetwork: 'mainnet',
      }}
    />
  </div>
  )
}

function Titles() {

  return (
    <div className={"main-titles-container"}>
      <h1>$MIRAI</h1>
      <h2>Pre-Sale Token Family {"&"} Friends</h2>
    </div>
  )
}

function App() {

  const { enabledChains } = useMultiwallet();

  const [web3, setWeb3] = React.useState(null);
  const [contract, setContract] =  React.useState(null);

  //useEffects
  React.useEffect( () => {
    if (!enabledChains.ethereum) {
      console.log("[*] Not connected to any chain")
      return
    }

    const web3Provider = window.ethereum;
    const web3instance = new Web3(web3Provider);
    const marketContract = new web3instance.eth.Contract(MarketContractABI, marketContractAddress)

    console.log("[*] Setting web3 object in state")
    setWeb3(web3instance)
    setContract(marketContract)

  }, [enabledChains])

  if (enabledChains.ethereum) {

    console.log("[*] Logged in", web3, contract)

    return (
      <AppShell>
        <Titles />
        <LoggedIn web3={web3} contract={contract} />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <Titles />
      <LoggedOut />
    </AppShell>
  );

}

export default App;
