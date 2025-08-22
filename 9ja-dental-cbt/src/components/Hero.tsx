import Link from "next/link";
export default function Hero() {
  return (
    <div id="aboutUs" className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-32 md:pt-40 md:pb-40 text-center min-h-screen">
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-white opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

      <span className="px-3 py-1 text-xs font-medium text-white glass-effect rounded-full mb-8 border border-white border-opacity-20">
        Testing Software
      </span>

      <h1 className="md:text-6xl max-w-4xl leading-tight text-4xl font-medium tracking-tighter">
      Ace Your Dental Exams with Confidence
      </h1>

      <p className="md:text-xl max-w-2xl text-lg text-neutral-300 mt-6">
      Learn, compete, and grow with Nigeria’s most comprehensive dental CBT prep platform.
      </p>
      <p className="md:text-xl max-w-2xl text-lg text-neutral-300 mt-6">
      Learning tool created for dentists by dentists
      </p>

      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Link
          href="#"
          className="px-8 py-3 bg-[#3ab286] text-black font-medium rounded-full hover:bg-amber-300 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Get started
        </Link>
        <Link
          href="#"
          className="px-8 py-3 glass-effect text-white font-medium rounded-full hover:bg-opacity-20 transition-all duration-300 border border-white border-opacity-20"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}
