// pages/chat/index.jsx
import React, { useEffect, useState, useRef } from 'react';
import styles from './styles/chat.module.scss';
import Header from '@components/Header/Header';
import axios from 'axios';
import IntentModal from '@pages/modal/IntentModal';
import { API_BASE_URL } from '@/config';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';

const Chat = () => {
  const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [typingIntervalId, setTypingIntervalId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [processingTime, setProcessingTime] = useState(0);

  // 스크롤 관련 상태
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  const chatsContainerRef = useRef(null);
  const promptInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const typingIntervalRef = useRef(null);

  // 채용 정보 관련 상태
  const [selectedJob, setSelectedJob] = useState(null);
  const selectedCardRef = useRef(null);

  // 훈련정보 관련 상태
  const [selectedTraining, setSelectedTraining] = useState(null);

  // 모달 및 음성 입력 상태
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [initialMode, setInitialMode] = useState(null);

  // 메뉴 아이템
  const suggestions = [
    { text: "시니어JobGo 이용안내", icon: "help", id: 1 },
    { text: "AI 맞춤 채용정보 검색", icon: "work", id: 2 },
    { text: "맞춤 훈련정보 검색", icon: "school", id: 3 },
    { text: "이력서 관리", icon: "description", id: 4 },
  ];

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    const element = chatsContainerRef.current;
    if (element && !isAutoScrolling) {
      if (!isUserScrolling) {
        setIsUserScrolling(true);
      }
      const isScrolledUp = element.scrollTop < element.scrollHeight - element.clientHeight - 100;
      setShowScrollButton(isScrolledUp);
    }
  };

  // 스크롤 다운
  const scrollToBottom = () => {
    if (chatsContainerRef.current) {
      setIsAutoScrolling(true);
      setIsUserScrolling(false);
      setShowScrollButton(false);

      chatsContainerRef.current.scrollTo({
        top: chatsContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });

      setTimeout(() => {
        setIsAutoScrolling(false);
      }, 500);
    }
  };

  // 채팅 내역 변경 시 스크롤
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 0);
    return () => clearTimeout(timer);
  }, [chatHistory]);

  // 폼 제출 핸들러
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || isBotResponding) return;

    const message = userMessage.trim();
    setChatHistory(prev => [...prev, { role: "user", text: message }]);
    setIsBotResponding(true);
    setStartTime(Date.now());
    setProcessingTime(0);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat/`, {
        user_message: message,
        session_id: "default_session"
      }, { withCredentials: true });

      const { message: botMessage, jobPostings, type } = response.data;
      
      const newBotMessage = {
        role: "bot",
        text: botMessage,
        type: type,
        jobPostings: jobPostings || [],
        trainingCourses: response.data.trainingCourses || []
      };

      setChatHistory(prev => [...prev, newBotMessage]);

    } catch (error) {
      console.error("메시지 전송 오류:", error);
      setChatHistory(prev => [...prev, {
        role: "model",
        text: "죄송합니다. 메시지를 처리하는 중에 오류가 발생했습니다.",
        type: "error"
      }]);
    } finally {
      setIsBotResponding(false);
      setUserMessage("");
      setStartTime(null);
    }
  };

  // 추천 메뉴 클릭 핸들러
  const handleSuggestionClick = (suggestion) => {
    setUserMessage(suggestion.text);
    setTimeout(() => handleFormSubmit({ preventDefault: () => { } }), 0);
  };

  // 채팅 내역 삭제
  const handleDeleteChats = () => {
    setChatHistory([]);
    setIsBotResponding(false);
  };

  // 채용 공고 클릭 핸들러
  const handleJobClick = (job) => {
    setSelectedJob(prev => {
      const newSelected = prev?.id === job.id ? null : job;
      if (newSelected) {
        setTimeout(() => {
          const cardElement = document.querySelector(`[data-job-id="${job.id}"]`);
          if (cardElement) {
            cardElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center'
            });
          }
        }, 100);
      }
      return newSelected;
    });
  };

  // 응답 중단 핸들러
  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsBotResponding(false);
    setUserMessage("");
  };

  // 훈련 공고 클릭 핸들러
  const handleTrainingClick = (training) => {
    setSelectedTraining(prev => {
      const newSelected = prev?.id === training.id ? null : training;
      if (newSelected) {
        setTimeout(() => {
          const cardElement = document.querySelector(`[data-training-id="${training.id}"]`);
          if (cardElement) {
            cardElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'center'
            });
          }
        }, 100);
      }
      return newSelected;
    });
  };

  // 모달 핸들러
  const handleModalSubmit = async (response) => {
    setIsModalOpen(false);
    setUserMessage("");

    if (response.mode === 'voice') {
      setIsVoiceMode(true);
      setInitialMode('voice');
    }

    if (!response.mode || response.mode !== 'voice') {
      const userMessage = {
        role: "user",
        text: response.originalText || "음성으로 검색하기",
      };
      setChatHistory((prev) => [...prev, userMessage]);
    }

    setIsBotResponding(true);
    try {
      const botMessage = {
        role: "model",
        text: response.message || response.text,
        jobPostings: response.jobPostings || [],
        trainingCourses: response.trainingCourses || [],
        type: response.type
      };

      setChatHistory((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error processing bot response:", error);
    } finally {
      setIsBotResponding(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (!isVoiceMode) {
      setInitialMode(null);
    }
  };

  const handleVoiceInputClick = () => {
    setIsModalOpen(true);
    setInitialMode('voice');
    setTimeout(() => {
      const voiceButton = document.querySelector(`.${styles.recordingIndicator}`);
      if (voiceButton) {
        voiceButton.click();
      }
    }, 100);
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    if (text.length <= 500) {
      setUserMessage(text);
    }
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>
        <IntentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
          initialMode={initialMode}
        />

        <div
          className={styles.container}
          ref={chatsContainerRef}
          onScroll={handleScroll}
        >
          {chatHistory.length === 0 && (
            <>
              <div className={styles.appHeader}>
                <h1 className={styles.heading}>안녕하세요!</h1>
                <h2 className={styles.subHeading}>무엇을 도와드릴까요?</h2>
              </div>

              <ul className={styles.suggestions}>
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    className={styles.suggestionsItem}
                    onClick={() => handleSuggestionClick(item)}
                  >
                    <p className={styles.text}>{item.text}</p>
                    <span className={`material-symbols-rounded`}>{item.icon}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className={styles.chatsContainer}>
            {chatHistory.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                selectedJob={selectedJob}
                selectedTraining={selectedTraining}
                onJobClick={handleJobClick}
                onTrainingClick={handleTrainingClick}
                selectedCardRef={selectedCardRef}
              />
            ))}
          </div>

          <ChatInput
            userMessage={userMessage}
            isBotResponding={isBotResponding}
            isVoiceMode={isVoiceMode}
            onSubmit={handleFormSubmit}
            onChange={handleInputChange}
            onVoiceInputClick={handleVoiceInputClick}
            onStopResponse={handleStopResponse}
            onDeleteChats={handleDeleteChats}
          />

          {showScrollButton && (
            <button
              className={`${styles.scrollButton} ${styles.visible}`}
              onClick={scrollToBottom}
            >
              <span className="material-symbols-rounded">arrow_downward</span>
              최근 메시지 보기
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default Chat;