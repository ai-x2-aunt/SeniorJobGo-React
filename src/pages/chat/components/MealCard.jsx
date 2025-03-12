import React from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/commonCard.module.scss';

const MealCard = ({ meal, onClick, isSelected, cardRef }) => {
  console.log('MealCard - 받은 급식소 데이터:', meal);

  // 운영 상태를 계산하는 함수
  const getOperationStatus = () => {
    const now = new Date();
    const currentDay = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];
    
    // 운영 요일 확인
    const operatingDays = meal.operatingDays?.split('+').map(day => day.trim()) || [];
    console.log('운영 요일: ', operatingDays);
    console.log('현재 요일: ', currentDay);
    const isOperatingDay = operatingDays.includes(currentDay);
    
    if (!isOperatingDay) {
      return 'closed'; // 휴무
    }

    // 운영 시간 파싱
    const timeMatch = meal.operatingHours?.match(/(\d{1,2}):(\d{2})\s*~\s*(\d{1,2}):(\d{2})/);
    if (!timeMatch) {
      return 'ended'; // 시간 정보가 없으면 기본적으로 종료로 표시
    }

    const [_, startHour, startMin, endHour, endMin] = timeMatch;
    const startTime = new Date();
    startTime.setHours(parseInt(startHour), parseInt(startMin), 0);
    
    const endTime = new Date();
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0);

    const currentTime = now;

    if (currentTime < startTime) {
      return 'preparing'; // 준비중
    } else if (currentTime > endTime) {
      return 'ended'; // 종료
    } else {
      return 'operating'; // 운영중
    }
  };

  // 상태에 따른 라벨 텍스트
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

  const operationStatus = getOperationStatus();

  const formatWeekDays = (dateStr) => {
    if (!dateStr) return null;

    const weekdays = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    // const operatingDays = dateStr.split('+').map(day => day.trim());
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
    

    return weekdays.map(day => ({
      day,
      isOperating: operatingDays.some(d => d.includes(day))
    }));
  };

  const WeekdayDisplay = ({ dateStr }) => {
    const weekdayInfo = formatWeekDays(dateStr);
    
    if (!weekdayInfo) return null;

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
      <div className={styles.mealCard__header}>
        <div className={styles.mealCard__facility}>
          <span className="material-symbols-rounded">fork_spoon</span>
          {meal.name}
        </div>
        <div className={`${styles.statusLabel} ${styles[operationStatus]}`}>
          {getStatusLabel(operationStatus)}
        </div>
      </div>

      <div className={styles.mealCard__details}>
        <div className={styles.mealCard__detail}>
          {meal.address}
        </div>
        <div className={styles.mealCard__detail}>
          {/* <WeekdayDisplay dateStr={meal.description} /> */}
        </div>
      </div>

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