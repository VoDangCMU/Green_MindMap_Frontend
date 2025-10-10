"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const publicRoutes = ["/login"];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuth, isLoading, isHydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isHydrated && !isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!isAuth && !isPublicRoute) {
        // Redirect to login if not authenticated and not on a public route
        router.push("/login");
      } else if (isAuth && pathname === "/login") {
        // Redirect to dashboard if authenticated and on login page
        router.push("/dashboard");
      }
    }
  }, [isAuth, isLoading, isHydrated, pathname, router]);

  // Show loading spinner while hydrating or checking authentication
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render protected content if not authenticated
  const isPublicRoute = publicRoutes.includes(pathname);
  if (!isAuth && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
}
