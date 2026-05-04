export function getWorkoutType(title) {
  const normalizedTitle = title.toLowerCase();

  if (normalizedTitle.includes("legs") || normalizedTitle.includes("glutes")) {
    return "legs";
  }

  if (normalizedTitle.includes("upper")) {
    return "upper";
  }

  if (normalizedTitle.includes("abs") || normalizedTitle.includes("core")) {
    return "core";
  }

  if (normalizedTitle.includes("cardio")) {
    return "cardio";
  }

  if (normalizedTitle.includes("stretch") || normalizedTitle.includes("light")) {
    return "mobility";
  }

  if (normalizedTitle.includes("rest")) {
    return "rest";
  }

  return "training";
}
