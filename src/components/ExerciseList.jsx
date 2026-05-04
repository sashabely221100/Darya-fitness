import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

export default function ExerciseList({ exercises, checkedExercises, onToggleExercise }) {
  return (
    <div className="exercise-list">
      {exercises.map((exercise, index) => {
        const isChecked = checkedExercises.includes(index);

        return (
          <div className={`exercise-row ${isChecked ? "is-checked" : ""}`} key={`${exercise.name}-${index}`}>
            <label className="exercise-toggle">
              <input
                checked={isChecked}
                onChange={() => onToggleExercise(index)}
                type="checkbox"
              />
              <span className="exercise-check" aria-hidden="true">
                {isChecked ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </span>
              <span className="exercise-copy">
                <strong>{exercise.name}</strong>
                <small>{exercise.target}</small>
              </span>
            </label>
          </div>
        );
      })}
    </div>
  );
}
