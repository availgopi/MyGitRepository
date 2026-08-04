import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
    palette: {
        mode: "dark",

        primary: {
            main: "#58A6FF",
        },

        background: {
            default: "#0D1117",
            paper: "#161B22",
        },

        success: {
            main: "#3FB950",
        },

        error: {
            main: "#F85149",
        },
    },

    typography: {
        fontFamily: "Segoe UI, Roboto, sans-serif",
    },
});

export default darkTheme;