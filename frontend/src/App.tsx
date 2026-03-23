import { useState, useEffect } from "react";
import { login, getMe, getScans, uploadScan, deleteScan, downloadScan } from "./api";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ScansPage from "./pages/ScansPage";
import RegisterPage from "./pages/RegisterPage";
import MergePage from "./pages/MergePage";


function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);

  const handleLogin = async () => {
    try {
      const data = await login(email, password);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      const userData = await getMe();
      setUser(userData);

      const scansData = await getScans();
      setScans(scansData);

      console.log("LOGIN SUCCESS:", data);
      console.log("CURRENT USER:", userData);

    } catch (error) {
      console.error("LOGIN ERROR", error);
    }
  };


  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadScan(file);

      const updatedScans = await getScans();
      setScans(updatedScans);

    } catch (error) {
      console.error("UPLOAD ERROR", error);
    }
  };


  const handleDelete = async (scanId: string) => {
    try {
      await deleteScan(scanId);

      const updatedScans = await getScans();
      setScans(updatedScans);

    } catch (error) {
      console.error("DELETE ERROR", error);
    }
  };


  const handleDownload = async (scan: any) => {
    try {
      const blob = await downloadScan(scan.id);

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = scan.original_filename;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("DOWNLOAD ERROR", error);
    }
  };


  useEffect(() => {
    const fetchUserAndScans = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const userData = await getMe();
        setUser(userData);

        const scansData = await getScans();
        setScans(scansData);

      } catch (e) {
        console.error("Auto login failed");
      }
    };

    fetchUserAndScans();
  }, []);

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