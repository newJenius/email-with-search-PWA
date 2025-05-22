import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styless/Profile.css";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState({
    username: "",
    real_name: "",
    bio: "",
    price_per_message: "",
    about_me: "",
    avatar: "",
    sut_zaprosa: "",
    hashtags_user: "",
    format_svyazi: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
  
    if (error || !user) {
      setUserId(null);
      setLoading(false);
      return;
    }
  
    setUserId(user.id);
  
    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
  
    if (profileError) console.error(profileError);
    else setProfile(data);
  
    setLoading(false);
  };
  

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = fileName;


    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      return;
    }

    const { data: urlData, error: urlError } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    if (urlError) {
      console.error("Ошибка при получении публичного URL:", urlError);
      return;
    }

    const publicUrl = urlData.publicUrl;


    const {error: updateError } = await supabase
      .from("profiles")
      .update({ avatar: publicUrl })
      .eq("id", userId);

    if(updateError){
      console.error("Update error:", updateError);
      return;
    }

    setProfile({ ...profile, avatar: publicUrl });
  };

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
  
    // Проверка пустых обязательных полей
    if (
      !profile.real_name.trim() ||
      !profile.bio.trim() ||
      !profile.sut_zaprosa.trim() ||
      !profile.price_per_message.toString().trim()
    ) {
      alert("Пожалуйста, заполните все поля профиля.");
      return;
    }
  
    const updates = {
      ...profile,
      id: user.id,
    };

    if (profile.real_name.length > 60 || profile.bio.length > 80 || profile.sut_zaprosa.length > 320 || profile.format_svyazi.length > 120 || profile.hashtags_user.length > 500) {
      alert("Некоторые поля превышают допустимую длину.");
      return;
    }
    
  
    const { error } = await supabase.from("profiles").upsert(updates);
    if (error) console.error(error);
    else alert("Профиль сохранён.");
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Ошибка при выходе из аккаунта:", error);
      return;
    }
    navigate("/register"); // Или другой маршрут, куда должен попасть пользователь
  };
  


  if(loading){
    return <div className="loading-screen-prof">Загрузка...</div>;
  }

  if (!userId) {
    return (
      <div className="reg-profile-container-prof">
        <button onClick={() => navigate('/register')} className="regis-button-prof">Зарегистрироваться</button>
      </div>
    );
  }


  
  return (
    <div className="profile-container-prof">
      <div className="avatar-preview-prof">
        {profile.avatar ? (
          <img
            src={profile.avatar}
            className="avatar-image-prof"
            alt="avatar"
          />
        ) : (
          "Photo Avatar"
        )}
      </div>

      <input
        className="input-image-file-prof"
        type="file"
        accept="image/*"
        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
      />
      <button className='change-img-btn-prof' onClick={handleAvatarUpload}>Сменить фото профиля</button>
      <p className="wiki-style-prof">*Ваш профиль - не анкета, не биография. Это условия связи с вами!</p>

      <Field
        label="Имя"
        placeholder="Тони Старк"
        value={profile.real_name}
        onChange={(v) => setProfile({ ...profile, real_name: v })}
        maxLength={60}
      />
      <Field
        label="Краткое описание себя"
        placeholder="Гений, Миллиардер, Плэйбой, Филантроп."
        value={profile.bio}
        onChange={(v) => setProfile({ ...profile, bio: v })}
        maxLength={80}
      />
      <Field
        label="Цена за связь с вами"
        type="number"
        value={profile.price_per_message}
        onChange={(v) =>
          setProfile({ ...profile, price_per_message: v })
        }
      />
      <div className="form-field-prof about-section">
        <label className="field-label-prof">Суть запроса ко мне</label>
        <textarea
          value={profile.sut_zaprosa}
          className="about-text-input-prof"
          placeholder="Пишите о том, что делает вас вами."
          onChange={(e) => setProfile({ ...profile, sut_zaprosa: e.target.value })}
          maxLength={320}
        />
      </div>

      <div className="form-field-prof about-section">
        <label className="field-label-prof">Формат связи</label>
        <textarea
          value={profile.format_svyazi}
          className="about2-text-input-prof"
          placeholder="Предпочитаю краткие и конкретные сообщения."
          onChange={(e) => setProfile({ ...profile, format_svyazi: e.target.value })}
          maxLength={120}
        />
      </div>

      <div className="form-field-prof hashtags-section">
        <label className="field-label-prof">Хэштеги</label>
        <textarea
          value={profile.hashtags_user}
          className="hashtags-text-input-prof"
          placeholder="Для поисковика."
          onChange={(e) => setProfile({ ...profile, hashtags_user: e.target.value })}
          maxLength={500}
        />
      </div>

      <button className="save-button-prof" onClick={saveProfile}>
        Сохранить Профиль
      </button>

      <button className="logout-button-prof" onClick={handleLogout}>
        Выйти из аккаунта
      </button>


    </div>
  );
}

function Field({ label, value, onChange, textarea = false, type = "text", placeholder= "" }) {
  return (
    <div className="form-field-prof">
      <label className="field-label-prof">{label}</label>
      {textarea ? (
        <textarea
          className="text-input-prof"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="text-input-prof"
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
