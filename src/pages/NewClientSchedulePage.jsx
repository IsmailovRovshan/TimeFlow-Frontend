// src/pages/NewClientSchedulePage.jsx
import React, { useState, useEffect } from "react";
import api from "../http/index";
import PageContainer from "../components/PageContainer";
import AlertMessage from "../components/AlertMessage";
import FormInput from "../components/FormInput";
import { Modal, Button } from "react-bootstrap";

const daysOfWeek = [
  { label: "Воскресенье", value: "Sunday" },
  { label: "Понедельник", value: "Monday" },
  { label: "Вторник", value: "Tuesday" },
  { label: "Среда", value: "Wednesday" },
  { label: "Четверг", value: "Thursday" },
  { label: "Пятница", value: "Friday" },
  { label: "Суббота", value: "Saturday" },
];

function SlotRow({ index, slot, onChange, onRemove }) {
  return (
    <div className="row align-items-center g-2 mb-2">
      <div className="col-12">
        <strong className="me-2">Слот {index + 1}</strong>
      </div>
      <div className="col-5">
        <label className="form-label mb-1">День недели</label>
        <select
          className="form-select rounded-pill"
          value={slot.dayOfWeek}
          onChange={e => onChange({ ...slot, dayOfWeek: e.target.value })}
        >
          {daysOfWeek.map(d => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>
      <div className="col-5">
        <label className="form-label mb-1">Время</label>
        <input
          type="time"
          className="form-control rounded-pill"
          value={slot.time}
          onChange={e => onChange({ ...slot, time: e.target.value })}
        />
      </div>
      <div className="col-auto">
        <button
          type="button"
          className="btn btn-outline-danger rounded-pill"
          onClick={onRemove}
        >
          Удалить
        </button>
      </div>
    </div>
  );
}

export default function NewClientSchedulePage() {
  const [createdTeacher, setCreatedTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [age, setAge] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [numberLessons, setNumberLessons] = useState(1);
  const [slots, setSlots] = useState([{ dayOfWeek: "Monday", time: "10:00" }]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [mode, setMode] = useState("TheMostFree");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSlotsModal, setShowSlotsModal] = useState(false);

  useEffect(() => {
    api.get("/subjects")
      .then(({ data }) => setSubjects(data))
      .catch(() => setError("Не удалось загрузить список предметов"));

    api.get("/clients")
      .then(({ data }) => setClients(data))
      .catch(() => setError("Не удалось загрузить список клиентов"));
  }, []);

  const updateSlot = (i, s) => {
    const next = [...slots];
    next[i] = s;
    setSlots(next);
  };
  const removeSlot = i => setSlots(slots.filter((_, idx) => idx !== i));
  const addSlot = () => setSlots([...slots, { dayOfWeek: "Monday", time: "10:00" }]);

  const validateInput = () => {
    if (!selectedClientId && (!clientName || !age)) {
      setError("Введите ФИО и возраст или выберите клиента");
      return false;
    }
    if (!subjectId || !startDate || !slots.length) {
      setError("Заполните все поля и слоты");
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    ClientId: selectedClientId || null,
    FullName: selectedClientId ? null : clientName,
    Age: selectedClientId ? null : Number(age),
    SubjectId: subjectId,
    Slots: slots.map(s => ({
      dayOfWeek: s.dayOfWeek,
      time: s.time.length === 5 ? `${s.time}:00` : s.time,
    })),
    StartDate: startDate,
    Number: Number(numberLessons),
  });

  const handleFindTeachers = async e => {
    e.preventDefault();
    setError(""); setSuccess(""); setCreatedTeacher(null);
    if (!validateInput()) return;
    try {
      const payload = slots.map(s => ({
        dayOfWeek: s.dayOfWeek,
        time: s.time.length === 5 ? `${s.time}:00` : s.time,
      }));
      const { data } = await api.post(
        `/users/free?subjectId=${subjectId}`,
        payload
      );
      setTeachers(data.length ? data : []);
      if (!data.length) setError("Нет свободных преподавателей");
    } catch {
      setError("Ошибка при поиске преподавателей");
    }
  };

  const handleCreate = async () => {
    if (!selectedTeacher) {
      setError("Выберите преподавателя");
      return;
    }
    try {
      const { data: teacherDto } = await api.post(
        `/lessons/main-create?userId=${selectedTeacher}`,
        buildPayload()
      );
      setCreatedTeacher(teacherDto);
      setSuccess(`Расписание создано. Преподаватель: ${teacherDto.fullName}`);
      resetForm();
    } catch {
      setError("Ошибка при создании");
    }
  };

  const handleAutoSearch = async () => {
    setError(""); setSuccess(""); setCreatedTeacher(null);
    if (!validateInput()) return;
    try {
      const { data: teacherDto } = await api.post(
        `/lessons/main-create/${mode}`,
        buildPayload()
      );
      setCreatedTeacher(teacherDto);
      setSuccess(`Расписание создано. Преподаватель: ${teacherDto.fullName}`);
      resetForm();
    } catch {
      setError("Ошибка автоподбора");
    }
  };

  const resetForm = () => {
    setClientName(""); setAge(""); setSubjectId("");
    setStartDate(""); setNumberLessons(1);
    setSlots([{ dayOfWeek: "Monday", time: "10:00" }]);
    setTeachers([]); setSelectedTeacher("");
    setSelectedClientId("");
  };

  return (
    <PageContainer title="Новый клиент и расписание">
      <AlertMessage type="danger" message={error} />
      <AlertMessage type="success" message={success} />

      <form onSubmit={handleFindTeachers}>
        <h5 className="mb-3">Основная информация</h5>
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <label className="form-label">Существующий клиент</label>
            <select
              className="form-select rounded-pill"
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
            >
              <option value="">Не выбран</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.age} лет)
                </option>
              ))}
            </select>
          </div>

          {!selectedClientId && (
            <>
              <div className="col-md-6">
                <FormInput
                  id="clientName"
                  label="ФИО клиента"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <FormInput
                  id="age"
                  type="number"
                  label="Возраст"
                  min="1"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="col-md-6">
            <FormInput
              id="startDate"
              type="date"
              label="Дата начала"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <FormInput
              id="numberLessons"
              type="number"
              label="Кол-во уроков"
              min="1"
              value={numberLessons}
              onChange={e => setNumberLessons(e.target.value)}
            />
          </div>
          <div className="col-12">
            <label htmlFor="subjectId" className="form-label mb-1">
              Предмет
            </label>
            <select
              id="subjectId"
              className="form-select rounded-pill"
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              required
            >
              <option value="">Выберите предмет</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <Button
          variant="outline-primary"
          className="rounded-pill mb-4"
          onClick={() => setShowSlotsModal(true)}
        >
          Слоты
        </Button>

        <div className="d-flex flex-wrap gap-2 mb-4">
          <button type="submit" className="btn btn-primary rounded-pill">
            Найти преподавателей
          </button>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select rounded-pill w-auto"
              value={mode}
              onChange={e => setMode(e.target.value)}
            >
              <option value="TheMostFree">Наименьшая загруженность</option>
              <option value="ByExperience">По опыту</option>
              <option value="ByOldest">Самый старший</option>
              <option value="ByYoungest">Самый младший</option>
            </select>
            <button
              type="button"
              className="btn btn-outline-info rounded-pill"
              onClick={handleAutoSearch}
            >
              Автоподбор
            </button>
          </div>
        </div>
      </form>

      {teachers.length > 0 && (
        <div className="mt-4">
          <h5 className="mb-3">Выберите преподавателя</h5>
          <div className="mb-3">
            <select
              className="form-select rounded-pill"
              value={selectedTeacher}
              onChange={e => setSelectedTeacher(e.target.value)}
            >
              <option value="">Не выбран</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.email})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-success rounded-pill"
            onClick={handleCreate}
          >
            Создать клиента и расписание
          </button>
        </div>
      )}

      <Modal show={showSlotsModal} onHide={() => setShowSlotsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Удобные слоты</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {slots.map((slot, i) => (
            <SlotRow
              key={i}
              index={i}
              slot={slot}
              onChange={s => updateSlot(i, s)}
              onRemove={() => removeSlot(i)}
            />
          ))}
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="outline-secondary"
              size="sm"
              className="rounded-pill"
              onClick={addSlot}
            >
              Добавить слот
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="rounded-pill"
            onClick={() => setShowSlotsModal(false)}
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </PageContainer>
  );
}
