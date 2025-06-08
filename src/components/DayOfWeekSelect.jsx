const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DayOfWeekSelect({ dayOfWeek, setDayOfWeek }) {
  return (
    <div className="mb-3">
      <label htmlFor="dayOfWeek" className="form-label ">День недели</label>
      <select
        className="form-select"
        id="dayOfWeek"
        value={dayOfWeek}
        onChange={(e) => setDayOfWeek(e.target.value)}
        required
      >
        {days.map((day) => (
          <option key={day} value={day}>{day}</option>
        ))}
      </select>
    </div>
  );
}
