import React from "react";
import { ArrowLeft, Check, SkipForward } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getYouTubeEmbedUrl } from "../utils/youtube.js";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function WorkoutMode({ workout, onComplete, onExit }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(workout.exercises[0]?.seconds ?? 0);
  const currentExercise = workout.exercises[currentIndex];
  const embedUrl = getYouTubeEmbedUrl(workout.videoUrl ?? "");
  const progress = useMemo(
    () => (workout.exercises.length ? ((currentIndex + 1) / workout.exercises.length) * 100 : 0),
    [currentIndex, workout.exercises.length]
  );
  const isLastExercise = currentIndex === workout.exercises.length - 1;

  useEffect(() => {
    if (currentExercise) {
      setRemainingSeconds(currentExercise.seconds);
    }
  }, [currentExercise]);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [remainingSeconds]);

  const goNext = () => {
    if (isLastExercise) {
      onComplete();
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  if (!currentExercise) {
    return (
      <section className="workout-mode">
        <button className="ghost-button back-button" onClick={onExit} type="button">
          <ArrowLeft size={18} aria-hidden="true" />
          Exit
        </button>
        <div className="mode-card empty-mode">
          <span className="eyebrow">No exercises</span>
          <h1>Add items first</h1>
          <p>This workout needs at least one exercise before workout mode can start.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="workout-mode">
      <button className="ghost-button back-button" onClick={onExit} type="button">
        <ArrowLeft size={18} aria-hidden="true" />
        Exit
      </button>

      <div className="mode-card">
        <div className="mode-topline">
          <span>{currentIndex + 1}/{workout.exercises.length} exercises</span>
          <span>{workout.title}</span>
        </div>

        <div className="progress-track" aria-label={`${currentIndex + 1} of ${workout.exercises.length} exercises completed`}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="timer-ring" aria-live="polite">
          <span>{formatTime(remainingSeconds)}</span>
        </div>

        <div className="mode-copy">
          <span className="eyebrow">Now</span>
          <h1>{currentExercise.name}</h1>
          <p>{currentExercise.target}</p>
        </div>

        {embedUrl && (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="mode-video"
            src={embedUrl}
            title={`${workout.title} YouTube video`}
          />
        )}

        <div className="mode-actions">
          <button className="secondary-button" onClick={goNext} type="button">
            <SkipForward size={18} aria-hidden="true" />
            Skip
          </button>
          <button className="primary-button" onClick={goNext} type="button">
            <Check size={18} aria-hidden="true" />
            {isLastExercise ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </section>
  );
}
