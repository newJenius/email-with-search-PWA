import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Confirm() {
  const [message, setMessage] = useState('Подтверждаем...');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmSession = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl();
  
      if (error) {
        setMessage('Ошибка подтверждения: ' + error.message);
        return;
      }
  
      const session = data.session;
      if (!session) {
        setMessage('Ошибка: сессия не найдена.');
        return;
      }
  
      setMessage('Email подтверждён! Начисляем бонус...');
  
      const user = session.user;
  
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
  
      if (!existingProfile && !profileError) {
        const { username, real_name } = user.user_metadata;
        const invitedBy = localStorage.getItem('invited_by') || null;
  
        await supabase.from('profiles').insert({
          id: user.id,
          username,
          real_name,
          balance: 500,
          invited_by: invitedBy,
        });
  
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
  
    confirmSession();
  }, []);
  

  return <div>{message}</div>;
}
