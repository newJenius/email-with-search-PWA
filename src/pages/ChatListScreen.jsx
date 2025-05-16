import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '../styless/ChatList.css';
import { Asterisk } from 'lucide-react';
import InviteModal from './InviteModal';
import '../styless/SearchPage.css';
import '../styless/Home.css';

export default function ChatListScreen() {
  const [chatList, setChatList] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [balance, setBalance] = useState(null);

  const navigate = useNavigate();


  useEffect(() => {
    const fetchChats = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return console.error('Ошибка получения пользователя:', userError);
  
      const currentUserId = user.id;
  
      // Получаем баланс пользователя
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', currentUserId)
        .single();
  
      if (profileError) {
        console.error('Ошибка загрузки баланса:', profileError);
      } else {
        setBalance(profile.balance);
      }
  
      // Получаем чаты
      const { data: messages, error: messageError } = await supabase
        .from('messages')
        .select(`
          id, content, created_at, is_read,
          sender_id, receiver_id,
          sender:profiles!messages_sender_id_fkey(id, username, real_name, avatar),
          receiver:profiles!messages_receiver_id_fkey(id, username, real_name, avatar)
        `)
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });
  
      if (messageError) {
        console.error('Ошибка загрузки сообщений:', messageError);
        return;
      }
  
      const chatMap = new Map();
  
      messages.forEach(msg => {
        const partner = msg.sender_id === currentUserId ? msg.receiver : msg.sender;
        const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
        const isUnread = !msg.is_read && msg.sender_id !== currentUserId;
  
        if (!chatMap.has(partnerId)) {
          chatMap.set(partnerId, {
            id: partnerId,
            name: partner.real_name || partner.username,
            avatar: partner.avatar,
            lastMessage: msg.content,
            lastTime: msg.created_at,
            isUnread,
          });
        }
      });
  
      setChatList(Array.from(chatMap.values()));
    };
  
    fetchChats();
  }, []);

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
  

  return (
    <div className="chat-list-container-clst">
      <div className="header-main-clst">
        <h2 className='header-clst'>Люди</h2>
      </div>
      
      <div className='chat-margin-top-clst'>
      {chatList.map((chat) => (
        <div
          key={chat.id}
          className={`chat-list-item-clst ${chat.isUnread ? 'unread' : ''}`}
          onClick={() => {
            navigate(`/chats/${chat.id}`)
          }}
        > 
          {chat.isUnread && <div className="unread-dot-clst" />}
          {/* <img src={chat.avatar} alt={chat.name} className="avatar-clst" /> */}
          <div className="chat-info-clst">
            <div className="chat-name-clst">{chat.name}</div>
            <div className="chat-preview-clst">{chat.lastMessage}</div>
          </div>
          
        </div>
      ))}
      </div>

      <div className='balance-btn-clst'>
        <p className='balance-text-clst'>Доступов: {balance ?? '...'}</p>
        <p className='balance-text1-clst'>Тратьте доступы с умом они конечны!</p>
        <button className='buy-button-clst' onClick={() => navigate('/invite')}>+Доступ</button>
      </div>
    </div>
  );
}
