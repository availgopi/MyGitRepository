import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import AnalyzeIncident from "./pages/AnalyzeIncident";
import IncidentDetails from "./pages/IncidentDetails";

export default function App() {

    return (

        <Routes>

            <Route
                path="/"
                element={<Dashboard />}
            />

            <Route
                path="/analyze"
                element={<AnalyzeIncident />}
            />

            <Route
                path="/incidents/:id"
                element={<IncidentDetails />}
            />

        </Routes>

    );

}