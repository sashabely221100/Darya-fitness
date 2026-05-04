const FITNESS_DATA_FILE = "darya-fitness-progress.json";
const FITNESS_DATA_MIME = "application/json";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";

function getGoogleClientId() {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID;
}

function waitForGoogleIdentity() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google);
      return;
    }

    let attempts = 0;
    const timerId = window.setInterval(() => {
      attempts += 1;

      if (window.google?.accounts?.oauth2) {
        window.clearInterval(timerId);
        resolve(window.google);
      }

      if (attempts > 80) {
        window.clearInterval(timerId);
        reject(new Error("Google Identity Services did not load."));
      }
    }, 100);
  });
}

export function hasGoogleClientId() {
  return Boolean(getGoogleClientId());
}

export async function requestGoogleAccess() {
  const google = await waitForGoogleIdentity();
  const clientId = getGoogleClientId();

  if (!clientId) {
    throw new Error("Set VITE_GOOGLE_CLIENT_ID in .env.local first.");
  }

  return new Promise((resolve, reject) => {
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      prompt: "consent",
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        resolve(response.access_token);
      }
    });

    tokenClient.requestAccessToken();
  });
}

async function findFitnessDataFile(accessToken) {
  const params = new URLSearchParams({
    fields: "files(id,name,modifiedTime)",
    q: `name='${FITNESS_DATA_FILE}'`,
    spaces: "appDataFolder"
  });
  const response = await fetch(`${DRIVE_FILES_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Google Drive file lookup failed: ${response.status}`);
  }

  const result = await response.json();
  return result.files?.[0] ?? null;
}

export async function loadFitnessDataFromGoogle(accessToken) {
  const file = await findFitnessDataFile(accessToken);

  if (!file) {
    return null;
  }

  const response = await fetch(`${DRIVE_FILES_URL}/${file.id}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Google Drive data load failed: ${response.status}`);
  }

  return response.json();
}

export async function saveFitnessDataToGoogle(accessToken, data) {
  const file = await findFitnessDataFile(accessToken);
  const metadata = {
    mimeType: FITNESS_DATA_MIME,
    name: FITNESS_DATA_FILE,
    parents: file ? undefined : ["appDataFolder"]
  };
  const formData = new FormData();

  formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  formData.append("file", new Blob([JSON.stringify(data, null, 2)], { type: FITNESS_DATA_MIME }));

  const url = file
    ? `${DRIVE_UPLOAD_URL}/${file.id}?uploadType=multipart`
    : `${DRIVE_UPLOAD_URL}?uploadType=multipart`;

  const response = await fetch(url, {
    method: file ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Google Drive data save failed: ${response.status}`);
  }

  return response.json();
}
