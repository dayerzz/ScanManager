import { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const data = await login(email, password);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      navigate("/scans");
    } catch (err) {
      console.error("LOGIN ERROR", err);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-80">

          <h2 className="text-2xl font-bold mb-6">
            Welcome Back
          </h2>

          <input
            type="email"
            placeholder="Email"
            className="w-full border p-3 mb-4 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border p-3 mb-4 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-500 text-white p-3 rounded hover:bg-indigo-600 transition"
          >
            Login
          </button>

          {/* ССЫЛКА НА РЕГИСТРАЦИЮ */}
          <p className="mt-4 text-sm">
            Нет аккаунта?{" "}
            <span
              className="text-blue-500 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Зарегистрироваться
            </span>
          </p>

        </div>
      </div>

      {/* RIGHT */}
      <div className="w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
        <div className="text-center max-w-sm">
          <h2 className="text-3xl font-bold mb-4">
            Seamless work experience
          </h2>
          <p>
            Everything you need in one place
          </p>
        </div>
      </div>

    </div>
  );
}