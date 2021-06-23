import * as React from "react";
import Web3 from "web3";
import { WalletPickerModal, useMultiwallet } from "@renproject/multiwallet-ui";
import {
  AppBar,
  Tabs,
  Tab,
  TextField,
  Button,
  Snackbar,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";

//components
import AppShell from "./components/AppShell/AppShell";
import TabPanel from "./components/TabPanel/TabPanel";

import { EthereumInjectedConnector } from "@renproject/multiwallet-ethereum-injected-connector";
import { EthereumWalletConnectConnector } from "@renproject/multiwallet-ethereum-walletconnect-connector";

import settings from "./settings";
import MarketContractABI from "./config/Market-abi.json";
import "./App.css";

const blockchainScanUrl = settings.blockchain.explorerUrl;
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

function NotificationAlert(props) {
  const { notificationOpen, setNotificationOpen, responseMsg } = props;

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setNotificationOpen(false);
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      open={notificationOpen}
      onClose={handleClose}
      message={responseMsg}
      key={"Notification response"}
    />
  );
}

const WalletInfo = () => {
  const { enabledChains } = useMultiwallet();
  const connection = Object.entries(enabledChains).find(
    ([chain, connector]) => connector.status === "connected"
  );

  return (
    <div className={"wallet-ui-container"}>
      {connection && (
        <Alert
          id={"wallet-status-text"}
          className="text-truncate"
          severity="success"
          key={connection[0]}
        >
          <strong>CONNECTED</strong> with wallet {connection[1].account}
        </Alert>
      )}
    </div>
  );
};

