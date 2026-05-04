import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getMonthDays, getPlanIdForDate, toDateKey } from "../utils/dates.js";
import { getWorkoutType } from "../utils/workoutTypes.js";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const TYPE_LABELS = {
  legs: "legs",
  upper: "upper",
  core: "core",
  cardio: "cardio",
  mobility: "mob",
  rest: "rest",
  training: "train"
};

export default function CalendarSidebar({ completedWorkouts, onSelectWorkout, workouts }) {
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const monthDays = getMonthDays(visibleMonth);
  const todayKey = toDateKey(new Date());

  const moveMonth = (offset) => {
    setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  return (
    <aside className="calendar-sidebar" aria-label="Workout calendar">
      <div className="calendar-header">
        <div>
          <span className="eyebrow">Calendar</span>
          <h2>{visibleMonth.toLocaleDateString("en", { month: "long", year: "numeric" })}</h2>
        </div>
        <div className="calendar-controls">
          <button onClick={() => moveMonth(-1)} title="Previous month" type="button">
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <button onClick={() => moveMonth(1)} title="Next month" type="button">
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((weekday, index) => (
          <span key={`${weekday}-${index}`}>{weekday}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {monthDays.map((date, index) => {
          if (!date) {
            return <span className="calendar-empty" key={`empty-${index}`} />;
          }

          const dateKey = toDateKey(date);
          const planId = getPlanIdForDate(date);
          const workout = workouts.find((item) => item.id === planId);
          const type = workout ? getWorkoutType(workout.title) : "training";
          const isCompleted = Boolean(completedWorkouts[dateKey]);

          return (
            <button
              className={`calendar-day type-${type} ${isCompleted ? "is-completed" : ""} ${dateKey === todayKey ? "is-today" : ""}`}
              key={dateKey}
              onClick={() => onSelectWorkout(planId)}
              title={`${workout?.title ?? "Workout"} - ${type}`}
              type="button"
            >
              <strong>{date.getDate()}</strong>
              <span>{TYPE_LABELS[type] ?? type}</span>
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        {["legs", "upper", "core", "cardio", "mobility", "rest"].map((type) => (
          <span key={type}>
            <i className={`type-${type}`} />
            {type}
          </span>
        ))}
      </div>
    </aside>
  );
}
