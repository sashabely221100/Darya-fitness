import React, { useMemo, useState } from "react";
import { ArrowLeft, Check, Link, Plus, Trash2 } from "lucide-react";
import { getYouTubeEmbedUrl } from "../utils/youtube.js";

export default function WorkoutSetupScreen({ mode, onBack, onFinish, onUpdateWorkout, workouts }) {
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(workouts[0]?.id ?? "");
  const [exerciseName, setExerciseName] = useState("");
  const [exerciseTarget, setExerciseTarget] = useState("");
  const [exerciseSeconds, setExerciseSeconds] = useState(45);
  const selectedWorkout = useMemo(
    () => workouts.find((workout) => workout.id === selectedWorkoutId) ?? workouts[0],
    [selectedWorkoutId, workouts]
  );
  const embedUrl = getYouTubeEmbedUrl(selectedWorkout?.videoUrl ?? "");
  const isOnboarding = mode === "onboarding";

  const updateSelectedWorkout = (changes) => {
    onUpdateWorkout({ ...selectedWorkout, ...changes });
  };

  const addExercise = (event) => {
    event.preventDefault();

    if (!exerciseName.trim() || !exerciseTarget.trim()) {
      return;
    }

    updateSelectedWorkout({
      exercises: [
        ...selectedWorkout.exercises,
        {
          name: exerciseName.trim(),
          target: exerciseTarget.trim(),
          seconds: Math.max(Number(exerciseSeconds) || 45, 5)
        }
      ]
    });
    setExerciseName("");
    setExerciseTarget("");
    setExerciseSeconds(45);
  };

  const deleteExercise = (exerciseIndex) => {
    updateSelectedWorkout({
      exercises: selectedWorkout.exercises.filter((_, index) => index !== exerciseIndex)
    });
  };

  return (
    <section className="setup-screen">
      {!isOnboarding && (
        <button className="ghost-button back-button" onClick={onBack} type="button">
          <ArrowLeft size={18} aria-hidden="true" />
          Back
        </button>
      )}

      <header className="setup-header">
        <span className="eyebrow">{isOnboarding ? "Welcome setup" : "Settings"}</span>
        <h1>{isOnboarding ? "Tune your weekly plan" : "Workout settings"}</h1>
        <p>
          Keep the presets, add the moves she likes, remove what does not fit, and attach YouTube references for each day.
        </p>
      </header>

      <div className="setup-layout">
        <nav className="setup-tabs" aria-label="Workout days">
          {workouts.map((workout) => (
            <button
              className={workout.id === selectedWorkout.id ? "is-active" : ""}
              key={workout.id}
              onClick={() => setSelectedWorkoutId(workout.id)}
              type="button"
            >
              <span>{workout.shortDay}</span>
              {workout.title}
            </button>
          ))}
        </nav>

        <div className="setup-editor">
          <div className="setup-workout-heading">
            <span className="eyebrow">{selectedWorkout.day}</span>
            <h2>{selectedWorkout.title}</h2>
            <p>{selectedWorkout.description}</p>
          </div>

          <div className="editable-exercise-list">
            {selectedWorkout.exercises.map((exercise, index) => (
              <div className="editable-exercise-row" key={`${exercise.name}-${index}`}>
                <span>
                  <strong>{exercise.name}</strong>
                  <small>{exercise.target}</small>
                </span>
                <button onClick={() => deleteExercise(index)} title="Delete exercise" type="button">
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>

          <form className="editor-panel" onSubmit={addExercise}>
            <div className="panel-heading">
              <span className="eyebrow">Customize</span>
              <h3>Add exercise</h3>
            </div>
            <div className="form-grid">
              <label>
                <span>Name</span>
                <input
                  onChange={(event) => setExerciseName(event.target.value)}
                  placeholder="Pilates squats"
                  value={exerciseName}
                />
              </label>
              <label>
                <span>Duration or reps</span>
                <input
                  onChange={(event) => setExerciseTarget(event.target.value)}
                  placeholder="45 sec or 12 reps"
                  value={exerciseTarget}
                />
              </label>
              <label>
                <span>Timer seconds</span>
                <input
                  min="5"
                  onChange={(event) => setExerciseSeconds(event.target.value)}
                  type="number"
                  value={exerciseSeconds}
                />
              </label>
            </div>
            <button className="secondary-button" type="submit">
              <Plus size={18} aria-hidden="true" />
              Add item
            </button>
          </form>

          <section className="editor-panel video-panel">
            <div className="panel-heading">
              <span className="eyebrow">Video guide</span>
              <h3>YouTube player</h3>
            </div>
            <label className="video-input">
              <span>Paste YouTube link</span>
              <div>
                <Link size={18} aria-hidden="true" />
                <input
                  onChange={(event) => updateSelectedWorkout({ videoUrl: event.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={selectedWorkout.videoUrl ?? ""}
                />
              </div>
            </label>
            {embedUrl ? (
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                src={embedUrl}
                title={`${selectedWorkout.title} YouTube video`}
              />
            ) : (
              <div className="empty-video">
                <span>Add a YouTube link to keep a visual reference here.</span>
              </div>
            )}
          </section>

          <button className="primary-button finish-setup-button" onClick={onFinish} type="button">
            <Check size={18} aria-hidden="true" />
            {isOnboarding ? "Finish setup" : "Save settings"}
          </button>
        </div>
      </div>
    </section>
  );
}
