"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AppShell from "./AppShell";
import AuthScreen from "./AuthScreen";

export default function Home() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="wrap" style={{ paddingTop: 60, textAlign: "center", color: "var(--ink-soft)" }}>
        טוען…
      </div>
    );
  }
  if (!session) {
    return <AuthScreen />;
  }
  return <AppShell />;
}
