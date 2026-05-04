import React from "react";
import { ArrowLeft, Play, RotateCcw } from "lucide-react";
import ExerciseList from "./ExerciseList.jsx";
import { getYouTubeEmbedUrl } from "../utils/youtube.js";

export default function WorkoutDetail({
  workout,
  isCompleted,
  checkedExercises,
  onBack,
  onStart,
  onToggleExercise,
  onResetChecks
}) {
  const embedUrl = getYouTubeEmbedUrl(workout.videoUrl ?? "");
  const hasExercises = workout.exercises.length > 0;

  return (
    <section className="detail-screen">
      <button className="ghost-button back-button" onClick={onBack} type="button">
        <ArrowLeft size={18} aria-hidden="true" />
        Plan
      </button>

      <div className="detail-header">
        <span className="eyebrow">{workout.day}</span>
        <h1>{workout.title}</h1>
        <p>{workout.description}</p>
        <div className="detail-meta">
          <span>{workout.duration} min</span>
          <span>{workout.exercises.length} exercises</span>
          {isCompleted && <span className="done-pill">Completed</span>}
        </div>
      </div>

      <ExerciseList
        exercises={workout.exercises}
        checkedExercises={checkedExercises}
        onToggleExercise={onToggleExercise}
      />

      {embedUrl && (
        <section className="detail-video">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            src={embedUrl}
            title={`${workout.title} YouTube video`}
          />
        </section>
      )}

      <div className="detail-actions">
        <button className="primary-button" disabled={!hasExercises} onClick={onStart} type="button">
          <Play size={18} aria-hidden="true" />
          Start Workout
        </button>
        <button className="icon-button" onClick={onResetChecks} title="Reset checklist" type="button">
          <RotateCcw size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
