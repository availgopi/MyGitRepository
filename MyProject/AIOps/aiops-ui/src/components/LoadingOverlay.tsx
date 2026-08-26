import {
  Backdrop,
  Stack,
  CircularProgress,
  Typography
} from "@mui/material";

interface Props {
    open: boolean;
    message?: string;
}

export default function LoadingOverlay({
    open,
    message
}: Props) {

    return (
        <Backdrop
            open={open}
            sx={{ zIndex: 9999, color: "#fff" }}
        >
            <Stack sx={{ alignItems: "center" }} spacing={2}>
                <CircularProgress color="inherit" />

                <Typography sx={{ mt: 2 }}>
                    {message ?? "Loading..."}
                </Typography>

            </Stack>
        </Backdrop>
    );
}