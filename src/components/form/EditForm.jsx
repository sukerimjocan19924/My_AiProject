import React, { useState, useEffect, useRef } from 'react'
import styles from './EditForm.module.scss'

const EditForm = ({ editingItem, archives, setArchives, setEditingItem }) => {
  const [title, setTitle] = useState(editingItem?.title || '')
  const [category, setCategory] = useState(editingItem?.category || '애니메이션')
  const [poster, setPoster] = useState(editingItem?.poster || '')
  const [db, setDb] = useState(null)
  const fileInputRef = useRef(null)
  const [description, setDescription] = useState(editingItem?.description || '')
  const [characters, setCharacters] = useState(editingItem?.characters || '')
  const [episodeCount, setEpisodeCount] = useState(editingItem?.episodeCount || '')
  const [favorite, setFavorite] = useState(editingItem?.favorite || false)

  // 드롭다운 상태
  const [open, setOpen] = useState(false)
  const categories = ["애니메이션", "드라마", "영화"]
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const apiKey = import.meta.env.VITE_TMDB_API_KEY

  // 카테고리 아이콘
  const categoryIcons = {
    애니메이션: '/icons/icon-animation.svg',
    드라마: '/icons/icon-drama.svg',
    영화: '/icons/icon-movie.svg',
  }

  // 단위 매핑
  const unitMap = {
    '애니메이션': '화',
    '드라마': '회',
    '영화': '분',
  }

  const handleArrowNavigation = (direction) => {
    if (!suggestions.length) return
    setSelectedIndex((prev) => {
      let newIndex = prev
      if (direction === "up") {
        newIndex = prev > 0 ? prev - 1 : suggestions.length - 1
      } else if (direction === "down") {
        newIndex = prev < suggestions.length - 1 ? prev + 1 : 0
      }
      return newIndex
    })
  }

  const getEpisodeLabel = (category, count) => {
    const unit = unitMap[category] || ''
    return count ? `총 ${count}${unit}` : ''
  }

  // IndexedDB 초기화
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

  const handleTitleChange = async (e) => {
    const value = e.target.value
    setTitle(value)

    if (value.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      let searchEndpoint = "multi"
      let discoverEndpoint = null
      let genreFilter = null

      if (genreFilter) {
        if (category === "드라마") {
          filteredResults = filteredResults.filter(
            (item) =>
              item.genre_ids?.includes(18) && !item.genre_ids?.includes(16),
          )
        } else if (category === "애니메이션") {
          filteredResults = filteredResults.filter(
            (item) =>
              item.genre_ids?.includes(16) && !item.genre_ids?.includes(18),
          )
        } else {
          filteredResults = filteredResults.filter((item) =>
            item.genre_ids?.includes(genreFilter),
          )
        }
      }

      // 1. 검색 API 호출
      const searchRes = await fetch(
        `https://api.themoviedb.org/3/search/${searchEndpoint}?api_key=${apiKey}&query=${encodeURIComponent(value)}&language=ko-KR`,
      )
      const searchData = await searchRes.json()

      // ✅ 장르 필터링 강화
      let filteredResults = searchData.results || []
      if (genreFilter) {
        filteredResults = filteredResults.filter((item) => {
          return (
            item.genre_ids?.includes(genreFilter) &&
            !(category === "드라마" && item.genre_ids?.includes(16))
          ) // 드라마일 때 애니 제외
        })
      }

      // 2. Discover API 호출
      const discoverRes = await fetch(
        `https://api.themoviedb.org/3/${discoverEndpoint}`,
      )
      const discoverData = await discoverRes.json()

      // ✅ 중복 제거 후 합치기
      const seen = new Set()
      const combinedResults = [
        ...filteredResults,
        ...(discoverData.results || []),
      ]
        .filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        })
        .map((item) => ({
          id: item.id,
          title: item.title || item.name,
          poster: item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : "",
          description: item.overview,
          characters: "",
          episodeCount:
            category === "영화"
              ? item.runtime || ""
              : item.number_of_episodes || "",
        }))

      setSuggestions(combinedResults)
      setSelectedIndex(-1)
      setShowSuggestions(true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSelectTitle = async (item) => {
    const url =
      category === "영화"
        ? `https://api.themoviedb.org/3/movie/${item.id}?api_key=${apiKey}&language=ko-KR&append_to_response=credits`
        : `https://api.themoviedb.org/3/tv/${item.id}?api_key=${apiKey}&language=ko-KR&append_to_response=credits`

    try {
      const res = await fetch(url)
      const data = await res.json()

      setTitle(item.title || item.name)
      setPoster(
        data.poster_path
          ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
          : "",
      )
      setDescription(data.overview || "")
      setCharacters(
        data.credits?.cast
          ?.slice(0, 5)
          .map((c) => c.name)
          .join(", ") || "",
      )

      if (category === "드라마" || category === "애니메이션") {
        const episodes =
          data.number_of_episodes ??
          (Array.isArray(data.seasons)
            ? data.seasons.reduce((sum, s) => sum + (s.episode_count || 0), 0)
            : 0)
        setEpisodeCount(parseInt(episodes, 10) || "")
      } else {
        setEpisodeCount(data.runtime || "")
      }

      setShowSuggestions(false)
    } catch (error) {
      console.error(error)
    }
  }

  // 저장 처리
  const handleSubmit = () => {
    const updatedArchive = {
      ...editingItem,
      title,
      category,
      poster,
      description,
      characters,
      episodeCount,
      episodeInfo: getEpisodeLabel(category, episodeCount),
      favorite,
    }

    const updatedArchives = archives.map((a) =>
      a.id === editingItem.id ? updatedArchive : a,
    )
    setArchives(updatedArchives)
    localStorage.setItem('archives', JSON.stringify(updatedArchives))

    if (poster && db) {
      const tx = db.transaction("posters", "readwrite")
      tx.objectStore("posters").put({ id: editingItem.id, poster })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    setEditingItem(null) // 수정 완료 후 닫기
  }

  return (
    <section className={styles.form}>
      <div className={styles.titleWrap}>
        <h2>
          <img src="/icons/icon-pencil.svg" alt="icon" />
          작품 수정
        </h2>

        {favorite && (
          <div className={styles.titleExtra}>
            <img src="/icons/icon-star2-filled.svg" alt="즐겨찾기됨" />
            <span>즐겨찾기됨</span>
          </div>
        )}
      </div>

      {title && (
        <div className={styles.editingInfo}>
          <span className={styles.tag}>
            {category}
          </span>
          <p>"{title}" 작품 수정 중</p>
        </div>
      )}

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
      </div>

      {/* 제목 입력 + API 자동 연동 */}
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
              if (e.key === "ArrowUp") {
                e.preventDefault()
                handleArrowNavigation("up")
              }
              if (e.key === "ArrowDown") {
                e.preventDefault()
                handleArrowNavigation("down")
              }
              if (e.key === "Enter") {
                e.preventDefault()
                if (selectedIndex >= 0) {
                  handleSelectTitle(suggestions[selectedIndex])
                } else if (suggestions.length > 0) {
                  handleSelectTitle(suggestions[0])
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
                  ref={(el) => {
                    if (index === selectedIndex && el) {
                      el.scrollIntoView({ block: "nearest" })
                    }
                  }}
                  className={index === selectedIndex ? styles.active : ""}
                  onClick={() => handleSelectTitle(item)}
                >
                  {item.title || item.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 포스터 이미지 */}
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
            const file = e.target.files[0]
            if (!file) return
            const reader = new FileReader()
            reader.onloadend = () => setPoster(reader.result)
            reader.readAsDataURL(file)
          }}
        />
      </div>

      {/* 줄거리 */}
      <div className={styles.field}>
        <label>줄거리</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="간단한 줄거리를 입력하세요"
        />
      </div>

      {/* 등장인물 */}
      <div className={styles.field}>
        <label>등장인물</label>
        <input
          type="text"
          value={characters}
          onChange={(e) => setCharacters(e.target.value)}
          placeholder={
            category === '애니메이션'
              ? '예: 탄지로, 이노스케, 젠이츠'
              : category === '드라마'
              ? '예: 윤세리, 리정혁, 구승준'
              : '예: 마석도, 장첸, 김옥분'
          }
        />
      </div>

      {/* 회차 정보 */}
      <div className={styles.field}>
        <label>회차 정보</label>
        <input
          type="number"
          min="1"
          value={episodeCount}
          onChange={(e) => setEpisodeCount(e.target.value)}
          placeholder={
            category === '영화'
              ? '예: 109 (분)'
              : category === '드라마'
              ? '예: 16 (회)'
              : '예: 24 (화)'
          }
        />
      </div>

      {/* 즐겨찾기 토글 */}
      <div className={`${styles.field} ${styles.favorite}`}>
        <div className={styles.favoriteRow}>
          <div className={styles.favoriteTitle}>
            <img
              src={favorite ? "/icons/icon-star2-filled.svg" : "/icons/icon-star2.svg"}
              alt="즐겨찾기"
              className={styles.favoriteIcon}
            />
            <span className={styles.favoriteText}>즐겨찾기</span>
          </div>
          <input
            type="checkbox"
            checked={favorite}
            onChange={(e) => setFavorite(e.target.checked)}
            className={styles.favoriteCheckbox}
          />
        </div>
      </div>

      {/* 버튼 */}
      <div className={styles.actions}>
        <button className={styles.submitBtn} onClick={handleSubmit}>
          <img src="/icons/icon-check.svg" alt="icon" />
          수정 완료
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => setEditingItem(null)}
        >
          <img src="/icons/icon-close.svg" alt="icon" />
          취소 (등록 폼으로 돌아가기)
        </button>
      </div>
    </section>
  )
}

export default EditForm
