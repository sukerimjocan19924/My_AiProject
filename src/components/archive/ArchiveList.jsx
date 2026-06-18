import React from 'react'
import ArchiveCard from './ArchiveCard'
import styles from './ArchiveList.module.scss'

const ArchiveList = ({ archives, setArchives, searchTerm, type, setEditingItem, editingItem }) => {
  if (archives.length === 0) {
    if (type === 'favorites') {
      return (
        <div className={`${styles.empty} ${styles.favoritesEmpty}`} >
          <img src="/icons/icon-empty-star.svg" alt="empty" />
          <p className={styles.emptyTitle}>즐겨찾기한 작품이 없습니다</p>
          <p className={styles.emptyText}>작품 카드의 ⭐ 버튼을 눌러 즐겨찾기에 추가해보세요!</p>
        </div>
      )
    }

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
    <div className={`${styles.list} ${type === 'favorites' ? styles.favoritesList : ''}`}>
      {archives.map(item => (
        <ArchiveCard
          key={item.id}
          item={item}
          archives={archives}
          setArchives={setArchives}
          setEditingItem={setEditingItem}
          editingItem={editingItem}
        />
      ))}
    </div>
  )
}

export default ArchiveList
