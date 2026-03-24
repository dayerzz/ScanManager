import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const data = await login(email, password);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      navigate("/scans");
    } catch (e) {
      console.error("LOGIN ERROR", e);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT */}
      <div className="w-1/2 flex flex-col justify-center items-center bg-gray-100">

        <div className="w-80">

          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Здравствуйте
          </h1>

          <input
            type="email"
            placeholder="Email/Логин"
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
            onClick={handleLogin}
            className="w-full bg-indigo-500 text-white py-3 rounded hover:bg-indigo-600 transition"
          >
            Войти
          </button>

          <p className="mt-4 text-sm text-gray-600">
            Нет аккаунта?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-blue-500 cursor-pointer"
            >
              Зарегистрироваться
            </span>
          </p>

        </div>
      </div>

      {/* RIGHT */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">

        <div className="text-center text-white px-10">
          <h2 className="text-3xl font-bold">
            Удобная работа со сканами
          </h2>

          <p className="mt-3 opacity-80">
            Загружайте, ищите и управляйте документами
          </p>
        </div>

      </div>

    </div>
  );
}

export default LoginPage;