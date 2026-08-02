"use client";

import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { COLLECTIONS } from "@/lib/constants";
import { getDb, getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import type { AdminUser } from "@/types";

/**
 * Admin session state.
 *
 * Authentication proves *who* you are; the `admins/{uid}` document decides
 * *whether* you may use the panel. A signed-in Firebase user with no admin
 * document is rejected and signed straight back out, which is also exactly
 * what `firestore.rules` enforces on the server side.
 */

interface AuthState {
  user: User | null;
  admin: AdminUser | null;
  loading: boolean;
  configured: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  // With no Firebase config there is no session to resolve, so start settled
  // rather than flipping these from an effect on the first render.
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState<string | null>(
    isFirebaseConfigured
      ? null
      : "Firebase is not configured. Copy .env.example to .env.local and add your project keys.",
  );

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const auth = getFirebaseAuth();

    // Keep the session across reloads and tabs.
    void setPersistence(auth, browserLocalPersistence).catch((persistError) => {
      console.error("[auth] Could not set persistence:", persistError);
    });

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDoc(doc(getDb(), COLLECTIONS.admins, nextUser.uid));

        if (!snapshot.exists()) {
          setAdmin(null);
          setError("This account is not registered as an administrator.");
          await firebaseSignOut(auth);
          return;
        }

        const record = { id: snapshot.id, ...snapshot.data() } as AdminUser;

        if (record.isActive === false) {
          setAdmin(null);
          setError("This administrator account has been deactivated.");
          await firebaseSignOut(auth);
          return;
        }

        setAdmin(record);
        setError(null);

        // Best effort — a failed timestamp write must not block sign-in.
        void updateDoc(doc(getDb(), COLLECTIONS.admins, nextUser.uid), {
          lastLoginAt: serverTimestamp(),
        }).catch(() => undefined);
      } catch (lookupError) {
        console.error("[auth] Admin lookup failed:", lookupError);
        setAdmin(null);
        setError("We couldn't verify your admin access. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    const auth = getFirebaseAuth();

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // `onAuthStateChanged` takes it from here and performs the role check.
    } catch (signInError) {
      const code = (signInError as { code?: string }).code ?? "";
      throw new Error(authErrorMessage(code));
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(getFirebaseAuth());
    setAdmin(null);
    setError(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
    } catch (resetError) {
      const code = (resetError as { code?: string }).code ?? "";
      throw new Error(authErrorMessage(code));
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      admin,
      loading,
      configured: isFirebaseConfigured,
      error,
      signIn,
      signOut,
      resetPassword,
    }),
    [user, admin, loading, error, signIn, signOut, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAdminAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used inside <AdminAuthProvider>.");
  }
  return context;
}

/** Roles that may create, update and delete content. */
export function canWrite(admin: AdminUser | null): boolean {
  return admin?.role === "superadmin" || admin?.role === "admin" || admin?.role === "editor";
}

/** Roles that may manage other administrators and destructive settings. */
export function canManageAdmins(admin: AdminUser | null): boolean {
  return admin?.role === "superadmin";
}

function authErrorMessage(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address doesn't look valid.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a few minutes and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled in this Firebase project.";
    default:
      return "Sign-in failed. Please try again.";
  }
}
