"use client";

import { useRef } from "react";

interface PlanFormProps {
  action: (formData: FormData) => Promise<void>;
}

export default function PlanForm({ action }: PlanFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await action(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Plan Title
          </label>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. Standard Plan"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Base Rate (%)
          </label>
          <input
            name="baseRate"
            type="number"
            step="0.1"
            required
            placeholder="e.g. 10"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Threshold ($)
          </label>
          <input
            name="threshold"
            type="number"
            step="1"
            required
            placeholder="e.g. 50000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Accelerator Rate (%)
          </label>
          <input
            name="acceleratorRate"
            type="number"
            step="0.1"
            required
            placeholder="e.g. 15"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        Create Plan
      </button>
    </form>
  );
}
