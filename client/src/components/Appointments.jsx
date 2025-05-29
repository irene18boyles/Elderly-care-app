import React, { useState } from 'react';
import '../styles/Appointments.css';
import AppointmentModal from './modals/AppointmentsModal';

// Setup month and day names
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Setup days of the week
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AppointmentPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create an array to hold the days of the month
  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // handle month navigation
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // handle date click to open modal
  const handleDateClick = (day) => {
    if (!day) return; // ignore empty slots
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    setSelectedDay(dateStr);
    setShowModal(true);
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(app => app.date === date);
  };

  return (
    <div className="appointments-container">
      <h1 className="appointments-title">Appointments</h1>

      <div className="calendar-container">
        {/* Month & Navigation */}
        <div className="calendar-nav">
          <button className="nav-button" onClick={handlePrevMonth}>
            Prev
          </button>
          <h2 className="current-month">
            {monthNames[month]} {year}
          </h2>
          <button className="nav-button" onClick={handleNextMonth}>
            Next
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="weekdays-header">
          {daysOfWeek.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {daysArray.map((day, index) => {
            if (day === null) {
              return (
                <div
                  key={index}
                  className="calendar-day calendar-day-empty"
                />
              );
            }

            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayAppointments = getAppointmentsForDate(dateStr);

            return (
              <div
                key={index}
                className="calendar-day calendar-day-active"
                onClick={() => handleDateClick(day)}
              >
                <div className="day-number">{day}</div>
                <ul className="appointments-list">
                  {dayAppointments.map(app => (
                    <li key={app.id} className="appointment-item" title={app.title}>
                      {app.title}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <AppointmentModal
          date={selectedDay}
          appointments={getAppointmentsForDate(selectedDay)}
          setAppointments={setAppointments}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AppointmentPage;