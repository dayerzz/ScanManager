import { useState, useEffect } from "react";
import { login, getMe, getScans, uploadScan, deleteScan, downloadScan } from "./api";

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
    <div style={{ padding: "20px" }}>
      {user ? (
        <div>
          <h1>Привет, {user.email}</h1>
          <input type="file" onChange={handleUpload} />

          <h2>Мои сканы:</h2>

          {scans.length === 0 ? (
            <p>Нет сканов</p>
          ) : (
            <ul>
              {scans.map((scan) => (
                <li key={scan.id}>
                  {scan.original_filename} ({scan.file_size} bytes)

                  <button onClick={() => handleDownload(scan)}>
                    Download
                  </button>

                  <button onClick={() => handleDelete(scan.id)}>
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div>
          <h1>Login</h1>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <br /><br />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
          />

          <br /><br />

          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
}

export default App;