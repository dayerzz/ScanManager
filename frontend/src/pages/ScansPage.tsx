import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMe,
  getScans,
  uploadScan,
  deleteScan,
  downloadScan,
  updateScanName,
} from "../api";

import pencilIcon from "../assets/pencil.svg";
import uploadIcon from "../assets/upload.svg";
import downloadIcon from "../assets/download.svg";

function ScansPage() {
  const [user, setUser] = useState<any>(null);
  const [scans, setScans] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("desc");

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
      } catch {
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const startEditing = (scan: any) => {
    setEditingId(scan.id);
    setNewName(scan.original_filename);
  };

  const saveName = async (scanId: string) => {
    const trimmed = newName.trim();

    if (!trimmed) {
      setEditingId(null);
      return;
    }

    try {
      await updateScanName(scanId, trimmed);

      const updated = await getScans();
      setScans(updated);
    } catch (e) {
      console.error("Rename error", e);
    }

    setEditingId(null);
  };

  const filteredScans = scans
    .filter((scan) => {
      const matchesSearch =
        scan.original_filename.toLowerCase().includes(search.toLowerCase()) ||
        (scan.ocr_text &&
          scan.ocr_text.toLowerCase().includes(search.toLowerCase()));

      const scanDate = new Date(scan.created_at);

      const matchesFrom = dateFrom ? scanDate >= new Date(dateFrom) : true;
      const matchesTo = dateTo ? scanDate <= new Date(dateTo) : true;

      return matchesSearch && matchesFrom && matchesTo;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();

      return sort === "desc" ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Здравствуйте, {user?.username}
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/merge")}
              className="bg-indigo-500 text-white px-4 py-2 rounded"
            >
              Склейка
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* UPLOAD */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 border-2 border-dashed">
          <label className="cursor-pointer flex flex-col items-center gap-3 text-gray-600">
            <img src={uploadIcon} className="w-8 h-8 opacity-70" />
            <span>Загрузить файл</span>
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {/* FILTERS */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <input
            type="text"
            placeholder="Поиск по тексту"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="p-2 border rounded"
              />

              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="p-2 border rounded"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="desc">Сначала новые</option>
              <option value="asc">Сначала старые</option>
            </select>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-center text-sm text-gray-500 mb-4">
          МОИ СКАНЫ
        </h2>

        {/* LIST */}
        <div className="space-y-4">
          {filteredScans.map((scan) => (
            <div key={scan.id} className="bg-white shadow-md rounded-lg p-4">

              <div className="flex justify-between items-center">

                <div className="flex items-center gap-2">
                  {editingId === scan.id ? (
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onBlur={() => saveName(scan.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveName(scan.id);
                        }
                      }}
                      className="border px-2 py-1 rounded"
                      autoFocus
                    />
                  ) : (
                    <>
                      <span>{scan.original_filename}</span>

                      <img
                        src={pencilIcon}
                        onClick={() => startEditing(scan)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={downloadIcon}
                    onClick={() => handleDownload(scan)}
                    className="w-5 h-5 cursor-pointer"
                  />

                  <button
                    onClick={() => handleDelete(scan.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  onClick={() =>
                    setExpanded(expanded === scan.id ? null : scan.id)
                  }
                >
                  {expanded === scan.id ? "▲" : "▼"}
                </button>
              </div>

              {expanded === scan.id && scan.ocr_text && (
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