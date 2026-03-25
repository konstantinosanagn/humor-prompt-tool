"use client";

import { useState } from "react";
import type { HumorFlavorStep, LlmModel, LookupItem } from "@/app/lib/types";
import ConfirmDeleteButton from "@/app/components/confirm-delete-button";
import { deleteStep, updateStep } from "./actions";

interface StepCardProps {
  step: HumorFlavorStep;
  models: LlmModel[];
  inputTypes: LookupItem[];
  outputTypes: LookupItem[];
  stepTypes: LookupItem[];
  flavorId: number;
}

export default function StepCard({
  step,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  flavorId,
}: StepCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const modelName = models.find((m) => m.id === step.llm_model_id)?.name ?? "Unknown";
  const inputSlug = inputTypes.find((t) => t.id === step.llm_input_type_id)?.slug ?? "?";
  const outputSlug = outputTypes.find((t) => t.id === step.llm_output_type_id)?.slug ?? "?";
  const stepTypeSlug = stepTypes.find((t) => t.id === step.humor_flavor_step_type_id)?.slug ?? "?";

  const handleDeleteStep = async (formData: FormData) => {
    formData.set("humor_flavor_id", String(flavorId));
    await deleteStep(formData);
  };

  const handleUpdateStep = async (formData: FormData) => {
    formData.set("id", String(step.id));
    formData.set("humor_flavor_id", String(flavorId));
    await updateStep(formData);
    setEditing(false);
  };

  return (
    <div className="border-2 border-[var(--border)] shadow-[var(--shadow-sm)] bg-[var(--background)]">
      {/* Header row */}
      <div className="flex items-center gap-3 p-3">
        <span className="w-8 h-8 flex items-center justify-center bg-[var(--primary)] border-2 border-[var(--border)] text-xs font-bold font-head flex-shrink-0">
          {step.order_by}
        </span>

        <div className="flex-1 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase px-2 py-0.5 border border-[var(--border)] bg-[var(--foreground)]/5">
            {stepTypeSlug}
          </span>
          <span className="text-xs font-bold text-[var(--accent-blue)]">{modelName}</span>
          <span className="text-xs text-[var(--foreground)]/60">temp: {step.llm_temperature}</span>
          <span className="text-xs text-[var(--foreground)]/40">{inputSlug} → {outputSlug}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setExpanded(!expanded); if (!expanded) setEditing(false); }}
            className="text-xs font-bold uppercase text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
          <ConfirmDeleteButton id={step.id} onDelete={handleDeleteStep} />
        </div>
      </div>

      {/* Description */}
      {step.description && (
        <div className="px-3 pb-2 text-xs text-[var(--foreground)]/60">{step.description}</div>
      )}

      {/* Expanded prompts */}
      {expanded && !editing && (
        <div className="border-t-2 border-[var(--border)] p-3 space-y-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-[var(--foreground)]/60">System Prompt</label>
            <pre className="mt-1 text-xs bg-[var(--foreground)]/5 border border-[var(--border)] p-2 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {step.llm_system_prompt}
            </pre>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-[var(--foreground)]/60">User Prompt</label>
            <pre className="mt-1 text-xs bg-[var(--foreground)]/5 border border-[var(--border)] p-2 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {step.llm_user_prompt}
            </pre>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="px-3 py-1.5 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-xs font-bold uppercase shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
          >
            Edit Step
          </button>
        </div>
      )}

      {/* Inline edit form */}
      {expanded && editing && (
        <form action={handleUpdateStep} className="border-t-2 border-[var(--border)] p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase">Step Type</label>
              <select name="humor_flavor_step_type_id" defaultValue={step.humor_flavor_step_type_id} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
                {stepTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Model</label>
              <select name="llm_model_id" defaultValue={step.llm_model_id} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
                {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Temperature</label>
              <input name="llm_temperature" type="number" step="0.1" min="0" max="2" defaultValue={step.llm_temperature} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Input Type</label>
              <select name="llm_input_type_id" defaultValue={step.llm_input_type_id} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
                {inputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Output Type</label>
              <select name="llm_output_type_id" defaultValue={step.llm_output_type_id} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
                {outputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase">Description</label>
              <input name="description" defaultValue={step.description ?? ""} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">System Prompt</label>
            <textarea name="llm_system_prompt" defaultValue={step.llm_system_prompt} rows={6} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs font-mono bg-[var(--background)] resize-y" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase">User Prompt</label>
            <textarea name="llm_user_prompt" defaultValue={step.llm_user_prompt} rows={6} className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs font-mono bg-[var(--background)] resize-y" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-xs font-bold uppercase shadow-[var(--shadow-xs)] cursor-pointer">
              Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-xs font-bold uppercase text-[var(--foreground)]/60 cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
