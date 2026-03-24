import { useState } from "react";
import { useNavigate } from "react-router-dom";

function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files);
    setFiles(selected);
  };

  const handleMerge = () => {
    console.log("MERGE FILES:", files);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Склейка документов
          </h1>

          <button
            onClick={() => navigate("/scans")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Назад
          </button>
        </div>

        {/* UPLOAD */}
        <div className="bg-white p-6 rounded shadow mb-6">

          <label className="flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed border-gray-300 rounded p-10 hover:bg-gray-50 transition">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-gray-500"
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

            <span className="text-gray-600 text-lg">
              Перетащите файлы сюда или выберите
            </span>

            <input
              type="file"
              multiple
              onChange={handleSelectFiles}
              className="hidden"
            />
          </label>

        </div>

        {/* FILE LIST */}
        <div className="bg-white p-4 rounded shadow mb-6">

          <h2 className="text-lg font-semibold mb-2">
            Выбранные файлы:
          </h2>

          {files.length === 0 ? (
            <p className="text-gray-500">Файлы не выбраны</p>
          ) : (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="text-gray-700">
                  {file.name}
                </li>
              ))}
            </ul>
          )}

        </div>

        {/* BUTTON */}
        <div className="text-center">
          <button
            onClick={handleMerge}
            className="bg-indigo-500 text-white px-6 py-3 rounded hover:bg-indigo-600"
          >
            Склеить
          </button>
        </div>

      </div>
    </div>
  );
}

export default MergePage;