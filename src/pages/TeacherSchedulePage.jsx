// src/pages/TeacherSchedulePage.jsx
import React, { useState, useEffect } from "react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { ru } from "date-fns/locale";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import api from "../http/index";
import PageContainer from "../components/PageContainer";

const allHours = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0") + ":00"
);

export default function TeacherSchedulePage() {
  const [teacherId, setTeacherId] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date())
  );
  const [lessons, setLessons] = useState([]);
  const [freeSlots, setFreeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromHour, setFromHour] = useState(8);
  const [toHour, setToHour] = useState(20);

  // Получаем ID преподавателя
  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => setTeacherId(data.id))
      .catch(() => setError("Не удалось загрузить профиль"));
  }, []);

  // Загружаем уроки и свободные слоты
  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    setError("");
    const weekEnd = endOfWeek(currentWeekStart);

    Promise.all([
      api.post("/lessons/range", {
        userId: teacherId,
        startDate: currentWeekStart,
        endDate: weekEnd,
      }),
      api.get(`/timeSlots/free/${teacherId}`),
    ])
      .then(([lessonsRes, freeRes]) => {
        setLessons(lessonsRes.data);
        setFreeSlots(freeRes.data);
      })
      .catch(() => setError("Ошибка загрузки данных"))
      .finally(() => setLoading(false));
  }, [teacherId, currentWeekStart]);

  const handlePrevWeek = () =>
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  const handleNextWeek = () =>
    setCurrentWeekStart(addDays(currentWeekStart, 7));

  // Дни недели текущей недели
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart),
  });

  // Найти занятие
  const findLesson = (day, hour) =>
    lessons.find((lesson) => {
      const d = new Date(lesson.lessonDate);
      d.setHours(d.getHours() - 4); // корректировка часового пояса
      return (
        d.getFullYear() === day.getFullYear() &&
        d.getMonth() === day.getMonth() &&
        d.getDate() === day.getDate() &&
        d.getHours() === hour
      );
    });

    function getButtonStyleByStatus(status) {
  switch (status) {
    case "Запланирован":
      return { backgroundColor: "#66CDAA", color: "white" }; // зелёный
    case "Отменён":
      return { backgroundColor: "#DC143C", color: "white" }; // оранжевый
    case "Перенесён":
      return { backgroundColor: "#6495ed", color: "white" }; // красный
    default:
      return { backgroundColor: "#6c757d", color: "white" }; // серый по умолчанию
  }
}

  // Проверить, свободен ли слот
  const isFree = (day, hour) => {
    const dayName = day.toLocaleString("en-US", { weekday: "long" });
    return freeSlots.some((slot) => {
      if (slot.dayOfWeek !== dayName) return false;
      const slotHour = parseInt(slot.time.split(":")[0], 10);
      return slotHour === hour;
    });
  };

  // Список промежутков от fromHour до toHour
  const timeSlots = [];
  for (let h = fromHour; h < toHour; h++) {
    timeSlots.push({
      hour: h,
      label: `${h.toString().padStart(2, "0")}:00 – ${(h + 1)
        .toString()
        .padStart(2, "0")}:00`,
    });
  }

  return (
    <PageContainer title="Моё расписание">
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Навигация по неделям */}
      <div className="d-flex justify-content-between mb-3">
        <button onClick={handlePrevWeek} className="btn btn-outline-secondary">
          ← Пред. неделя
        </button>
        <span className="align-self-center">
          {format(currentWeekStart, "dd MMM yyyy", { locale: ru })} –{" "}
          {format(endOfWeek(currentWeekStart), "dd MMM yyyy", { locale: ru })}
        </span>
        <button onClick={handleNextWeek} className="btn btn-outline-secondary">
          След. неделя →
        </button>
      </div>

      {/* Диапазон часов */}
      <div className="row mb-4 gy-2 gx-3 align-items-end">
        <div className="col-auto">
          <label htmlFor="fromHour" className="form-label">
            from:
          </label>
          <select
            id="fromHour"
            className="form-select"
            value={fromHour}
            onChange={(e) => setFromHour(+e.target.value)}
          >
            {allHours.map((lbl, idx) => (
              <option key={idx} value={idx} disabled={idx >= toHour}>
                {lbl}
              </option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <label htmlFor="toHour" className="form-label">
            to:
          </label>
          <select
            id="toHour"
            className="form-select"
            value={toHour}
            onChange={(e) => setToHour(+e.target.value)}
          >
            {allHours.map((lbl, idx) => (
              <option key={idx} value={idx + 1} disabled={idx < fromHour}>
                {lbl}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive" style={{ maxHeight: "60vh" }}>
        <table
          className="table table-bordered table-sm mb-0"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <colgroup>
            <col style={{ width: "150px" }} />
            {weekDays.map((_, idx) => (
              <col key={idx} style={{ width: `calc((100% - 150px) / 7)` }} />
            ))}
          </colgroup>

          <thead className="table-light">
            <tr>
              <th className="p-2 align-middle text-truncate">Время</th>
              {weekDays.map((day) => (
                <th
                  key={day.toISOString()}
                  className="p-2 align-middle text-truncate"
                >
                  {format(day, "EEE, d MMM", { locale: ru })}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {timeSlots.map((slot) => (
              <tr key={slot.hour}>
                <td className="p-2 align-middle fw-bold text-truncate">
                  {slot.label}
                </td>
                {weekDays.map((day) => {
                  const lesson = findLesson(day, slot.hour);
                  const free = !lesson && isFree(day, slot.hour);
                  return (
                    <td
                      key={day.toISOString()}
                      className="p-2 align-middle"
                      style={{ verticalAlign: "middle" }}
                    >
                      {lesson ? (
                        <OverlayTrigger
                          trigger="click"
                          placement="right"
                          rootClose
                          overlay={
                            <Popover id={`popover-${lesson.client.id}`}>
                              <Popover.Header as="h6">
                                {lesson.client.fullName}
                              </Popover.Header>
                              <Popover.Body>
                                <div><strong>Возраст:</strong> {lesson.client.age}</div>
                                <div><strong>Статус:</strong> {lesson.status}</div>
                                <div><strong>Предмет:</strong> {lesson.subject.name}</div>
                              </Popover.Body>
                            </Popover>
                          }
                        >
                          <button
                            className="btn btn-sm w-100 text-start py-1 rounded-top text-truncate"
                            style={{
                              ...getButtonStyleByStatus(lesson.status),
                              height: "2.0rem",
                            }}
                          >
                            {lesson.client.fullName}
                          </button>
                        </OverlayTrigger>

                      ) : free ? (
                          <div
                            className="w-100 h-100 d-flex justify-content-center align-items-center text-truncate"
                            style={{ minHeight: "2.0rem", overflow: "hidden" }}
                          >
                            <small className="text-secondary fst-italic">Свободен</small>
                          </div>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}
    </PageContainer>
  );
}
