"use client";

import React from "react";
import { Crown, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/store/userStore";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  className?: string;
}

export function SubscriptionCard({ className }: SubscriptionCardProps) {
  const { user } = useUserStore();

  if (!user) return null;

  const subscription = user.subscription;
  const isFreePlan = subscription === "free";
  const isPremium = subscription === "premium";
  const isEnterprise = subscription === "enterprise";

  // Mock subscription data - replace with real data from your backend
  const subscriptionData = {
    free: {
      name: "Free Plan",
      description: "Basic access to dental CBT questions",
      features: [
        "50 questions per month",
        "Basic analytics",
        "Community support",
      ],
      price: "$0",
      billing: "Always free",
      nextBilling: null,
    },
    premium: {
      name: "Premium Plan",
      description: "Enhanced learning experience",
      features: [
        "Unlimited questions",
        "Advanced analytics",
        "Priority support",
        "Custom study plans",
        "Offline access",
      ],
      price: "$19.99",
      billing: "Monthly",
      nextBilling: "2025-10-09", // Mock next billing date
    },
    enterprise: {
      name: "Enterprise Plan",
      description: "Full institutional access",
      features: [
        "Everything in Premium",
        "Team management",
        "Custom branding",
        "API access",
        "Dedicated support",
      ],
      price: "$99.99",
      billing: "Monthly",
      nextBilling: "2025-10-09", // Mock next billing date
    },
  };

  const currentPlan = subscriptionData[subscription];

  const handleUpgrade = () => {
    // In a real app, this would redirect to the payment page
    console.log("Redirect to upgrade page");
    // router.push('/dashboard/subscription/upgrade');
  };

  const handleCancelSubscription = () => {
    // In a real app, this would show a confirmation dialog and handle cancellation
    console.log("Cancel subscription");
    // Show confirmation dialog
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "p-2 rounded-full",
                isFreePlan && "bg-gray-100 dark:bg-gray-800",
                isPremium && "bg-blue-100 dark:bg-blue-900/30",
                isEnterprise && "bg-purple-100 dark:bg-purple-900/30"
              )}
            >
              <Crown
                className={cn(
                  "h-6 w-6",
                  isFreePlan && "text-gray-500",
                  isPremium && "text-blue-600 dark:text-blue-400",
                  isEnterprise && "text-purple-600 dark:text-purple-400"
                )}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{currentPlan.name}</h3>
              <p className="text-muted-foreground">{currentPlan.description}</p>
            </div>
          </div>
          <Badge
            variant={isFreePlan ? "secondary" : "default"}
            className={cn(
              isPremium && "bg-blue-500 hover:bg-blue-600",
              isEnterprise && "bg-purple-500 hover:bg-purple-600"
            )}
          >
            Current Plan
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3">Plan Features</h4>
            <ul className="space-y-2">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Billing Information</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="font-semibold">{currentPlan.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Billing</span>
                  <span className="text-sm">{currentPlan.billing}</span>
                </div>
                {currentPlan.nextBilling && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Next billing
                    </span>
                    <span className="text-sm">
                      {formatDate(currentPlan.nextBilling)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {currentPlan.nextBilling && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  Your subscription renews on{" "}
                  {formatDate(currentPlan.nextBilling)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Upgrade Options */}
      {isFreePlan && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3 mb-4">
            <Crown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold">Upgrade to Premium</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Unlock unlimited access to all dental CBT questions and advanced
            features.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleUpgrade}
              className="flex items-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>Upgrade to Premium</span>
            </Button>
            <Button variant="outline">View All Plans</Button>
          </div>
        </Card>
      )}

      {/* Subscription Management */}
      {!isFreePlan && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Subscription Management
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Update Payment Method</span>
            </Button>
            <Button variant="outline">View Billing History</Button>
            {isPremium && (
              <Button
                onClick={handleUpgrade}
                className="flex items-center space-x-2"
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade to Enterprise</span>
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              className="flex items-center space-x-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Cancel Subscription</span>
            </Button>
          </div>
        </Card>
      )}

      {/* Plan Comparison */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Compare Plans</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Feature</th>
                <th className="text-center py-2">Free</th>
                <th className="text-center py-2">Premium</th>
                <th className="text-center py-2">Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b">
                <td className="py-2">Questions per month</td>
                <td className="text-center">50</td>
                <td className="text-center">Unlimited</td>
                <td className="text-center">Unlimited</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Advanced analytics</td>
                <td className="text-center">❌</td>
                <td className="text-center">✅</td>
                <td className="text-center">✅</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Priority support</td>
                <td className="text-center">❌</td>
                <td className="text-center">✅</td>
                <td className="text-center">✅</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Team management</td>
                <td className="text-center">❌</td>
                <td className="text-center">❌</td>
                <td className="text-center">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
