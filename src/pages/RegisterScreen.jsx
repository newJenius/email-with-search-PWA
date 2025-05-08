import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styless/RegisterScreen.css';
import { useUI } from '../components/uiContext';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [realName, setRealName] = useState('');
  const [password, setPassword] = useState('');
  const [emailApproved, setEmailApproved] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { setBottomNavVisible } = useUI();

  const invitedBy = localStorage.getItem('invited_by');
  const invitedByUsername = localStorage.getItem('invited_by_username');

  useEffect(() => {
    setBottomNavVisible(false);
    return () => setBottomNavVisible(true);
  }, [setBottomNavVisible]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const inviterUsername = params.get('by');
    const mode = params.get('mode');
    const emailParam = params.get('email'); // извлекаем email, если есть

    const isInviteMode = mode === 'invite' && inviterUsername;

    (async () => {
      if (emailParam) {
        setEmail(emailParam);
        const { data, error } = await supabase
          .from('waitlist')
          .select('approved')
          .eq('email', emailParam)
          .single();

        if (error || !data || !data.approved) {
          setEmailApproved(false);
        } else {
          setEmailApproved(true);
        }
        setCheckingEmail(false);
        return;
      }

      if (isInviteMode && inviterUsername) {
        const { data: inviterProfile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', inviterUsername)
          .single();

        if (error || !inviterProfile) {
          console.warn('Неверный username в ссылке приглашения');
          setEmailApproved(false);
        } else {
          localStorage.setItem('invited_by', inviterProfile.id);
          localStorage.setItem('invited_by_username', inviterUsername);
          setEmailApproved(true);
        }

        setCheckingEmail(false);
        return;
      }

      // если нет email и нет валидного инвайта
      setCheckingEmail(false);
      setEmailApproved(false);
    })();
  }, [location.search]);

  const handleRegister = async () => {
    if (!email || !password) {      //if (!username || !email || !realName || !password) {
      alert('Заполните все поля');
      return;
    }

    if (!emailApproved) {
      alert('Этот email не одобрен для регистрации.');
      return;
    }

    // const { data: existingUser, error: usernameError } = await supabase
    //   .from('profiles')
    //   .select('id')
    //   .eq('username', username)
    //   .single();

    // if (existingUser) {
    //   alert('Это имя пользователя уже занято.');
    //   return;
    // }

    // if (usernameError && usernameError.code !== 'PGRST116') {
    //   alert('Ошибка при проверке имени: ' + usernameError.message);
    //   return;
    // }

    const { data: emailExists, error: emailCheckError } = await supabase
      .from('public_user_emails')
      .select('email')
      .eq('email', email)
      .single();

    if (emailExists) {
      alert('Этот email уже зарегистрирован.');
      return;
    }

    if (emailCheckError && emailCheckError.code !== 'PGRST116') {
      alert('Ошибка при проверке email: ' + emailCheckError.message);
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://nermes.xyz/confirm',
        // data: {
        //   username,
        //   real_name: realName,
        // },
      },
    });

    if (signUpError) {
      alert('Ошибка регистрации: ' + signUpError.message);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      alert('Не удалось получить ID пользователя');
      return;
    }

    if (signUpData?.session) {
      localStorage.setItem('supabase.session', JSON.stringify(signUpData.session));
    }
    

    // const { error: insertError } = await supabase.from('profiles').upsert({
    //   id: userId,
    //   username,
    //   real_name: realName,
    //   invited_by: invitedBy || null,
    //   balance: 500,
    // });

    // // Начисление 50 монет тому, кто пригласил
    // if (invitedBy) {
    //   console.log('invitedBy =', invitedBy);
    //   console.log('invoking bonus...');
    //   const { data: bonusData, error: bonusError } = await supabase.rpc('increment_balaance', {
    //     user_id: invitedBy,
    //     amount: 50
    //   });
      
    //   if (bonusError) {
    //     console.error('Bonus error:', bonusError.message);
    //   } else {
    //     console.log('Bonus success:', bonusData);
    //   }
      

    // }

    // if (insertError) {
    //   alert('Ошибка при сохранении профиля: ' + insertError.message);
    //   return;
    // }
    // if (insertError) {
    //   alert('Успешно! Подтвердите почту.');
    //   return;
    // }

    alert('Успешно! Подтвердите email и войдите в аккаунт.');
    navigate('/login');
  };

  if (checkingEmail) {
    return <p className="register-container-reg">Проверка доступа...</p>;
  }

  if (!emailApproved) {
    return (
      <div className="register-container-regg">
        <h1 className='text-error-regg'>Ошибка</h1>
        <p className='text-error-regg'>Регистрация доступна только по приглашению. Убедитесь, что вы используете правильную ссылку.</p>
        <button className="havee-acc-btn-reg" onClick={() => navigate('/login')}>
          <p>Уже есть аккаунт</p>
          </button>
      </div>
    );
  }

  return (
    <div className="register-container-reg">
      <h1>Регистрация</h1>
      <p>Создайте аккаунт чтобы продолжить!</p>
      {invitedByUsername && <p>Вас пригласил @{invitedByUsername}</p>}
      {/* <input
        type="text"
        placeholder="Никнейм"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input-reg"
      /> */}
      <input
        type="email"
        placeholder='Почта'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input-reg"
      />
      {/* <input
        type="text"
        placeholder="Полное Имя (Тони Старк)"
        value={realName}
        onChange={(e) => setRealName(e.target.value)}
        className="input-reg"
      /> */}
      <input
        type="password"
        placeholder="Придумайте пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-reg"
      />
      <button onClick={handleRegister} className="register-button-reg">
        Зарегистрироваться
      </button>
      {/* <p className="login-link-reg">
        Уже есть аккаунт? <span onClick={() => navigate('/login')}>Войти</span>
      </p> */}
    </div>
  );
}
