import React from 'react';
import styles from '../styles/chatInput.module.scss';

const ChatInput = ({
  userMessage,
  isBotResponding,
  isVoiceMode,
  onSubmit,
  onChange,
  onVoiceInputClick,
  onStopResponse,
  onDeleteChats,
  setIsVoiceMode
}) => {
  return (
    <div className={styles.promptContainer}>
      <div className={styles.promptRow}>
        {isVoiceMode ? (
          <>
            <button
              className={`${styles.button} ${styles.voiceButton}`}
              onClick={() => onVoiceInputClick('voice')}
              disabled={isBotResponding}
            >
              <span className="material-symbols-rounded">mic</span>
              음성으로 대화하기
            </button>
            <button
              className={`${styles.button} ${styles.smallButton}`}
              onClick={() => setIsVoiceMode(false)}
              disabled={isBotResponding}
            >
              <span className="material-symbols-rounded">keyboard</span>
            </button>
          </>
        ) : (
          <>
            <button
              className={`${styles.button} ${styles.smallButton}`}
              onClick={() => onVoiceInputClick('voice')}
              disabled={isBotResponding}
            >
              <span className="material-symbols-rounded">mic</span>
            </button>
            <form onSubmit={onSubmit} className={styles.promptForm}>
              <input
                type="text"
                className={styles.textInput}
                placeholder="궁금하신 내용을 입력해주세요"
                value={userMessage}
                onChange={onChange}
                disabled={isBotResponding}
              />
              <button
                type="submit"
                disabled={!userMessage.trim() || isBotResponding}
                className={styles.sendButton}
              >
                <span className="material-symbols-rounded">arrow_upward</span>
              </button>
            </form>
          </>
        )}

        <button
          type="button"
          onClick={onDeleteChats}
          className={`${styles.button} ${styles.deleteButton}`}
        >
          <span className="material-symbols-rounded">delete</span>
        </button>
      </div>

      <p className={styles.disclaimerText}>
        본 챗봇은 상담원과의 실시간 채팅 서비스는 운영되지 않습니다.<br />
        AI채용도우미와 자유롭게 대화하며 나에게 맞는 채용 정보를 받아보세요!
      </p>
    </div>
  );
};

export default ChatInput; 