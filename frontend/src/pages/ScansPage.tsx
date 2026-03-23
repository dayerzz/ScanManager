import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMe,
  getScans,
  uploadScan,
  deleteScan,
  downloadScan,
  renameScan
} from "../api";

function ScansPage() {
  const [user, setUser] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const userData = await getMe();
        setUser(userData);

        const scansData = await getScans();
        setScans(scansData);

      } catch (e) {
        console.error("ERROR", e);

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
      }
    };

    fetchData();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadScan(file);
    const updated = await getScans();
    setScans(updated);
  };

  const handleDelete = async (id: string) => {
    await deleteScan(id);
    const updated = await getScans();
    setScans(updated);
  };

  const handleDownload = async (scan: any) => {
    const blob = await downloadScan(scan.id);

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = scan.original_filename;
    a.click();
  };

  const handleRename = async (id: string) => {
    try {
      await renameScan(id, newName);

      setEditingId(null);
      setNewName("");

      const updated = await getScans();
      setScans(updated);

    } catch (error) {
      console.error("RENAME ERROR", error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Привет, {user?.email}
          </h1>

          <div className="flex gap-2">

            <button
              onClick={() => navigate("/merge")}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 transition"
            >
              Склейка
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>

          </div>
        </div>

        {/* UPLOAD */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <input
            type="file"
            onChange={handleUpload}
            className="block w-full text-sm"
          />
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Мои сканы
        </h2>

        {/* LIST */}
        <div className="space-y-4">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="bg-white shadow-md rounded-lg p-4"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-2">

                {/* LEFT */}
                <div className="flex items-center gap-2">

                  {editingId === scan.id ? (
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRename(scan.id);
                        }
                      }}
                      className="border px-2 py-1 rounded"
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="font-medium text-gray-800">
                        {scan.original_filename}
                      </span>

                      <button
                        onClick={() => {
                          setEditingId(scan.id);
                          setNewName(scan.original_filename);
                        }}
                        className="text-gray-500 hover:text-black"
                      >
                        ✏️
                      </button>
                    </>
                  )}

                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-2">

                  <button
                    onClick={() => toggleExpand(scan.id)}
                    className="text-gray-500 hover:text-black text-lg"
                  >
                    {expandedId === scan.id ? "▲" : "▼"}
                  </button>

                  <button
                    onClick={() => handleDownload(scan)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                  >
                    Download
                  </button>

                  <button
                    onClick={() => handleDelete(scan.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                  >
                    Delete
                  </button>

                </div>
              </div>

              {/* OCR */}
              {scan.ocr_text && expandedId === scan.id && (
                <pre className="mt-3 bg-black text-green-400 p-3 rounded text-sm max-h-48 overflow-auto whitespace-pre-wrap">
                  {scan.ocr_text}
                </pre>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default ScansPage;