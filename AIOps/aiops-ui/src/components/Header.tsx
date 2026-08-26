import { AppBar, Toolbar, Typography, Chip } from "@mui/material";

export default function Header() {

    return (

        <AppBar position="static">

            <Toolbar>

                <Typography
                    variant="h4"
                    sx={{ flexGrow: 1 }}
                >
                    Enterprise AI Incident Resolution Service
                </Typography>

                <Chip
                    color="success"
                    label="Backend Connected"
                />

            </Toolbar>

        </AppBar>

    );
}