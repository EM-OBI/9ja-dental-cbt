export default function Features() {
  return (
    <section
      id="features"
      className="w-full py-24 bg-gray-200 dark:bg-neutral-950"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight gradient-text text-gray-900 ">
            Our Features
          </h2>
          <p className="dark:text-gray-400 text-gray-900 text-lg md:text-xl max-w-2xl mx-auto text-center whitespace-break-spaces mb-1 leading-[1.5]">
            Prepare smarter for your dental exams with tools built for speed,
            accuracy, and confidence.
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
            <p className="dark:text-gray-400 text-black text-base text-left whitespace-break-spaces">
              Practice dentistry MCQs from all specialties. Start free with
              sample questions or unlock the full bank for complete exam prep.
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
            <p className="dark:text-gray-400 text-black text-base text-left whitespace-break-spaces">
              Switch to quiz mode for speed or study mode for depth. Premium
              gives you AI insights to fix weak spots fast.
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
            <p className="dark:text-gray-400 text-black text-left whitespace-break-spaces text-base">
              Track your progress, stay motivated, and climb the leaderboard
              with a personalized dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
