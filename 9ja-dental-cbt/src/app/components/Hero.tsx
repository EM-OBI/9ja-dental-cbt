"use client";
import Link from "next/link";
import StatsSection from "./Stats";
import { MoveRight } from "lucide-react";

export default function Hero() {
  return (
    <div
      id="aboutUs"
      className="relative z-10 flex flex-col items-center justify-center px-6 pt-32 pb-32 md:pt-40 md:pb-40 text-center min-h-screen bg-gray-200 bg-no-repeat bg-[radial-gradient(circle_at_top_center,rgba(173,109,244,0.5),transparent_70%)] dark:bg-black dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(139,92,246,0.25),transparent_70%)] overflow-hidden"
    >
      {/* Left floating dental icons */}
      {/* <div className="absolute left-5 md:left-10 top-1/4 animate-float">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="green"
          viewBox="0 0 256 256"
        >
          <path d="M171,71.42,149.54,80,171,88.57A8,8,0,1,1,165,103.42L128,88.61,91,103.42A8,8,0,1,1,85,88.57L106.46,80,85,71.42A8,8,0,1,1,91,56.57l37,14.81,37-14.81A8,8,0,1,1,171,71.42Zm53,8.33c0,42.72-8,75.4-14.69,95.28-8.73,25.8-20.63,45.49-32.65,54a15.69,15.69,0,0,1-15.95,1.41,16.09,16.09,0,0,1-9.18-13.36C150.68,205.58,146.48,168,128,168s-22.68,37.59-23.53,49.11a16.09,16.09,0,0,1-16,14.9,15.67,15.67,0,0,1-9.13-2.95c-12-8.53-23.92-28.22-32.65-54C40,155.15,32,122.47,32,79.75A56,56,0,0,1,88,24h80A56,56,0,0,1,224,79.75Zm-16,0A40,40,0,0,0,168,40H88A40,40,0,0,0,48,79.76c0,40.55,7.51,71.4,13.85,90.14,11.05,32.66,23,43.37,26.61,46C91.57,174.67,105.59,152,128,152s36.45,22.71,39.49,63.94h0c3.6-2.59,15.57-13.26,26.66-46C200.49,151.16,208,120.31,208,79.76Z"></path>
        </svg>
      </div>

      <div className="absolute left-20 md:left-40 bottom-1/3 animate-float delay-1000">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="green"
          viewBox="0 0 256 256"
        >
          <path d="M216,79v1a40,40,0,0,1-40,40H136v80h8a16,16,0,0,0,10.67-27.93,8,8,0,0,1,10.66-11.92A32,32,0,0,1,144,216h-8v16a8,8,0,0,1-16,0V216H96a8,8,0,0,1,0-16h24V120H96a16,16,0,0,0,0,32,8,8,0,0,1,0,16,32,32,0,0,1,0-64h24V24a8,8,0,0,1,16,0v80h40a24,24,0,0,0,24-24V79a23,23,0,0,0-23-23H160a8,8,0,0,1,0-16h17a39,39,0,0,1,39,39ZM56,96H32a8,8,0,0,1-8-8V80A40,40,0,0,1,64,40H96a8,8,0,0,1,0,16A40,40,0,0,1,56,96ZM80,56H64A24,24,0,0,0,40,80H56A24,24,0,0,0,80,56Z"></path>
        </svg>
      </div> */}

      {/* Right floating dental icons */}
      {/* <div className="absolute right-5 md:right-10 top-1/3 animate-float delay-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="green"
          viewBox="0 0 256 256"
        >
          <path d="M237.66,66.34l-48-48a8,8,0,0,0-11.32,11.32L196.69,48,168,76.69,133.66,42.34a8,8,0,0,0-11.32,11.32L128.69,60l-84,84A15.86,15.86,0,0,0,40,155.31v49.38L18.34,226.34a8,8,0,0,0,11.32,11.32L51.31,216h49.38A15.86,15.86,0,0,0,112,211.31l84-84,6.34,6.35a8,8,0,0,0,11.32-11.32L179.31,88,208,59.31l18.34,18.35a8,8,0,0,0,11.32-11.32ZM100.69,200H56V155.31l18-18,20.34,20.35a8,8,0,0,0,11.32-11.32L85.31,126,98,113.31l20.34,20.35a8,8,0,0,0,11.32-11.32L109.31,102,140,71.31,184.69,116Z"></path>
        </svg>
      </div>

      <div className="absolute right-20 md:right-40 bottom-1/4 animate-float delay-1500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="green"
          viewBox="0 0 256 256"
        >
          <path d="M220,160a12,12,0,1,1-12-12A12,12,0,0,1,220,160Zm-4.55,39.29A48.08,48.08,0,0,1,168,240H144a48.05,48.05,0,0,1-48-48V151.49A64,64,0,0,1,40,88V40a8,8,0,0,1,8-8H72a8,8,0,0,1,0,16H56V88a48,48,0,0,0,48.64,48c26.11-.34,47.36-22.25,47.36-48.83V48H136a8,8,0,0,1,0-16h24a8,8,0,0,1,8,8V87.17c0,32.84-24.53,60.29-56,64.31V192a32,32,0,0,0,32,32h24a32.06,32.06,0,0,0,31.22-25,40,40,0,1,1,16.23.27ZM232,160a24,24,0,1,0-24,24A24,24,0,0,0,232,160Z"></path>
        </svg>
      </div> */}

      {/* Content */}
      <span className="px-3 py-1 text-xs font-medium text-black dark:text-white glass-effect rounded-full mb-4 border border-white border-opacity-20 relative z-20">
        Testing Software
      </span>

      <h1 className="max-w-4xl text-4xl md:text-6xl font-medium leading-tight tracking-tighter text-gray-900 dark:text-white relative z-20">
        Ace Your Dental Exams with{" "}
        <span className="cursive-font text-6xl md:text-7xl">Confidence</span>
      </h1>

      <p className="md:text-xl max-w-2xl text-base dark:text-neutral-300 text-black mt-6 whitespace-normal relative z-20">
        Learn, compete, and grow with Nigeria&apos;s most comprehensive dental
        CBT prep platform.
      </p>
      <p className="md:text-xl max-w-2xl text-base dark:text-neutral-300 text-black mt-5 whitespace-normal relative z-20">
        Learning tool created for dentists by dentists
      </p>

      <div className="mt-12 flex flex-col sm:flex-row gap-4 relative z-20">
        <Link
          href="/login"
          className="group relative px-7 py-3.5 font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span>Get started</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              data-lucide="arrow-right"
              className="lucide lucide-arrow-right w-4 h-4 group-hover:translate-x-1 transition-transform"
              strokeWidth={1.5}
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </Link>

        <Link
          href="#features"
          className="group relative px-7 py-3.5 font-medium text-gray-800 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span>Learn more</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-down transition-transform duration-300 group-hover:translate-y-0.5"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
          <span className="absolute inset-0 bg-gradient-to-b from-transparent to-white/10 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        </Link>
      </div>
      <StatsSection />
    </div>
  );
}
