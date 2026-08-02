"use client";

import { collection, getDocs, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { ShieldAlert, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { canManageAdmins, useAdminAuth } from "@/components/admin/auth-provider";
import { Modal } from "@/components/admin/modal";
import {
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  ConfirmDialog,
  Panel,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { COLLECTIONS } from "@/lib/constants";
import { getDb, getFirebaseAuth } from "@/lib/firebase/client";
import { formatDateTime, initials } from "@/lib/utils";
import type { AdminRole, AdminUser } from "@/types";

const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  editor: "Editor",
};

const ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  superadmin: "Full access, including managing other administrators.",
  admin: "Full access to all website content.",
  editor: "Can create and edit content.",
};

/** Attach the caller's ID token so the API route can authorise the request. */
async function authorisedFetch(input: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Your session has expired. Sign in again.");

  const token = await user.getIdToken();
  return fetch(input, {
    ...init,
    headers: {
      ...init.headers,
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export default function AdminUsersPage() {
  const { admin } = useAdminAuth();
  const isSuperAdmin = canManageAdmins(admin);

  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "editor" as AdminRole,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);

  const load = useCallback(async () => {
    try {
      const snapshot = await getDocs(collection(getDb(), COLLECTIONS.admins));
      setItems(
        snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...data,
              createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
              lastLoginAt: data.lastLoginAt?.toDate?.().toISOString() ?? null,
            } as AdminUser;
          })
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setError(null);
    } catch (loadError) {
      console.error("[admin-users] Failed to load:", loadError);
      setError("Could not load administrators. Check your Firestore security rules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // `load` awaits Firestore before its first setState, so this is not a
    // synchronous set-in-effect; the rule cannot see through the async boundary.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function changeRole(target: AdminUser, role: AdminRole) {
    setBusyId(target.id);
    const previous = items;
    setItems((current) =>
      current.map((item) => (item.id === target.id ? { ...item, role } : item)),
    );

    try {
      await updateDoc(doc(getDb(), COLLECTIONS.admins, target.id), {
        role,
        updatedAt: serverTimestamp(),
      });
      toast.success(`${target.name} is now ${ROLE_LABELS[role].toLowerCase()}.`);
    } catch (updateError) {
      console.error("[admin-users] Role change failed:", updateError);
      setItems(previous);
      toast.error("Could not change that role.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(target: AdminUser) {
    const next = !target.isActive;
    setBusyId(target.id);
    const previous = items;
    setItems((current) =>
      current.map((item) => (item.id === target.id ? { ...item, isActive: next } : item)),
    );

    try {
      await updateDoc(doc(getDb(), COLLECTIONS.admins, target.id), {
        isActive: next,
        updatedAt: serverTimestamp(),
      });
      toast.success(next ? "Access restored." : "Access suspended.");
    } catch (updateError) {
      console.error("[admin-users] Status change failed:", updateError);
      setItems(previous);
      toast.error("Could not change that status.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate() {
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    if (form.name.trim().length < 2) next.name = "A name is required.";
    setFormErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const response = await authorisedFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
          role: form.role,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Could not create the administrator.");
      }

      toast.success("Administrator added.");
      setModalOpen(false);
      setForm({ email: "", password: "", name: "", role: "editor" });
      await load();
    } catch (createError) {
      toast.error(
        createError instanceof Error ? createError.message : "Could not create the administrator.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);

    try {
      const response = await authorisedFetch("/api/admin/users", {
        method: "DELETE",
        body: JSON.stringify({ uid: deleteTarget.id }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Could not remove this administrator.");
      }

      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Administrator removed.");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error ? deleteError.message : "Could not remove this administrator.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Administrators"
        description="Who can sign in to this panel, and what they are allowed to do."
        actions={
          isSuperAdmin && (
            <Button onClick={() => setModalOpen(true)}>
              <UserPlus aria-hidden className="size-4" />
              Add administrator
            </Button>
          )
        }
      />

      {!isSuperAdmin && (
        <Panel className="mb-4 border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="flex gap-2.5 text-[13.5px] text-amber-800 dark:text-amber-200">
            <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            You can see this list but not change it. Only a superadmin can add, promote or
            remove administrators.
          </p>
        </Panel>
      )}

      {error && (
        <Panel className="mb-4 border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-[13.5px] text-red-700 dark:text-red-300">{error}</p>
        </Panel>
      )}

      {loading ? (
        <AdminLoading label="Loading administrators…" />
      ) : items.length === 0 ? (
        <AdminEmpty
          icon={<ShieldCheck className="size-5" />}
          title="No administrators found"
          description="Create the first one with: npm run create-admin"
        />
      ) : (
        <ul className="space-y-3">
          {items.map((user) => {
            const isSelf = user.id === admin?.id;
            return (
              <li key={user.id}>
                <Panel
                  padded={false}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
                >
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-135 from-brand-600 to-accent-500 text-sm font-bold text-white"
                  >
                    {initials(user.name || user.email)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="truncate text-[14.5px] font-semibold text-navy-950 dark:text-white">
                        {user.name}
                      </h3>
                      {isSelf && <Badge tone="info">You</Badge>}
                      <Badge tone={user.isActive ? "success" : "danger"}>
                        {user.isActive ? "Active" : "Suspended"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 truncate text-[12.5px] text-navy-500 dark:text-navy-400">
                      {user.email}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-navy-400">
                      Last signed in {formatDateTime(user.lastLoginAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Select
                      value={user.role}
                      aria-label={`Role for ${user.name}`}
                      disabled={!isSuperAdmin || isSelf || busyId === user.id}
                      onChange={(event) => changeRole(user, event.target.value as AdminRole)}
                      containerClassName="w-36"
                    >
                      {(Object.keys(ROLE_LABELS) as AdminRole[]).map((role) => (
                        <option key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </option>
                      ))}
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!isSuperAdmin || isSelf || busyId === user.id}
                      onClick={() => toggleActive(user)}
                    >
                      {user.isActive ? "Suspend" : "Restore"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!isSuperAdmin || isSelf || busyId === user.id}
                      onClick={() => setDeleteTarget(user)}
                      aria-label={`Remove ${user.name}`}
                      title={isSelf ? "You cannot remove yourself" : "Remove"}
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </Button>
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>
      )}

      <Panel className="mt-5 bg-navy-50/60 dark:bg-navy-900/40">
        <h3 className="text-sm font-semibold text-navy-950 dark:text-white">What each role can do</h3>
        <dl className="mt-3 space-y-2">
          {(Object.keys(ROLE_LABELS) as AdminRole[]).map((role) => (
            <div key={role} className="flex gap-3 text-[13px]">
              <dt className="w-24 shrink-0 font-medium text-navy-800 dark:text-navy-100">
                {ROLE_LABELS[role]}
              </dt>
              <dd className="text-navy-600 dark:text-navy-300">{ROLE_DESCRIPTIONS[role]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-[12.5px] leading-relaxed text-navy-500 dark:text-navy-400">
          Suspending an administrator revokes their access immediately — the security rules
          check <code>isActive</code> on every read and write, not just at sign-in.
        </p>
      </Panel>

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title="Add administrator"
        description="Creates a sign-in account, or grants panel access to an existing one."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={saving}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label="Full name"
            required
            placeholder="Jane Cooper"
            value={form.name}
            error={formErrors.name}
            onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
          />
          <Input
            label="Email address"
            type="email"
            required
            autoComplete="off"
            placeholder="jane@company.com"
            value={form.email}
            error={formErrors.email}
            onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
          />
          <Input
            label="Temporary password"
            type="password"
            required
            autoComplete="new-password"
            description="At least 8 characters. Ask them to change it after their first sign-in."
            value={form.password}
            error={formErrors.password}
            onChange={(event) => setForm((state) => ({ ...state, password: event.target.value }))}
          />
          <Select
            label="Role"
            value={form.role}
            description={ROLE_DESCRIPTIONS[form.role]}
            onChange={(event) => setForm((state) => ({ ...state, role: event.target.value as AdminRole }))}
          >
            {(Object.keys(ROLE_LABELS) as AdminRole[]).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove this administrator?"
        message={`${deleteTarget?.name ?? "This person"} will lose access to the panel immediately. Their sign-in account is kept, but it will no longer grant any admin permissions.`}
        confirmLabel="Remove access"
        busy={busyId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
