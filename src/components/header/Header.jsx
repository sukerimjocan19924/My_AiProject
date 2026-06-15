import React, { useState } from 'react'
import styles from './Header.module.scss'

const Header = () => {
  const [category, setCategory] = useState("전체 카테고리")
  const [open, setOpen] = useState(false)

  const categoryIcons = {
    "전체 카테고리": "/icons/icon-bookMark.svg",
    "애니메이션": "/icons/icon-animation.svg",
    "드라마": "/icons/icon-drama.svg",
    "영화": "/icons/icon-movie.svg",
  }

  const categories = Object.keys(categoryIcons)

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <img src="/icons/icon-logo.svg" alt="logo" />
        </div>
        <h1>My Project</h1>
      </div>

      <div className={styles.actions}>
        <div className={styles.categoryBox}>
          <button
            className={styles.categorySelect}
            onClick={() => setOpen(!open)} >
            <span className={styles.categoryLabel}>
                <img src={categoryIcons[category]} alt={category} />
                {category}
            </span>
            <img src="/icons/icon-arrow-down.svg" alt="dropdown" />
          </button>

          {open && (
            <ul className={styles.dropdown}>
              {categories.map((cat) => (
                <li
                  key={cat}
                  onClick={() => {
                    setCategory(cat)
                    setOpen(false)
                  }}
                >
                  <img src={categoryIcons[cat]} alt={cat} />
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className={styles.favoriteBtn}>
          <img src="/icons/icon-star.svg" alt="favorite" />
          즐겨찾기
        </button>
      </div>
    </header>
  )
}

export default Header