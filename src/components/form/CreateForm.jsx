import React, { useState, useEffect, useRef } from 'react'
import styles from './CreateForm.module.scss'

const CreateForm = ({ archives, setArchives, editingItem, setEditingItem }) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('애니메이션')
  const [poster, setPoster] = useState('')
  const [db, setDb] = useState(null)
  const fileInputRef = useRef(null)
  const [description, setDescription] = useState('')
  const [characters, setCharacters] = useState('')
  const [episodeCount, setEpisodeCount] = useState('')
  const [favorite, setFavorite] = useState(false)

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const apiKey = import.meta.env.VITE_TMDB_API_KEY

  const categoryIcons = {
    애니메이션: '/icons/icon-animation.svg',
    드라마: '/icons/icon-drama.svg',
    영화: '/icons/icon-movie.svg',
  }

  const categories = Object.keys(categoryIcons)

  const handleArrowNavigation = (direction) => {
    if (!suggestions.length) return
    setSelectedIndex(prev => {
      let newIndex = prev
      if (direction === 'up') {
        newIndex = prev > 0 ? prev - 1 : suggestions.length - 1
      } else if (direction === 'down') {
        newIndex = prev < suggestions.length - 1 ? prev + 1 : 0
      }
      return newIndex
    })
  }

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
      let searchEndpoint = 'multi'
      let discoverEndpoint = null
      let genreFilter = null

      if (category === '영화') {
        searchEndpoint = 'movie'
        discoverEndpoint = `discover/movie?api_key=${apiKey}&language=ko-KR&sort_by=popularity.desc`
      } else if (category === '드라마') {
        searchEndpoint = 'tv'
        discoverEndpoint = `discover/tv?api_key=${apiKey}&language=ko-KR&with_genres=18&sort_by=popularity.desc`
        genreFilter = 18
      } else if (category === '애니메이션') {
        searchEndpoint = 'tv'
        discoverEndpoint = `discover/tv?api_key=${apiKey}&language=ko-KR&with_genres=16&sort_by=popularity.desc`
        genreFilter = 16
      }

      // 1. 검색 API 호출
      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/${searchEndpoint}?api_key=${apiKey}&query=${encodeURIComponent(value)}&language=ko-KR`
      )
      const searchData = await searchRes.json()

      // ✅ 장르 필터링 (드라마/애니메이션만 적용)
      let filteredResults = searchData.results
      if (genreFilter) {
        filteredResults = filteredResults.filter(item => item.genre_ids?.includes(genreFilter))
      }

      // 2. Discover API 호출 (영화/드라마/애니메이션 구분)
      const discoverRes = await fetch(`https://api.themoviedb.org/3/${discoverEndpoint}`)
      const discoverData = await discoverRes.json()

      // ✅ 중복 제거 후 합치기
      const seen = new Set()
      const combinedResults = [...filteredResults, ...(discoverData.results || [])]
        .filter(item => {
          if (seen.has(item.id)) return false
          seen.add(item.id)
          return true
        })
        .map(item => ({
          id: item.id,
          title: item.title || item.name,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
          description: item.overview,
          characters: '',
          episodeCount: item.media_type === 'tv' ? item.number_of_episodes : ''
        }))

      setSuggestions(combinedResults)
      setSelectedIndex(-1)
      setShowSuggestions(true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectTitle = async (item) => {
    const url = category === '영화'
      ? `https://api.themoviedb.org/3/movie/${item.id}?api_key=${apiKey}&language=ko-KR&append_to_response=credits`
      : `https://api.themoviedb.org/3/tv/${item.id}?api_key=${apiKey}&language=ko-KR&append_to_response=credits`

    try {
      const res = await fetch(url)
      const data = await res.json()

      setTitle(item.title || item.name)
      setPoster(data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '')
      setDescription(data.overview || '')
      setCharacters(data.credits?.cast?.slice(0, 5).map(c => c.name).join(', ') || '')

      if (category === '드라마' || category === '애니메이션') {
        const episodes =
          data.number_of_episodes ??
          (Array.isArray(data.seasons)
            ? data.seasons.reduce((sum, s) => sum + (s.episode_count || 0), 0)
            : 0)
        setEpisodeCount(parseInt(episodes, 10) || '')
      } else {
        setEpisodeCount(data.runtime || '')
      }

      setShowSuggestions(false)
      setFavorite(false)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const request = indexedDB.open("ArchiveDB", 1)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains("posters")) {
        db.createObjectStore("posters", { keyPath: "id" })
      }
    }
    request.onsuccess = (e) => setDb(e.target.result)
  }, [])

  const handlePosterUpload = (file, id) => {
    if (!db) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPoster(reader.result) // 미리보기
      const tx = db.transaction("posters", "readwrite")
      tx.objectStore("posters").put({ id, poster: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      window.alert("작품 제목을 입력해주세요.")
      return
    }

    const newId = Date.now()

    const newArchive = {
      id: newId,
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

    if (poster && db) {
      const tx = db.transaction("posters", "readwrite")
      tx.objectStore("posters").put({ id: newId, poster })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

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
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                e.preventDefault()
                handleArrowNavigation('up')
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                handleArrowNavigation('down')
              }
              if (e.key === 'Enter') {
                e.preventDefault()
                if (selectedIndex >= 0) {
                  handleSelectTitle(suggestions[selectedIndex])
                } else if (suggestions.length > 0) {
                  handleSelectTitle(suggestions[0]) // 아무 것도 선택 안 했으면 첫 번째 자동 선택
                }
              }
            }}
            placeholder="작품 제목을 입력하세요"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((item, index) => (
                <li
                  key={item.id}
                  ref={el => {
                    if (index === selectedIndex && el) {
                      el.scrollIntoView({ block: 'nearest' }) // ✅ 자동 스크롤
                    }
                  }}
                  className={index === selectedIndex ? styles.active : ''}
                  onClick={() => handleSelectTitle(item)}
                >
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
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onloadend = () => setPoster(reader.result); // 미리보기만
            reader.readAsDataURL(file);
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
