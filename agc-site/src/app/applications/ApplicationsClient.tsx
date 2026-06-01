"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { Button } from "@/components/Button";
import type { ApplicationsFormFields } from "@/data/applications-page";

type BreadcrumbItem = { label: string; href?: string };

type ApplicationsClientProps = {
  hero: {
    title: string;
    subtitle: string;
    image?: string;
    imageAlt: string;
  };
  breadcrumbs: BreadcrumbItem[];
  applyIntro: string;
  programsEmail: string;
  formEyebrow: string;
  formCardTitle: string;
  sectionPersonal: string;
  sectionExperience: string;
  sectionMotivation: string;
  applicationTypeLabel: string;
  optionVolunteer: string;
  optionStaff: string;
  optionFellow: string;
  availabilityPlaceholder: string;
  availabilityFullTime: string;
  availabilityPartTime: string;
  availabilityFlexible: string;
  submitSending: string;
  submitIdle: string;
  successMessage: string;
  emailWarnIntro: string;
  errorFallback: string;
  formFields: ApplicationsFormFields;
};

export function ApplicationsClient({
  hero,
  breadcrumbs,
  applyIntro,
  programsEmail,
  formEyebrow,
  formCardTitle,
  sectionPersonal,
  sectionExperience,
  sectionMotivation,
  applicationTypeLabel,
  optionVolunteer,
  optionStaff,
  optionFellow,
  availabilityPlaceholder,
  availabilityFullTime,
  availabilityPartTime,
  availabilityFlexible,
  submitSending,
  submitIdle,
  successMessage,
  emailWarnIntro,
  errorFallback,
  formFields,
}: ApplicationsClientProps) {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailNotifyWarning, setEmailNotifyWarning] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (formData.get("website")) return;
    setStatus("sending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationType: formData.get("applicationType"),
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          position: formData.get("position"),
          organization: formData.get("organization"),
          country: formData.get("country"),
          city: formData.get("city"),
          experience: formData.get("experience"),
          skills: formData.get("skills"),
          motivation: formData.get("motivation"),
          availability: formData.get("availability"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setEmailNotifyWarning(Boolean(data.emailFailed));
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : errorFallback);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-none border border-border/90 bg-white px-4 py-2.5 text-black shadow-sm focus:border-accent-600 focus:ring-1 focus:ring-accent-500";
  const labelClass = "block text-sm font-medium text-black";

  return (
    <>
      <PageHero
        variant={hero.image ? "compact" : "minimal"}
        compactTall={Boolean(hero.image)}
        title={hero.title}
        subtitle={hero.subtitle}
        image={hero.image}
        imageAlt={hero.imageAlt}
        breadcrumbs={breadcrumbs}
      />

      <HomeScrollReveal
        variant="slideRight"
        start="top 88%"
        className="block w-full"
      >
        <section className="border-t border-border/80 bg-white py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 border-l-[3px] border-accent-600 py-2 pl-5">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black">
                {formEyebrow}
              </p>
              <p className="mt-2 page-prose max-w-xl text-[1.02rem]">
                {applyIntro}
              </p>
            </div>

            <div className="page-card p-8 sm:p-10">
              <h2 className="page-heading text-xl text-black">
                {formCardTitle}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="relative mt-10 space-y-10"
              >
                <div
                  className="absolute -left-[9999px] opacity-0"
                  aria-hidden="true"
                >
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="applicationType" className={labelClass}>
                    {applicationTypeLabel}{" "}
                    <span className="text-accent-800">*</span>
                  </label>
                  <select
                    id="applicationType"
                    name="applicationType"
                    required
                    className={inputClass}
                    defaultValue="volunteer"
                  >
                    <option value="volunteer">{optionVolunteer}</option>
                    <option value="staff">{optionStaff}</option>
                    <option value="fellow">{optionFellow}</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-accent-800">
                    {sectionPersonal}
                  </h3>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {formFields.personalInfo.map((field) => (
                      <div
                        key={field.name}
                        className={
                          field.name === "fullName" || field.name === "email"
                            ? "sm:col-span-2"
                            : ""
                        }
                      >
                        <label htmlFor={field.name} className={labelClass}>
                          {field.label}{" "}
                          {field.required && (
                            <span className="text-accent-800">*</span>
                          )}
                        </label>
                        <input
                          type={field.type}
                          id={field.name}
                          name={field.name}
                          required={field.required}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/80 pt-10">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-accent-800">
                    {sectionExperience}
                  </h3>
                  <div className="mt-5 space-y-5">
                    {formFields.experience.map((field) => (
                      <div key={field.name}>
                        <label htmlFor={field.name} className={labelClass}>
                          {field.label}
                        </label>
                        <textarea
                          id={field.name}
                          name={field.name}
                          rows={4}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border/80 pt-10">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-accent-800">
                    {sectionMotivation}
                  </h3>
                  <div className="mt-5 space-y-5">
                    {formFields.motivation.map((field) => (
                      <div key={field.name}>
                        <label htmlFor={field.name} className={labelClass}>
                          {field.label}{" "}
                          {field.required && (
                            <span className="text-accent-800">*</span>
                          )}
                        </label>
                        {field.type === "select" ? (
                          <select
                            id={field.name}
                            name={field.name}
                            className={inputClass}
                          >
                            <option value="">{availabilityPlaceholder}</option>
                            <option value="full-time">
                              {availabilityFullTime}
                            </option>
                            <option value="part-time">
                              {availabilityPartTime}
                            </option>
                            <option value="flexible">
                              {availabilityFlexible}
                            </option>
                          </select>
                        ) : (
                          <textarea
                            id={field.name}
                            name={field.name}
                            required={field.required}
                            rows={4}
                            className={inputClass}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {status === "success" && (
                  <div className="space-y-2 text-sm">
                    <p className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-emerald-900">
                      {successMessage}
                    </p>
                    {emailNotifyWarning && (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                        {emailWarnIntro} {programsEmail} directly.
                      </p>
                    )}
                  </div>
                )}
                {status === "error" && (
                  <p className="rounded-lg border border-red-200/80 bg-red-50/80 px-4 py-3 text-sm text-red-900">
                    {errorMessage}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={status === "sending"}
                  className="rounded-none"
                >
                  {status === "sending" ? submitSending : submitIdle}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
