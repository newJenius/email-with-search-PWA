import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useUI } from "../components/uiContext";
import { supabase } from "../lib/supabaseClient"; // путь к клиенту Supabase

export default function MessageListener({ userId }) {
  const { setNewMessage } = useUI();
  const location = useLocation();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('new-message-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`, // ← подставь имя поля
        },
        (payload) => {
          if (location.pathname !== "/chat") {
            setNewMessage(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, location.pathname, setNewMessage]);

  // Сброс когда заходим в чат
  useEffect(() => {
    if (location.pathname === "/chat") {
      setNewMessage(false);
    }
  }, [location.pathname, setNewMessage]);

  return null;
}
