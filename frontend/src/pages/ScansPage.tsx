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

  const [filters, setFilters] = useState({
    search: "",
    date_from: "",
    date_to: "",
    sort: "desc",
  });

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

  useEffect(() => {
    const fetchFiltered = async () => {
      try {
        const data = await getScans(filters);
        setScans(data);
      } catch (e) {
        console.error("FILTER ERROR", e);
      }
    };

    fetchFiltered();
  }, [filters]);

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
    const updated = await getScans(filters);
    setScans(updated);
  };

  const handleDelete = async (id: string) => {
    await deleteScan(id);
    const updated = await getScans(filters);
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

      const updated = await getScans(filters);
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

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Здравствуйте, {user?.email}
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/merge")}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Склейка
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* UPLOAD */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <label className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded p-6 hover:bg-gray-50 transition">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V3m0 0l-3 3m3-3l3 3"
              />
            </svg>

            <span className="text-gray-600">Загрузить файл</span>

            <input
              type="file"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-4 rounded shadow mb-4 space-y-4">

          <input
            type="text"
            placeholder="Поиск по тексту"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="w-full p-2 border rounded"
          />

          <div className="flex justify-between items-center flex-wrap gap-3">

            <div className="flex gap-2">
              <input
                type="date"
                onChange={(e) =>
                  setFilters({ ...filters, date_from: e.target.value })
                }
                className="border p-2 rounded"
              />

              <input
                type="date"
                onChange={(e) =>
                  setFilters({ ...filters, date_to: e.target.value })
                }
                className="border p-2 rounded"
              />
            </div>

            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters({ ...filters, sort: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="desc">Сначала новые</option>
              <option value="asc">Сначала старые</option>
            </select>

          </div>

        </div>

        {/* LIST */}
        <div className="space-y-4">
          {scans.map((scan) => (
            <div key={scan.id} className="bg-white p-4 rounded shadow">

              <div className="flex justify-between items-start">

                {/* NAME */}
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
                    />
                  ) : (
                    <>
                      <span>{scan.original_filename}</span>

                      <button
                        onClick={() => {
                          setEditingId(scan.id);
                          setNewName(scan.original_filename);
                        }}
                      >
                        ✏️
                      </button>
                    </>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col items-end gap-2">

                  <div className="flex gap-3 items-center">

                    <button
                      onClick={() => handleDownload(scan)}
                      className="text-gray-600 hover:text-black"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 16v-8m0 8l-3-3m3 3l3-3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleDelete(scan.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Удалить
                    </button>

                  </div>

                  <button
                    onClick={() => toggleExpand(scan.id)}
                    className="text-gray-500 hover:text-black text-lg"
                  >
                    {expandedId === scan.id ? "▲" : "▼"}
                  </button>

                </div>

              </div>

              {/* OCR */}
              {scan.ocr_text && expandedId === scan.id && (
                <pre
                  className="mt-2 bg-black text-green-400 p-2 rounded"
                  dangerouslySetInnerHTML={{
                    __html: highlightText(scan.ocr_text, filters.search),
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