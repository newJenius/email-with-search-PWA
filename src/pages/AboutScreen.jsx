import { useState } from 'react';
import '../styless/AboutScreen.css';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../components/uiContext';

const questions = [
  {
    question: 'Что это за платформа?',
    answer: 'Это платформа где потенциально будут доступны все люди мира. Где можно будет достучаться до абсолютно кого угодно. Здесь ищут людей, а не информацию. Зачем мне в гугле писать запрос "Как выйти на инвесторов?, Как преодолеть одиночество?" и получить статичный ответ по типу 1. Делай то. 2. Делай это. Не лучше ли обратиться к человеу который через это сам прошёл?',
  },
  {
    question: 'Кто может быть на платформе?',
    answer: 'Абсолютно каждый кто хочет делиться своим жизненным опытом, своими знаниями со всем миром.',
  },
  {
    question: 'Зачем я должен здесь быть?',
    answer: 'Потому что тебя уже ищут. Людям необходимо именно то через что ты прошел. Что ты усвоил. Чему ты научился.',
  },
  {
    question: 'Это соцсеть?',
    answer: 'НЕТ! Это платформа доступа к людям. Если кратко, индекс всего человечества и их опыта.',
  },
  {
    question: 'Что будет дальше?',
    answer: 'Хоту превратить эту платформу в всемирную паутину доступа. Где будет доступен каждый политик, каждый музыкант и т.д. Хочу чтобы ты тоже был доступен здесь!!!',
  },
  {
    question: 'Почему здесь за доступ нужно платить?',
    answer: 'Единственный способ обеспечить доступность потенциально всех людей мира - это предлагать им финансовую выгоду. Тут важно понимать, что деньги показывают ваше желание достучаться. Естественном образом служа фильтром от спама и прочего мусора. Если вы хотите связаться с кем то. То, почему вы должны задуматься о том как достать данные? а что если не ответит? Захотел? Заплатил и получил доступ к человеку.  (ПОКА все бесплатно)',
  },
];

export default function AboutScreen() {
  const [openIndex, setOpenIndex] = useState(null);
  const navigate = useNavigate();
  // const { setBottomNavVisible } = useUI();

  // useEffect(() => {
  //   setBottomNavVisible(false);
  //   return () => setBottomNavVisible(true);
  // }, [setBottomNavVisible]);

  const toggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  

  return (
    <div className="faq-container-faqqq">
      {questions.map((item, index) => (
        <div
          key={index}
          className={`faq-item-faqqq ${openIndex === index ? 'open' : ''}`}
          onClick={() => toggle(index)}
        >
          <div className="faq-question-faqqq">
            {item.question}
            <span className="arrow-faqqq">{openIndex === index ? '▲' : '▼'}</span>
          </div>
          {openIndex === index && (
            <div className="faq-answer-faqqq">{item.answer}</div>
          )}
        </div>
      ))}

      {/* <button className='back-button-faqq' onClick={() => navigate('/')}>Назад</button> */}
    </div>
  );
}
