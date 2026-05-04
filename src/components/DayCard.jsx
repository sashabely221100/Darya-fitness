import React from "react";
import { Check, ChevronRight } from "lucide-react";

export default function DayCard({ workout, isToday, isCompleted, onSelect }) {
  return (
    <button
      className={`day-card ${isToday ? "is-today" : ""} ${isCompleted ? "is-completed" : ""}`}
      onClick={onSelect}
      type="button"
    >
      <span className="day-pill">{workout.shortDay}</span>
      <div className="day-card-copy">
        <h3>{workout.title}</h3>
        <p>{workout.description}</p>
        <span>{workout.duration} min</span>
      </div>
      <div className="day-card-action" aria-hidden="true">
        {isCompleted ? <Check size={18} /> : <ChevronRight size={18} />}
      </div>
    </button>
  );
}
