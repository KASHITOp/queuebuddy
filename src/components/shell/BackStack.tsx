'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { onNativeBackButton } from '@/lib/capacitor';

type Handler = () => void;

interface BackStackApi {
  push: (handler: Handler) => () => void;
}

const BackStackContext = createContext<BackStackApi | null>(null);

/**
 * Android back button routing. Open sheets and pushed screens register a handler; the newest one wins.
 * With nothing open, `onRoot` decides (e.g. go to the Home tab) and returning false exits the app.
 */
export const BackStackProvider: React.FC<{ onRoot: () => boolean; children: React.ReactNode }> = ({
  onRoot,
  children,
}) => {
  const stack = useRef<Handler[]>([]);
  const onRootRef = useRef(onRoot);
  onRootRef.current = onRoot;

  useEffect(
    () =>
      onNativeBackButton(() => {
        const top = stack.current[stack.current.length - 1];
        if (top) {
          top();
          return true;
        }
        return onRootRef.current();
      }),
    []
  );

  const api = useRef<BackStackApi>({
    push: (handler) => {
      stack.current.push(handler);
      return () => {
        stack.current = stack.current.filter((h) => h !== handler);
      };
    },
  });

  return <BackStackContext.Provider value={api.current}>{children}</BackStackContext.Provider>;
};

/** While `active`, the Android back button calls `handler` instead of leaving the screen. */
export const useBackHandler = (active: boolean, handler: Handler) => {
  const ctx = useContext(BackStackContext);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active || !ctx) return;
    return ctx.push(() => handlerRef.current());
  }, [active, ctx]);
};
