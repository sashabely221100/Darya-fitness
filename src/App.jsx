import React, { useMemo, useState } from "react";
import CalendarSidebar from "./components/CalendarSidebar.jsx";
import GoogleAccountHeader from "./components/GoogleAccountHeader.jsx";
import WorkoutDetail from "./components/WorkoutDetail.jsx";
import WorkoutMode from "./components/WorkoutMode.jsx";
import WorkoutSetupScreen from "./components/WorkoutSetupScreen.jsx";
import WeeklyPlan from "./components/WeeklyPlan.jsx";
import { weeklyPlan } from "./data/workouts.js";
import {
  hasGoogleClientId,
  loadFitnessDataFromGoogle,
  requestGoogleAccess,
  saveFitnessDataToGoogle
} from "./services/googleDriveSync.js";
import { getCurrentWeekDateKeys, getDateForPlanId, getStreak, getTodayPlanId, toDateKey } from "./utils/dates.js";

const COMPLETED_STORAGE_KEY = "daily-30-completed-workouts";
const CHECKLIST_STORAGE_KEY = "daily-30-checklists";
const WORKOUTS_STORAGE_KEY = "daily-30-custom-workouts";
const GOOGLE_USER_STORAGE_KEY = "daily-30-google-user";
const GOOGLE_TOKEN_STORAGE_KEY = "daily-30-google-access-token";
const APP_SETTINGS_STORAGE_KEY = "daily-30-app-settings";
const DEFAULT_APP_SETTINGS = {
  onboardingCompleted: false
};

