import React from "react";
import { Flame, Target, Trophy } from "lucide-react";

export default function ProgressSummary({ completedThisWeek, streak }) {
  return (
    <section className="progress-summary" aria-label="Weekly progress">
      <div className="metric-card">
        <Target size={20} aria-hidden="true" />
        <span>Weekly progress</span>
        <strong>{completedThisWeek}/7 days</strong>
      </div>
      <div className="metric-card">
        <Flame size={20} aria-hidden="true" />
        <span>Current streak</span>
        <strong>{streak} day{streak === 1 ? "" : "s"}</strong>
      </div>
      <div className="metric-card compact">
        <Trophy size={20} aria-hidden="true" />
        <span>{Math.round((completedThisWeek / 7) * 100)}% complete</span>
      </div>
    </section>
  );
}
