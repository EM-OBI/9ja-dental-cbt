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
      name: "Free",
      monthlyPrice: "₦0",
      annualPrice: "₦0",
      description: "Try core quizzes and basic tracking.",
      features: [
        "20 questions per specialty",
        "Core Specialties only (Conservative, Prosthodontics, and Maxillofacial Surgery)",
        "Basic quiz mode (timed practice)",
        "Basic progress tracking (scores, % correct)",
        "Demo-only leaderboard",
        "Community access (forums, peer Q&A)",
      ],
      badge: "Starter",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
          aria-hidden="true"
          focusable="false"
          role="img"
        >
          <path
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      cta: "Start Free",
    },
    {
      name: "Pro",
      monthlyPrice: "₦3,000",
      annualPrice: "₦2,400",
      description: "Full question bank + exam-mode + AI insights.",
      features: [
        "Full access to all questions (unlimited)",
        "All dental specialties included",
        "Full quiz mode (timed + customizable)",
        "Study mode with explanations & notes",
        "AI insights (strengths, weaknesses, trends)",
        "Detailed performance dashboard",
        "Personalized revision recommendations",
        "Earn tokens with points system",
        "Global leaderboard access",
        "Premium priority support",
      ],
      badge: "Most Popular",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
          aria-hidden="true"
          focusable="false"
          role="img"
        >
          <path
            d="M13 10V3L4 14h7v7l9-11h-7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      cta: "Start 7-Day Trial",
    },
  ];

  return (
    <section id="pricing">
      <div className="bg-white py-12 antialiased flex items-center justify-center">
        <div className="w-full max-w-7xl px-4 md:px-6">
          {/* Pricing header section */}
          <div className="flex flex-col items-center text-center mb-10">
            <h1 className="mb-4 text-4xl md:text-5xl font-bold tracking-tight text-gray-900 heading-font">
              Choose Your
              <span className="text-blue-600"> Plan</span>
            </h1>
            <p className="mb-6 max-w-2xl text-lg text-gray-600 font-light leading-relaxed">
              Prep smarter. Pass confidently. Pick a plan that fits your stage.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center mb-8 space-x-3">
              <span className="text-sm font-medium text-gray-700">Monthly</span>
              <button
                title="Toggle Billing"
                onClick={toggleBilling}
                className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                role="switch"
                type="button"
                aria-checked={isAnnual}
              >
                <span
                  className={`${
                    isAnnual ? "translate-x-5" : "translate-x-0"
                  } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
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
              <span className="text-sm font-medium text-gray-700">
                Annual{" "}
                <span className="text-green-500 text-xs ml-1">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-xl overflow-hidden transition-all duration-300 border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 shadow-sm w-full"
              >
                <div className="relative flex flex-col space-y-3 h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600">
                        {plan.icon}
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
                        {plan.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-2xl mb-2 heading-font">
                      {plan.name}
                    </h3>

                    <div className="flex items-baseline mb-3">
                      <span
                        className={`${
                          isAnnual ? "hidden" : ""
                        } text-4xl font-bold text-gray-900`}
                      >
                        {plan.monthlyPrice}
                      </span>
                      <span
                        className={`${
                          isAnnual ? "" : "hidden"
                        } text-4xl font-bold text-gray-900`}
                      >
                        {plan.annualPrice}
                      </span>
                      <span className="ml-2 text-sm text-gray-600 font-medium">
                        /month
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 font-light leading-relaxed">
                      {plan.description}
                    </p>

                    <ul className="space-y-2.5">
                      {plan.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-start text-sm text-gray-700"
                        >
                          <svg
                            className="w-4 h-4 mr-2.5 mt-0.5 flex-shrink-0 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                            aria-hidden="true"
                            focusable="false"
                            role="img"
                          >
                            <path
                              d="M5 13l4 4L19 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="font-medium">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/signup?plan=${encodeURIComponent(
                          plan.name.toLowerCase()
                        )}`
                      )
                    }
                    className={`mt-4 w-full inline-flex items-center justify-center px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      plan.name === "Pro"
                        ? "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-lg hover:shadow-xl"
                        : "bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-gray-400 focus:ring-gray-400"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
                <div className="absolute inset-0 -z-10 rounded-xl p-px bg-gradient-to-br from-transparent via-blue-100/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
