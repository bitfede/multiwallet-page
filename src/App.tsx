import { AppBar, Tab, Tabs } from "@material-ui/core";
import { EthereumInjectedConnector } from "@renproject/multiwallet-ethereum-injected-connector";
import { EthereumWalletConnectConnector } from "@renproject/multiwallet-ethereum-walletconnect-connector";
import { useMultiwallet, WalletPickerModal } from "@renproject/multiwallet-ui";
import * as React from "react";
import Web3 from "web3";
import "./App.css";
import AppShell from "./components/AppShell/AppShell";
import { BuyNft } from "./components/buy-nft/buy-nft";
import TabPanel from "./components/TabPanel/TabPanel";
import { TransferNft } from "./components/transfer-nft/transfer-nft";
import { WalletInfo } from "./components/wallet-info/wallet-info";
import MarketContractABI from "./config/Market-abi.json";
import settings from "./settings";

const options = {
  chains: {
    bsc: [
      {
        name: "Metamask",
        logo: "https://avatars1.githubusercontent.com/u/11744586?s=60&v=4",
        connector: new EthereumInjectedConnector({ debug: true }),
      },
      {
        name: "WalletConnect",
        logo: "https://avatars0.githubusercontent.com/u/37784886?s=60&v=4",
        connector: new EthereumWalletConnectConnector({
          rpc: {
            [settings.blockchain.providerChainId]:
              settings.blockchain.providerUrl,
          },
          qrcode: true,
          debug: true,
        }),
      },
    ],
  },
};

function LoggedIn(props) {
  const { web3, contract } = props;

  const [value, setValue] = React.useState(0);

  const handleChangeValue = (e, newValue) => {
    setValue(newValue);
  };

  return (
    <div className={"loggedin-container"}>
      <WalletInfo />
      <AppBar position="static">
        <Tabs
          centered
          value={value}
          onChange={(e, newValue) => handleChangeValue(e, newValue)}
          aria-label="simple tabs example"
        >
          <Tab label="Buy NFT" />
          <Tab label="Transfer NFT" />
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0}>
        <BuyNft web3={web3} contract={contract} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TransferNft web3={web3} contract={contract} />
      </TabPanel>
    </div>
  );
}

function LoggedOut() {
  const [open, setOpen] = React.useState(false);
  const [chain, setChain] = React.useState("");

  const setClosed = React.useMemo(() => () => setOpen(false), [setOpen]);

  return (
    <div>
      <div className={"content-card"}>
        <button
          onClick={() => {
            setChain("bsc");
            setOpen(true);
          }}
          className={"loggedout-connect-btn"}
        >
          Connect
        </button>
      </div>
      <div className={"connect-btn-helper-text"}>
        <p>
          Connect your wallet <br /> to Save The Future
        </p>
      </div>
      <WalletPickerModal
        open={open}
        options={{
          chain,
          onClose: setClosed,
          config: options,
          targetNetwork: undefined,
        }}
      />
    </div>
  );
}

function App() {
  const { enabledChains } = useMultiwallet();
  const [web3, setWeb3] = React.useState(null);
  const [contract, setContract] = React.useState(null);
  const isConnected =
    !!contract &&
    Object.entries(enabledChains).some(
      ([chain, connector]) => connector.status === "connected"
    );

  React.useEffect(() => {
    handleChainChange();
  }, [enabledChains]);

  const handleChainChange = async () => {
    const chain = enabledChains?.bsc;
    if (!chain) {
      console.log("[*] Not connected to any chain");
      return;
    }

    const contractAddress = settings.blockchain.contractAddress;
    const web3Provider = (await chain.connector.getProvider()) as any;
    const web3instance = new Web3(web3Provider);
    const marketContract = new web3instance.eth.Contract(
      MarketContractABI as any,
      contractAddress
    );

    setWeb3(web3instance);
    setContract(marketContract);
    console.log(
      "[*] Connected.",
      contractAddress,
      web3Provider,
      web3instance,
      marketContract
    );
  };

  return (
    <AppShell>
      <div className={"main-titles-container"}>
        <h1>$MIRAI</h1>
        <h2>Pre-Sale Token Family & Friends</h2>
      </div>

      {isConnected ? (
        <LoggedIn web3={web3} contract={contract} />
      ) : (
        <LoggedOut />
      )}
    </AppShell>
  );
}

export default App;
