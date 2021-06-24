import { Snackbar } from "@material-ui/core";

export function NotificationAlert(props: any) {
  const { notificationOpen, setNotificationOpen, responseMsg } = props;

  const handleClose = (event: any, reason: string) => {
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
