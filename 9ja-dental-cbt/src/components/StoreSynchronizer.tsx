"use client";

import { useEffect } from "react";
import { useUser } from "@/hooks/queries/useUserQuery";
import { useStreaks } from "@/hooks/queries/useProgressQueries";
import { useUserStore } from "@/store/userStore";
import { useProgressStore } from "@/store/progressStore";
import { authClient } from "@/modules/auth/utils/auth-client";

export function StoreSynchronizer() {
    // We need to get the session first to know the user ID
    // But useUser might need userId. 
    // Actually, useUser in its current form takes userId as argument.
    // We need to get the userId from auth or somewhere.
    // The userStore might have the ID if we set it from session.

    // Let's assume we get the session here or useUser handles it.
    // But useUser currently expects userId.
    // We can use a separate hook or logic to get the current session user ID.

    const { setUser, updateUser } = useUserStore();

    // We can try to get the session user ID from the auth client directly or use a hook
    // For now, let's assume we can get it from the userStore if it was set by initial auth check
    // Or we can fetch the session here.

    const [userId, setUserId] = React.useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchSession = async () => {
            const session = await authClient.getSession();
            if (session?.data?.user?.id) {
                setUserId(session.data.user.id);
                const userWithPrefs = {
                    ...session.data.user,
                    subscription: "free",
                    level: 1,
                    xp: 0,
                    joinedDate: new Date().toISOString(),
                    preferences: {
                        theme: "system",
                        notifications: {
                            studyReminders: true,
                            streakAlerts: true,
                            progressReports: true,
                            achievements: true,
                        },
                        quiz: {
                            defaultMode: "study",
                            showExplanations: true,
                            timePerQuestion: 60,
                            autoSubmit: false,
                        },
                        study: {
                            defaultFocusTime: 25,
                            breakTime: 5,
                            soundEffects: true,
                        },
                    },
                };
                // We need to cast to unknown first if the types don't perfectly align, 
                // but we should try to match the User interface.
                // Assuming session.data.user has the basic fields.
                setUser(userWithPrefs as unknown as import("@/store/types").User);
            }
        };
        fetchSession();
    }, [setUser]);

    const { data: userData } = useUser(userId);
    const { data: streaks } = useStreaks(userId);

    // Sync User
    useEffect(() => {
        if (userData) {
            updateUser({
                id: userData.id,
                name: userData.name,
                email: userData.email,
                avatar: userData.avatar,
                joinedDate: userData.createdAt.toISOString(),
            });
        }
    }, [userData, updateUser]);

    // Sync Streaks
    useEffect(() => {
        if (streaks) {
            // We need to update the store's streakData with the fetched streaks
            // The store expects a full StreakData object.
            // The API returns StreakData.
            useProgressStore.setState((state) => ({
                streakData: {
                    ...state.streakData,
                    ...streaks,
                    lastActivityDate: streaks.lastActivityDate ? new Date(streaks.lastActivityDate).toISOString() : undefined,
                },
            }));
        }
    }, [streaks]);

    return null;
}

import React from "react";
