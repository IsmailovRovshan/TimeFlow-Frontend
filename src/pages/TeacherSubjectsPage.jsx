// src/pages/TeacherSubjectsPage.jsx
import React, { useState, useEffect } from "react";
import api from "../http/index";
import PageContainer from "../components/PageContainer";
import AlertMessage from "../components/AlertMessage";

export default function TeacherSubjectsPage() {
  const [teacherId, setTeacherId]           = useState(null);
  const [allSubjects, setAllSubjects]       = useState([]);
  const [assigned, setAssigned]             = useState([]);
  const [errorMessage, setErrorMessage]     = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 1) Получить текущего пользователя и его предметы
  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => {
        setTeacherId(data.id);
        setAssigned(data.subjects || []);
      })
      .catch(() => setErrorMessage("Не удалось загрузить профиль"));
  }, []);

  // 2) Загрузить все предметы
  useEffect(() => {
    api.get("/subjects")
      .then(({ data }) => setAllSubjects(data))
      .catch(() => setErrorMessage("Не удалось загрузить список предметов"));
  }, []);

  // 3) Вычислить предметы, которые ещё не привязаны
  const available = allSubjects.filter(
    s => !assigned.some(a => a.id === s.id)
  );

  // 4) Привязка
  const handleAssign = async subjectId => {
    if (!teacherId) return;
    clearMessages();
    try {
      await api.post(`/users/${teacherId}/subjects/${subjectId}`);
      const subj = allSubjects.find(s => s.id === subjectId);
      setAssigned(prev => [...prev, subj]);
      setSuccessMessage("Предмет успешно привязан");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Ошибка привязки");
    }
  };

  // 5) Удаление связи
  const handleRemove = async subjectId => {
    if (!teacherId) return;
    clearMessages();
    try {
      await api.delete(`/users/${teacherId}/subjects/${subjectId}`);
      setAssigned(prev => prev.filter(s => s.id !== subjectId));
      setSuccessMessage("Привязка удалена");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Ошибка удаления привязки");
    }
  };

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <PageContainer title="Мои предметы">
      <AlertMessage type="success" message={successMessage} />
      <AlertMessage type="danger"  message={errorMessage} />

      <div className="row">
        <div className="col-md-6">
          <h5>Привязанные предметы</h5>
          {assigned.length === 0 ? (
            <p className="text-muted">Нет привязанных предметов</p>
          ) : (
            <ul className="list-group mb-4">
              {assigned.map(s => (
                <li
                  key={s.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {s.name}
                  <button
                    className="btn btn-sm btn-danger rounded-pill"
                    onClick={() => handleRemove(s.id)}
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="col-md-6">
          <h5>Доступные предметы</h5>
          {available.length === 0 ? (
            <p className="text-muted">Нет доступных предметов</p>
          ) : (
            <ul className="list-group mb-4">
              {available.map(s => (
                <li
                  key={s.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {s.name}
                  <button
                    className="btn btn-sm btn-primary rounded-pill"
                    onClick={() => handleAssign(s.id)}
                  >
                    Привязать
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
