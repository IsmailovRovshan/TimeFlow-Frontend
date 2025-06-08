import { useEffect, useState } from "react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, setHours, setMinutes, isEqual } from "date-fns";
import { ru } from "date-fns/locale";
import api from "../http/index.js";

const generateTimeSlots = (startHour = 0, endHour = 24) => {
  const slots = [];
  for (let hour = startHour; hour < endHour; hour++) {
    slots.push({ 
      start: `${hour.toString().padStart(2, '0')}:00`, 
      end: `${(hour + 1).toString().padStart(2, '0')}:00` 
    });
  }
  return slots;
};


export default function SchedulePage() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    setLoading(true);
    api.get("/users")
      .then(response => {
        if (response.data && response.data.users) {
          setTeachers(response.data.users);
        } else if (Array.isArray(response.data)) {
          setTeachers(response.data);
        } else {
          console.error("Unexpected data structure:", response.data);
          setTeachers([]);
        }
      })
      .catch(err => {
        setError("Ошибка загрузки преподавателей");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTeacherId) return;

    setLoading(true);
    const weekEnd = endOfWeek(currentWeekStart);

    api.post("/lessons/range", {
      userId: selectedTeacherId,
      startDate: currentWeekStart,
      endDate: weekEnd
    })
      .then(response => {
        setLessons(response.data);
      })
      .catch(err => {
        setError("Ошибка загрузки расписания");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [selectedTeacherId, currentWeekStart]);

  const handlePrevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const handleNextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));
  const handleTeacherChange = (e) => setSelectedTeacherId(e.target.value);

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart)
  });

  const findLessonForSlot = (day, hour) => {
    return lessons.find(lesson => {
      const lessonDate = new Date(lesson.lessonDate);
      
      // Сдвиг времени на 4 часа (например, если сервер в UTC, а клиент в GMT+4)
      lessonDate.setHours(lessonDate.getHours() - 4);
  
      return (
        lessonDate.getFullYear() === day.getFullYear() &&
        lessonDate.getMonth() === day.getMonth() &&
        lessonDate.getDate() === day.getDate() &&
        lessonDate.getHours() === hour
      );
    });
  };

  return (
    <div className="p-2 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Расписание занятий</h1>

      <div className="mb-4 ">
        <select
          id="teacher"
          className="p-2 w-full border rounded"
          value={selectedTeacherId || ""}
          onChange={handleTeacherChange}
          disabled={loading}
        >
          <option value="">Выберите преподавателя </option>
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {selectedTeacherId && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <button onClick={handlePrevWeek} className="p-2 m-2 bg-gray-200 rounded hover:bg-gray-300">
              Предыдущая неделя
            </button>

            <span className="font-medium">
              Неделя {format(currentWeekStart, 'dd MMM yyyy')} – {format(endOfWeek(currentWeekStart), 'dd MMM yyyy')}
            </span>

            <button onClick={ handleNextWeek } className="p-2 m-2 bg-gray-200 rounded hover:bg-gray-300">
              Следующая неделя
            </button>
          </div>

          <div className="overflow-y-auto m-2" >
            <table className="min-w-full border text-sm" style={{ height: '100%', overflowY: 'scroll'}}>
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border text-left">Время</th>
                  {weekDays.map(day => (
                    <th key={day.toISOString()} className="p-3 border text-left">
                      {format(day, 'EEEE, d MMM', { locale: ru })}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, i) => {
                  const hour = i;
                  return (
                    <tr key={slot.start}>
                      <td className="p-3 border font-medium">{slot.start} – {slot.end}</td>
                      {weekDays.map(day => {
                        const lesson = findLessonForSlot(day, hour);
                        return (
                          <td key={day.toISOString()} className="p-3 border align-top">
                            {lesson ? (
                              <div className="p-2 bg-blue-100 rounded">
                                <div className="font-semibold">{lesson.client?.fullName || lesson.clientId}</div>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}
