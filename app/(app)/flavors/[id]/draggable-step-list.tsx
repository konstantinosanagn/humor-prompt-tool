"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StepCard from "./step-card";
import StepForm from "./step-form";
import { reorderSteps } from "./actions";
import type { HumorFlavorStep, LlmModel, LookupItem } from "@/app/lib/types";

function SortableStep({
  step,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  flavorId,
}: {
  step: HumorFlavorStep;
  models: LlmModel[];
  inputTypes: LookupItem[];
  outputTypes: LookupItem[];
  stepTypes: LookupItem[];
  flavorId: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex gap-2">
        <button
          {...attributes}
          {...listeners}
          className="w-8 flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing text-[var(--foreground)]/40 hover:text-[var(--foreground)] border-2 border-[var(--border)] bg-[var(--foreground)]/5"
          title="Drag to reorder"
        >
          ⠿
        </button>
        <div className="flex-1">
          <StepCard
            step={step}
            models={models}
            inputTypes={inputTypes}
            outputTypes={outputTypes}
            stepTypes={stepTypes}
            flavorId={flavorId}
          />
        </div>
      </div>
    </div>
  );
}

export default function DraggableStepList({
  steps: initialSteps,
  models,
  inputTypes,
  outputTypes,
  stepTypes,
  flavorId,
}: {
  steps: HumorFlavorStep[];
  models: LlmModel[];
  inputTypes: LookupItem[];
  outputTypes: LookupItem[];
  stepTypes: LookupItem[];
  flavorId: number;
}) {
  const [steps, setSteps] = useState(initialSteps);
  const [showForm, setShowForm] = useState(false);

  // Sync with server re-renders (e.g., after step create/delete)
  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);
    const newSteps = arrayMove(steps, oldIndex, newIndex).map((s, i) => ({
      ...s,
      order_by: i + 1,
    }));

    setSteps(newSteps);
    await reorderSteps(flavorId, newSteps.map((s) => s.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-head text-xl uppercase tracking-tight">
          Steps ({steps.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
        >
          + Add Step
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {steps.map((step) => (
              <SortableStep
                key={step.id}
                step={step}
                models={models}
                inputTypes={inputTypes}
                outputTypes={outputTypes}
                stepTypes={stepTypes}
                flavorId={flavorId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {steps.length === 0 && (
        <div className="border-2 border-dashed border-[var(--border)] p-8 text-center text-[var(--foreground)]/40 text-sm font-bold uppercase">
          No steps yet. Add one to get started.
        </div>
      )}

      {showForm && (
        <StepForm
          flavorId={flavorId}
          models={models}
          inputTypes={inputTypes}
          outputTypes={outputTypes}
          stepTypes={stepTypes}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
