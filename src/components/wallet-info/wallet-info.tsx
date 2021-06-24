import { Alert } from "@material-ui/lab";
import { useMultiwallet } from "@renproject/multiwallet-ui";

export const WalletInfo = () => {
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
