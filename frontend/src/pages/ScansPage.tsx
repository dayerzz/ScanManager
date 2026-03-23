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
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  // init
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

  // поиск
  useEffect(() => {
    const fetchSearch = async () => {
      try {
        const data = await getScans(search);
        setScans(data);
      } catch (e) {
        console.error("SEARCH ERROR", e);
      }
    };

    fetchSearch();
  }, [search]);

  // подсветка
  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");

    return text.replace(
      regex,
      `<mark class="bg-yellow-300 text-black">$1</mark>`
    );
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadScan(file);
    const updated = await getScans(search);
    setScans(updated);
  };

  const handleDelete = async (id: string) => {
    await deleteScan(id);
    const updated = await getScans(search);
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

      const updated = await getScans(search);
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
              Выйти
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

        {/* SEARCH */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Поиск по имени или тексту..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded"
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
                    Скачать
                  </button>

                  <button
                    onClick={() => handleDelete(scan.id)}
                    className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition"
                  >
                    Удалить
                  </button>

                </div>
              </div>

              {/* OCR */}
              {scan.ocr_text && expandedId === scan.id && (
                <pre
                  className="mt-3 bg-black text-green-400 p-3 rounded text-sm max-h-48 overflow-auto whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(scan.ocr_text, search),
                  }}
                />
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default ScansPage;