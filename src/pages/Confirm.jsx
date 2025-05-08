import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Confirm() {
  const [message, setMessage] = useState('Подтверждаем...');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const confirm = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (!code) {
        setMessage('Ошибка: ссылка некорректна или устарела.');
        return;
      }

      // ВАЖНО: здесь вызывается exchangeCodeForSession
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Ошибка подтверждения:', error);
        setMessage(`Ошибка подтверждения: ${error.message}`);
        return;
      }

      const user = data.session.user;

      setMessage('Email подтверждён! Начисляем бонус...');

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
      setTimeout(() => navigate('/login'), 2000);
    };

    confirm();
  }, []);

  return <div>{message}</div>;
}
