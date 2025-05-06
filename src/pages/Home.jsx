import React from "react";
import "../styless/Home.css";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container-hm">
      {/* Header */}
      {/* <div className="header-hm">
        <h1 className="logo-hm">napo.</h1>
        <FiSearch size={24} className="search-icon-hm" />
      </div> */}

      {/* Main */}
      <div className="main-hm">
        <div className="search-bar-hm" onClick={() => navigate('/search')}>
          <FiSearch size={18} className="search-icon-hm" /> 
          <span className="search-text-hm">Поиск человечности</span>
        </div>

        <div className="card-hm">
          <h2 className="card-title-hm">Платформа где доступны все люди мира!</h2>
          <p className="card-subtitle-hm">Начните использовать поиск чтобы
             найти доступ к тем, кто понимает.</p>
        </div>

        <p className="founder-link-hm">Страница основателя @founderNermes</p>
        <p className="founder-link2-hm">Для улучшений!</p>
      </div>
    </div>
  );
}

