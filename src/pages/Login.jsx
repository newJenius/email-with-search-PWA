import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styless/Login.css';
import { useUI } from '../components/uiContext';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const {setBottomNavVisible} = useUI();

  const initialEmail = location.state?.email || new URLSearchParams(location.search).get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(true);
  const [emailApproved, setEmailApproved] = useState(true);
  
  
  useEffect(() => {
    setBottomNavVisible(false);
    return () => setBottomNavVisible(true);
  }, [setBottomNavVisible]);

  useEffect(() => {
    if(!initialEmail){
      setCheckingEmail(false);
      return;
    }

    const verifyEmailExists = async () => {
      const { data, error } = await supabase
        .from('public_user_emails')
        .select('id')
        .eq('email', initialEmail)
        .maybeSingle();
  
      if (!data || error) {
        setEmailApproved(false);
      }
      setCheckingEmail(false);
    };

    verifyEmailExists();
  }, [initialEmail]);
  

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
    if (error) {
      alert('Ошибка входа: ' + error.message);
    } else {
      // Успешный вход
      if (data?.session) {
        localStorage.setItem('supabase.session', JSON.stringify(data.session));
      }
      navigate('/'); // или '/profile'
    }
  };
  

  
//  

  if(checkingEmail){
    return <p className='login-container-lg'>Проверка email...</p>;
  }

  if(!emailApproved){
    return(
      <div className='login-container-lg'>
        <h1>Ошибка</h1>
        <p>Этот email не зарегистрирован или доступ ограничен. Убедитесь, что вы используете правильную ссылку.</p>
      </div>
    );
  }

  return (
    <div className="login-container-lg">
        <h1>Войти в аккаунт</h1>
        <p>Введите данные от аккаунта чтобы продолжить!</p>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input-lg"
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input-lg"
      />
      <div className="spacer-lg" />
      <button onClick={handleSignIn} className="login-button-lg">Войти</button>
    </div>
  );
}
