import React from 'react';
import PropTypes from 'prop-types';
// import styles from '../styles/chat.module.scss';
import styles from '../styles/commonCard.module.scss';

const JobCard = ({ job, onClick, isSelected, cardRef }) => {
  console.log('JobCard 원본 데이터:', job);

  return (
    <div
      ref={cardRef}
      className={`${styles.jobCard} ${isSelected ? styles.selected : ''}`}
      onClick={() => onClick(job)}
      data-job-id={job.id}
    >
      <div className={styles.jobCard__header}>
        <div className={styles.jobCard__company}>{job.company}</div>
        <h3 className={styles.jobCard__title}>{job.title}</h3>
      </div>
      <div className={styles.jobCard__details}>
        <div className={styles.jobCard__detail}>
          {/* <span className={`material-symbols-rounded`}>money_bag</span> */}
          {job.salary}
        </div>
        <div className={styles.jobCard__detail}>
          {/* <span className={`material-symbols-rounded`}>calendar_month</span> */}
          {job.workingHours}
        </div>
      </div>
      <div className={styles.jobCard__location}>
        {/* <span className={`material-symbols-rounded`}>location_on</span> */}
        {job.location}
      </div>

      <div className={`${styles.jobCard__description} ${isSelected ? styles.visible : ''}`}>
        <p data-label="근무시간">{job.workingHours}</p>
        <p data-label="급여">{job.salary}</p>
        <p data-label="전형방법">{job.hiringProcess}</p>
        <p data-label="제출서류">{job.requiredDocs}</p>
        <p data-label="사회보험">{job.insurance}</p>
        <p data-label="접수마감일">{job.deadline}</p>
        <p data-label="문의전화">{job.phoneNumber}</p>
        <p data-label="모집직종">{job.jobCategory}</p>
        <p data-label="상세내용">{job.description}</p>
      </div>

      <div className={`${styles.jobCard__footer} ${isSelected ? styles.visible : ''}`}>
        <a
          href={job.posting_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.jobCard__button}
          onClick={(e) => e.stopPropagation()}
        >
          지원하기
        </a>
      </div>
    </div>
  );
};

JobCard.propTypes = {
  job: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    salary: PropTypes.string,
    workingHours: PropTypes.string,
    description: PropTypes.string,
    posting_url: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
  cardRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ])
};

export default JobCard; 