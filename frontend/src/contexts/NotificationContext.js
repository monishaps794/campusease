import React, { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);

  const addNotification = (message) => {
    setNotifications((prev) => [...prev, { id: Date.now(), message }]);
    setHasNew(true);
    console.log("🔔 Notification added:", message);
  };

  const clearNotification = () => {
    setHasNew(false);
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, clearNotification, hasNew }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
