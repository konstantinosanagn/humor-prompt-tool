"use client";

import { useState } from "react";
import Modal from "@/app/components/modal";
import { createStep } from "./actions";
import type { LlmModel, LookupItem } from "@/app/lib/types";

interface StepFormProps {
  flavorId: number;
  models: LlmModel[];
  inputTypes: LookupItem[];
  outputTypes: LookupItem[];
  stepTypes: LookupItem[];
  onClose: () => void;
}

export default function StepForm({ flavorId, models, inputTypes, outputTypes, stepTypes, onClose }: StepFormProps) {
  const [pending, setPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    formData.set("humor_flavor_id", String(flavorId));
    await createStep(formData);
    setPending(false);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <form action={handleSubmit} className="space-y-4">
        <h2 className="font-head text-xl uppercase tracking-tight">New Step</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase">Step Type</label>
            <select name="humor_flavor_step_type_id" required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
              {stepTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Model</label>
            <select name="llm_model_id" required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
              {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Temperature</label>
            <input name="llm_temperature" type="number" step="0.1" min="0" max="2" defaultValue="1.0" required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Input Type</label>
            <select name="llm_input_type_id" required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
              {inputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Output Type</label>
            <select name="llm_output_type_id" required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]">
              {outputTypes.map((t) => <option key={t.id} value={t.id}>{t.slug}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase">Description</label>
            <input name="description" placeholder="Step intent..." className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs bg-[var(--background)]" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold uppercase">System Prompt</label>
          <textarea name="llm_system_prompt" rows={4} required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs font-mono bg-[var(--background)] resize-y" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase">User Prompt</label>
          <textarea name="llm_user_prompt" rows={4} required className="w-full px-2 py-1.5 border-2 border-[var(--border)] text-xs font-mono bg-[var(--background)] resize-y" />
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase text-[var(--foreground)]/60 cursor-pointer">Cancel</button>
          <button type="submit" disabled={pending} className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-xs font-bold uppercase shadow-[var(--shadow-xs)] cursor-pointer disabled:opacity-50">
            {pending ? "Creating..." : "Create Step"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
