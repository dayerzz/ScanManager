import { useState } from "react";

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleMerge = () => {
    console.log("MERGE FILES:", files);
    alert("Склейка пока не реализована");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-bold mb-6">
          Склейка сканов
        </h1>

        {/* DROP ZONE */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="bg-white p-6 rounded shadow mb-4 border-2 border-dashed text-center"
        >
          <p className="text-gray-500">
            Перетащите файлы сюда или выберите
          </p>

          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="mt-2"
          />
        </div>

        {/* FILE LIST */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="font-semibold mb-2">
            Выбранные файлы:
          </h2>

          {files.length === 0 ? (
            <p className="text-gray-500">
              Файлы не выбраны
            </p>
          ) : (
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="border p-2 rounded flex justify-between items-center"
                >
                  <span>{file.name}</span>

                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:underline"
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* BUTTON */}
        <button
          onClick={handleMerge}
          className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition"
        >
          Склеить
        </button>

      </div>
    </div>
  );
}