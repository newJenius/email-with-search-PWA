// src/pages/Confirm.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Confirm() {
  const [message, setMessage] = useState('Подтверждаем...');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
      if (error) {
        setMessage('Ошибка подтверждения: ' + error.message);
      } else {
        setMessage('Email подтверждён! Перенаправляем...');
        setTimeout(() => navigate('/'), 2000);
      }
    };
    confirmEmail();
  }, []);

  return <div>{message}</div>;
}
