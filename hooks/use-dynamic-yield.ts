"use client";

import { useEffect, useState, useCallback } from "react";
import type { DYObject, DYEventProperties, DYUserContext } from "@/dy/types";

/**
 * Hook to interact with Dynamic Yield client-side API
 *
 * @returns {Object} - DY utilities and state
 * - isReady: boolean indicating if DY API is loaded and ready
 * - DY: the DY object or null
 * - sendEvent: function to send custom events
 * - setUserContext: function to set user context
 */
export function useDynamicYield() {
  const [isReady, setIsReady] = useState(false);
  const [DY, setDY] = useState<DYObject | null>(null);

  useEffect(() => {
    // Check if DY is already loaded
    if (typeof window !== "undefined" && window.DY?.API) {
      setDY(window.DY);
      setIsReady(true);
      return;
    }

    // Poll for DY to be ready
    const checkDY = setInterval(() => {
      if (typeof window !== "undefined" && window.DY?.API) {
        setDY(window.DY);
        setIsReady(true);
        clearInterval(checkDY);
      }
    }, 100);

    // Cleanup after 10 seconds if DY never loads
    const timeout = setTimeout(() => {
      clearInterval(checkDY);
      console.warn("Dynamic Yield failed to load within 10 seconds");
    }, 10000);

    return () => {
      clearInterval(checkDY);
      clearTimeout(timeout);
    };
  }, []);

  /**
   * Send a custom event to Dynamic Yield
   */
  const sendEvent = useCallback(
    (eventName: string, properties?: DYEventProperties) => {
      if (!isReady || !DY?.API) {
        console.warn("DY not ready, event not sent:", eventName);
        return false;
      }

      try {
        DY.API("event", {
          name: eventName,
          properties,
        });
        return true;
      } catch (error) {
        console.error("Error sending DY event:", error);
        return false;
      }
    },
    [isReady, DY]
  );

  /**
   * Set user context in Dynamic Yield
   */
  const setUserContext = useCallback(
    (user: DYUserContext) => {
      if (!isReady || !DY?.API) {
        console.warn("DY not ready, user context not set");
        return false;
      }

      try {
        DY.API("setContext", { user });
        return true;
      } catch (error) {
        console.error("Error setting DY user context:", error);
        return false;
      }
    },
    [isReady, DY]
  );

  return {
    isReady,
    DY,
    sendEvent,
    setUserContext,
  };
}


