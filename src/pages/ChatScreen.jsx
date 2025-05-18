import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { FiSend } from 'react-icons/fi';
import '../styless/ChatScreen.css';
import {
  SendHorizonal,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  CircleUserRound,
} from 'lucide-react';
import { useUI } from '../components/uiContext';
import "../styless/loadingScreen.css";
import { FiPaperclip } from "react-icons/fi";
import { LiaCircleSolid } from "react-icons/lia";




export default function ChatScreen() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [confirmPreview, setConfirmPreview] = useState(false);
  const [senderId, setSenderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pricePerMessage, setPricePerMessage] = useState(200);
  const [balance, setBalance] = useState(0);
  const flatListRef = useRef(null);
  const navigate = useNavigate();
  const {setBottomNavVisible} = useUI();
  const [isInitiator, setIsInitiator] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const [profilesMap, setProfilesMap] = useState({});

  useEffect(() => {
    const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, real_name, avatar')
        .in('id', senderIds);

      if (!error && data) {
        const map = {};
        data.forEach(p => map[p.id] = p);
        setProfilesMap(map);
      }
    };
    if (messages.length > 0) fetchProfiles();
  }, [messages]);


  


  useEffect(() => {
    setBottomNavVisible(false);
    if (!id) return;
  
    const fetchData = async () => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, real_name, id, avatar, price_per_message')
        .eq('id', id)
        .single();
      if (!profileError && profileData) {
        setProfile(profileData);
        setPricePerMessage(profileData.price_per_message || 20);
      }
  
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (user && !userError) {
        setSenderId(user.id);
  
        const { data: balanceData, error: balanceError } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
        if (!balanceError && balanceData) {
          setBalance(balanceData.balance);
        }
  
        // загружаем сообщения только когда всё остальное готово
        fetchMessages(user.id);
      }
    };
  
    fetchData();
  
    return () => setBottomNavVisible(true);
  }, [id]);
 
  useEffect(() => {
    if (senderId && id) {
      setIsInitiator(senderId === id);
    }
  }, [senderId, id]);
  
  
  

  const fetchMessages = async (currentUserId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true });
  
    if (!error) {
      setMessages(data);
  
      if (!data || data.length === 0) {
        // Чат пустой — ты инициатор
        setIsInitiator(true);
      } else {
        const firstMsg = data[0];
        const initiatorId = firstMsg.sender_id;
        setIsInitiator(currentUserId === initiatorId);
      }

      await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', currentUserId)
      .eq('sender_id', id)
      .eq('is_read', false);
    }
  };
  
  
  

  useEffect(() => {
    const ref = flatListRef.current;
    if (!ref) return;
  
    const isAtBottom = Math.abs(ref.scrollHeight - ref.scrollTop - ref.clientHeight) < 50;
  
    if (isAtBottom) {
      const timeout = setTimeout(() => {
        ref.scrollTop = ref.scrollHeight;
      }, 100);
  
      return () => clearTimeout(timeout);
    }
  }, [messages]);
  

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  

  const handleSendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed || !senderId || !id || loading) return;

  
    const firstMessage = messages.length === 0;
    
    if (firstMessage || isInitiator) {
      setConfirmPreview(true);
    } else {
      handleConfirmSend();
    }
  };
  
  

  const handleConfirmSend = async () => {
    const trimmed = message.trim();
    if (!trimmed || !senderId || !id || loading) return;
  
    try {
      setLoading(true);
  
      if (isInitiator) {
        // Пользователь отправляет сообщение
        const { data: balanceData, error: balanceError } = await supabase
          .from('profiles')
          .select('balance, id')
          .eq('id', senderId)
          .single();
        
        const latestBalance = balanceData?.balance ?? 0;
        if (latestBalance < pricePerMessage) {
          alert('Недостаточно средств.');
          return;
        }
  
        const { error: decreaseError } = await supabase.rpc('decrease_balance', {
          user_id: senderId,
          amount: pricePerMessage,
        });
        if (decreaseError) {
          alert('Ошибка списания: ' + decreaseError.message);
          return;
        }
  
        await supabase.from('messages').insert([{
          sender_id: senderId,
          receiver_id: id,
          content: trimmed,
          paid: true,
          has_been_answered: false,
          price: pricePerMessage,
        }]);
  
        setBalance(latestBalance - pricePerMessage);
  
      } else {
        
         // 1. Сохраняем сообщение
         const { data: inserted, error: insertError } = await supabase
         .from('messages')
         .insert([{
           sender_id: senderId,
           receiver_id: id,
           content: trimmed,
           paid: false,
         }])
         .select();

       if (insertError) {
         console.error('Ошибка вставки ответа:', insertError);
         return;
       }

       const responseTime = inserted[0].created_at; // <== вот точка отсечения!


       const { data: paidMessages, error: fetchError } = await supabase
        .from('messages')
        .select('id, price, created_at')
        .eq('sender_id', id)
        .eq('receiver_id', senderId)
        .eq('paid', true)
        .eq('has_been_answered', false)
        .is('paid_message_id', null)
        .lt('created_at', responseTime)
        .order('created_at', { ascending: true });


        if (fetchError) {
          console.error('Ошибка поиска сообщений:', fetchError);
          return;
        }
       

  
        if (paidMessages.length > 0) {
          const totalReward = paidMessages.reduce((sum, msg) => sum + (msg.price || pricePerMessage), 0);
          const messageIds = paidMessages.map(msg => msg.id);
  
          // Обновляем все сообщения как отвеченные
          const { data: updateMessages, error: updateError } = await supabase
            .from('messages')
            .update({ 
              answered_at: responseTime,
              has_been_answered: true,
              paid_message_id: inserted[0].id
            })
            .in('id', messageIds)
            .select();

            console.log('Data:', updateMessages);
            console.log('Error:', updateError);
  
            if (!updateError && updateMessages.length === 0) {
              console.warn('🔒 Ничего не обновилось — проверь RLS политику!');
            } 
            
            
        
            // Теперь начисляем баланс
            await supabase.rpc('increase_balance', {
              user_id: senderId,
              amount: Number(totalReward),
            });
        
            const { data: updatedProfile, error: fetchBalanceError } = await supabase
              .from('profiles')
              .select('balance')
              .eq('id', senderId)
              .single();
        
            if (!fetchBalanceError && updatedProfile) {
              setBalance(updatedProfile.balance);
            }
          }
        

      }
  
      setMessage('');
      setConfirmPreview(false);
      await fetchMessages(senderId);
    } catch (e) {
      console.error('Ошибка:', e);
    } finally {
      setLoading(false);
    }
  };
  
  
  

  useEffect(() => {
    if (!senderId || !id) return;
  
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        payload => {
          const msg = payload.new;
          const isMineOrTheirs = 
            (msg.sender_id === senderId && msg.receiver_id === id) ||
            (msg.sender_id === id && msg.receiver_id === senderId);
  
          if (isMineOrTheirs) {
            setMessages(prev => [...prev, msg]);
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [senderId, id]);
  

  
  
  

  const handleEscrowAction = async (messageId, isLike) => {
    const rpc = isLike ? 'release_escrow' : 'refund_escrow';
    const { error } = await supabase.rpc(rpc, { p_message_id: messageId });
    if (error) {
      alert('Ошибка: ' + error.message);
      return;
    }
  
    if (!isLike) {
      // вставка системного сообщения
      await supabase.from('messages').insert([
        {
          sender_id: senderId,
          receiver_id: id,
          content: '⚠️ Пользователь поставил дизлайк. Часть средств возвращена. Ответ был помечен как неудачный.',
          is_system: true,
          paid: false
        }
      ]);
    }
  
    await fetchMessages();
  };

  

  if (!profile) return <div className='loading-container-maain'></div>;

  return (
    <div className="chat-screen-cs">
      <div className="chat-header-cs">
        <button onClick={() => navigate(-1)} className="icon-button-cs">
          <ArrowLeft size={18} />
        </button>

        {/* <button className='header-button-cs' onClick={() => navigate('/profile/' + profile.id)}> */}
          {/* {profile.avatar ? (
            // <img src={profile.avatar} alt="avatar" className="avatar-cs" />
          ) : (
            <CircleUserRound size={32} className="avatar-placeholder-cs" />
          )} */}

          {/* <div className="header-info-cs"> */}
            {/* <div className="username-cs">{profile.real_name}</div> */}
            {/* <div className="rating-cs">4.4/5 quality of answers</div> */}
          {/* </div> */}
        {/* </button> */}
      </div>

      <div className="chat-messages-cs" ref={flatListRef}>
        {messages.map((item, index) => {
          const isMyMessage = item.sender_id === senderId;
          const isTheirMessage = item.sender_id === id;
          return (
            <div className={`message-wrapper-cs ${isMyMessage ? 'my-wrapper-cs' : 'their-wrapper-cs'}`}>
              <div className={`chat-bubble-cs ${isMyMessage ? 'my-message-cs' : 'their-message-cs'}`}>
                
                <div className="message-meta-cs">
                  {profilesMap[item.sender_id]?.avatar ? (
                    <img src={profilesMap[item.sender_id].avatar} alt="avatar" className="message-avatar-cs" />
                  ) : (
                    <LiaCircleSolid color='rgb(22,22,22)' size={28} className="message-avatar-placeholder-cs" />
                  )}
                  <div className="message-header-cs">
                    <span className="message-username-cs">{profilesMap[item.sender_id]?.real_name || 'Неизвестный'}</span>
                    <p className="message-watermark-cs">nermes.xyz</p>
                  </div>
                </div>

                <div className="bubble-content-wrapper-cs">
                  <p>{item.content}</p>
                </div>
              </div>
              {/* {isTheirMessage && (
                // <div className="options-container-cs">
                //   <button
                //     onClick={() =>
                //       setSelectedMessageId(selectedMessageId === item.id ? null : item.id)
                //     }
                //     className="icon-button-cs-cs"
                //   >
                //     <span style={{ fontSize: 18 }}>⋯</span>
                //   </button>

                //   {selectedMessageId === item.id && (
                //     <div className="dropdown-menu-cs">
                //       <button
                //         onClick={() => {
                //           handleEscrowAction(item.id, false);
                //           setSelectedMessageId(null);
                //         }}
                //       >
                //         Не нравится ответ
                //       </button>
                //     </div>
                //   )}
                // </div>
              )} */}
            </div>
        );
      })}

      <div className="chat-input-cs">
        {confirmPreview && isInitiator ? (
          <div className="preview-confirm-cs">
            <span>Отправка стоит {pricePerMessage} доступов. Подтвердите?</span>
            <button onClick={() => setConfirmPreview(false)} className="cancel-button-cs">Отмена</button>
            <button onClick={handleConfirmSend} disabled={loading} className="send-button-cs">
              {loading ? '...' : 'Отправить'}
            </button>
          </div>
        ) : (
          <div className={`input-wrapper-cs ${isFocused || message ? 'expanded' : 'collapsed'}`}>
            <textarea
              ref={textareaRef}
              className="input-field-cs"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={3}
              placeholder="Напишите сообщение"
            />
  
            { (isFocused || message) && (
              <>
                <button 
                  onClick={handleSendMessage} 
                  disabled={loading} 
                  className="send-inside-input-cs"
                >
                  {loading ? '...' : <SendHorizonal size={20} />}
                </button>
                <button className="attach-button-cs">
                  <FiPaperclip size={20} />
                </button>
              </>
            )}
          </div>

        )}
      </div>
      </div>
      </div>
  );
}
