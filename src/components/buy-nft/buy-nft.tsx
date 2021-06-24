import { Button, TextField } from "@material-ui/core";
import { useMultiwallet } from "@renproject/multiwallet-ui";
import React from "react";
import settings from "../../settings";
import { NotificationAlert } from "../notification-alert/notification-alert";

export function BuyNft(props) {
  const { web3, contract } = props;
  const { enabledChains } = useMultiwallet();
  const myAccount = Object.entries(enabledChains).find(
    ([chain, connector]) => connector.status === "connected"
  )?.[1].account;

  const [amount, setAmount] = React.useState<string>("0");
  const [loading, setLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);
  const [responseMsg, setResponseMsg] = React.useState(null);

  const handleChange = (evt) => {
    let newValue = evt.target.value.replace(/,/g, ".");
    if (!newValue || newValue.match(/^[0-9]+.?[0-9]*$/)) {
      setAmount(newValue);
    }
  };

  const handleBuyNft = async () => {
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
        onChange={handleChange}
        label="Amount"
        helperText="The quantity of BNB to send (Example: 0.5)"
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
          onClick={() => handleBuyNft()}
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
