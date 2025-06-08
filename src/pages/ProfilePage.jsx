// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../http/index";
import PageContainer from "../components/PageContainer";
import AlertMessage from "../components/AlertMessage";
import FormInput from "../components/FormInput";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullName:  "",
    email:     "",
    experiense: "0",
    age:       "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError]         = useState("");

  // Загрузка профиля
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
      return;
    }
    api.get("/auth/me")
      .then(({ data }) => setUser(data))
      .catch(err => {
        setError(err.response?.data || err.message || "Ошибка загрузки профиля");
        navigate("/login");
      });
  }, [navigate]);

  // Заполняем форму, когда пользователь загружен
  useEffect(() => {
    if (user) {
      setForm({
        fullName:  user.fullName || "",
        email:     user.email    || "",
        experiense: user.experiense?.toString() || "0",
        age:       user.age?.toString()         || "",
      });
    }
  }, [user]);

  const handleChange = e => {
    const { id, value } = e.target;
    setForm(f => ({ ...f, [id]: value }));
  };

  const handleEdit   = () => setIsEditing(true);
  const handleCancel = () => {
    setForm({
      fullName:  user.fullName,
      email:     user.email,
      experiense: user.experiense.toString(),
      age:       user.age.toString(),
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        fullName:  form.fullName,
        email:     form.email,
        experiense: parseInt(form.experiense, 10),
        age:       parseInt(form.age, 10),
      };
      const { data: updated } = await api.put(`/users/${user.id}`, payload);
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data || err.message || "Ошибка сохранения");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  if (error) {
    return (
      <PageContainer title="Профиль">
        <AlertMessage type="danger" message={error} />
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer title="Профиль">
        <p>Загрузка...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Профиль">
      {/* Центрируем карточку и даём отступ сверху */}
      <div className="d-flex justify-content-center mt-5">
        <div
          className="card bg-light border-0 shadow-lg rounded-4"
          style={{ width: "600px" }}
        >
          <div className="card-body p-4">
            {isEditing ? (
              <>
                <FormInput
                  id="fullName"
                  label="Имя"
                  value={form.fullName}
                  onChange={handleChange}
                />
                <FormInput
                  id="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
                <FormInput
                  id="experiense"
                  label="Опыт работы (лет)"
                  type="number"
                  min={0}
                  value={form.experiense}
                  onChange={handleChange}
                />
                <FormInput
                  id="age"
                  label="Возраст"
                  type="number"
                  min={0}
                  value={form.age}
                  onChange={handleChange}
                />
                <div className="d-flex gap-2 mt-3">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary flex-fill rounded-pill"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn btn-secondary flex-fill rounded-pill"
                  >
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <h5 className="card-title mb-4 text-center">
                  Личный профиль
                </h5>
                <p className="card-text">
                  <strong>Имя:</strong> {user.fullName}
                </p>
                <p className="card-text">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="card-text">
                  <strong>Опыт работы:</strong> {user.experiense} лет
                </p>
                <p className="card-text">
                  <strong>Возраст:</strong> {user.age}
                </p>
                <div className="d-flex gap-2 mt-3">
                  <button
                    onClick={handleEdit}
                    className="btn btn-outline-primary flex-fill rounded-pill"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary flex-fill rounded-pill"
                  >
                    Выйти
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
