import React, { useState, useEffect } from "react";
import api from "../http";
import FormInput from "../components/FormInput";
import PageContainer from "../components/PageContainer";
import { Modal, Button, Spinner } from "react-bootstrap";

export default function ClientSearchPage({ onClientSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [expandedClientId, setExpandedClientId] = useState(null);
  const [clientLessons, setClientLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("");

  // Для модального окна переноса
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [lessonToReschedule, setLessonToReschedule] = useState(null);
  const [newLessonDate, setNewLessonDate] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  // При монтировании компонента сразу загружаем всех клиентов
  useEffect(() => {
    fetchAllClients();
  }, []);

  const fetchAllClients = async () => {
    try {
      const res = await api.get("/clients");
      setResults(res.data);
    } catch {
      setResults([]);
    }
  };

  // поиск клиентов по запросу
  const handleSearch = async () => {
    // Если строка запроса пустая или короче 2 символов, показываем всех клиентов
    if (query.trim().length < 2) {
      fetchAllClients();
      return;
    }

    setLoading(true);
    try {
      const res = await api.get("/clients/search", { params: { name: query } });
      setResults(res.data);
      setExpandedClientId(null);
      setClientLessons([]);
      setDateFilter("");
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // загрузка уроков с опциональным фильтром
  const fetchLessons = async (clientId, date) => {
    setLessonsLoading(true);
    try {
      const params = {};
      if (date) params.date = date;
      const res = await api.get(`/lessons/client/${clientId}`, { params });
      setClientLessons(res.data);
    } catch {
      setClientLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  };

  // разворачивание/сворачивание аккордеона
  const toggleClientLessons = async (client) => {
    if (expandedClientId === client.id) {
      setExpandedClientId(null);
      setClientLessons([]);
      setDateFilter("");
    } else {
      setExpandedClientId(client.id);
      setDateFilter("");
      await fetchLessons(client.id, "");
      onClientSelect?.(client);
    }
  };

  // отправка DELETE и повторная загрузка уроков
  const handleCancelLesson = async (lessonId) => {
    try {
      await api.delete(`/lessons/${lessonId}`);
      await fetchLessons(expandedClientId, dateFilter);
    } catch (err) {
      console.error("Ошибка при отмене урока:", err);
    }
  };

  // открыть модальное окно переноса
  const openRescheduleModal = (lesson) => {
    setLessonToReschedule(lesson);
    setNewLessonDate("");
    setShowRescheduleModal(true);
  };

  // закрыть модалку
  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setLessonToReschedule(null);
    setNewLessonDate("");
  };

  // отправить запрос переноса
  const handleReschedule = async () => {
    if (!lessonToReschedule || !newLessonDate) return;
    setRescheduling(true);
    try {
      // формируем тело запроса
      const dto = {
        lessonId: lessonToReschedule.id,
        newLessonDate: new Date(newLessonDate).toISOString(),
      };
      await api.post("/lessons/reschedule", dto);
      // после успешного переноса перезагружаем уроки
      await fetchLessons(expandedClientId, dateFilter);
      closeRescheduleModal();
    } catch (err) {
      console.error("Ошибка при переносе урока:", err);
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <>
      <PageContainer title="Поиск клиента и уроков">
        {/* Поиск клиента */}
        <div className="d-flex mb-2 align-items-end">
          <div className="flex-grow-1 me-2">
            <FormInput
              id="clientSearch"
              label="Поиск клиента"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary rounded-pill"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              "Найти"
            )}
          </button>
        </div>

        {/* Список клиентов с аккордеоном */}
        <ul className="list-group ">
          {results.map((c) => (
            <li key={c.id} className="list-group-item p-0 mb-1">
              <div
                className="d-flex justify-content-between align-items-center p-3 "
                style={{ cursor: "pointer" }}
                onClick={() => toggleClientLessons(c)}
              >
                <div>
                  <strong>{c.fullName}</strong>, {c.age} лет
                </div>
                <div>{expandedClientId === c.id ? "▲" : "▼"}</div>
              </div>

              {expandedClientId === c.id && (
                <div className="border-top p-3 bg-light">
                  {/* Фильтр по дате */}
                  <div className="mb-3">
                    <label htmlFor="lessonDate" className="form-label">
                      Фильтр по дате
                    </label>
                    <div className="d-flex align-items-center">
                      <input
                        id="lessonDate"
                        type="date"
                        className="form-control rounded-pill"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                      />
                      <button
                        className="btn btn-secondary ms-2 rounded-pill"
                        onClick={() => fetchLessons(c.id, dateFilter)}
                        disabled={lessonsLoading}
                      >
                        {lessonsLoading ? (
                          <Spinner as="span" animation="border" size="sm" />
                        ) : (
                          "Фильтр"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Список уроков с кнопками «Перенести» и «Отменить» */}
                  {lessonsLoading ? (
                    <p>Загрузка уроков...</p>
                  ) : clientLessons.length > 0 ? (
                    <ul className="list-group">
                      {clientLessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <span>
                              {new Date(lesson.lessonDate).toLocaleString("ru-RU", {
                              timeZone: "UTC",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            </span>
                            <span className="ms-3">
                              {lesson.subject.name} ({lesson.status}) 
                            </span>
                          </div>
                          <div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary me-2 rounded-pill"
                              onClick={() => openRescheduleModal(lesson)}
                            >
                              Перенести
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill"
                              onClick={() => handleCancelLesson(lesson.id)}
                            >
                              Отменить
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>У этого клиента нет уроков.</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </PageContainer>

      {/* Модальное окно переноса */}
      <Modal show={showRescheduleModal} onHide={closeRescheduleModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Перенос урока</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Перенести урок:{" "}
            <strong>{lessonToReschedule?.subject.name}</strong> от{" "}
            {lessonToReschedule
              ? new Date(lessonToReschedule.lessonDate).toLocaleString(
                  "ru-RU",
                  {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : ""}
          </p>
          <FormInput
            id="newLessonDate"
            label="Новая дата и время"
            type="datetime-local"
            value={newLessonDate}
            onChange={(e) => setNewLessonDate(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeRescheduleModal}
            disabled={rescheduling}
          >
            Отмена
          </Button>
          <Button
            variant="primary rounded-pill"
            onClick={handleReschedule}
            disabled={rescheduling || !newLessonDate}
          >
            {rescheduling ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              "Сохранить"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
