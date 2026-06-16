import React, { useState } from 'react'
import styles from './CreateForm.module.scss'

const CreateForm = ({ archives, setArchives }) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('애니메이션')
  const [poster, setPoster] = useState('')
  const [description, setDescription] = useState('')
  const [characters, setCharacters] = useState('')
  const [episodeCount, setEpisodeCount] = useState('')
  const [favorite, setFavorite] = useState(false)

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [open, setOpen] = useState(false)

  const categoryIcons = {
    애니메이션: '/icons/icon-animation.svg',
    드라마: '/icons/icon-drama.svg',
    영화: '/icons/icon-movie.svg',
  }

  const categories = Object.keys(categoryIcons)

  const unitMap = {
    '애니메이션': '화',
    '드라마': '회',
    '영화': '분',
  }

  const getEpisodeLabel = (category, count) => {
    const unit = unitMap[category] || ''
    return count ? `총 ${count}${unit}` : ''
  }

  const handleTitleChange = async (e) => {
    const value = e.target.value
    setTitle(value)

    if (value.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const res = await fetch(`/api/search?title=${value}`)
      const data = await res.json()
      setSuggestions(data)
      setShowSuggestions(true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectTitle = (item) => {
    setTitle(item.title)
    setPoster(item.poster || '')
    setDescription(item.description || '')
    setCharacters(item.characters || '')
    setEpisodeCount(item.episodeCount || '')
    setShowSuggestions(false)
    setFavorite(false)
  }

  const handleSubmit = () => {
    const newArchive = {
      id: Date.now(),
      title,
      category,
      poster,
      description,
      characters,
      episodeCount,
      episodeInfo: getEpisodeLabel(category, episodeCount),
      favorite,
    }

    const updatedArchives = [newArchive, ...archives]
    setArchives(updatedArchives)
    localStorage.setItem('archives', JSON.stringify(updatedArchives))

    setTitle('')
    setPoster('')
    setDescription('')
    setCharacters('')
    setEpisodeCount('')
    setFavorite(false)
  }

  return (
    <section className={styles.form}>
      <div className={styles.title}>
        <h2>
          <img src="/icons/icon-plus_circle.svg" alt="icon" />
          새 작품 등록
        </h2>
        <p>제목 입력 시 작품 정보를 자동으로 불러올 수 있습니다</p>
      </div>

      <div className={styles.field}>
        <label>카테고리</label>
        <div className={styles.categoryBox}>
          <button
            type="button"
            className={styles.categorySelect}
            onClick={() => setOpen(!open)}
          >
            <span className={styles.categoryLabel}>
              <img src={categoryIcons[category]} alt={category} />
              {category}
            </span>
            <img src="/icons/icon-arrow-down.svg" alt="icon" />
          </button>

          {open && (
            <ul className={styles.dropdown}>
              {categories.map((cat) => (
                <li key={cat} onClick={() => { setCategory(cat); setOpen(false) }}>
                  <img src={categoryIcons[cat]} alt={cat} />
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <div className={styles.titleWrap}>
          <label>제목</label>
          <div className={styles.titleExtra}>
            <img src="/icons/icon-link.svg" alt="API 연동" />
            <span>API 자동 연동</span>
          </div>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="작품 제목을 입력하세요"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((item) => (
                <li key={item.id} onClick={() => handleSelectTitle(item)}>
                  {item.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label>포스터 이미지</label>
        <div className={styles.poster}>
          {poster ? (
            <img src={poster} alt={title} className={styles.posterImage} />
          ) : (
            <div className={styles.posterPlaceholder}>
              <img src="/icons/icon-image.svg" alt="icon" />
              <span>포스터가 자동으로 표시됩니다</span>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0]
            if (!file) return
            setPoster(URL.createObjectURL(file))
          }}
        />
      </div>

      <div className={styles.field}>
        <label>줄거리</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="간단한 줄거리를 입력하세요"
        />
      </div>

      <div className={styles.field}>
        <label>등장인물</label>
        <input
          type="text"
          value={characters}
          onChange={(e) => setCharacters(e.target.value)}
          placeholder={
            category === '애니메이션'
              ? '예: 쿠로센세이, 나기사, 카르마'
              : category === '드라마'
              ? '예: 윤세리, 리정혁, 구승준'
              : '예: 마석도, 장첸, 김옥분'
          }
        />
      </div>

      <div className={styles.field}>
        <label>회차 정보</label>
        <input
          type="number"
          min="1"
          value={episodeCount}
          onChange={(e) => setEpisodeCount(e.target.value)}
          placeholder={`예: ${category === '영화' ? '109 (분)' : category === '드라마' ? '16 (회)' : '24 (화)'}`}
        />
      </div>
      
      <div className={`${styles.field} ${styles.favorite}`}>
        <div className={styles.favoriteRow}>
          <div className={styles.favoriteTitle}>
            <img
              src={favorite 
                ? "/icons/icon-star2-filled.svg" 
                : "/icons/icon-star2.svg"}
              alt="즐겨찾기"
              className={styles.favoriteIcon}
            />
            <span className={styles.favoriteText}>즐겨찾기</span>
          </div>

          <input
            type="checkbox"
            id="favoriteToggle"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
            className={styles.favoriteCheckbox}
          />
        </div>
      </div>
      
      <button className={styles.submitBtn} onClick={handleSubmit}>
        <img src="/icons/icon-plus.svg" alt="icon" />
        작품 등록하기
      </button>
    </section>
  )
}

export default CreateForm
