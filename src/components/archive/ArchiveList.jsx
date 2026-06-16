import React from 'react'
import ArchiveCard from './ArchiveCard'
import styles from './ArchiveList.module.scss'

const ArchiveList = ({ archives, setArchives, searchTerm }) => {
  if (archives.length === 0) {
    if (searchTerm && searchTerm.trim() !== '') {
      return (
        <div className={styles.empty}>
          <img src="/icons/icon-empty.svg" alt="empty" />
          <p className={styles.emptyText}>해당 작품이 없습니다</p>
        </div>
      )
    }

    return (
      <div className={styles.empty}>
        <img src="/icons/icon-empty.svg" alt="empty" />
        <p className={styles.emptyTitle}>아직 등록된 작품이 없습니다</p>
        <p className={styles.emptyText}>왼쪽 폼에서 새 작품을 등록해보세요!</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {archives.map(item => (
        <ArchiveCard
          key={item.id}
          item={item}
          archives={archives}
          setArchives={setArchives}
        />
      ))}
    </div>
  )
}

export default ArchiveList
