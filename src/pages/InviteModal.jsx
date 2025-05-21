import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styless/InviteModal.css'

export default function InviteModal({ onClose }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [claimAvailable, setClaimAvailable] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const checkClaimStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('last_claimed_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Ошибка при проверке бонуса:', error);
        return;
      }

      const now = new Date();
      const today8AM = new Date();
      today8AM.setHours(8, 0, 0, 0);
      if (now < today8AM) today8AM.setDate(today8AM.getDate() - 1); // если раньше 8 утра — берем вчера

      const lastClaimed = data?.last_claimed_at ? new Date(data.last_claimed_at) : null;

      if (!lastClaimed || lastClaimed < today8AM) {
        setClaimAvailable(true);
      }
    };

    checkClaimStatus();
  }, []);


  useEffect(() => {
    const fetchUsername = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Ошибка при получении username:', error);
        return;
      }

      setUsername(data.username);
      setLoading(false);
    };

    fetchUsername();
  }, []);

  const link = `${window.location.origin}/invite/${username}`;
  // `${window.location.origin}/invite/${username}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    alert("Ссылка скопирована");
  };

  const handleClaim = async () => {
    setClaiming(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
  
    const { error: updateError } = await supabase.rpc('claim_daily_reward', {
      user_id_input: user.id
    });
  
    if (updateError) {
      alert("Ошибка при начислении монет");
      console.error(updateError);
      setClaiming(false);
      return;
    }
  
    alert("Вы получили 25 монет!");
    setClaimAvailable(false);
    setClaiming(false);
  };
  

  if (loading) return <p className='loading-im'>Загрузка...</p>;

  return (
    <div className='invitemodall-container-im'>
      <div className='invitemodall-im'>
      
      <h1 className='h1-im'>Работы еще ведутся!!!</h1>
      {/*<h3>Пригласи друга</h3>
      <p>Скопируй ссылку и получи бонус:</p>
      <input value={link} readOnly style={{ width: '100%' }} />
      <button onClick={copy}>Скопировать</button>
      <button onClick={onClose}>Закрыть</button> */}

        {/* <h2>Еще ведутся работы!!!</h2> */}

        <h2>Ежедневная награда</h2>
      <div className='btn-claim-container-im'>
      {claimAvailable ? (
        <button className='btn-claim-im' onClick={handleClaim} disabled={claiming}>
          {claiming ? "Загрузка..." : "Получить +25 доступов"}
        </button>
      ) : (
         <p>Бонус уже получен сегодня</p>
      )}
      </div>

      {/* <h2>Задания (в будущем)</h2>
      <p>Заполнить профиль</p>
      <p>пригласить друзей. за каждого 50 доступов</p> */}

      </div>
    </div>
  );
}
