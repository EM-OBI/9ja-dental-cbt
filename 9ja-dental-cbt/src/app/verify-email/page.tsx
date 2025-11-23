"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/modules/auth/utils/auth-client";
import toast from "react-hot-toast";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            toast.error("Invalid verification link");
            return;
        }

        const verify = async () => {
            try {
                const { error } = await authClient.verifyEmail({
                    query: {
                        token,
                    },
                });

                if (error) {
                    console.error("Verification error:", error);
                    setStatus("error");
                    toast.error(error.message || "Verification failed");
                } else {
                    setStatus("success");
                    toast.success("Email verified successfully!");
                    setTimeout(() => {
                        router.push("/login?verified=true");
                    }, 2000);
                }
            } catch (err) {
                console.error("Unexpected verification error:", err);
                setStatus("error");
                toast.error("An unexpected error occurred");
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="bg-white dark:bg-card rounded-2xl shadow-xl border border-gray-200 dark:border-border p-8 w-full max-w-md text-center">
            {status === "verifying" && (
                <div className="py-8">
                    <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-2">
                        Verifying your email...
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please wait while we verify your account.
                    </p>
                </div>
            )}

            {status === "success" && (
                <div className="py-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-2">
                        Email Verified!
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Redirecting you to login...
                    </p>
                    <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin mx-auto" />
                </div>
            )}

            {status === "error" && (
                <div className="py-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </motion.div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-2">
                        Verification Failed
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The verification link is invalid or has expired.
                    </p>
                    <Button onClick={() => router.push("/login")} className="w-full">
                        Back to Login
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background p-4">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
