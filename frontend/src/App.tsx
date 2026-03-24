import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ScansPage from "./pages/ScansPage";
import MergePage from "./pages/MergePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/scans" element={<ScansPage />} />
      <Route path="/merge" element={<MergePage />} />
    </Routes>
  );
}

export default App;