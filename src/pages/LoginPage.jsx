// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../http/index";
import PageContainer from "../components/PageContainer";
import AlertMessage from "../components/AlertMessage";
import FormInput from "../components/FormInput";

export default function LoginPage() {
  const navigate = useNavigate();

  const [login, setLogin]             = useState("");
  const [password, setPassword]       = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage("");

    try {
      // логинимся и сохраняем токен
      const { data: loginData } = await api.post("/auth/login", { login, password });
      localStorage.setItem("jwtToken", loginData.token);

      // получаем профиль
      const { data: user } = await api.get("/auth/me");

      // теперь user.role — строка "Teacher", "Manager" или "Administrator"
      switch (user.role) {
        case "Teacher":
          navigate("/mySchedule");
          break;
        case "Manager":
          navigate("/createMain");
          break;
        case "Adm":
          navigate("/users");
          break;
        default:
          // если вдруг пришла неизвестная роль — редирект на главную или логин
          navigate("/login");
      }
    } catch (err) {
      const msg = err.response?.data || err.message || "Ошибка входа";
      setErrorMessage(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  return (
    <PageContainer title="Вход">
      <AlertMessage type="danger" message={errorMessage} />

      <form onSubmit={handleSubmit}>
        <FormInput
          id="login"
          label="Логин"
          value={login}
          onChange={e => setLogin(e.target.value)}
        />
        <FormInput
          id="password"
          type="password"
          label="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button type="submit" className="btn btn-primary w-100 rounded-pill mt-2">
          Войти
        </button>
      </form>

      <p className="mt-3 text-center">
        Нет аккаунта?{" "}
        <Link to="/register" className="link-primary">
          Зарегистрироваться
        </Link>
      </p>
    </PageContainer>
  );
}
