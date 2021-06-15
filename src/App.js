import * as React from 'react';
import Web3 from "web3";
import { WalletPickerModal, useMultiwallet } from '@renproject/multiwallet-ui';

import MarketContractABI from "./contracts/Market-abi.json";

import logo from './logo.svg';
import './App.css';


import { EthereumInjectedConnector } from '@renproject/multiwallet-ethereum-injected-connector';
import { EthereumWalletConnectConnector } from '@renproject/multiwallet-ethereum-walletconnect-connector';
import { BinanceSmartChainInjectedConnector } from '@renproject/multiwallet-binancesmartchain-injected-connector';
import { EmojiNatureOutlined } from '@material-ui/icons';

// Replace with your contract's address.
const marketContractAddress = "0x3Aa969d343BD6AE66c4027Bb61A382DC96e88150";

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
    <div>
      {Object.entries(enabledChains).map(([chain, connector]) => (
        <span key={chain}>
          {chain}: Status {connector.status} to {connector.account}
        </span>
      ))}
    </div>
  );
};

function App() {

  const { enabledChains } = useMultiwallet();

  const [open, setOpen] = React.useState(false);
  const [chain, setChain] = React.useState('');
  const [web3, setWeb3] = React.useState(null);
  const [contract, setContract] =  React.useState(null);
  const setClosed = React.useMemo(() => () => setOpen(false), [setOpen]);

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

  // functions
  const _handleBuyNft = () => {
    console.log("[*] Buy an Nft")
    console.log("MY ADDRESS", web3.eth.getAccounts())

    // contract.methods.buyNft(0.01).call({from: web3.eth.getAccounts}, function(error, result){
    //   console.log("------------")
    //   console.log(error, result)
    // });
  }

  if (enabledChains.ethereum) {

    console.log("YAAAAAMAN", web3, contract)

    return (
      <div className={"app-container"}>
        <div className={"content-card"}>
          <WalletDemo />
          <button
          onClick={() => _handleBuyNft()}
          >
            Buy Nft
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={"app-container"}>

      <div className={"content-card"}>
        <button
          onClick={() => {
            setChain('ethereum');
            setOpen(true);
          }}
        >
          Request Ethereum
        </button>
        <button
          onClick={() => {
            setChain('bsc');
            setOpen(true);
          }}
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
  );


}

export default App;
