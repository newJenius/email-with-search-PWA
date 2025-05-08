// src/pages/Confirm.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Confirm() {
  const [message, setMessage] = useState('Подтверждаем...');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
    
      if (error) {
        setMessage('Ошибка подтверждения: ' + error.message);
        return;
      }
    
      setMessage('Email подтверждён! Начисляем бонус...');
    
      const user = sessionData.session?.user;
      if (!user) {
        setMessage('Ошибка: не найден пользователь');
        return;
      }
    
      // Проверка: существует ли профиль
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
    
      if (!existingProfile && !profileError) {
        // Новый пользователь — создаём профиль
        const { username, real_name } = user.user_metadata;
        const invitedBy = localStorage.getItem('invited_by') || null;
    
        await supabase.from('profiles').insert({
          id: user.id,
          username,
          real_name,
          balance: 500,
          invited_by: invitedBy,
        });
    
        // Начисляем бонус пригласившему
        if (invitedBy) {
          await supabase.rpc('increment_balaance', {
            user_id: invitedBy,
            amount: 50,
          });
        }
      }
    
      setMessage('Бонус начислен! Перенаправляем...');
      setTimeout(() => navigate('/'), 2000);
    };
    
    confirmEmail();
  }, []);

  return <div>{message}</div>;
}
