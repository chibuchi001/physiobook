"use client";

import { useState } from "react";
import { UserProfile } from "@clerk/nextjs";
import {
  Bell,
  CreditCard,
  Shield,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    current: true,
    features: [
      "2 appointments per month",
      "Basic triage assessment",
      "Email reminders",
    ],
  },
  {
    name: "Basic",
    price: "$29",
    current: false,
    popular: true,
    features: [
      "10 appointments per month",
      "AI-powered triage",
      "Smart therapist matching",
      "SMS reminders",
      "Tele-physio sessions",
    ],
  },
  {
    name: "Pro",
    price: "$79",
    current: false,
    features: [
      "Unlimited appointments",
      "Priority AI triage",
      "VIP therapist matching",
      "AI exercise guidance",
      "Voice agent support",
      "Family accounts (up to 4)",
    ],
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({
    appointmentReminders: true,
    exerciseReminders: true,
    progressUpdates: false,
    promotionalEmails: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors",
                activeTab === tab.id
                  ? "bg-physio-50 text-physio-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <tab.icon
                className={cn(
                  "w-5 h-5",
                  activeTab === tab.id ? "text-physio-600" : "text-gray-400"
                )}
              />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <Card>
              <CardContent className="p-6">
                <UserProfile
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none p-0",
                      navbar: "hidden",
                      pageScrollBox: "p-0",
                    },
                  }}
                />
              </CardContent>
            </Card>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-physio-50 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900">Free Plan</h3>
                      <p className="text-sm text-gray-500">
                        2 appointments remaining this month
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-physio-100 text-physio-700 text-sm font-medium rounded-full">
                      Active
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <Card
                    key={plan.name}
                    className={cn(
                      "relative",
                      plan.popular && "ring-2 ring-physio-500"
                    )}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-physio-500 text-white text-xs font-medium rounded-full">
                        Most Popular
                      </div>
                    )}
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <div className="mb-4">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        {plan.price !== "$0" && (
                          <span className="text-gray-500">/mo</span>
                        )}
                      </div>
                      <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <span className="text-physio-500">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={cn(
                          "w-full",
                          plan.current
                            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                            : "bg-physio-600 hover:bg-physio-700"
                        )}
                        disabled={plan.current}
                      >
                        {plan.current ? "Current Plan" : "Upgrade"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Appointment Reminders</h4>
                    <p className="text-sm text-gray-500">Get reminded before your appointments</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.appointmentReminders}
                      onChange={() => toggleNotification("appointmentReminders")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-physio-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-physio-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Exercise Reminders</h4>
                    <p className="text-sm text-gray-500">Daily reminders to complete your exercises</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.exerciseReminders}
                      onChange={() => toggleNotification("exerciseReminders")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-physio-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-physio-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Progress Updates</h4>
                    <p className="text-sm text-gray-500">Weekly summary of your recovery progress</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.progressUpdates}
                      onChange={() => toggleNotification("progressUpdates")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-physio-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-physio-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-medium text-gray-900">Promotional Emails</h4>
                    <p className="text-sm text-gray-500">News about new features and offers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.promotionalEmails}
                      onChange={() => toggleNotification("promotionalEmails")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-physio-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-physio-600"></div>
                  </label>
                </div>

                <Button className="mt-4 bg-physio-600 hover:bg-physio-700">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 text-green-700">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium">Your data is protected</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      All your health information is encrypted and stored securely in compliance with HIPAA regulations.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Data Management</h4>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h5 className="font-medium text-gray-900">Download My Data</h5>
                        <p className="text-sm text-gray-500">Get a copy of all your data</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h5 className="font-medium text-gray-900">Delete Account</h5>
                        <p className="text-sm text-gray-500">Permanently delete your account and data</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h5 className="font-medium text-gray-900">Two-Factor Authentication</h5>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <h5 className="font-medium text-gray-900">Active Sessions</h5>
                      <p className="text-sm text-gray-500">Manage your logged-in devices</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
