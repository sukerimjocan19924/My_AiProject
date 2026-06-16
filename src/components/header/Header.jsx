import React, { useState } from 'react'
import styles from './Header.module.scss'

const Header = ({ page, setPage }) => {

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <img src="/icons/icon-logo.svg" alt="logo" />
        </div>
        <h1>나의 작품 아카이브</h1>
      </div>

      <div className={styles.actions}>
        {page === 'favorite' && (
          <button
            className={styles.archiveBtn}
            onClick={() => setPage('archive')}
          >
            <img src="/icons/icon-arrow-left.svg" />
            목록으로
          </button>
        )}

        <button
          className={styles.favoriteBtn}
          onClick={() => setPage('favorite')}
        >
          <img
            src={
              page === 'favorite'
                ? "/icons/icon-star-filled.svg"
                : "/icons/icon-star.svg"
            }
            alt="favorite"
          />
          즐겨찾기
        </button>
      </div>
    </header>
  )
}

export default Header
