"use client";

import { useState, useTransition } from "react";

type Slot = { weekday: number; openTime: string; closeTime: string };

export function BusinessHoursEditor({
  action,
  initial,
  weekdayLabels,
}: {
  action: (formData: FormData) => Promise<void>;
  initial: Slot[];
  weekdayLabels: string[];
}) {
  const [slots, setSlots] = useState<Slot[]>(initial);
  const [pending, startTransition] = useTransition();

  function addSlot(day: number) {
    setSlots((s) => [
      ...s,
      { weekday: day, openTime: "12:00", closeTime: "15:30" },
    ]);
  }

  function removeSlot(i: number) {
    setSlots((s) => s.filter((_, idx) => idx !== i));
  }

  function updateSlot(i: number, patch: Partial<Slot>) {
    setSlots((s) => s.map((slot, idx) => (idx === i ? { ...slot, ...patch } : slot)));
  }

  function save() {
    const fd = new FormData();
    fd.set("payload", JSON.stringify(slots));
    startTransition(() => action(fd));
  }

  return (
    <div className="card space-y-4 max-w-3xl">
      {weekdayLabels.map((label, d) => {
        const daySlots = slots
          .map((s, idx) => ({ s, idx }))
          .filter(({ s }) => s.weekday === d);
        return (
          <div key={d} className="flex items-start gap-4 border-b pb-3 last:border-b-0">
            <div className="w-28 pt-2 font-medium">{label}</div>
            <div className="flex-1 space-y-2">
              {daySlots.length === 0 && (
                <div className="text-sm text-th-text-muted">Cerrado</div>
              )}
              {daySlots.map(({ s, idx }) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="time"
                    className="input w-28"
                    value={s.openTime}
                    onChange={(e) => updateSlot(idx, { openTime: e.target.value })}
                  />
                  <span>a</span>
                  <input
                    type="time"
                    className="input w-28"
                    value={s.closeTime}
                    onChange={(e) => updateSlot(idx, { closeTime: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeSlot(idx)}
                    className="text-xs text-red-400 hover:underline ml-2"
                  >
                    Quitar
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addSlot(d)}
                className="text-sm text-brand-400 hover:underline"
              >
                + agregar franja
              </button>
            </div>
          </div>
        );
      })}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="btn-primary"
        >
          {pending ? "Guardando..." : "Guardar horarios"}
        </button>
      </div>
    </div>
  );
}
