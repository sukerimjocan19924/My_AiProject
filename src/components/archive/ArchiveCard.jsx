import React, { useState, useEffect, useRef } from 'react'
import styles from './ArchiveCard.module.scss'

const ArchiveCard = ({ item, archives, setArchives, setEditingItem }) => {
  const [expanded, setExpanded] = useState(false)
  const [showArrow, setShowArrow] = useState(false)
  const descRef = useRef(null)

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `정말 "${item.title}" 작품을 삭제하시겠습니까?`
    )
    if (confirmDelete) {
      const updatedArchives = archives.filter(
        archive => archive.id !== item.id
      )
      setArchives(updatedArchives)
      localStorage.setItem('archives', JSON.stringify(updatedArchives))
      window.alert('작품이 삭제되었습니다.')
    }
  }

  const handleFavorite = () => {
    const updatedArchives = archives.map(archive =>
      archive.id === item.id ? { ...archive, favorite: !archive.favorite } : archive
    )
    setArchives(updatedArchives)
    localStorage.setItem('archives', JSON.stringify(updatedArchives))
  }

  const handleEdit = () => {
    setEditingItem(item)
  }

  useEffect(() => {
    const checkOverflow = () => {
      if (!descRef.current) return

      const element = descRef.current
      const lineHeight = parseFloat(
        getComputedStyle(element).lineHeight
      )

      const maxHeight = lineHeight * 3

      setShowArrow(
        element.scrollHeight > maxHeight + 1
      )
    }

    checkOverflow()

    window.addEventListener(
      'resize',
      checkOverflow
    )

    return () =>
      window.removeEventListener(
        'resize',
        checkOverflow
      )
  }, [item.description])

  return (
    <div className={styles.card}>
      <div className={styles.poster}>
        {item.poster ? (
          <img src={item.poster} alt={item.title} />
        ) : (
          <div className={`${styles.posterPlaceholder} ${styles[item.category]}`}>
            <img
              src={
                item.category === '애니메이션'
                ? '/icons/icon-animation-list.svg'
                : item.category === '드라마'
                ? '/icons/icon-drama-list.svg'
                : '/icons/icon-movie-list.svg'
              }
              alt={item.category} />
            <span>{item.category}</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.headerRow}>
          <div className={styles.titleCategory}>
            <span className={`${styles.tag} ${styles[item.category]}`}>
              {item.category}
            </span>
            <h4>{item.title}</h4>
          </div>
          <div className={styles.actions}>
            <button className={styles.btn} onClick={handleFavorite}>
              <img
                src={item.favorite ? "/icons/icon-star2-filled.svg" : "/icons/icon-star2.svg"}
                alt="즐겨찾기"
              />
            </button>
            <button className={styles.btn} onClick={handleEdit}>
              <img src="/icons/icon-pencil.svg" alt="수정" />
            </button>
            <button className={styles.btn} onClick={handleDelete}>
              <img src="/icons/icon-trash.svg" alt="삭제" />
            </button>
          </div>
        </div>

        {item.description && (
          <div className={styles.descriptionBox}>
            <div className={styles.descriptionWrapper}>
              <p
                ref={descRef}
                className={`${styles.description} ${expanded ? styles.expanded : ''}`}
              >
                {item.description}
              </p>
              {showArrow && (
                <button
                  className={styles.expandBtn}
                  onClick={() => setExpanded(!expanded)}
                >
                  <img
                    src={expanded ? "/icons/icon-arrow-up.svg" : "/icons/icon-arrow-down.svg"}
                    alt={expanded ? "접기" : "더보기"}
                  />
                </button>
              )}
            </div>
          </div>
        )}

        <div className={styles.metaRow}>
          {item.characters && (
            <div className={styles.metaItem}>
              <img src="/icons/icon-characters.svg" alt="등장인물" />
              <span>{item.characters}</span>
            </div>
          )}
          {item.episodeInfo && (
            <div className={styles.metaItem}>
              <img
                src={item.category === '영화' 
                  ? "/icons/icon-clock.svg"
                  : "/icons/icon-episode.svg"}
                alt={item.category === '영화' ? "러닝타임" : "회차"}
              />
              <span>{item.episodeInfo}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArchiveCard
