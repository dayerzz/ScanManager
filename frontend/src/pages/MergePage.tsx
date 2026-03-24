import { useState } from "react";
import { useNavigate } from "react-router-dom";
import uploadIcon from "../assets/upload.svg";

function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Склейка документов
          </h1>

          <button
            onClick={() => navigate("/scans")}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Назад
          </button>
        </div>

        {/* UPLOAD SAME STYLE */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 border-2 border-dashed">
          <label className="cursor-pointer flex flex-col items-center gap-3 text-gray-600">

            <img src={uploadIcon} className="w-8 h-8 opacity-70" />

            <span>Перетащите файлы или нажмите</span>

            <input
              type="file"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4 mb-6 text-center">
          {files.length === 0
            ? "Файлы не выбраны"
            : files.map((f) => <div key={f.name}>{f.name}</div>)}
        </div>

        <button className="bg-indigo-500 text-white px-6 py-2 rounded">
          Склеить
        </button>

      </div>
    </div>
  );
}

export default MergePage;