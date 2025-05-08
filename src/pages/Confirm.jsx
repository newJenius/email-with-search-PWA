import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function Confirm() {
  const [message, setMessage] = useState('Подтверждаем...');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  return navigate('/login');
  });
}
