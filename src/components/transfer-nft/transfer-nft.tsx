import { Button, TextField } from "@material-ui/core";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import React from "react";
import settings from "../../settings";
import { NotificationAlert } from "../notification-alert/notification-alert";

export function TransferNft(props) {
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
  const [responseMsg, setResponseMsg] = React.useState<string>();

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
            href={`${settings.blockchain.explorerUrl}${responseMsg}`}
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
