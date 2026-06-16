import React from 'react'
import styles from './Stats.module.scss'

const Stats = ({ archives = [] }) => {
  const total = archives.length

  const anime = archives.filter(
    item => item.category === '애니메이션'
  ).length

  const drama = archives.filter(
    item => item.category === '드라마'
  ).length

  const movie = archives.filter(
    item => item.category === '영화'
  ).length

  return (
    <section className={styles.stats}>
      <h3>내 아카이브 현황</h3>

      <div className={styles.grid}>
        <div className={styles.card}>
          <span>{total}</span>
          <p>전체</p>
        </div>

        <div className={styles.card}>
          <span>{anime}</span>
          <p>애니</p>
        </div>

        <div className={styles.card}>
          <span>{drama}</span>
          <p>드라마</p>
        </div>

        <div className={styles.card}>
          <span>{movie}</span>
          <p>영화</p>
        </div>
      </div>
    </section>
  )
}

export default Stats