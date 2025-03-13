import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/commonCard.module.scss';

const MealCard = ({ meal, onClick, isSelected, cardRef }) => {
  console.log('MealCard - 받은 급식소 데이터:', meal);

  // 현재 운영 상태를 계산하는 함수
  const getOperationStatus = () => {
    const now = new Date();
    const currentDay = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
    
    // 운영 요일 확인
    const operatingDays = meal.description?.split('+').map(day => day.trim()) || [];
    console.log('운영 요일: ', operatingDays);
    console.log('현재 요일: ', currentDay);
    const isOperatingDay = operatingDays.includes(currentDay);
    
    // 운영 요일이 아니라면 '휴무' 상태 반환
    if (!isOperatingDay) {
      return 'closed';
    }

    // 운영 시간 파싱 - 정규표현식으로 시작/종료 시간 추출
    console.log('운영 시간 문자열: ', meal.operatingDays);
    // const timeMatch = meal.operatingHours?.match(/(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/);
    const timeMatch = meal.operatingHours?.match(/\((\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})\)/);    console.log('시간 매치 결과: ', timeMatch);
    console.log('시간 매치 결과:', timeMatch);

    if (!timeMatch) {
      console.log('시간 형식 매치 실패로 종료 상태 반환');
      return 'ended'; // 시간 정보가 없으면 기본적으로 종료로 표시
    }

    // 시작 시간과 종료 시간 설정
    const [_, startHour, startMin, endHour, endMin] = timeMatch;
    const startTime = new Date();
    startTime.setHours(parseInt(startHour), parseInt(startMin), 0);
    
    const endTime = new Date();
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0);

    const currentTime = now;

    console.log('현재 시간:', currentTime.toTimeString());
    console.log('시작 시간:', startTime.toTimeString());
    console.log('종료 시간:', endTime.toTimeString());
    console.log('현재 < 시작?', currentTime < startTime);
    console.log('현재 > 종료?', currentTime > endTime);

    // 현재 시간과 비교하여 상태 결정
    if (currentTime < startTime) {
      return 'preparing'; // 준비중
    } else if (currentTime > endTime) {
      return 'ended'; // 종료
    } else {
      return 'operating'; // 운영중
    }
  };

  // 운영 상태에 따른 표시 텍스트 반환
  const getStatusLabel = (status) => {
    switch (status) {
      case 'operating':
        return '운영중';
      case 'preparing':
        return '준비중';
      case 'ended':
        return '종료';
      case 'closed':
        return '오늘휴무';
      default:
        return '';
    }
  };

  // 현재 운영 상태 계산
  const operationStatus = getOperationStatus();

  // 요일 문자열을 포맷팅하는 함수 - 요일별 운영 여부 표시용
  const formatWeekDays = (dateStr) => {
    if (!dateStr) return null;

    const weekdays = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    // 요일 약자('월', '화' 등)를 전체 이름('월요일', '화요일' 등)으로 변환
    const operatingDays = dateStr.split('+').map(day => {
      const dayMap = {
        '월': '월요일',
        '화': '화요일',
        '수': '수요일',
        '목': '목요일',
        '금': '금요일',
        '토': '토요일',
        '일': '일요일'
      };

      return dayMap[day.trim()] || day.trim();
    })
    

    // 각 요일별 운영 여부 정보를 담은 객체 배열 반환
    return weekdays.map(day => ({
      day,
      isOperating: operatingDays.some(d => d.includes(day))
    }));
  };

  // 요일 표시 컴포넌트 - 내부 컴포넌트로 정의
  const WeekdayDisplay = ({ dateStr }) => {
    const weekdayInfo = formatWeekDays(dateStr);
    
    if (!weekdayInfo) return null;

    // 요일별 운영 여부를 시각적으로 표시
    return (
      <div className={styles.mealCard__weekdays}>
        {weekdayInfo.map(({ day, isOperating }) => (
          <span
            key={day}
            className={`${styles.weekdayBox} ${isOperating ? styles.active : styles.inactive}`}
          >
            {day}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.mealCard} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      {/* 카드 헤더 - 시설명과 운영 상태 표시 */}
      <div className={styles.mealCard__header}>
        <div className={styles.mealCard__facility}>
          <span className="material-symbols-rounded">fork_spoon</span>
          {meal.name}
        </div>
        <div className={`${styles.statusLabel} ${styles[operationStatus]}`}>
          {getStatusLabel(operationStatus)}
        </div>
      </div>

      {/* 카드 기본 정보 - 주소와 요일 표시 */}
      <div className={styles.mealCard__details}>
        <div className={styles.mealCard__detail}>
          {meal.address}
        </div>
        <div className={styles.mealCard__detail}>
          <WeekdayDisplay dateStr={meal.description} />
        </div>
      </div>

      {/* 확장된 상세 정보 - 선택 시에만 표시 */}
      <div className={`${styles.mealCard__description} ${isSelected ? styles.visible : ''}`}>
        <p data-label="시설명">{meal.name}</p>
        <p data-label="주소">{meal.address}</p>
        <p data-label="전화번호">{meal.phone || '정보 없음'}</p>
        <p data-label="운영시간">{meal.operatingHours}</p>
        <p data-label="급식대상">{meal.targetGroup}</p>
        <p data-label="운영요일">
          <WeekdayDisplay dateStr={meal.description} />
        </p>
      </div>
    </div>
  );
};

// PropTypes를 통한 타입 검증 - 컴포넌트에 전달되는 props의 타입을 검사
MealCard.propTypes = {
  meal: PropTypes.shape({
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    phone: PropTypes.string,
    operatingHours: PropTypes.string,
    description: PropTypes.string,
    targetGroup: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
  cardRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ])
};

export default MealCard;