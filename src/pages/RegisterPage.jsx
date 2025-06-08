// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../http/index";
import PageContainer from "../components/PageContainer";
import AlertMessage from "../components/AlertMessage";
import FormInput from "../components/FormInput";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [login, setLogin]       = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [role, setRole]         = useState(1);  // 1=Teacher, 2=Manager, 3=Administrator
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage]     = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await api.post("/auth/register", {
        login,
        password,
        fullName,
        email,
        role
      });
      setSuccessMessage("Регистрация прошла успешно. Перенаправление на вход...");
      setTimeout(() => navigate("/login"), 500);
    } catch (err) {
      const msg = err.response?.data || err.message || "Ошибка регистрации";
      setErrorMessage(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  };

  return (
    <PageContainer title="Регистрация">
      <AlertMessage type="success" message={successMessage} />
      <AlertMessage type="danger"  message={errorMessage} />

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
        <FormInput
          id="fullName"
          label="ФИО"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
        <FormInput
          id="email"
          type="email"
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <div className="mb-3">
          <label htmlFor="role" className="form-label">Роль</label>
          <select
            id="role"
            className="form-select"
            value={role}
            onChange={e => setRole(parseInt(e.target.value, 10))}
          >
            <option value={0}>Преподаватель  </option>
            <option value={1}>Менеджер</option>
            <option value={2}>Администратор</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary rounded-pill">
          Зарегистрироваться
        </button>
      </form>
    </PageContainer>
);
}
