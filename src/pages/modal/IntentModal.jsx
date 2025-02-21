import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import styles from './styles/IntentModal.module.scss';

const IntentModal = ({ isOpen, onClose, onSubmit, initialMode }) => {
  const [mode, setMode] = useState(null); // 'voice' 또는 'text'
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');  // finalTranscript를 state로 관리
  const [summary, setSummary] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);  // 검색 중 상태
  const [searchTime, setSearchTime] = useState(0);  // 검색 시간 (초)
  const searchTimerRef = useRef(null);  // 타이머 참조
  const recognitionRef = useRef(null);  // 음성 인식 객체 참조
  const isListeningRef = useRef(false);  // 녹음 중 여부 참조

  // 음성 인식 초기화
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ko-KR';

        recognition.onstart = () => {
          console.log('음성 인식이 시작되었습니다.');
          setIsListening(true);
        };

        recognition.onend = () => {
          console.log('음성 인식이 종료되었습니다.');
          setIsListening(false);  // 상태 업데이트
          
          // 의도적으로 종료된 경우가 아니라면 재시작
          if (isListeningRef.current) {
            console.log('음성 인식 재시작 시도...');
            setTimeout(() => {
              try {
                recognition.start();
                console.log('음성 인식 재시작 성공');
              } catch (error) {
                console.error('음성 인식 재시작 실패:', error);
                setIsListening(false);
              }
            }, 300);  // 딜레이 증가
          }
        };

        recognition.onerror = (event) => {
          console.error('음성 인식 오류:', event.error);
          if (event.error === 'not-allowed') {
            alert('마이크 사용 권한이 필요합니다.');
          } else {
            alert('음성 인식 오류가 발생했습니다: ' + event.error);
          }
          setIsListening(false);
        };

        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          const newTranscript = finalTranscript + interimTranscript;
          console.log('인식된 텍스트:', newTranscript);
          setTranscript(newTranscript);
        };
        recognitionRef.current = recognition;
        console.log('음성 인식 초기화 완료');

      } else {
        console.error('SpeechRecognition이 지원되지 않음');
        alert('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.');
      }
    };

    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('음성 인식 정리 중 오류:', error);
        }
      }
    };
  }, []);

  // initialMode가 변경될 때 모드 설정 및 음성 녹음 시작
  useEffect(() => {
    if (isOpen && initialMode === 'voice') {
      setMode('voice');
      // 약간의 지연 후 녹음 시작
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          isListeningRef.current = true;
          setTranscript('');
          setSummary(null);
        }
      }, 100);
    }
  }, [isOpen, initialMode]);

  // 음성 입력 처리
  const processTranscript = async (text) => {
    if (!text.trim()) return;

    try {
      setIsProcessing(true);
      
      // 음성 입력 텍스트를 바로 전달
      onSubmit('voice', text);
      
      // 상태 초기화 및 모달 닫기
      setTranscript('');
      setFinalTranscript('');
      setSummary(null);
      setIsProcessing(false);
      onClose();

    } catch (error) {
      console.error('음성 입력 처리 중 오류:', error);
      setIsProcessing(false);
    }
  };

  // 녹음 완료 버튼 클릭 핸들러
  const handleRecordingComplete = () => {
    if (!transcript.trim()) return;
    
    stopListening();
    processTranscript(transcript);
  };

  // 음성 입력 시작
  const startListening = () => {
    if (recognitionRef.current) {
      setFinalTranscript('');  // finalTranscript 초기화
      setTranscript('');  // transcript 초기화
      recognitionRef.current.start();
      isListeningRef.current = true;
      setSummary(null);
    } else {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
    }
  };

  // 음성 입력 중지
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
    }
  };

  // 요약 내용 확인 및 검색 시작
  const handleConfirm = async () => {
    if (summary) {
      try {
        setIsSearching(true);  // 검색 시작
        setSearchTime(0);  // 타이머 초기화

        // 타이머 시작
        searchTimerRef.current = setInterval(() => {
          setSearchTime(prev => prev + 1);
        }, 1000);

        const searchResponse = await axios.post(`${API_BASE_URL}/chat/`, {
          user_message: summary.originalText,
          user_profile: {
            jobType: summary.직무,
            location: summary.지역,
            age: summary.연령대
          }
        }, {
          withCredentials: true
        });

        // 모든 음성 입력 관련 상태 초기화
        setFinalTranscript('');
        setTranscript('');
        setSummary(null);

        onSubmit({
          ...searchResponse.data,
          mode: 'voice',
          originalText: summary.originalText
        });
        onClose();
        
      } catch (error) {
        console.error('검색 중 오류:', error);
        alert('검색 중 오류가 발생했습니다.');

      } finally {
        setIsSearching(false);  // 검색 종료

        if (searchTimerRef.current) {
          clearInterval(searchTimerRef.current);  // 타이머 정지
          searchTimerRef.current = null;
        }
      }
    }
  };

  // 검색 취소 및 음성 입력 화면으로 돌아가기
  const handleCancel = () => {
    if (searchTimerRef.current) {
      clearInterval(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    setIsSearching(false);
    setSearchTime(0);
    setSummary(null);
    setTranscript('');
    startListening();
  };

  // 텍스트 모드 선택 시
  const handleTextModeSelect = () => {
    setMode('text');
    onClose();  // 모달 닫고 채팅 입력으로 전환
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearInterval(searchTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="닫기"
        >
          <span className="material-symbols-rounded">close</span>
        </button>

        {!mode ? (
          // 초기 선택 화면
          <div className={styles.modeSelection}>
            <div className={styles.introContainer}>
              <h2 className={styles.introTitle}>
                시니어잡고는 AI 기술이 적용된 <br/>고령층을 위한 <span className={styles.highlighted}>대화형 도우미</span>입니다.
              </h2>
              <p className={styles.introSubtitle}>
                AI가 맞춤 추천하는 채용정보와 교육과정을 만나보세요.<br />
                말로 하거나 글로 쓰거나, 편하신 방법으로 시작해보세요!
              </p>
            </div>

            <div className={styles.modeButtons}>
              <button className={styles.modeButton} onClick={async () => {
                  setMode('voice');
                  // 권한 확인 후 녹음 시작
                  const hasPermission = await requestMicrophonePermission();
                  if (hasPermission) {
                    setTimeout(() => {
                      startListening();
                    }, 100);
                  }
                }}
              >
                <span className="material-symbols-rounded">record_voice_over</span>
                말로 주고 받는 대화
              </button>
              <button className={styles.modeButton} onClick={handleTextModeSelect}>
                <span className="material-symbols-rounded">forum</span>
                입력하는 채팅 대화
              </button>
            </div>
          </div>
        ) : mode === 'voice' ? (
          // 음성 입력 화면
          <div className={styles.voiceMode}>
            <div className={styles.recordingSection}>
              <div 
                className={`${styles.recordingIndicator} ${isListening ? styles.active : ''}`}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isListening) {
                    stopListening();
                  } else {
                    await startListening();
                  }
                }}
              >
                {isListening ? (
                  <span className="material-symbols-rounded">mic</span>
                ) : (
                  <>
                    <span className="material-symbols-rounded">mic</span>
                    녹음 시작
                  </>
                )}
              </div>
              {isListening && (
                <div className={styles.transcript}>
                  <h4>음성 인식 중...</h4>
                  <p>{transcript || "말씀해 주세요..."}</p>
                  <button 
                    className={styles.confirmRecording}
                    onClick={handleRecordingComplete}
                    disabled={!transcript.trim()}
                  >
                    {isProcessing ? (
                      <div className={styles.loadingText}>
                        처리 중...
                        <span className={styles.loadingTimer}>{searchTime}s</span>
                      </div>
                    ) : '녹음 완료'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default IntentModal; 