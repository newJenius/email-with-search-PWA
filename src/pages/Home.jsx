import React, { useEffect, useState } from "react";
import "../styless/Home.css";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();

  //     if (!session || !session.user) {
  //       navigate("/register");
  //       return;
  //     }

  //     // Проверка, есть ли профиль
  //     const { data: profile, error } = await supabase
  //       .from("profiles")
  //       .select("id")
  //       .eq("id", session.user.id)
  //       .single();

  //     if (error || !profile) {
  //       navigate("/register");
  //     } else {
  //       setLoading(false);
  //     }
  //   };

  //   checkAuth();
  // }, [navigate]);

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="container-hm">
      <div className="main-hm">
        <div className="search-bar-hm" onClick={() => navigate('/search')}>
          <FiSearch size={18} className="search-icon-hm" />
          <span className="search-text-hm">Поиск человечности</span>
        </div>
        <div className="card-hm">
          <h2 className="card-title-hm">Платформа где доступны все люди мира!</h2>
          <p className="card-subtitle-hm">Начните использовать поиск чтобы найти доступ к тем, кто понимает.</p>
        </div>
        <p className="founder-link-hm">Страница основателя @founderNermes</p>
        <p className="founder-link2-hm">Для улучшений!</p>
      </div>
    </div>
  );
}
