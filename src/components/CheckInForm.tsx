"use client";

import { FormEvent, useRef, useState } from "react";
import { ORGANIZATION_OPTIONS } from "@/lib/constants";
import type { OrganizationOption } from "@/lib/constants";
import SignatureField, { type SignatureFieldHandle } from "./SignatureField";

export default function CheckInForm() {
  const sigRef = useRef<SignatureFieldHandle>(null);
  const [organization, setOrganization] = useState<OrganizationOption | "">("");
  const [otherOrganization, setOtherOrganization] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!organization) {
      setError("請選擇單位");
      return;
    }

    if (organization === "其他" && !otherOrganization.trim()) {
      setError("請填寫其他單位名稱");
      return;
    }

    if (!name.trim()) {
      setError("請填寫姓名");
      return;
    }

    if (!title.trim()) {
      setError("請填寫職稱");
      return;
    }

    const signature = sigRef.current?.getDataUrl();
    if (!signature) {
      setError("請完成簽名");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization,
          otherOrganization:
            organization === "其他" ? otherOrganization.trim() : undefined,
          name: name.trim(),
          title: title.trim(),
          signature,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "簽到失敗，請稍後再試");
      }

      setShowSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "簽到失敗，請稍後再試",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-ocean-950 via-ocean-900 to-teal-900 px-6 text-center">
        <div className="animate-fade-in max-w-sm space-y-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal-500/20 ring-4 ring-teal-400/30">
            <svg
              className="h-12 w-12 text-teal-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold tracking-wide text-white">
            簽到成功
          </h2>
          <p className="text-ocean-200/90">
            感謝您蒞臨 InnoVex2026 基隆主題館開幕儀式
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="organization" className="form-label">
          單位 <span className="text-teal-300">*</span>
        </label>
        <select
          id="organization"
          value={organization}
          onChange={(e) =>
            setOrganization(e.target.value as OrganizationOption | "")
          }
          className="form-input"
          required
        >
          <option value="">請選擇單位</option>
          {ORGANIZATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {organization === "其他" && (
        <div className="animate-fade-in">
          <label htmlFor="otherOrganization" className="form-label">
            其他單位名稱 <span className="text-teal-300">*</span>
          </label>
          <input
            id="otherOrganization"
            type="text"
            value={otherOrganization}
            onChange={(e) => setOtherOrganization(e.target.value)}
            className="form-input"
            placeholder="請輸入單位名稱"
            required
          />
        </div>
      )}

      <div>
        <label htmlFor="name" className="form-label">
          姓名 <span className="text-teal-300">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="form-input"
          placeholder="請輸入姓名"
          required
        />
      </div>

      <div>
        <label htmlFor="title" className="form-label">
          職稱 <span className="text-teal-300">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          placeholder="請輸入職稱"
          required
        />
      </div>

      <div>
        <label className="form-label">
          簽名 <span className="text-teal-300">*</span>
        </label>
        <SignatureField ref={sigRef} />
      </div>

      {error && (
        <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "提交中…" : "完成簽到"}
      </button>
    </form>
  );
}
