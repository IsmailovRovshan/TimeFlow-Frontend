import { useState, useEffect } from "react";
import api from "../http/index";
import PageContainer from "../components/PageContainer";
import AlertMessage from "../components/AlertMessage";
import SearchTeacherForm from "../components/SearchTeacherForm";

export default function SearchTeacherPage() {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("Monday");
  const [time, setTime] = useState("10:00:00");
  const [number, setNumber] = useState(1);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get("/clients");
        setClients(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке клиентов", error);
      }
    };

    fetchClients();
  }, []);

  const handleFormSubmit = async (data) => {
    try {
      const response = await api.post("/lessons/auto-search", data);
      setSuccessMessage(response.data);
      setErrorMessage("");
    } catch (error) {
      const errMessage = error.response?.data || "Произошла неизвестная ошибка";
      console.error("Ошибка:", errMessage);
      setErrorMessage(errMessage);
      setSuccessMessage("");
    }
  };

  return (
    <PageContainer title="Составить расписание">
      <AlertMessage type="success" message={successMessage} />
      <AlertMessage type="danger" message={errorMessage} />

      <SearchTeacherForm
        clients={clients}
        clientId={clientId}
        setClientId={setClientId}
        dayOfWeek={dayOfWeek}
        setDayOfWeek={setDayOfWeek}
        time={time}
        setTime={setTime}
        number={number}
        setNumber={setNumber}
        onSubmit={handleFormSubmit}
      />
    </PageContainer>
  );
}
