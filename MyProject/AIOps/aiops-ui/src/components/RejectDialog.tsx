import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography
} from "@mui/material";

import { useState } from "react";

interface Props {

    open: boolean;

    onClose: () => void;

    onReject: (reason: string) => void;

}

export default function RejectDialog({

    open,

    onClose,

    onReject

}: Props) {

    const [reason, setReason] = useState("");

    function submit() {

        onReject(reason);

        setReason("");

    }

    function close() {

        setReason("");

        onClose();

    }

    return (

        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="sm"
        >

            <DialogTitle>

                Reject Remediation

            </DialogTitle>

            <DialogContent>

                <Typography sx={{ mb: 2 }}>

                    Please provide the reason for rejecting
                    the AI recommended remediation.

                </Typography>

                <TextField

                    fullWidth

                    multiline

                    minRows={4}

                    label="Reason"

                    value={reason}

                    onChange={(e) =>
                        setReason(e.target.value)
                    }

                />

            </DialogContent>

            <DialogActions>

                <Button
                    onClick={close}
                >
                    Cancel
                </Button>

                <Button
                    color="error"
                    variant="contained"
                    disabled={reason.trim() === ""}
                    onClick={submit}
                >
                    Reject
                </Button>

            </DialogActions>

        </Dialog>

    );

}