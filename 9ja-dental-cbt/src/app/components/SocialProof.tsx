"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
}

interface SocialProofProps {
  initialCount?: number;
  animationDuration?: number;
}

export default function SocialProof({
  initialCount = 1,
  animationDuration = 3000,
}: SocialProofProps) {
  const [count, setCount] = useState(initialCount);
  const [targetCount, setTargetCount] = useState(initialCount);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch actual users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/recent?limit=3");
        const result = (await response.json()) as {
          success: boolean;
          data?: { users: User[]; totalCount: number };
        };

        if (result.success && result.data) {
          setUsers(result.data.users || []);
          setTargetCount(result.data.totalCount || initialCount);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
        // Use fallback users if API fails
        setUsers([]);
        setTargetCount(initialCount);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [initialCount]);

  // Animate the counter
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoading) {
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
  }, [initialCount, targetCount, animationDuration, isLoading]);

  // Format number with commas
  const formattedCount = count.toLocaleString();

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Fallback placeholder images if no users or no images
  const fallbackImages = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&q=80",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=160&q=80",
    "https://images.unsplash.com/photo-1500649297466-74794c70acfc?w=160&q=80",
  ];

  return (
    <div className="mt-8 flex items-center gap-6 justify-center">
      <div className="flex -space-x-2">
        {isLoading ? (
          // Loading skeleton
          <>
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="w-9 h-9 rounded-full border-2 border-black bg-gray-200 dark:bg-gray-700 animate-pulse"
              />
            ))}
          </>
        ) : users.length > 0 ? (
          // Display actual users
          <>
            {users.slice(0, 3).map((user) => (
              <div key={user.id} className="relative group">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full border-2 border-black object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full border-2 border-black bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                    {getInitials(user.name)}
                  </div>
                )}
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {user.name}
                </div>
              </div>
            ))}
          </>
        ) : (
          // Fallback to placeholder images
          <>
            {fallbackImages.map((src, index) => (
              <Image
                key={index}
                src={src}
                alt="User avatar"
                width={36}
                height={36}
                className="w-9 h-9 rounded-full border-2 border-black object-cover"
              />
            ))}
          </>
        )}
        <div className="w-9 h-9 rounded-full border-2 border-black bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-black dark:text-white text-xs font-semibold">
          {count >= 10000
            ? "10k+"
            : count >= 1000
            ? `${Math.floor(count / 1000)}k+`
            : `${count}+`}
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
