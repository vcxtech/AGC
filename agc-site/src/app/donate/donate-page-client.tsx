"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { HomeScrollReveal } from "@/components/home/HomeScrollReveal";
import { RichTextContent } from "@/components/RichTextContent";
import { RichTextListItems } from "@/components/RichTextListItems";
import type { DonatePageContent } from "@/data/donate-page";
import type { PublicDonationSettings } from "@/lib/donation-settings";
import type { SiteSettings } from "@/lib/site-settings";

type PaystackPopInstance = {
  resumeTransaction: (accessCode: string) => void;
};

declare global {
  interface Window {
    PaystackPop?: new () => PaystackPopInstance;
  }
}

type DonatePageClientProps = {
  content: DonatePageContent;
  heroImage: string;
  siteSettings: SiteSettings;
  donationSettings: PublicDonationSettings;
  initialReference?: string;
};

function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.PaystackPop) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Paystack")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(script);
  });
}

export function DonatePageClient({
  content,
  heroImage,
  siteSettings,
  donationSettings,
  initialReference,
}: DonatePageClientProps) {
  const { currencySymbol, presetAmounts, paystackReady } = donationSettings;
  const [selectedAmount, setSelectedAmount] = useState<number | null>(
    presetAmounts[1] ?? presetAmounts[0] ?? null,
  );
  const [customAmount, setCustomAmount] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(content.successMessage);

  const resolvedAmount = (() => {
    if (customAmount.trim()) {
      const n = Number(customAmount);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return selectedAmount;
  })();

  const verifyPayment = useCallback(
    async (reference: string) => {
      const res = await fetch("/api/donations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment verification failed");
      setSuccessMessage(data.message || content.successMessage);
      setStatus("success");
    },
    [content.successMessage],
  );

  useEffect(() => {
    if (!initialReference) return;
    setStatus("processing");
    verifyPayment(initialReference).catch((err) => {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Verification failed");
    });
  }, [initialReference, verifyPayment]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!paystackReady) {
      setStatus("error");
      setErrorMessage(donationSettings.unavailableMessage);
      return;
    }
    if (!resolvedAmount) {
      setStatus("error");
      setErrorMessage("Please select or enter an amount.");
      return;
    }

    setStatus("processing");
    setErrorMessage("");

    try {
      const res = await fetch("/api/donations/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          amount: resolvedAmount,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to start payment");

      await loadPaystackScript();
      if (!window.PaystackPop) {
        window.location.href = data.authorizationUrl;
        return;
      }

      const popup = new window.PaystackPop();
      popup.resumeTransaction(data.accessCode);

      const reference = data.reference as string;
      const onFocus = () => {
        verifyPayment(reference).catch(() => {
          setStatus("idle");
        });
      };
      window.addEventListener("focus", onFocus, { once: true });

      const poll = async (attempts = 0) => {
        if (attempts > 20) return;
        try {
          await verifyPayment(reference);
          window.removeEventListener("focus", onFocus);
        } catch {
          window.setTimeout(() => poll(attempts + 1), 3000);
        }
      };
      window.setTimeout(() => poll(0), 4000);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <>
        <PageHero
          title={content.successTitle}
          subtitle={content.subtitle}
          image={heroImage}
          imageAlt="Thank you for your donation"
          breadcrumbs={[
            { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
            { label: siteSettings.chrome.breadcrumbs.donate ?? "Donate" },
          ]}
        />
        <section className="w-full border-t border-border/80 bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-2xl px-6 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-50 text-accent-700">
              <Heart className="h-8 w-8" aria-hidden />
            </div>
            <p className="mt-6 text-lg text-black">{successMessage}</p>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={content.title}
        subtitle={content.subtitle}
        image={heroImage}
        imageAlt="Support Africa Governance Centre"
        breadcrumbs={[
          { label: siteSettings.chrome.breadcrumbs.home, href: "/" },
          { label: siteSettings.chrome.breadcrumbs.donate ?? "Donate" },
        ]}
      />

      <HomeScrollReveal variant="fadeUp" start="top 88%" className="block w-full">
        <section className="w-full border-t border-border/80 bg-white py-8 sm:py-12 lg:py-14">
          <div className="mx-auto w-full max-w-none px-6 sm:px-8 lg:px-11 xl:px-16 2xl:px-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14 xl:gap-16">
              <div>
                <p className="text-sm font-medium text-accent-800">{content.sectionEyebrow}</p>
                <h2 className="mt-2 font-serif text-[1.85rem] font-semibold tracking-tight text-black sm:text-[2.2rem] lg:text-[2.55rem] lg:leading-tight">
                  {content.sectionHeading}
                </h2>
                <RichTextContent html={content.intro} className="mt-4 max-w-none text-black" />

                {content.impactItems?.length ? (
                  <RichTextListItems
                    items={content.impactItems}
                    as="ul"
                    listClassName="mt-8 space-y-3"
                    className="text-sm text-slate-800"
                  />
                ) : null}

                <RichTextContent html={content.footnote} className="mt-8 text-sm text-slate-600" />
              </div>

              <div className="rounded-none border border-border/80 bg-white p-6 shadow-sm sm:p-8">
                {!paystackReady ? (
                  <p className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {donationSettings.unavailableMessage}
                  </p>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      {content.typeQuestion}
                      <span className="text-accent-700">*</span>
                    </h3>
                    <div
                      className="mt-4 rounded-none border-2 border-accent-600 bg-accent-50/40 p-5 shadow-sm"
                      aria-current="true"
                    >
                      <p className="font-semibold text-black">{content.typeLabel}</p>
                      <RichTextContent
                        html={content.typeDescription}
                        className="mt-2 text-sm text-slate-700"
                      />
                      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                        Mastercard · Visa · Verve · Paystack
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-black">{content.amountHeading}</h3>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {presetAmounts.map((amount) => {
                        const active = !customAmount && selectedAmount === amount;
                        return (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => {
                              setSelectedAmount(amount);
                              setCustomAmount("");
                            }}
                            className={`min-h-11 rounded-none border px-3 py-2 text-sm font-semibold transition-colors ${
                              active
                                ? "border-accent-600 bg-accent-600 text-white"
                                : "border-border bg-white text-black hover:border-accent-400"
                            }`}
                          >
                            {currencySymbol}
                            {amount.toLocaleString()}
                          </button>
                        );
                      })}
                    </div>
                    <label className="mt-4 block text-sm font-medium text-black">
                      {content.otherAmountLabel}
                      <div className="relative mt-2">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          min={donationSettings.minAmount}
                          max={donationSettings.maxAmount}
                          step="0.01"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setSelectedAmount(null);
                          }}
                          placeholder="0.00"
                          className="w-full rounded-none border border-border py-2.5 pl-8 pr-3 text-black focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="border-t border-border/60 pt-6">
                    <h3 className="font-semibold text-black">{content.formTitle}</h3>
                    <p className="mt-1 text-sm text-slate-600">{content.formDescription}</p>
                    <div className="mt-4 space-y-4">
                      <label className="block text-sm font-medium text-black">
                        Full name
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={content.namePlaceholder}
                          className="mt-1 w-full rounded-none border border-border px-3 py-2.5 text-black focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                        />
                      </label>
                      <label className="block text-sm font-medium text-black">
                        Email
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={content.emailPlaceholder}
                          className="mt-1 w-full rounded-none border border-border px-3 py-2.5 text-black focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                        />
                      </label>
                      <label className="block text-sm font-medium text-black">
                        Message (optional)
                        <textarea
                          rows={3}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={content.messagePlaceholder}
                          className="mt-1 w-full rounded-none border border-border px-3 py-2.5 text-black focus:border-accent-500 focus:outline-none focus:ring-1 focus:ring-accent-500"
                        />
                      </label>
                    </div>
                  </div>

                  {status === "error" && errorMessage ? (
                    <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                      {errorMessage}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!paystackReady || status === "processing"}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-none bg-accent-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {status === "processing" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        {content.processingLabel}
                      </>
                    ) : (
                      content.submitLabel
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </HomeScrollReveal>
    </>
  );
}
