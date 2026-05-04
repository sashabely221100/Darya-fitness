import React from "react";
import { Cloud, LogOut, Settings } from "lucide-react";

export default function GoogleAccountHeader({
  isConfigured,
  isSyncing,
  lastSync,
  onSignIn,
  onSignOut,
  onSettings,
  syncMessage,
  user
}) {
  return (
    <section className="account-header">
      {user ? (
        <>
          <div className="account-profile">
            {user.picture ? <img alt="" src={user.picture} /> : <span>{user.name?.slice(0, 1) ?? "G"}</span>}
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <button className="secondary-button account-button" disabled={isSyncing} onClick={onSignIn} type="button">
            <Cloud size={18} aria-hidden="true" />
            Sync
          </button>
          <div className="account-mini-actions">
            <button className="ghost-button sign-out-button" onClick={onSettings} type="button">
              <Settings size={17} aria-hidden="true" />
              Settings
            </button>
            <button className="ghost-button sign-out-button" onClick={onSignOut} type="button">
              <LogOut size={17} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </>
      ) : (
        <>
          <button className="google-signin-button" disabled={!isConfigured || isSyncing} onClick={onSignIn} type="button">
            <span aria-hidden="true">G</span>
            Sign in with Google
          </button>
          {!isConfigured && <p>Set VITE_GOOGLE_CLIENT_ID to enable Google sync.</p>}
        </>
      )}

      {(syncMessage || lastSync) && (
        <p className="account-sync-message">{syncMessage || `Last synced ${lastSync}`}</p>
      )}
    </section>
  );
}
