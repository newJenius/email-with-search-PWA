// InviteRedirect.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function InviteRedirect() {
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (data) {
        localStorage.setItem('invited_by', data.id); // id пригласившего
        localStorage.setItem('invited_by_username', username); // на всякий
        navigate(`/register?mode=invite&by=${username}`);
      } else {
        alert('Неверная ссылка приглашения');
        navigate('/invitereg');
      }
    })();
  }, [username, navigate]);

  return null;
}
