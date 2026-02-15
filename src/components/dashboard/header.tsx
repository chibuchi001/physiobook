"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Calendar,
  Camera,
  Home,
  LineChart,
  Menu,
  Search,
  Settings,
  Stethoscope,
  Users,
  Video,
  X,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Book Appointment", href: "/book", icon: Calendar },
  { name: "My Appointments", href: "/appointments", icon: Stethoscope },
  { name: "Progress", href: "/progress", icon: LineChart },
  { name: "Exercises", href: "/exercises", icon: Camera },
  { name: "Find Therapists", href: "/therapists", icon: Users },
  { name: "Tele-Physio", href: "/tele-physio", icon: Video },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get current page title
  const currentPage = navigation.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200 lg:hidden" />

        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          {/* Search */}
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search appointments, therapists..."
              className="h-10 w-full max-w-md rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:bg-white focus:border-physio-300 focus:ring-1 focus:ring-physio-300 transition-colors"
            />
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-500" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
            </Button>

            {/* Separator */}
            <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

            {/* Profile */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="relative z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/80"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white">
            <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-200">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-physio-500 to-health-500 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  PhysioBook
                </span>
              </Link>
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col p-4">
              <ul role="list" className="space-y-1">
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "group flex gap-x-3 rounded-xl p-3 text-sm font-medium transition-all",
                          isActive
                            ? "bg-physio-50 text-physio-700"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5 shrink-0",
                            isActive
                              ? "text-physio-600"
                              : "text-gray-400 group-hover:text-gray-600"
                          )}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
