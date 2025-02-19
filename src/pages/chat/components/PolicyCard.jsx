import React from 'react';
import styles from '../styles/chat.module.scss';

const PolicyCard = ({ policy, onClick, isSelected, cardRef }) => {
  return (
    <div
      ref={cardRef}
      className={`${styles.policyCard} ${isSelected ? styles.selected : ''}`}
      onClick={() => onClick(policy)}
      data-policy-id={policy.id}
    >
      <div className={styles.policyCard__header}>
        <div className={styles.policyCard__department}>
          <span className={`material-symbols-rounded`}>account_balance</span>
          {policy.department}
        </div>
        <div className={styles.policyCard__date}>{policy.publishDate}</div>
      </div>
      
      <h3 className={styles.policyCard__title}>{policy.title}</h3>
      
      <div className={styles.policyCard__tags}>
        {policy.tags.map((tag, index) => (
          <span key={index} className={styles.policyCard__tag}>
            {tag}
          </span>
        ))}
      </div>

      <div className={`${styles.policyCard__description} ${isSelected ? styles.visible : ''}`}>
        <p data-label="지원대상">{policy.target}</p>
        <p data-label="지원내용">{policy.support}</p>
        <p data-label="신청방법">{policy.howToApply}</p>
        <p data-label="신청기간">{policy.applicationPeriod}</p>
        <p data-label="문의처">{policy.contact}</p>
        <p data-label="상세내용">{policy.description}</p>
      </div>

      <div className={`${styles.policyCard__footer} ${isSelected ? styles.visible : ''}`}>
        <a
          href={policy.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.policyCard__button}
          onClick={(e) => e.stopPropagation()}
        >
          자세히 보기
        </a>
      </div>
    </div>
  );
};

export default PolicyCard; 