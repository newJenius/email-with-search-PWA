import { supabase } from "../lib/supabaseClient"; // путь может отличаться
import { useNavigate } from "react-router-dom"; 

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Ошибка выхода:", error.message);
    } else {
      navigate.push("/login"); // или на главную
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
    >
      Выйти из аккаунта
    </button>
  );
}
