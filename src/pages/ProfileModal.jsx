import React, { useEffect, useState } from 'react';
import '../styless/ProfileModal.css';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { useUI } from '../components/uiContext';

export default function ProfileModal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const {setBottomNavVisible} = useUI();

    

  const fetchProfile = async () => {
    if (!id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, real_name, avatar, bio, about_me, price_per_message')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Ошибка загрузки профиля:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    setBottomNavVisible(false);
    fetchProfile();
    return () => setBottomNavVisible(true);
  }, [id]);

  const handleMessagePress = async () => {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
      navigate('/register');
    } else {
      navigate(`/chats/${profile.id}`);
    }
  };




  if (loading) return <div className="centered-pf-modal"></div>;
  if (!profile) return <div className="centered-pf-modal">Profile not found.</div>;

  return (
    <div className="profile-modal-pf-modal">
      <button className="close-btn-pf-modal" onClick={() => navigate(-1)}>&times;</button>

      <div className='avatar-container-pf-modal'>
      <div className="avatar-box-pf-modal">
        {profile.avatar ? (
          <img src={profile.avatar} alt="Avatar" className="avatar-pf-modal" />
          
        ) : (
          <div className="avatar placeholder-pf-modal" />
        )}
         <h2 className='real_name-pf-modal'>{profile.real_name}</h2>
         <p className='bio-pf-modal'>{profile.bio || 'No bio yet.'}</p>
      </div>
      </div>
      
      <div className='otkrit-k-pf-podal'>
        <p className='otkrit-k-text-pf-modal'>Открыт к...</p>
        <p className='otkrit-k-subtext-pf-modal'>Готов отвечать на техвопросы и обсуждать коллаборации.</p>
      </div>

      <div className='format-sv-pf-modal'>
        <p className='format-sv-text-pf-modal'>Формат связи</p>
        <p className='format-sv-subtext-pf-modal'>Предпочитаю краткие и конкретные сообщения. Отвечаю в течение 2 дней.</p>
      </div>

      <div className='hashtags-pf-modal'>
        <p className='hashtags-text-pf-modal'>Хэштеги</p>
        <p className='hashtags-subtext-pf-modal'>#csgoawp#3k#csgohighlights#csgotips#csgoedit#video
          #freecsgoknife#steelseries#csclips
          #stream#shroud#steam#faceit#play</p>
      </div>

      <div className='comments-pf-modal'>
        <p className='comments-text-pf-modal'>Посмотреть отзывы других людей</p>
      </div>
     
      
      <p className="username-pf-modal">@{profile.username}</p>
      <div className='border-bottom-pf-modal'></div>

      {/* <div className="about_me-box-pf-modal">
        <p>{profile.about_me || 'Пользователь не ввел данные.'}</p>
      </div> */}

      <div className='message-btn-field-pd-modal'>
          <button className="message-btn-pf-modal" onClick={handleMessagePress}>
            Связаться с человеком за {profile.price_per_message} доступов
          </button>
        </div>
    </div>
  );
}
