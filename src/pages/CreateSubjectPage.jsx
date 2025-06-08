// src/pages/CreateSubjectPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../http/index";
import PageContainer from "../components/PageContainer";
import AlertMessage from "../components/AlertMessage";
import FormInput from "../components/FormInput";

export default function CreateSubjectPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get("/subjects");
      setSubjects(data);
    } catch (err) {
      console.error(err);
      setErrorMessage("Не удалось загрузить список предметов");
    }
  };

  
  const handleCreate = async e => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const { data: created } = await api.post("/subjects", { name });
      setSubjects([...subjects, created]);
      setSuccessMessage("Предмет успешно создан");
      setName("");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Ошибка при создании предмета";
      setErrorMessage(msg);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm("Удалить предмет?")) return;
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      setErrorMessage("Ошибка при удалении");
    }
  };


  const startEdit = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
    setErrorMessage("");
    setSuccessMessage("");
  };

 
  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

 
  const saveEdit = async id => {
    if (!editName.trim()) {
      setErrorMessage("Название не может быть пустым");
      return;
    }
    try {
      await api.put(`/subjects/${id}`, { name: editName });
      setSubjects(subjects.map(s => (s.id === id ? { ...s, name: editName } : s)));
      setSuccessMessage("Изменено успешно");
      cancelEdit();
    } catch (err) {
      console.error(err);
      setErrorMessage("Ошибка при обновлении");
    }
  };

  return (
    <PageContainer title="Добавить и Управлять Предметами">
      <AlertMessage type="success" message={successMessage} />
      <AlertMessage type="danger" message={errorMessage} />

      <form onSubmit={handleCreate} className="mb-4">
        <FormInput
          id="name"
          label="Название предмета"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button type="submit" className="mt-2 btn btn-primary rounded-pill">
          Создать
        </button>
      </form>

      <h5>Список предметов</h5>
      <div className="table-responsive">
        <table className="table table-bordered table-sm">
          <thead className="table-light">
            <tr>
              <th className="p-2">Название</th>
              <th className="p-2 text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map(subject => (
              <tr key={subject.id}>
                <td className="p-2 align-middle">
                  {editingId === subject.id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                    />
                  ) : (
                    subject.name
                  )}
                </td>
                <td className="p-2 text-center align-middle">
                  {editingId === subject.id ? (
                    <>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => saveEdit(subject.id)}
                      >
                        Сохранить
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={cancelEdit}
                      >
                        Отмена
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => startEdit(subject.id, subject.name)}
                      >
                        Изменить
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(subject.id)}
                      >
                        Удалить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {subjects.length === 0 && (
              <tr>
                <td colSpan="3" className="p-2 text-center text-muted">
                  Предметы не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
