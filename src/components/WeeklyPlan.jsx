import React from "react";
import DayCard from "./DayCard.jsx";
import ProgressSummary from "./ProgressSummary.jsx";

export default function WeeklyPlan({ workouts, todayPlanId, completedPlanIds, completedThisWeek, streak, onSelectWorkout }) {
  return (
    <>
      <header className="hero">
        <span className="eyebrow">Daily 30</span>
        <h1>Your weekly training plan</h1>
        <p>Short, structured sessions for strength, cardio, recovery, and consistency.</p>
      </header>

      <ProgressSummary completedThisWeek={completedThisWeek} streak={streak} />

      <section className="plan-grid" aria-label="Workout days">
        {workouts.map((workout) => (
          <DayCard
            key={workout.id}
            workout={workout}
            isToday={workout.id === todayPlanId}
            isCompleted={completedPlanIds.includes(workout.id)}
            onSelect={() => onSelectWorkout(workout.id)}
          />
        ))}
      </section>
    </>
  );
}
