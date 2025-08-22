"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
export default function PricingPlans() {
  const [isAnnual, setIsAnnual] = useState(false);
  const router = useRouter();

  const toggleBilling = () => {
    setIsAnnual(!isAnnual);
  };

  const plans = [
    {
      name: "Demo",
      monthlyPrice: "₦0",
      annualPrice: "₦0",
      description: "Try core quizzes and basic tracking.",
      features: [
        "20 questions / specialty",
        "Core Specialties only (Conservative, Prosthodontics, and Maxillofacial Surgery)",
        "Basic quiz mode (timed practice)",
        "Basic progress tracking (scores, % correct)",
        "Demo-only leaderboard",
        "Community access (forums, peer Q&A)"
      ],
      badge: "Starter",
      icon: (
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      cta: "Start demo",
    },
    {
      name: "Basic",
      monthlyPrice: "₦3000",
      annualPrice: "₦2400",
      description: "Full question bank + exam-mode.",
      features: [
        "Full access to all questions (unlimited)",
        "All dental specialties includeds",
        "Full quiz mode (timed + customizable)",
        "Detailed performance dashboard",
        "Earn tokens with points system",
        "Global leaderboard access",
        "Community support with priority response",
      ],
      badge: "Most popular",
      icon: (
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      cta: "Start 7‑day trial",
    },
    {
      name: "Advanced",
      monthlyPrice: "₦6000",
      annualPrice: "₦4800",
      description: "Study notes and AI insights",
      features: [
        "All basic features",
        "Study mode with explanations & notes",
        "AI insights (strengths, weaknesses, trends)",
        "Personalized revision recommendations",
        "Enhanced points system with bonus challenges",
        "Global leaderboard + premium-only tiers",
        "Early access to new features & updates",
        "Premium priority support",
      ],
      badge: "For study groups",
      icon: (
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      cta: "Request demo",
    },
  ];

  return (
    <section id="pricing">
      <div className="bg-gray-50 dark:bg-neutral-950 min-h-screen antialiased flex items-center justify-center">
        <div className="w-full max-w-5xl px-4 py-12">
          {/* Pricing header section */}
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Dental Specialty Quiz —
              <span className="text-blue-600 dark:text-blue-400"> Plans</span>
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Prep smarter. Pass confidently. Pick a plan that fits your stage.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center mb-10 space-x-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Monthly
              </span>
              <button
                onClick={toggleBilling}
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 dark:bg-gray-700 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                role="switch"
                type="button"
                aria-checked={isAnnual}
              >
                <span
                  className={`${
                    isAnnual ? "translate-x-5" : "translate-x-0"
                  } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-900 shadow ring-0 transition duration-200 ease-in-out`}
                >
                  <span className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity opacity-0 duration-100 ease-out">
                    <svg
                      className="h-3 w-3 text-gray-400"
                      fill="none"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
                        fill="currentColor"
                      ></path>
                    </svg>
                  </span>
                </span>
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Annual{" "}
                <span className="text-green-500 text-xs ml-1">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl overflow-hidden transition-all duration-300 border border-gray-100/80 dark:border-white/10 bg-white dark:bg-black hover:shadow-2xl will-change-transform shadow dark:shadow-lg mx-auto md:max-w-[360px] min-h-[520px]"
              >
                <div className="relative flex flex-col space-y-6 h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 group-hover:bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 transition-all duration-300">
                        {plan.icon}
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 transition-colors duration-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40">
                        {plan.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white tracking-tight text-2xl mt-2">
                      {plan.name}
                    </h3>

                    <div className="flex items-baseline">
                      <span
                        className={`${
                          isAnnual ? "hidden" : ""
                        } text-5xl font-bold text-gray-900 dark:text-white`}
                      >
                        {plan.monthlyPrice}
                      </span>
                      <span
                        className={`${
                          isAnnual ? "" : "hidden"
                        } text-5xl font-bold text-gray-900 dark:text-white`}
                      >
                        {plan.annualPrice}
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        /month
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {plan.description}
                    </p>

                    <ul className="space-y-4 mt-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center text-gray-700 dark:text-gray-300"
                        >
                          <svg
                            className="w-5 h-5 mr-3 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                {plan.name === "Advanced" ? (
                  <button
                    type="button"
                    disabled
                    className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold bg-[#3ab286] hover:bg-amber-300 text-black transition-colors duration-300"
                  >
                    Coming soon
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/signup?plan=${encodeURIComponent(
                          plan.name.toLowerCase()
                        )}`
                      )
                    }
                    className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold bg-[#3ab286] hover:bg-amber-300 text-black transition-colors duration-300"
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
              <div className="absolute inset-0 -z-10 rounded-2xl p-px bg-gradient-to-br from-transparent via-blue-100/40 to-transparent dark:via-blue-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
}
