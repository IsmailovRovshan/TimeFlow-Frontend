// src/pages/ManageTimeSlotsPage.jsx
import React, { useState, useEffect } from "react";
import api from "../http/index";
import PageContainer from "../components/PageContainer";
import AlertMessage from "../components/AlertMessage";
import FormInput from "../components/FormInput";

const daysOfWeek = [
  { label: "Воскресенье", value: "Sunday" },
  { label: "Понедельник",  value: "Monday" },
  { label: "Вторник",      value: "Tuesday" },
  { label: "Среда",        value: "Wednesday" },
  { label: "Четверг",      value: "Thursday" },
  { label: "Пятница",      value: "Friday" },
  { label: "Суббота",      value: "Saturday" },
];

export default function ManageTimeSlotsPage() {
  const [teacherId, setTeacherId]           = useState(null);
  const [timeSlots, setTimeSlots]           = useState([]);
  const [dayOfWeek, setDayOfWeek]           = useState("Monday");
  const [time, setTime]                     = useState("08:00");
  const [errorMessage, setErrorMessage]     = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Получаем текущего пользователя и его слоты
  useEffect(() => {
    api.get("/auth/me")
      .then(({ data }) => {
        setTeacherId(data.id);
        loadSlots(data.id);
      })
      .catch(() => setErrorMessage("Не удалось загрузить профиль"));
  }, []);

  // Загрузка всех слотов и фильтрация по текущему пользователю
  const loadSlots = async userId => {
    try {
      const { data } = await api.get("/timeSlots");
      setTimeSlots(data.filter(ts => ts.userId === userId));
    } catch {
      setErrorMessage("Ошибка загрузки тайм-слотов");
    }
  };

  // Создать новый слот (isBusy всегда true)
  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!teacherId) {
      setErrorMessage("Не найден текущий преподаватель");
      return;
    }

    try {
      await api.post("/timeSlots", {
        dayOfWeek,
        time:     time.length === 5 ? `${time}:00` : time,
        isBusy:   true,
        userId:   teacherId
      });
      setSuccessMessage("Тайм-слот добавлен");
      loadSlots(teacherId);
    } catch (err) {
      const msg = err.response?.data?.message || "Ошибка при добавлении";
      setErrorMessage(msg);
    }
  };

  // Удалить слот
  const handleDelete = async slotId => {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await api.delete(`/timeSlots/${slotId}`);
      setSuccessMessage("Тайм-слот удалён");
      setTimeSlots(prev => prev.filter(ts => ts.id !== slotId));
    } catch (err) {
      const msg = err.response?.data?.message || "Ошибка при удалении";
      setErrorMessage(msg);
    }
  };

  // Группируем по дням недели
  const slotsByDay = daysOfWeek.map(d => ({
    label: d.label,
    value: d.value,
    slots: timeSlots.filter(ts => ts.dayOfWeek === d.value)
  }));

  return (
    <PageContainer title="Рабочее время">
      <AlertMessage type="success" message={successMessage} />
      <AlertMessage type="danger"  message={errorMessage} />

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="row gy-3">
          <div className="col-md-2">
            <label htmlFor="dayOfWeek" className="form-label">День недели</label>
            <select
              id="dayOfWeek"
              className="form-select rounded-pill"
              value={dayOfWeek}
              onChange={e => setDayOfWeek(e.target.value)}
            >
              {daysOfWeek.map(d => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <FormInput
              id="time"
              label="Время"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
            />
          </div>

          <div className="col-md-2 mt-5">
            <button
              type="submit"
              className="btn btn-primary w-100 rounded-pill"
            >
              Добавить
            </button>
          </div>
        </div>
      </form>

      {slotsByDay.map(group => (
        <div key={group.value} className="mb-4">
          <h6 className="mb-2">{group.label}</h6>
          {group.slots.length > 0 ? (
            <ul className="list-group">
              {group.slots.map(ts => (
                <li
                  key={ts.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>{ts.time.slice(0, 5)}</span>
                  <button
                    className="btn btn-sm btn-danger rounded-pill"
                    onClick={() => handleDelete(ts.id)}
                  >
                    Удалить
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">Нет слотов</p>
          )}
        </div>
      ))}
    </PageContainer>
  );
}
