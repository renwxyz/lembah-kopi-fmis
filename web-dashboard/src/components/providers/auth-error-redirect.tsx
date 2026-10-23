"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";

function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function AuthErrorRedirect() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const isRedirecting = useRef(false);

  useEffect(() => {
    const redirectToLogin = (error: unknown) => {
      if (
        pathname === "/login" ||
        isRedirecting.current ||
        !isUnauthorizedError(error)
      ) {
        return;
      }

      isRedirecting.current = true;
      queryClient.clear();
      router.replace("/login");
    };

    const unsubscribeQueries = queryClient
      .getQueryCache()
      .subscribe((event) => {
        if (event.type === "updated" && event.query.state.status === "error") {
          redirectToLogin(event.query.state.error);
        }
      });
    const unsubscribeMutations = queryClient
      .getMutationCache()
      .subscribe((event) => {
        if (
          event.type === "updated" &&
          event.mutation.state.status === "error"
        ) {
          redirectToLogin(event.mutation.state.error);
        }
      });

    return () => {
      unsubscribeQueries();
      unsubscribeMutations();
    };
  }, [pathname, queryClient, router]);

  return null;
}
