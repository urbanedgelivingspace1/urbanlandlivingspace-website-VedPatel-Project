"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

import {
  AdminTopNotification,
  type AdminNotificationType,
} from "@/components/admin/admin-top-notification";

type Notification = Readonly<{
  id: number;
  type: AdminNotificationType;
  title: string;
  message: string;
}>;

type PropertyEditGuardValue = Readonly<{
  isDirty: boolean;
  setDirty: (isDirty: boolean) => void;
  requestNavigation: () => boolean;
}>;

const PropertyEditGuardContext = createContext<PropertyEditGuardValue | null>(null);

export function PropertyEditGuard({
  savedNotice = false,
  children,
}: Readonly<{
  savedNotice?: boolean;
  children: React.ReactNode;
}>) {
  const [isDirty, setDirty] = useState(false);
  const notificationId = useRef(0);
  const [notification, setNotification] = useState<Notification | null>(() =>
    savedNotice
      ? {
          id: 0,
          type: "success",
          title: "Changes saved successfully.",
          message: "Your updates have been recorded.",
        }
      : null,
  );

  const requestNavigation = useCallback(() => {
    if (!isDirty) return true;

    notificationId.current += 1;
    setNotification({
      id: notificationId.current,
      type: "warning",
      title: "You have unsaved changes.",
      message: "Please save the changes to move forward to other sections.",
    });
    return false;
  }, [isDirty]);

  const value = useMemo(
    () => ({ isDirty, setDirty, requestNavigation }),
    [isDirty, requestNavigation],
  );

  return (
    <PropertyEditGuardContext.Provider value={value}>
      {notification ? (
        <AdminTopNotification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      ) : null}
      {children}
    </PropertyEditGuardContext.Provider>
  );
}

export function usePropertyEditGuard() {
  return useContext(PropertyEditGuardContext);
}
