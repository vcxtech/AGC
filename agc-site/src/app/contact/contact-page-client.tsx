"use client";

import { useState } from "react";
import { Mail, MapPin, Phone, Clock, Send } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import type { SiteSettings } from "@/lib/site-settings";

type ContactContent = {
  title: string;
  subtitle: string;
  intro: string;
  sidebarEyebrow: string;
  sidebarHeading: string;
  mapHeading: string;
  formTitle: string;
  formDescription: string;
  formPlaceholders: { name: string; email: string; subject: string; message: string };
  submitLabel: string;
  /** Optional when CMS JSON omits the field (build/prerender safe). */
  divisions?: { name: string; email: string }[];
};

type ContactPageClientProps = { contactContent: ContactContent; heroImage: string; siteSettings: SiteSettings };

export function ContactPageClient({ contactContent, heroImage, siteSettings }: ContactPageClientProps) {
  const divisions = Array.isArray(contactContent.divisions) ? contactContent.divisions : [];
  const mapQuery = encodeURIComponent(siteSettings.address);
  const mapEmbedSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setEmailNotifyWarning(Boolean(data.emailFailed));
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <>
      <PageHero
        title={contactContent.title}
        subtitle={contactContent.subtitle}
        image={heroImage}
        imageAlt="Get In Touch"
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: siteSettings.chrome.breadcrumbs.contact },
        ]}
      />

      <HomeScrollReveal variant="fadeUp" start="top 88%" className="block w-full">
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
            <div>
              <p className="text-sm font-medium text-accent-800">{contactContent.sidebarEyebrow}</p>
              <h2 className="mt-2 font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                {contactContent.sidebarHeading}
              </h2>
              <p className="page-prose mt-4 max-w-none text-black">{contactContent.intro}</p>
              <ul className="mt-10 space-y-6">
                {divisions.map((div) => (
                  <li key={div.name} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-white text-accent-700 shadow-sm ring-1 ring-border/60">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-black">{div.name}</p>
                      <a
                        href={`mailto:${div.email}`}
                        className="text-black hover:text-accent-700"
                      >
                        {div.email}
                      </a>
                    </div>
                  </li>
                ))}
                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-white text-accent-700 shadow-sm ring-1 ring-border/60">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Phone</p>
                    <a
                      href={`tel:${siteSettings.phone.replace(/\s/g, "")}`}
                      className="text-black hover:text-accent-700"
                    >
                      {siteSettings.phone}
                    </a>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-white text-accent-700 shadow-sm ring-1 ring-border/60">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Address</p>
                    <address className="not-italic text-black">
                      {siteSettings.address}
                    </address>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-white text-accent-700 shadow-sm ring-1 ring-border/60">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-black">Office hours</p>
                    <p className="text-black">{siteSettings.officeHours}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-none border-0 bg-white p-6 shadow-md sm:p-7">
              <h2 className="page-heading text-xl text-black sm:text-2xl">{contactContent.formTitle}</h2>
              <p className="page-prose mt-2 max-w-none text-sm text-black">{contactContent.formDescription}</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="sr-only">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder={contactContent.formPlaceholders.name}
                      className="w-full rounded-none border border-border/90 bg-white px-4 py-3 text-black placeholder:text-black focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder={contactContent.formPlaceholders.email}
                      className="w-full rounded-none border border-border/90 bg-white px-4 py-3 text-black placeholder:text-black focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="sr-only">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder={contactContent.formPlaceholders.subject}
                    className="w-full rounded-none border border-border/90 bg-white px-4 py-3 text-black placeholder:text-black focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="sr-only">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    placeholder={contactContent.formPlaceholders.message}
                    className="w-full rounded-none border border-border/90 bg-white px-4 py-3 text-black placeholder:text-black focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
                  />
                </div>
                {status === "success" && (
                  <div className="space-y-2 text-sm">
                    <p className="text-green-700">Thank you! Your message was received.</p>
                    {emailNotifyWarning && (
                      <p className="rounded-none border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                        We could not send the notification email automatically; your message is still saved. If you need an
                        urgent reply, email us directly at {siteSettings.email.programs}.
                      </p>
                    )}
                  </div>
                )}
                {status === "error" && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="flex w-full items-center justify-center gap-2 rounded-none bg-accent-700 px-6 py-4 font-semibold text-white transition-colors hover:bg-accent-800 disabled:opacity-70"
                >
                  <Send className="h-5 w-5" />
                  {status === "sending" ? "Sending..." : contactContent.submitLabel}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      </HomeScrollReveal>

      <HomeScrollReveal variant="clipOpen" start="top 90%" className="block w-full">
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
        <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
          <h2 className="text-center font-serif text-2xl font-semibold text-black sm:text-3xl">
            {contactContent.mapHeading}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-black sm:text-base">
            {siteSettings.address}
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm">
            <iframe
              title="Africa Governance Centre location map"
              src={mapEmbedSrc}
              className="h-[420px] w-full sm:h-[500px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
      </HomeScrollReveal>
    </>
  );
}
