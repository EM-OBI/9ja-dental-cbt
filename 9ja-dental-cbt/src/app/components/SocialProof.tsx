"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface SocialProofProps {
  initialCount?: number;
  targetCount?: number;
  animationDuration?: number;
}

export default function SocialProof({
  initialCount = 1,
  targetCount = 5,
  animationDuration = 3000,
}: SocialProofProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    // Only animate on client
    if (typeof window !== "undefined") {
      const startTime = Date.now();

      const updateCount = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Ease-out function for smooth animation
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
        const currentCount = Math.floor(
          initialCount + (targetCount - initialCount) * easeOut(progress)
        );

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        }
      };

      requestAnimationFrame(updateCount);
    }
  }, [initialCount, targetCount, animationDuration]);

  // Format number with commas
  const formattedCount = count.toLocaleString();

  return (
    <div className="mt-8 flex items-center gap-6 justify-center">
      <div className="flex -space-x-2">
        <Image
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&q=80"
          alt="User avatar"
          width={36}
          height={36}
          className="w-9 h-9 rounded-full border-2 border-black object-cover"
        />
        <Image
          src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=160&q=80"
          alt="User avatar"
          width={36}
          height={36}
          className="w-9 h-9 rounded-full border-2 border-black object-cover"
        />
        <Image
          src="https://images.unsplash.com/photo-1500649297466-74794c70acfc?w=160&q=80"
          alt="User avatar"
          width={36}
          height={36}
          className="w-9 h-9 rounded-full border-2 border-black object-cover"
        />
        <div className="w-9 h-9 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center text-black text-xs">
          {count >= 10000 ? "10k+" : `${Math.floor(count / 1000)}k+`}
        </div>
      </div>
      <div>
        <p className="text-sm dark:text-gray-100 text-black">
          Trusted by {formattedCount}+ Users
        </p>
      </div>
    </div>
  );
}
