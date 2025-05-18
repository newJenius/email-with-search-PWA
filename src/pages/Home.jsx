import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styless/SearchPage.css';
import '../styless/Home.css';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../components/uiContext';
import { FaBarsStaggered } from "react-icons/fa6";
import { FaInfo } from "react-icons/fa6";
import { FaTimes } from 'react-icons/fa';
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";




export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  // const { setBottomNavVisible } = useUI();

  // useEffect(() => {
  //   setBottomNavVisible(false);
  //   return () => setBottomNavVisible(true);
  // }, [setBottomNavVisible]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const searchUsers = async (value) => {
    setQuery(value);
    sessionStorage.setItem('search_query', value);

    if (!value) {
      setResults([]);
      sessionStorage.removeItem('search_results');
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, real_name, bio, avatar, sut_zaprosa, format_svyazi, hashtags_user')
      .or(`username.ilike.%${value}%,real_name.ilike.%${value}%,bio.ilike.%${value}%,sut_zaprosa.ilike.%${value}%,format_svyazi.ilike.%${value}%,hashtags_user.ilike.%${value}%`);

    if (!error) {
      setResults(data);
      sessionStorage.setItem('search_results', JSON.stringify(data));
    }
  };

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('search_query');
    const savedResults = sessionStorage.getItem('search_results');
  
    if (savedQuery) setQuery(savedQuery);
    if (savedResults) setResults(JSON.parse(savedResults));
  }, []);
  

  

  return (
    <div className="search-page-searchtab">
      <h2 className='header-nermes-logo-searchtab'>Nermes</h2>
      <div className="search-bar-searchtab relative">
      <IoIosSearch 
        className='search-icon-header-searchtab'
        size={16}
      />
        <input 
          ref={inputRef}
          className="search-input-searchtab"
          placeholder="Поиск человечности"
          value={query}
          onChange={(e) => searchUsers(e.target.value)}
        />
        {/* <button
          onClick={() => {
            sessionStorage.removeItem('search_query');
            sessionStorage.removeItem('search_results');
          }}
        className="search-cancel-searchtab">Cancel</button> */}

        {query && (
          <button 
            className="clear-button-searchtab"
            onClick={() => {
              setQuery('');
              setResults([]);
              sessionStorage.removeItem('search_query');
              sessionStorage.removeItem('search_results');
              inputRef.current?.focus(); // сразу вернуть фокус в поле
            }}
        >
          <FaTimes size={16} />
        </button>
        
        )}
      </div>

      {/* <div className='icon-bars-topbar-searchtab'> */}
        {/* <button className='bars-icon-searchtab'>
          <FaBarsStaggered size={18}/> 
        </button> */}

        {/* <button className='chat-icon-searchtab'
        onClick={() => navigate('/about')}>
          <FaInfo size={18}/>
        </button>
        </div> */}


        {query.trim() === '' && (
          <div className='card-containerr'>
        <div className="card-hm">
          <h2 className="card-title-hm">Платформа где инвестириуют в связи!</h2>
          <p className="card-subtitle-hm">Начните использовать поиск чтобы найти доступ к тем, кому в других местах не достучаться.</p>
        </div>
        </div>
      )}
      <ul className="search-results-searchtab">
        {results.map((user) => (
          <li key={user.id} 
            onClick={() => navigate('/profile/' + user.id)}
          className="search-result-item-searchtab">
            {/* <img src={user.avatar} alt="avatar" className="avatar-searchtab" /> */}
            <div className="user-details-searchtab">
              <span className="username-searchtab">{user.real_name}</span>
              <span className="bio-searchtab">{user.bio}</span>
              <span className='sut_zaprosa-searchtab'>{user.sut_zaprosa}</span>
              <span className='hashtags-searchtab'>{user.hashtags_user}</span>
            </div>
            {/* <button className="close-btn-searchtab">&times;</button> */}
          </li>
        ))}
      </ul>
    </div>
  );
}
