export default function Features() {
  return (
    <section id="features" className="w-full py-12 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-gray-900 heading-font">
            Our Features
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Prepare smarter for your dental exams with tools built for speed,
            accuracy, and confidence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4">
              <div className="bg-gradient-to-tr from-blue-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
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
            <h3 className="text-xl font-bold mb-2 text-gray-900 heading-font">
              Full Question Bank
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed font-light">
              Practice dentistry MCQs from all specialties. Start free with
              sample questions or unlock the full bank for complete exam prep.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4">
              <div className="bg-gradient-to-tr from-blue-500 to-green-400 p-3 rounded-2xl shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
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
            <h3 className="text-xl font-bold mb-2 text-gray-900 heading-font">
              Smart Learning Modes
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed font-light">
              Switch to quiz mode for speed or study mode for depth. Premium
              gives you AI insights to fix weak spots fast.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4">
              <div className="bg-gradient-to-tr from-pink-500 to-yellow-400 p-3 rounded-2xl shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 heading-font">
              Progress Tracking & Leaderboard
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed font-light">
              Track your progress, stay motivated, and climb the leaderboard
              with a personalized dashboard.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
