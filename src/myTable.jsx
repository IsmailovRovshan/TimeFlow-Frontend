import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const timeSlots = [
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const days = [
  { date: '2025-04-14', label: 'пн, 14.04' },
  { date: '2025-04-15', label: 'вт, 15.04' },
  { date: '2025-04-16', label: 'ср, 16.04' },
  { date: '2025-04-17', label: 'чт, 17.04' },
  { date: '2025-04-18', label: 'пт, 18.04' },
];

const MyTable = ({ schedule }) => {
  return (
    <div className="table-responsive">
      <table className="table table-bordered text-center align-middle" style={{ tableLayout: 'fixed' }}>
        <thead className="table-light">
          <tr>
            <th scope="col" style={{ width: '10%' }}>Время</th>
            {days.map((day) => (
              <th key={day.date} scope="col" style={{ width: `${90 / days.length}%` }}>
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time) => (
            <tr key={time}>
              <th scope="row">{time}</th>
              {days.map((day) => {
                const lesson = schedule.find(
                  (item) => item.date === day.date && item.time === time
                );
                return (
                  <td key={day.date + time}>
                    {lesson ? (
                      <div>
                        <strong>{lesson.title}</strong><br />
                        <small>{lesson.student}</small><br />
                        <span className="text-muted">{lesson.time}–{lesson.endTime}</span>
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
  );
};

export default MyTable;
