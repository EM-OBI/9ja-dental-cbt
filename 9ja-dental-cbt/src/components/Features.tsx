export default function Features() {
  return (
    <section className="w-full py-24 bg-black">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight gradient-text">
            Our Features
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime
            blanditiis unde necessitatibus reprehenderit eius voluptate repellat
            officia temporibus beatae quaerat quo dolorum, maiores perferendis
            incidunt modi, molestias vero qui sunt!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl py-12 px-8 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition">
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
            <h3 className="text-xl font-semibold mb-3 tracking-wide">
              Heading
            </h3>
            <p className="text-gray-400 text-base">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Non eum
              deserunt nostrum corporis distinctio minus velit perspiciatis
              mollitia facere exercitationem, illo minima excepturi voluptate
              at. Facere error quod similique ut.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl py-12 px-8 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition">
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
            <h3 className="text-xl font-semibold mb-3 tracking-wide">
              Heading
            </h3>
            <p className="text-gray-400 text-base">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Nam,
              nesciunt. Est blanditiis explicabo iure! Aperiam laborum error
              facilis accusamus magnam, laboriosam eveniet distinctio fuga
              officiis cumque excepturi consequuntur numquam accusantium?
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl py-12 px-8 flex flex-col items-center text-center shadow-lg hover:shadow-2xl transition">
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
            <h3 className="text-xl font-semibold mb-3 tracking-wide">
              Heading
            </h3>
            <p className="text-gray-400 text-base">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Modi
              reprehenderit molestias debitis illum? Dolorem, possimus cumque.
              Vero velit ad laboriosam vitae consequatur. Libero eum culpa dolor
              minima, porro non dolorum.{" "}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
