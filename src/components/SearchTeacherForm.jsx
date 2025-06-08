import SelectField from "./SelectField";
import DayOfWeekSelect from "./DayOfWeekSelect";
import FormInput from "./FormInput";

const dayOfWeekMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export default function SearchTeacherForm({
  clients,
  clientId,
  setClientId,
  dayOfWeek,
  setDayOfWeek,
  time,
  setTime,
  number,
  setNumber,
  onSubmit
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      clientId,
      dayOfWeek: dayOfWeekMap[dayOfWeek],
      time: time.length === 5 ? `${time}:00` : time,
      number: Number(number)
    });
  };

  return (
    <form onSubmit={handleSubmit}>

    <SelectField
    id="client"
    label="Клиент"
    options={clients}
    value={clientId}
    onChange={setClientId}
    getOptionValue={(client) => client.id}
    getOptionLabel={(client) => client.fullName}
    />

      <DayOfWeekSelect dayOfWeek={dayOfWeek} setDayOfWeek={setDayOfWeek} />
      <FormInput id="time" label="Время" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <FormInput id="number" label="Количество уроков" type="number" min="1" value={number} onChange={(e) => setNumber(e.target.value)} />
      <button type="submit" className="btn btn-primary ">Начать автопоиск</button>
    </form>
  );
}
