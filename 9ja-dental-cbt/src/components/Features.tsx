export default function Features() {
  return (
    <section id="features" className="w-full py-24 dark:bg-black bg-gray-200">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight gradient-text text-gray-900 ">
            Our Features
          </h2>
          <p className="dark:text-gray-400 text-gray-900 text-lg md:text-xl max-w-2xl mx-auto">
            9ja Dental CBT is desisgned to make exam preparation smarter and
            more engaging for clinical dental students. With secure
            authentication and a personalized dashboard, users can track their
            progress across all specialties in dentistry.
          </p>
          <p className="dark:text-gray-400 text-gray-900 text-lg md:text-xl max-w-2xl mx-auto">
            A free demo mode gives access to sample questions, while
            subscription plans unlock the full question bank, advanced quiz and
            study modes, and AI-powered insights that highlight strengths and
            weaknesses.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="dark:bg-white/5 bg-white border border-white/10 rounded-2xl py-12 px-8 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition">
            <div className="mb-6">
              <div className="bg-gradient-to-tr from-blue-500 to-pink-500 p-4 rounded-full">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 tracking-wide text-gray-500">
              Full Question Bank
            </h3>
            <p className="dark:text-gray-400 text-black text-base">
              Access a wide range of dentistry MCQs across all clinical
              specialties. From demo mode with sample questions to full
              subscription plans, you can practice with curated content tailored
              to your exam needs.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="dark:bg-white/5 bg-white border border-white/10 rounded-2xl py-12 px-8 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition">
            <div className="mb-6">
              <div className="bg-gradient-to-tr from-blue-500 to-green-400 p-4 rounded-full">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6"
                  />
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 tracking-wide text-gray-500">
              Smart Learning Modes
            </h3>
            <p className="dark:text-gray-400 text-black text-base">
              Choose between quiz mode to test your speed and accuracy or study
              mode to learn at your own pace. Premium users also enjoy AI-driven
              insights that identify weak areas and guide targeted revision.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="dark:bg-white/5 bg-white border border-white/10 rounded-2xl py-12 px-8 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition">
            <div className="mb-6">
              <div className="bg-gradient-to-tr from-pink-500 to-yellow-400 p-4 rounded-full">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3 tracking-wide text-gray-500">
              Progress Tracking & Leaderboard
            </h3>
            <p className="dark:text-gray-400 text-black text-base">
              Monitor your performance with a personalized dashboard, track
              progress in each specialty, and stay motivated through a
              points-based system and leaderboards that encourage healthy
              competition.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
