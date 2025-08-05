
"use client";
import React, { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);

  useEffect(() => {
    // Wait until loading is complete before checking for user profile
    if (!loading && !userProfile) {
      router.replace("/login");
    }
  }, [userProfile, loading, router]);

  // If loading, show a full-screen loader
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is finished and we have a user profile, render the app
  if (userProfile) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-1 flex-col md:ml-64">
          <Header setSidebarOpen={setSidebarOpen} userProfile={userProfile} />
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
              {children}
          </main>
        </div>
      </div>
    );
  }

  // If loading is finished and there's no user profile, the useEffect above will handle the redirect.
  // We can return a loader here as well to avoid a flash of content before redirect.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
