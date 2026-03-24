import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api";

function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await register(email, username, password);
      navigate("/login");
    } catch (e) {
      console.error("REGISTER ERROR", e);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-gray-100">

        <div className="w-80">

          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Регистрация
          </h1>

          <input
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-3 p-3 rounded bg-gray-800 text-white"
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-3 p-3 rounded bg-gray-800 text-white"
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-gray-800 text-white"
          />

          <button
            onClick={handleRegister}
            className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition"
          >
            Зарегистрироваться
          </button>

          <p className="mt-4 text-sm text-gray-600">
            Уже есть аккаунт?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-blue-500 cursor-pointer"
            >
              Войти
            </span>
          </p>

        </div>
      </div>

      {/* RIGHT */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">

        <div className="text-center text-white px-10">
          <h2 className="text-3xl font-bold">
            Создайте аккаунт
          </h2>

          <p className="mt-3 opacity-80">
            Начните работать со сканами уже сейчас
          </p>
        </div>

      </div>

    </div>
  );
}

export default RegisterPage;