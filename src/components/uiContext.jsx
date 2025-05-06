import { createContext, useContext, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isBottomNavVisible, setBottomNavVisible] = useState(true);
  const [newMessage, setNewMessage] = useState(false);

  return (
    <UIContext.Provider value={{ isBottomNavVisible, setBottomNavVisible, newMessage,
      setNewMessage, }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
