import { Link, useLocation } from "react-router-dom";
import { AiFillHome, AiOutlineMessage, AiOutlineUser } from "react-icons/ai";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { useUI } from "./uiContext.jsx";
import { Badge } from 'lucide-react';

export default function BottomNav() {
  const {isBottomNavVisible} = useUI();
  const location = useLocation();
  const { newMessage } = useUI();

  if(!isBottomNavVisible) return null;

  const tabs = [
    { path: "/", icon: <AiFillHome size={28} /> },
    { path: "/chat", icon: <AiOutlineMessage size={28} />},
    // { path: "/about", icon: <IoIosInformationCircleOutline size={32} />},
    { path: "/profile", icon: <AiOutlineUser size={28} />},
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "50px",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "black",
        borderTop: "0px solid #333",
        zIndex: 9999,
      }}
    >
      {tabs.map(({ path, icon, label }) => {
        const isActive = location.pathname === path;
        const isChat = path === "/chat";
        return (
          <Link
            key={path}
            to={path}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: isActive ? "#0067ff" : "#888",
              textDecoration: "none",
              fontSize: "12px",
              gap: "3px",
            }}
          >
           <div style={{ position: "relative" }}>
            {icon}
            {isChat && newMessage && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -6,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "red",
                }}
              />
            )}
          </div>
        </Link>
        );
      })}
    </nav>
  );
}
