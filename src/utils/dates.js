const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
export const PLAN_DAY_KEYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayPlanId() {
  return DAY_KEYS[new Date().getDay()];
}

export function getDateForPlanId(planId, baseDate = new Date()) {
  const currentDay = baseDate.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(baseDate);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(baseDate.getDate() + mondayOffset);

  const planIndex = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].indexOf(planId);
  const result = new Date(monday);
  result.setDate(monday.getDate() + planIndex);
  return result;
}

export function getCurrentWeekDateKeys(baseDate = new Date()) {
  return PLAN_DAY_KEYS.map((id) =>
    toDateKey(getDateForPlanId(id, baseDate))
  );
}

export function getPlanIdForDate(date) {
  return DAY_KEYS[date.getDay()];
}

export function getMonthDays(baseDate = new Date()) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days = [];

  for (let index = 0; index < leadingDays; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
}

export function getStreak(completedDates, baseDate = new Date()) {
  const completedSet = new Set(completedDates);
  let cursor = new Date(baseDate);
  cursor.setHours(0, 0, 0, 0);
  let streak = 0;

  while (completedSet.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
