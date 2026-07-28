import { AppBar, Toolbar, Typography, Chip } from "@mui/material";

export default function Header() {

    return (

        <AppBar position="static">

            <Toolbar>

                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1 }}
                >
                    Enterprise AIOps
                </Typography>

                <Chip
                    color="success"
                    label="Backend Connected"
                />

            </Toolbar>

        </AppBar>

    );
}