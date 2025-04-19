import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import { getActions } from "../app/actions/friendsActions";
import { validateEmail } from "../utils/validators";
import CustomPrimaryButton from "./CustomPrimaryButton";
import InputField from "./InputField";

const AddFriendDialog = ({
  isDialogOpen,
  closeDialogHandler,
  sendFriendInvitation = () => {},
}) => {
  const [email, setEmail] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSendInvitation = () => {
    sendFriendInvitation({ targetEmailAddress: email }, handleCloseDialog);
  };

  const handleCloseDialog = () => {
    closeDialogHandler();
    setEmail("");
  };

  useEffect(() => {
    setIsFormValid(validateEmail(email));
  }, [email]);

  return (
    <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
      <DialogTitle>Invite a Friend</DialogTitle> {/* 🛠 Fixed nested heading issue */}
      <DialogContent>
        <DialogContentText sx={{ marginBottom: "10px" }}>
          Enter the email address of the friend you want to invite.
        </DialogContentText>
        <InputField
          label="Email"
          type="text"
          value={email}
          setValue={setEmail}
          placeholder="Enter email address"
        />
      </DialogContent>
      <DialogActions>
        <CustomPrimaryButton
          onClick={handleSendInvitation}
          disabled={!isFormValid}
          label="Send"
          additionalStyles={{
            marginLeft: "15px",
            marginRight: "15px",
            marginBottom: "10px",
          }}
        />
      </DialogActions>
    </Dialog>
  );
};

const mapActionsToProps = (dispatch) => ({
  ...getActions(dispatch),
});

export default connect(null, mapActionsToProps)(AddFriendDialog);
