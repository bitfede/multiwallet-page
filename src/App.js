import * as React from 'react';
import Web3 from "web3";
import { WalletPickerModal, useMultiwallet } from '@renproject/multiwallet-ui';

//components
import AppShell from './components/AppShell/AppShell';

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
        <span key={chain}>
          {chain}: Status <strong>CONNECTED</strong> to {connector.account}
        </span>
      ))}
    </div>
  );
};

function TransferNftUI(props) {

  const {web3, contract} = props;

  
  const _handleTransferNft = () => {
    console.log("[*] Transfer NFT")
  }

  return (
    <div className={"content-card"}>
            <button
              onClick={() => _handleTransferNft()}
            >
              Transfer Nft
            </button>
    </div>
  )
}

function BuyNftUI(props) {

  const {web3, contract} = props;

  // functions
  const _handleBuyNft = async () => {
    console.log("[*] Buy an Nft")
    const myAccount = (await web3.eth.getAccounts())[0]
    console.log("MY ADDRESS", myAccount)
    console.log("METHODS", contract.methods)

    contract.methods.buyNft().send({from: myAccount, value: 10000000000000000}, (err, res) => {
      console.log(">>>>>", err, res)
    });
  }

  return (
    <div className={"content-card"}>
      <button
      onClick={() => _handleBuyNft()}
      >
        Buy Nft
      </button>
    </div>
  )
}

// TODO: put these components in separate files
function LoggedIn(props) {

  const {web3, contract} = props;

  return (
    <div>
      <WalletDemo />
      <BuyNftUI web3={web3} contract={contract} />
      <TransferNftUI web3={web3} contract={contract} />
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
        Request Ethereum
      </button>
      <button
        onClick={() => {
          setChain('bsc');
          setOpen(true);
        }}
        className={"loggedout-connect-btn"}
      >
        Request BSC
      </button>
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
        <LoggedIn web3={web3} contract={contract} />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <LoggedOut />
    </AppShell>
  );

}

export default App;
