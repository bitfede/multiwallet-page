import * as React from 'react';
import { WalletPickerModal, useMultiwallet } from '@renproject/multiwallet-ui';

import logo from './logo.svg';
import './App.css';

import { EthereumInjectedConnector } from '@renproject/multiwallet-ethereum-injected-connector';
import { EthereumWalletConnectConnector } from '@renproject/multiwallet-ethereum-walletconnect-connector';
import { BinanceSmartChainInjectedConnector } from '@renproject/multiwallet-binancesmartchain-injected-connector';


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
            42: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
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

  const [open, setOpen] = React.useState(false);
  const [chain, setChain] = React.useState('');
  const setClosed = React.useMemo(() => () => setOpen(false), [setOpen]);


  return (
    <div className={"app-container"}>

      <div className={"content-card"}>
        <WalletDemo />
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