function TransferNftUI(props) {
  const { web3, contract } = props;
  const { enabledChains } = useMultiwallet();
  const myAccount = Object.entries(enabledChains).find(
    ([chain, connector]) => connector.status === "connected"
  )?.[1].account;

  const [receiver, setReceiver] = React.useState("");
  const [tokenId, setTokenId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [responseMsg, setResponseMsg] = React.useState(null);

  const _handleTransferNft = async () => {
    try {
      setLoading(true);
      setNotificationOpen(false);

      console.log("[*] Transfer NFT");
      console.log("MY ADDRESS", myAccount);
      console.log("METHODS", contract.methods);

      const sendTo = receiver;
      const tokenIdInput = parseInt(tokenId);

      const receipt = await contract.methods
        .safeTransferFrom(myAccount, sendTo, tokenIdInput)
        .send({ from: myAccount });
      setIsError(false);
      setResponseMsg(receipt.transactionHash);
      console.log(">>SAFETRANSFER>>>", receipt.transactionHash);
    } catch (err) {
      console.log(err);
      setIsError(true);
      setResponseMsg(`[ERROR] ${err?.message || err}`);
      setNotificationOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Error / success
  if (responseMsg) {
    let responseJsx;

    if (isError) {
      responseJsx = (
        <div className={"content-card-tabpanel"}>
          <p>An error occurred</p>
          <p>
            <strong>{responseMsg}</strong>
          </p>
          <p>
            Check your wallet provider and try again. If the transaction did not
            succeed try refreshing the page.
            <br />
            If the problem persists let us know.
          </p>
          <Button
            className={"buy-nft-btn"}
            onClick={() => setResponseMsg(null)}
            variant="contained"
            color="primary"
          >
            Retry
          </Button>
        </div>
      );
    } else {
      responseJsx = (
        <div className={"content-card-tabpanel"}>
          <p>Success!</p>
          <p>
            Your transaction hash is <strong>{responseMsg}</strong>
          </p>
          <Button
            href={`${blockchainScanUrl}${responseMsg}`}
            target="_blank"
            rel="noreferrer"
            className={"buy-nft-btn"}
            variant="contained"
            color="primary"
          >
            View the transaction
          </Button>
        </div>
      );
    }

    return (
      <div className={"content-card-tabpanel"}>
        <h3>Transfer an NFT</h3>
        {responseJsx}
        <NotificationAlert
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
          responseMsg={responseMsg}
        />
      </div>
    );
  }

  // Loading / default
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
      <div style={{ height: "1rem" }} />
      <TextField
        id="transfer-tokenid-input"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        label="Token ID"
        helperText="The token ID"
        variant="outlined"
      />
      {loading ? (
        <div className={"lds-roller"}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : (
        <Button
          className={"buy-nft-btn"}
          onClick={() => _handleTransferNft()}
          variant="contained"
          color="primary"
          disabled={!receiver || !tokenId}
        >
          Transfer NFT
        </Button>
      )}
      <NotificationAlert
        notificationOpen={notificationOpen}
        setNotificationOpen={setNotificationOpen}
        responseMsg={responseMsg}
      />
    </div>
  );
}

function BuyNftUI(props) {
  const { web3, contract } = props;
  const { enabledChains } = useMultiwallet();
  const myAccount = Object.entries(enabledChains).find(
    ([chain, connector]) => connector.status === "connected"
  )?.[1].account;

  const [amount, setAmount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [responseMsg, setResponseMsg] = React.useState(null);

  // functions
  const _handleBuyNft = async () => {
    try {
      setLoading(true);
      setNotificationOpen(false);

      console.log("[*] Buy an Nft");
      console.log("MY ADDRESS", myAccount);
      console.log("AMOUNT", amount);

      const convertedAmount = parseFloat(amount) * 1000000000000000000;
      const receipt = await contract.methods
        .buyNft()
        .send({ from: myAccount, value: convertedAmount });

      setIsError(false);
      setResponseMsg(receipt.transactionHash);
      console.log(">>>>BUYNFT>>>>>", receipt.transactionHash);
    } catch (err) {
      console.log(err);
      setIsError(true);
      setResponseMsg(`[ERROR] ${err?.message || err}`);
      setNotificationOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Error / success
  if (responseMsg) {
    let responseJsx;

    if (isError) {
      responseJsx = (
        <div className={"content-card-tabpanel"}>
          <p>An error occurred</p>
          <p>
            <strong>{responseMsg}</strong>
          </p>
          <p>
            Check your wallet provider and try again. If the transaction did not
            succeed try refreshing the page.
            <br />
            If the problem persists let us know.
          </p>
          <Button
            className={"buy-nft-btn"}
            onClick={() => setResponseMsg(null)}
            variant="contained"
            color="primary"
          >
            Retry
          </Button>
        </div>
      );
    } else {
      responseJsx = (
        <div className={"content-card-tabpanel"}>
          <p>Success!</p>
          <p>
            Your transaction hash is <strong>{responseMsg}</strong>
          </p>
          <Button
            href={`${blockchainScanUrl}${responseMsg}`}
            target="_blank"
            rel="noreferrer"
            className={"buy-nft-btn"}
            variant="contained"
            color="primary"
          >
            View the transaction
          </Button>
        </div>
      );
    }

    return (
      <div className={"content-card-tabpanel"}>
        <h3>Buy an NFT</h3>
        {responseJsx}
        <NotificationAlert
          notificationOpen={notificationOpen}
          setNotificationOpen={setNotificationOpen}
          responseMsg={responseMsg}
        />
      </div>
    );
  }

  // Loading / default
  return (
    <div className={"content-card-tabpanel"}>
      <h3>Buy an NFT</h3>
      <TextField
        id="buy-amount-input"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        label="Amount"
        helperText="The quantity of BNB to send"
        variant="outlined"
        disabled={loading}
      />
      {loading ? (
        <div className={"lds-roller"}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      ) : (
        <Button
          className={"buy-nft-btn"}
          onClick={() => _handleBuyNft()}
          variant="contained"
          color="primary"
          disabled={!amount}
        >
          Buy NFT
        </Button>
      )}
    </div>
  );
}

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
        <BuyNftUI web3={web3} contract={contract} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <TransferNftUI web3={web3} contract={contract} />
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
        }}
      />
    </div>
  );
}

function Titles() {
  return (
    <div className={"main-titles-container"}>
      <h1>$MIRAI</h1>
      <h2>Pre-Sale Token Family {"&"} Friends</h2>
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
    const web3Provider = await chain.connector.getProvider();
    const web3instance = new Web3(web3Provider);
    const marketContract = new web3instance.eth.Contract(
      MarketContractABI,
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
      <Titles />
      {isConnected ? (
        <LoggedIn web3={web3} contract={contract} />
      ) : (
        <LoggedOut />
      )}
    </AppShell>
  );
}

export default App;
