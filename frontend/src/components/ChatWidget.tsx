import { useState } from "react";
import axios from "axios";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setInput("");

    try {
      const token = localStorage.getItem("access_token");

      const res = await axios.post(
        "http://localhost:8000/chat",
        { message: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const botMessage = {
        role: "bot",
        text: res.data.answer,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Ошибка сервера" },
      ]);
    }
  };

  return (
    <>
      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-full shadow-lg hover:scale-105 transition"
      >
        Чат
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 font-semibold">
            Поддержка ScanManager
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-gray-500 text-sm">
                Напишите вопрос...
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "ml-auto bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* INPUT */}
          <div className="flex border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1 p-2 text-sm outline-none"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-4 bg-purple-500 text-white"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}