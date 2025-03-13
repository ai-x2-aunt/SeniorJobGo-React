import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from '../styles/chat.module.scss';
// import styles from '../styles/commonCard.module.scss';
import JobCard from './JobCard';
import TrainingCard from './TrainingCard';
import Avatar from '@assets/images/icon-robot.svg';
import PolicyCard from './PolicyCard';
import MealCard from './MealCard';

const ChatMessage = ({
  message,
  selectedJob,
  selectedTraining,
  selectedPolicy,
  selectedMeal,
  onJobClick,
  onTrainingClick,
  onPolicyClick,
  onMealClick,
  selectedCardRef,
  isLast
}) => {
  console.log('ChatMessage - 전체 메시지 데이터:', message);

  const isBot = message.role === "bot";
  const isUser = message.role === "user";
  const isLoading = message.loading;
  const isVoiceMode = message.mode === 'voice';

  const getMessageStyle = (msg) => {
    const baseStyle = styles.message;
    if (msg.role === "model" || msg.role === "bot") {
      return `${baseStyle} ${styles.botMessage} ${msg.loading ? styles.loading : ""} ${msg.mode === 'voice' ? styles.voiceLoading : ""}`;
    }
    return `${baseStyle} ${styles.userMessage}`;
  };

  const formatMessage = (text) => {
    if (!text) return '';

    return (
      <div className={styles.messageContent}>
        <ReactMarkdown
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                className={styles.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
              />
            ),
            em: ({ node, ...props }) => (
              <em {...props} className={styles.sourceText} />
            ),
            h4: ({ node, ...props }) => (
              <h4 {...props} className={styles.searchResultTitle} />
            )
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className={`${styles.message} 
      ${isBot ? styles.botMessage : ''} 
      ${isUser ? styles.userMessage : ''} 
      ${isLoading ? styles.loading : ''}
      ${isVoiceMode ? styles.voiceMessage : ''}`}
    >
      {isBot && <img src={Avatar} alt="Bot" className={styles.avatar} />}
      <div className={styles.messageContent}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loadingDots}>
              <span></span><span></span><span></span>
            </div>
            <div className={styles.loadingText}>답변을 준비중입니다...</div>
          </div>
        ) : (
          <div className={styles.messageText}>
            {/* 정책 정보 카드 먼저 체크 */}
            {message.policyPostings?.length > 0 ? (
              <div className={styles.policyList}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
                <div className={styles.policyCards}>
                  {message.policyPostings.map((policy, index) => (
                    <div key={`${policy.source}-${policy.title}-${index}`} className={styles.itemGroup}>
                      <PolicyCard
                        policy={{
                          ...policy,
                          id: `${policy.source}-${policy.title}-${index}`,  // 고유 ID 생성
                          publishDate: new Date().toLocaleDateString(),  // 날짜 추가
                          tags: [policy.target]  // 태그 추가
                        }}
                        onClick={onPolicyClick}
                        isSelected={selectedPolicy && selectedPolicy.url === policy.url}
                        cardRef={selectedPolicy && selectedPolicy.url === policy.url ? selectedCardRef : null}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : !message.jobPostings?.length && !message.trainingCourses?.length ? (
              // 다른 카드 타입이 없을 때만 일반 텍스트 표시
              <ReactMarkdown>{message.text}</ReactMarkdown>
            ) : null}

            {/* 채용 정보 카드 */}
            {message.jobPostings?.length > 0 && (
              <div className={styles.jobList}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
                <div className={styles.jobCards}>
                  {message.jobPostings.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onClick={onJobClick}
                      isSelected={selectedJob && selectedJob.id === job.id}
                      cardRef={selectedJob && selectedJob.id === job.id ? selectedCardRef : null}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 훈련 정보 카드 */}
            {message.trainingCourses?.length > 0 && (
              <div className={styles.trainingList}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
                <div className={styles.trainingCards}>
                  {message.trainingCourses.map((course) => (
                    <TrainingCard
                      key={course.id}
                      training={course}
                      onClick={onTrainingClick}
                      isSelected={selectedTraining && selectedTraining.id === course.id}
                      cardRef={selectedTraining && selectedTraining.id === course.id ? selectedCardRef : null}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 무료급식소 정보 카드 */}
            {message.mealPostings && message.mealPostings.length > 0 && (
              <div className={styles.mealList}>
                <div className={styles.cardList}>
                  {message.mealPostings.map((meal, index) => (
                    <div key={`${meal.name}-${index}`} className={styles.itemGroup}>
                      <MealCard
                        meal={meal}
                        onClick={() => onMealClick(meal)}
                        isSelected={selectedMeal && selectedMeal.name === meal.name}
                        cardRef={selectedMeal && selectedMeal.name === meal.name ? selectedCardRef : null}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 