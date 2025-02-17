import React, { useState, useEffect } from 'react';
import styles from './styles/TrainingSearchModal.module.scss';

const TrainingSearchModal = ({ isOpen, onClose, onSubmit, userProfile }) => {
  const [formData, setFormData] = useState({
    city: '',
    district: '',
    interests: [],
    preferredTime: '',
    preferredDuration: ''
  });
  const [isEditing, setIsEditing] = useState(!userProfile);
  const [customInterest, setCustomInterest] = useState('');

  const cities = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
  const commonInterests = ['사무행정', 'IT/컴퓨터', '요양보호', '조리/외식', '운전/운송', '생산/제조', '판매/영업', '건물관리', '경비'];

  useEffect(() => {
    if (userProfile) {
      setFormData(userProfile);
      setIsEditing(false);
    }
  }, [userProfile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, customInterest.trim()]
      }));
      setCustomInterest('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{userProfile ? '맞춤 훈련정보 확인' : '정보 입력'}</h2>
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.formGroup}>
            <label>희망 교육지역</label>
            <div className={styles.locationInputs}>
              <select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                disabled={!isEditing}
                required
              >
                <option value="">시/도 선택</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                disabled={!isEditing}
                placeholder="군/구 입력"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>관심 분야 (다중 선택 가능)</label>
            <div className={styles.interestButtons}>
              {commonInterests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  className={`${styles.interestButton} ${formData.interests.includes(interest) ? styles.active : ''}`}
                  onClick={() => toggleInterest(interest)}
                  disabled={!isEditing}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className={styles.customInterestInput}>
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                disabled={!isEditing}
                placeholder="다른 관심 분야 입력"
              />
              <button
                type="button"
                onClick={addCustomInterest}
                disabled={!isEditing || !customInterest.trim()}
                className={styles.addButton}
              >
                추가
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>선호 교육시간</label>
            <select
              value={formData.preferredTime}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
              disabled={!isEditing}
            >
              <option value="">선택하세요</option>
              <option value="morning">오전 (09:00~12:00)</option>
              <option value="afternoon">오후 (13:00~17:00)</option>
              <option value="evening">저녁 (18:00~21:00)</option>
              <option value="anytime">시간 무관</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>선호 교육기간</label>
            <select
              value={formData.preferredDuration}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredDuration: e.target.value }))}
              disabled={!isEditing}
            >
              <option value="">선택하세요</option>
              <option value="short">단기 (1개월 이내)</option>
              <option value="medium">중기 (1~3개월)</option>
              <option value="long">장기 (3개월 이상)</option>
              <option value="any">기간 무관</option>
            </select>
          </div>

          <div className={styles.buttonGroup}>
            {userProfile && !isEditing ? (
              <>
                <button type="button" onClick={handleEdit} className={styles.editButton}>
                  수정하기
                </button>
                <button type="submit" className={styles.submitButton}>
                  검색하기
                </button>
              </>
            ) : (
              <button type="submit" className={styles.submitButton}>
                검색하기
              </button>
            )}
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingSearchModal; 