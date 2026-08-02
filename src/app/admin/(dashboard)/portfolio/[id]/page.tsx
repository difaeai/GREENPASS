"use client";

import { use } from "react";

import { ProjectEditor } from "@/components/admin/project-editor";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProjectEditor projectId={id} />;
}
