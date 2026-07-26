"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setInfo("שלחנו לך מייל אישור — לחצו על הקישור כדי להתחבר.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || "משהו השתבש, נסו שוב.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap" style={{ paddingTop: 60 }}>
      <div className="sheet" style={{ borderRadius: 26, margin: 0 }}>
        <h2>{mode === "signup" ? "יצירת חשבון" : "התחברות"}</h2>
        <div className="sub2">כדי לשמור את נתוני ההאכלה בענן ולראות אותם מכל מכשיר</div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>אימייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label>סיסמה</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>
          {error && <div className="tip warn">{error}</div>}
          {info && <div className="tip">{info}</div>}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "רגע…" : mode === "signup" ? "הרשמה" : "התחברות"}
          </button>
        </form>
        <button
          className="text-btn"
          onClick={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError("");
            setInfo("");
          }}
        >
          {mode === "signup" ? "כבר יש לכם חשבון? התחברות" : "אין לכם חשבון? הרשמה"}
        </button>
      </div>
    </div>
  );
}
