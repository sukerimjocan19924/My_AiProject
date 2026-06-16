import React, { useState } from 'react'
import ArchiveList from './ArchiveList'
import styles from './ArchiveTabs.module.scss'

const ArchiveTabs = ({ archives, setArchives, searchTerm }) => {
  const categories = ['전체', '애니메이션', '드라마', '영화']
  const [activeTab, setActiveTab] = useState('전체')

  const filteredArchives = archives.filter(item => {
    const matchCategory =
      activeTab === '전체' ? true : item.category === activeTab
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <section className={styles.tabs}>
      {/* 카테고리 탭 */}
      <div className={styles.tabHeader}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`${styles.tabBtn} ${activeTab === cat ? styles.active : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 작품 리스트 */}
      <ArchiveList
        archives={filteredArchives}
        setArchives={setArchives}
        searchTerm={searchTerm}
      />

    </section>
  )
}

export default ArchiveTabs
