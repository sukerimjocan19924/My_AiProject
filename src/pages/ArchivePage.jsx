import React, { useState } from 'react'
import ArchiveTabs from '../components/archive/ArchiveTabs'
import styles from './ArchivePage.module.scss'

const ArchivePage = ({ archives, setArchives, editingItem, setEditingItem }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('latest')
  const [open, setOpen] = useState(false)

  const sortOptions = [
    { value: 'latest', label: '최신순', icon: '/icons/icon-latest.svg' },
    { value: 'oldest', label: '오래된 순', icon: '/icons/icon-oldest.svg' },
    { value: 'titleAsc', label: '오름차순', icon: '/icons/icon-asc.svg' },
    { value: 'titleDesc', label: '내림차순', icon: '/icons/icon-desc.svg' },
  ]

  const sortArchives = (list) => {
    switch (sortOption) {
      case 'titleAsc':
        return [...list].sort((a, b) => a.title.localeCompare(b.title))
      case 'titleDesc':
        return [...list].sort((a, b) => b.title.localeCompare(a.title))
      case 'oldest':
        return [...list].sort((a, b) => a.id - b.id)
      case 'latest':
      default:
        return [...list].sort((a, b) => b.id - a.id)
    }
  }

  const filteredArchives = sortArchives(
    archives.filter(item => {
      const search = searchTerm.toLowerCase()
      return item.title?.toLowerCase().includes(search)
    })
  )

  const selected = sortOptions.find(opt => opt.value === sortOption)

  return (
    <div className={styles.archivePage}>
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <img src="/icons/icon-search.svg" alt="검색" />
          </span>
          <input
            type="text"
            placeholder="제목 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.sortBox}>
          <button
            type="button"
            className={styles.sortSelect}
            onClick={() => setOpen(!open)}
          >
            <span className={styles.sortLabel}>
              <img src={selected.icon} alt={selected.label} />
              {selected.label}
            </span>
            <img src="/icons/icon-arrow-down.svg" alt="icon" />
          </button>

          {open && (
            <ul className={styles.dropdown}>
              {sortOptions.map(opt => (
                <li
                  key={opt.value}
                  onClick={() => { setSortOption(opt.value); setOpen(false) }}
                >
                  <img src={opt.icon} alt={opt.label} />
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ArchiveTabs
        archives={filteredArchives}
        setArchives={setArchives}
        searchTerm={searchTerm}
        setEditingItem={setEditingItem}
        editingItem={editingItem}
      />
    </div>
  )
}

export default ArchivePage
