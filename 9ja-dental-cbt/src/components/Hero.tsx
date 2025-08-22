import Link from "next/link";
export default function Hero() {
  return (
    <div
      id="aboutUs"
      className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-32 md:pt-40 md:pb-40 text-center min-h-screen  dark:bg-black bg-gray-200"
    >
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-white opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

      <span className="px-3 py-1 text-xs font-medium text-black dark:text-white glass-effect rounded-full mb-8 border border-white border-opacity-20">
        Testing Software
      </span>

      <h1 className="md:text-6xl max-w-4xl leading-tight text-4xl font-medium tracking-tighter dark:text-white text-gray-900">
        Ace Your Dental Exams with Confidence
      </h1>

      <p className="md:text-xl max-w-2xl text-base dark:text-neutral-300 text-black mt-6 whitespace-normal">
        Learn, compete, and grow with Nigeria’s most comprehensive dental CBT
        prep platform.
      </p>
      <p className="md:text-xl max-w-2xl text-base dark:text-neutral-300 text-black mt-5 whitespace-normal">
        Learning tool created for dentists by dentists
      </p>

      <div className="mt-12 flex flex-row sm:flex-row gap-4">
        <Link
          href="/login"
          className="px-8 py-3 bg-[#3ab286] text-black font-medium rounded-full hover:bg-amber-300 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Get started
        </Link>
        <Link
          href="#"
          className="px-8 py-3 glass-effect dark:text-white text-gray-900 hover:text-green-600 font-medium rounded-full hover:bg-opacity-20 transition-all duration-300 border border-white border-opacity-20"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
