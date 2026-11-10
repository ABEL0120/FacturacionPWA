import { createContext } from "react";
import { NotificationContextValue } from "../types/notification.types";

export const NotificationContext = createContext<
  NotificationContextValue | undefined
>(undefined);

