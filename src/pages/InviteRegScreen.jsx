import { useState, useEffect } from 'react';
import '../styless/InviteRegScreen.css';
import { useUI } from '../components/uiContext';
import { supabase } from '../lib/supabaseClient'; // путь зависит от структуры
import { useNavigate } from 'react-router-dom';


export default function InviteRegScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { setBottomNavVisible } = useUI();
  const navigate = useNavigate();

  useEffect(() => {
    setBottomNavVisible(false);
    return () => setBottomNavVisible(true);
  }, [setBottomNavVisible]);

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      alert('Введите корректный email');
      return;
    }
  
    try {
      // 1. Проверка: зарегистрирован ли пользователь
      const { data: userData, error: userError } = await supabase
        .from('public_user_emails')
        .select('id')
        .eq('email', email)
        .maybeSingle();
  
      if (userError) {
        console.error('Ошибка при проверке users:', userError);
        alert('Что-то пошло не так. Попробуйте позже.');
        return;
      }
  
      if (userData) {
        // ✅ Уже зарегистрирован — ➡ login
        window.location.href = '/login?email=' + encodeURIComponent(email);
        return;
      }
  
      // 2. Проверка в waitlist
      const { data: waitlistEntry, error: waitlistError } = await supabase
        .from('waitlist')
        .select('id, approved')
        .eq('email', email)
        .maybeSingle();
  
      if (waitlistError) {
        console.error('Ошибка при проверке waitlist:', waitlistError);
        alert('Что-то пошло не так. Попробуйте позже.');
        return;
      }
  
      if (waitlistEntry?.approved === true) {
        // ✅ Одобрен, но не зарегистрирован — ➡ register
        window.location.href = '/register?email=' + encodeURIComponent(email);
        return;
      }
  
      if (waitlistEntry && waitlistEntry.approved === false) {
        alert('Вы уже подали заявку. Ожидайте одобрения.');
        return;
      }
  
      // 3. Если вообще нигде не найден — добавить в waitlist с approved = false
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert([{ email }]);
  
      if (insertError) {
        console.error('Ошибка при добавлении в waitlist:', insertError);
        alert('Ошибка. Попробуйте позже.');
        return;
      }
  
      setSubmitted(true);
    } catch (err) {
      console.error('Непредвиденная ошибка:', err);
      alert('Ошибка. Попробуйте позже.');
    }
  };
  
  
  

  return (
    <div className="invite-reg-container-invREG">
      <div className="invite-box-invREG">
        <h2>Оставить или проверить статус заявки</h2>
        <p>Мы уведомим вас, когда регистрация будет доступна</p>

        {submitted ? (
          <p className="success-message-invREG">Спасибо! Мы скоро с вами свяжемся.</p>
        ) : (
          <>
            <input
              type="email"
              placeholder="Введите ваш email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="invite-input-invREG"
            />
            <button className="invite-button-invREG" onClick={handleSubmit}>
              Оставить заявку
            </button>
          </>
        )}
      </div>
    </div>
  );
}
