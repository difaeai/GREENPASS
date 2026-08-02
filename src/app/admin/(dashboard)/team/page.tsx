"use client";

import { Eye, EyeOff, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ImageUploader, type ImageValue } from "@/components/admin/image-uploader";
import { Modal } from "@/components/admin/modal";
import {
  AdminEmpty,
  AdminLoading,
  AdminPageHeader,
  ConfirmDialog,
  Panel,
  ReorderControls,
} from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Switch, Textarea } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { SmartImage } from "@/components/ui/smart-image";
import { useCollection } from "@/hooks/use-collection";
import { COLLECTIONS, STORAGE_FOLDERS } from "@/lib/constants";
import { createDoc, nextOrder, updateDocById } from "@/lib/firebase/repository";
import { deleteStorageObject } from "@/lib/firebase/storage";
import { cn, initials } from "@/lib/utils";
import type { TeamMember } from "@/types";

interface FormState {
  name: string;
  position: string;
  description: string;
  photo: ImageValue;
  linkedinUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  email: string;
  isActive: boolean;
}

const EMPTY: FormState = {
  name: "",
  position: "",
  description: "",
  photo: { url: "", path: null },
  linkedinUrl: "",
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
  email: "",
  isActive: true,
};

export default function TeamPage() {
  const { items, loading, busyId, error, refresh, move, toggleActive, remove } =
    useCollection<TeamMember>(COLLECTIONS.team);

  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(member: TeamMember) {
    setEditing(member);
    setForm({
      name: member.name,
      position: member.position,
      description: member.description ?? "",
      photo: { url: member.photo ?? "", path: member.photoPath ?? null },
      linkedinUrl: member.linkedinUrl ?? "",
      facebookUrl: member.facebookUrl ?? "",
      instagramUrl: member.instagramUrl ?? "",
      twitterUrl: member.twitterUrl ?? "",
      email: member.email ?? "",
      isActive: member.isActive,
    });
    setErrors({});
    setModalOpen(true);
  }

  async function handleSave() {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "A name is required.";
    if (form.position.trim().length < 2) next.position = "A position is required.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      next.email = "That doesn't look like a valid email address.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      position: form.position.trim(),
      description: form.description.trim(),
      photo: form.photo.url,
      photoPath: form.photo.path,
      linkedinUrl: form.linkedinUrl.trim() || null,
      facebookUrl: form.facebookUrl.trim() || null,
      instagramUrl: form.instagramUrl.trim() || null,
      twitterUrl: form.twitterUrl.trim() || null,
      email: form.email.trim() || null,
      isActive: form.isActive,
    };

    try {
      if (editing) {
        if (editing.photoPath && editing.photoPath !== form.photo.path) {
          await deleteStorageObject(editing.photoPath);
        }
        await updateDocById(COLLECTIONS.team, editing.id, payload);
        toast.success("Team member updated.");
      } else {
        await createDoc(COLLECTIONS.team, { ...payload, order: nextOrder(items) });
        toast.success("Team member added.");
      }

      setModalOpen(false);
      await refresh();
    } catch (saveError) {
      console.error("[team] Save failed:", saveError);
      toast.error("Could not save this team member.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Team members"
        description="Shown in the Our Team section of the About page."
        actions={
          <Button onClick={openCreate}>
            <Plus aria-hidden className="size-4" />
            Add member
          </Button>
        }
      />

      {error && (
        <Panel className="mb-4 border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
          <p className="text-[13.5px] text-red-700 dark:text-red-300">{error}</p>
        </Panel>
      )}

      {loading ? (
        <AdminLoading label="Loading team…" />
      ) : items.length === 0 ? (
        <AdminEmpty
          icon={<Users className="size-5" />}
          title="No team members yet"
          description="Introduce the people behind your company."
          actionLabel="Add member"
          onAction={openCreate}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((member, index) => (
            <li key={member.id}>
              <Panel
                padded={false}
                className={cn("flex items-center gap-4 p-4", !member.isActive && "opacity-60")}
              >
                <ReorderControls
                  onUp={() => move(member.id, -1)}
                  onDown={() => move(member.id, 1)}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  disabled={busyId === member.id}
                />

                <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-navy-100 dark:bg-navy-800">
                  {member.photo ? (
                    <SmartImage
                      src={member.photo}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-sm font-semibold text-navy-500">
                      {initials(member.name)}
                    </span>
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="truncate text-[14.5px] font-semibold text-navy-950 dark:text-white">
                      {member.name}
                    </h3>
                    <Badge tone={member.isActive ? "success" : "neutral"}>
                      {member.isActive ? "Visible" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] font-medium text-brand-600 dark:text-brand-400">
                    {member.position}
                  </p>
                  {member.email && (
                    <p className="mt-0.5 truncate text-[11.5px] text-navy-400">{member.email}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActive(member.id)}
                    disabled={busyId === member.id}
                    aria-label={member.isActive ? "Hide" : "Show"}
                    title={member.isActive ? "Hide" : "Show"}
                  >
                    {member.isActive ? (
                      <Eye aria-hidden className="size-4" />
                    ) : (
                      <EyeOff aria-hidden className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(member)}
                    aria-label={`Edit ${member.name}`}
                    title="Edit"
                  >
                    <Pencil aria-hidden className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(member)}
                    aria-label={`Delete ${member.name}`}
                    title="Delete"
                    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </Button>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        title={editing ? "Edit team member" : "New team member"}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? "Save changes" : "Add member"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <ImageUploader
            label="Photo"
            description="Portrait orientation works best. A square headshot is fine too."
            folder={STORAGE_FOLDERS.team}
            aspect="portrait"
            value={form.photo}
            onChange={(photo) => setForm((state) => ({ ...state, photo }))}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Full name"
              required
              placeholder="Priya Raghavan"
              value={form.name}
              error={errors.name}
              onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
            />
            <Input
              label="Position"
              required
              placeholder="Chief Technology Officer"
              value={form.position}
              error={errors.position}
              onChange={(event) =>
                setForm((state) => ({ ...state, position: event.target.value }))
              }
            />
          </div>

          <Textarea
            label="Short bio"
            rows={3}
            description="One or two sentences shown on the team card."
            value={form.description}
            onChange={(event) =>
              setForm((state) => ({ ...state, description: event.target.value }))
            }
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Email"
              type="email"
              placeholder="priya@company.com"
              value={form.email}
              error={errors.email}
              onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
            />
            <Input
              label="LinkedIn URL"
              type="url"
              placeholder="https://linkedin.com/in/…"
              value={form.linkedinUrl}
              onChange={(event) =>
                setForm((state) => ({ ...state, linkedinUrl: event.target.value }))
              }
            />
            <Input
              label="X (Twitter) URL"
              type="url"
              placeholder="https://x.com/…"
              value={form.twitterUrl}
              onChange={(event) =>
                setForm((state) => ({ ...state, twitterUrl: event.target.value }))
              }
            />
            <Input
              label="Facebook URL"
              type="url"
              placeholder="https://facebook.com/…"
              value={form.facebookUrl}
              onChange={(event) =>
                setForm((state) => ({ ...state, facebookUrl: event.target.value }))
              }
            />
            <Input
              label="Instagram URL"
              type="url"
              containerClassName="sm:col-span-2"
              placeholder="https://instagram.com/…"
              value={form.instagramUrl}
              onChange={(event) =>
                setForm((state) => ({ ...state, instagramUrl: event.target.value }))
              }
            />
          </div>

          <Switch
            label="Visible on the site"
            checked={form.isActive}
            onChange={(isActive) => setForm((state) => ({ ...state, isActive }))}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove this team member?"
        message={`${deleteTarget?.name ?? "This person"} and their uploaded photo will be permanently removed.`}
        busy={busyId === deleteTarget?.id}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await remove(deleteTarget.id, async (member) => {
            await deleteStorageObject(member.photoPath);
          });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
