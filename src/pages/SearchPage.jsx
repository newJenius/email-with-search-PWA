import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styless/SearchPage.css';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);

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
      .select('id, username, real_name, bio, avatar, about_me')
      .or(`username.ilike.%${value}%,real_name.ilike.%${value}%,bio.ilike.%${value}%,about_me.ilike.%${value}%`);

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
      <div className="search-bar-searchtab">
        <input 
          ref={inputRef}
          className="search-input-searchtab"
          placeholder="Search"
          value={query}
          onChange={(e) => searchUsers(e.target.value)}
        />
        <button
          onClick={() => {
            sessionStorage.removeItem('search_query');
            sessionStorage.removeItem('search_results');
            navigate('/')
          }}
        className="search-cancel-searchtab">Cancel</button>
      </div>

      <ul className="search-results-searchtab">
        {results.map((user) => (
          <li key={user.id} 
            onClick={() => navigate('/profile/' + user.id)}
          className="search-result-item-searchtab">
            <img src={user.avatar} alt="avatar" className="avatar-searchtab" />
            <div className="user-details-searchtab">
              <span className="username-searchtab">{user.real_name}</span>
              <span className="bio-searchtab">{user.bio}</span>
            </div>
            {/* <button className="close-btn-searchtab">&times;</button> */}
          </li>
        ))}
      </ul>
    </div>
  );
}
