import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient.js";

import { UIProvider } from "./components/uiContext.jsx";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import BottomNav from "./components/BottomNav";
import SearchPage from "./pages/SearchPage";
import ProfileModal from "./pages/ProfileModal";
import ChatScreen from "./pages/ChatScreen";
import RegisterScreen from "./pages/RegisterScreen";
import Login from "./pages/Login";
import ChatListScreen from "./pages/ChatListScreen";
import AboutScreen from "./pages/AboutScreen.jsx";
import InviteModal from "./pages/InviteModal.jsx";
import InviteRedirect from "./pages/InvitedRedirect.jsx";
import InviteRegScreen from "./pages/InviteRegScreen.jsx";
import MessageListener from "./pages/MessageListener.jsx";
import Confirm from "./pages/Confirm.jsx";

function App() {
  const [isBottomNavVisible, setBottomNavVisible] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // например, установить глобальное состояние пользователя
        setUser(session.user);
      }
    };
    getSession();
  }, []);
  
  // Загрузка состояния из localStorage при первом рендере
  useEffect(() => {
    const saved = localStorage.getItem('ui-bottom-visible');
    if (saved !== null) {
      setBottomNavVisible(saved === 'true');
    }
  }, []);

  // Сохранение в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('ui-bottom-visible', isBottomNavVisible.toString());
  }, [isBottomNavVisible]);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);


  return (
    
    <UIProvider>
      <BrowserRouter>
      
        <div className="min-h-screen pb-16 bg-black">
      
          <Routes>
            <Route path="/invitereg" element={<InviteRegScreen />} />
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<ChatListScreen />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile/:id" element={<ProfileModal />} />
            <Route path="/chats/:id" element={<ChatScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<AboutScreen />} />
            <Route path="/invite" element={<InviteModal />} />
            <Route path="/invite/:username" element={<InviteRedirect />} />
            <Route path="/confirm" element={<Confirm />} />
            
          </Routes>
        
          
        </div>
        {userId && <MessageListener userId={userId}/>}
        {isBottomNavVisible && <BottomNav />}
      </BrowserRouter>
      
    </UIProvider>
  
    
  );
}

export default App;
