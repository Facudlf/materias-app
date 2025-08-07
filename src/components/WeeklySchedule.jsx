import React, { useState } from "react";
import { scheduleData } from "../data/horario";
import "./WeeklySchedule.css";

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const startTime = 8 * 60; // 08:00
const endTime = 13 * 60; // 13:00
const pxPerMin = 2;
const rowHeight = 25 * pxPerMin;
const totalHeight = (endTime - startTime) * pxPerMin;

function parseTime(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToLabel(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function WeeklySchedule() {
  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjectsMap = new Map();
  scheduleData.forEach(ev => {
    if (!subjectsMap.has(ev.codigo)) {
      subjectsMap.set(ev.codigo, ev.materia);
    }
  });
  const subjects = Array.from(subjectsMap.entries()).map(([codigo, materia]) => ({ codigo, materia }));

  const times = [];
  for (let t = startTime; t <= endTime; t += 25) {
    times.push(t);
  }

  const handleSelect = codigo => {
    setSelectedSubject(prev => (prev === codigo ? null : codigo));
  };

  return (
    <div className="weekly-container">
      <aside className="subject-list">
        {subjects.map(sub => (
          <button
            key={sub.codigo}
            className={`subject-btn ${selectedSubject === sub.codigo ? "active" : ""}`}
            onClick={() => handleSelect(sub.codigo)}
          >
            {sub.codigo} - {sub.materia}
          </button>
        ))}
      </aside>
      <div className="calendar" style={{"--row-height": `${rowHeight}px`}}>
        <div className="time-column" style={{ height: `${totalHeight}px` }}>
          {times.map(t => (
            <div key={t} className="time-cell">
              {minutesToLabel(t)}
            </div>
          ))}
        </div>
        {days.map(day => (
          <div key={day} className="day-column" style={{ height: `${totalHeight}px` }}>
            {scheduleData.filter(ev => ev.dia === day).map((ev, idx) => {
              const top = (parseTime(ev.inicio) - startTime) * pxPerMin;
              const height = (parseTime(ev.fin) - parseTime(ev.inicio)) * pxPerMin;
              const selected = selectedSubject === ev.codigo;
              const dimmed = selectedSubject && selectedSubject !== ev.codigo;
              return (
                <div
                  key={idx}
                  className={`event-block ${selected ? "selected" : ""} ${dimmed ? "dimmed" : ""}`}
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  {ev.codigo} - {ev.grupo}
                  {selected && (
                    <span className="close" onClick={() => setSelectedSubject(null)}>
                      ×
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