function readStoredJson(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStoredJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export default function App() {
  const [screen, setScreen] = useState("plan");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(getTodayPlanId());
  const [workouts, setWorkouts] = useState(() => readStoredJson(WORKOUTS_STORAGE_KEY, weeklyPlan));
  const [completedWorkouts, setCompletedWorkouts] = useState(() => readStoredJson(COMPLETED_STORAGE_KEY, {}));
  const [checklists, setChecklists] = useState(() => readStoredJson(CHECKLIST_STORAGE_KEY, {}));
  const [googleUser, setGoogleUser] = useState(() => readStoredJson(GOOGLE_USER_STORAGE_KEY, null));
  const [googleAccessToken, setGoogleAccessToken] = useState(() => window.sessionStorage.getItem(GOOGLE_TOKEN_STORAGE_KEY) ?? "");
  const [appSettings, setAppSettings] = useState(() => readStoredJson(APP_SETTINGS_STORAGE_KEY, DEFAULT_APP_SETTINGS));
  const [syncMessage, setSyncMessage] = useState("");
  const [lastSync, setLastSync] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedWorkout = workouts.find((workout) => workout.id === selectedWorkoutId) ?? workouts[0];
  const currentWeekKeys = useMemo(() => getCurrentWeekDateKeys(), []);
  const completedDates = Object.keys(completedWorkouts);
  const completedThisWeek = currentWeekKeys.filter((dateKey) => completedWorkouts[dateKey]).length;
  const streak = getStreak(completedDates);
  const completedPlanIds = workouts
    .filter((workout) => completedWorkouts[toDateKey(getDateForPlanId(workout.id))])
    .map((workout) => workout.id);
  const selectedDateKey = toDateKey(getDateForPlanId(selectedWorkout.id));
  const checkedExercises = checklists[selectedDateKey] ?? [];

  const selectWorkout = (workoutId) => {
    setSelectedWorkoutId(workoutId);
    setScreen("detail");
  };

  const getRemotePayload = () => ({
    version: 1,
    updatedAt: new Date().toISOString(),
    user: googleUser,
    appSettings,
    workouts,
    completedWorkouts,
    checklists
  });

  const persistAppData = (nextWorkouts, nextCompletedWorkouts, nextChecklists) => {
    setWorkouts(nextWorkouts);
    setCompletedWorkouts(nextCompletedWorkouts);
    setChecklists(nextChecklists);
    writeStoredJson(WORKOUTS_STORAGE_KEY, nextWorkouts);
    writeStoredJson(COMPLETED_STORAGE_KEY, nextCompletedWorkouts);
    writeStoredJson(CHECKLIST_STORAGE_KEY, nextChecklists);
  };

  const saveRemoteData = async (payload = getRemotePayload(), accessToken = googleAccessToken) => {
    if (!accessToken) {
      return;
    }

    setIsSyncing(true);
    setSyncMessage("Saving to Google Drive...");

    try {
      await saveFitnessDataToGoogle(accessToken, payload);
      setLastSync(new Date().toLocaleString());
      setSyncMessage("Saved to Google Drive.");
    } catch (error) {
      setSyncMessage(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsSyncing(true);
    setSyncMessage("Opening Google sign in...");

    try {
      const accessToken = await requestGoogleAccess();
      const user = {
        email: "Google Drive connected",
        id: "google-drive",
        name: "Google account",
        picture: ""
      };
      const remoteData = await loadFitnessDataFromGoogle(accessToken);

      setGoogleAccessToken(accessToken);
      setGoogleUser(user);
      window.sessionStorage.setItem(GOOGLE_TOKEN_STORAGE_KEY, accessToken);
      writeStoredJson(GOOGLE_USER_STORAGE_KEY, user);

      if (remoteData) {
        const nextWorkouts = remoteData.workouts ?? weeklyPlan;
        const nextCompletedWorkouts = remoteData.completedWorkouts ?? {};
        const nextChecklists = remoteData.checklists ?? {};
        const nextAppSettings = remoteData.appSettings ?? DEFAULT_APP_SETTINGS;

        persistAppData(nextWorkouts, nextCompletedWorkouts, nextChecklists);
        setAppSettings(nextAppSettings);
        writeStoredJson(APP_SETTINGS_STORAGE_KEY, nextAppSettings);
        setSyncMessage("Signed in and loaded Google Drive data.");

        if (!nextAppSettings.onboardingCompleted) {
          setScreen("onboarding");
        }
      } else {
        await saveRemoteData({ ...getRemotePayload(), user }, accessToken);
        setSyncMessage("Signed in and created Google Drive data.");
        setScreen("onboarding");
      }

      setLastSync(new Date().toLocaleString());
    } catch (error) {
      setSyncMessage(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const signOut = () => {
    setGoogleAccessToken("");
    setGoogleUser(null);
    setSyncMessage("Signed out locally.");
    window.sessionStorage.removeItem(GOOGLE_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(GOOGLE_USER_STORAGE_KEY);
  };

  const toggleExercise = (exerciseIndex) => {
    const nextChecked = checkedExercises.includes(exerciseIndex)
      ? checkedExercises.filter((index) => index !== exerciseIndex)
      : [...checkedExercises, exerciseIndex];
    const nextChecklists = { ...checklists, [selectedDateKey]: nextChecked };
    setChecklists(nextChecklists);
    writeStoredJson(CHECKLIST_STORAGE_KEY, nextChecklists);
  };

  const resetChecks = () => {
    const nextChecklists = { ...checklists, [selectedDateKey]: [] };
    setChecklists(nextChecklists);
    writeStoredJson(CHECKLIST_STORAGE_KEY, nextChecklists);
  };

  const updateWorkout = (nextWorkout) => {
    const nextWorkouts = workouts.map((workout) => (workout.id === nextWorkout.id ? nextWorkout : workout));
    setWorkouts(nextWorkouts);
    writeStoredJson(WORKOUTS_STORAGE_KEY, nextWorkouts);
    saveRemoteData({ ...getRemotePayload(), workouts: nextWorkouts });
  };

  const finishSetup = () => {
    const nextAppSettings = { ...appSettings, onboardingCompleted: true };
    setAppSettings(nextAppSettings);
    writeStoredJson(APP_SETTINGS_STORAGE_KEY, nextAppSettings);
    saveRemoteData({ ...getRemotePayload(), appSettings: nextAppSettings });
    setScreen("plan");
  };

  const completeWorkout = () => {
    const allExercises = selectedWorkout.exercises.map((_, index) => index);
    const nextCompleted = {
      ...completedWorkouts,
      [selectedDateKey]: {
        workoutId: selectedWorkout.id,
        completedAt: new Date().toISOString()
      }
    };
    const nextChecklists = { ...checklists, [selectedDateKey]: allExercises };

    setCompletedWorkouts(nextCompleted);
    setChecklists(nextChecklists);
    writeStoredJson(COMPLETED_STORAGE_KEY, nextCompleted);
    writeStoredJson(CHECKLIST_STORAGE_KEY, nextChecklists);
    saveRemoteData({
      ...getRemotePayload(),
      completedWorkouts: nextCompleted,
      checklists: nextChecklists
    });
    setScreen("detail");
  };

  return (
    <main className="app-shell">
      <div className="app-layout">
        <div className="left-rail">
          <GoogleAccountHeader
            isConfigured={hasGoogleClientId()}
            isSyncing={isSyncing}
            lastSync={lastSync}
            onSignIn={signInWithGoogle}
            onSignOut={signOut}
            onSettings={() => setScreen("settings")}
            syncMessage={syncMessage}
            user={googleUser}
          />
          <CalendarSidebar completedWorkouts={completedWorkouts} onSelectWorkout={selectWorkout} workouts={workouts} />
        </div>

        <div className="main-panel">
          {screen === "plan" && (
            <WeeklyPlan
              workouts={workouts}
              todayPlanId={getTodayPlanId()}
              completedPlanIds={completedPlanIds}
              completedThisWeek={completedThisWeek}
              streak={streak}
              onSelectWorkout={selectWorkout}
            />
          )}

          {screen === "detail" && (
            <WorkoutDetail
              workout={selectedWorkout}
              isCompleted={Boolean(completedWorkouts[selectedDateKey])}
              checkedExercises={checkedExercises}
              onBack={() => setScreen("plan")}
              onStart={() => setScreen("mode")}
              onToggleExercise={toggleExercise}
              onResetChecks={resetChecks}
            />
          )}

          {(screen === "onboarding" || screen === "settings") && (
            <WorkoutSetupScreen
              mode={screen}
              onBack={() => setScreen("plan")}
              onFinish={finishSetup}
              onUpdateWorkout={updateWorkout}
              workouts={workouts}
            />
          )}

          {screen === "mode" && (
            <WorkoutMode
              workout={selectedWorkout}
              onComplete={completeWorkout}
              onExit={() => setScreen("detail")}
            />
          )}
        </div>
      </div>
    </main>
  );
}
