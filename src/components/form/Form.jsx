import React, { useState } from 'react'
import styles from './Form.module.scss'

const Form = ({ archives, setArchives }) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('애니메이션')

  const [poster, setPoster] = useState('')
  const [description, setDescription] = useState('')
  const [characters, setCharacters] = useState('')
  const [episodeInfo, setEpisodeInfo] = useState('')

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] =
    useState(false)

  const [open, setOpen] = useState(false)

  const categoryIcons = {
    애니메이션: '/icons/icon-animation.svg',
    드라마: '/icons/icon-drama.svg',
    영화: '/icons/icon-movie.svg',
  }

  const categories = Object.keys(categoryIcons)

  const handleTitleChange = async (e) => {
    const value = e.target.value

    setTitle(value)

    if (value.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const res = await fetch(
        `/api/search?title=${value}`
      )

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

    setCharacters(
      item.characters?.join(', ') || ''
    )

    setEpisodeInfo(
      item.episodeInfo || ''
    )

    setShowSuggestions(false)
  }

  const handleSubmit = () => {
    const newArchive = {
      id: Date.now(),
      title,
      category,
      poster,
      description,
      characters,
      episodeInfo,
    }

    const updatedArchives = [
      newArchive,
      ...archives,
    ]

    setArchives(updatedArchives)

    localStorage.setItem(
      'archives',
      JSON.stringify(updatedArchives)
    )

    setTitle('')
    setPoster('')
    setDescription('')
    setCharacters('')
    setEpisodeInfo('')
  }

  return (
    <section className={styles.form}>
      <div className={styles.title}>
        <h2>
          <img
            src="/icons/icon-plus_circle.svg"
            alt="icon"
          />
          새 작품 등록
        </h2>

        <p>
          제목 입력 시 작품 정보를
          자동으로 불러올 수 있습니다
        </p>
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
              <img
                src={categoryIcons[category]}
                alt={category}
              />
              {category}
            </span>

            <img
              src="/icons/icon-arrow-down.svg"
              alt="icon"
            />
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
                  <img
                    src={categoryIcons[cat]}
                    alt={cat}
                  />
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label>제목</label>

        <div className={styles.searchBox}>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="작품 제목 입력"
          />

          {showSuggestions &&
            suggestions.length > 0 && (
              <ul className={styles.suggestions}>
                {suggestions.map((item) => (
                  <li
                    key={item.id}
                    onClick={() =>
                      handleSelectTitle(item)
                    }
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
            <img
              src={poster}
              alt={title}
              className={styles.posterImage}
            />
          ) : (
            <div className={styles.posterPlaceholder}>
              <img
                src="/icons/icon-image.svg"
                alt="icon"
              />
              <span>
                포스터가 자동으로 표시됩니다
              </span>
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0]

            if (!file) return

            setPoster(
              URL.createObjectURL(file)
            )
          }}
        />
      </div>

      <div className={styles.field}>
        <label>줄거리</label>

        <textarea
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          placeholder="간단한 줄거리를 입력하세요"
        />
      </div>

      <div className={styles.field}>
        <label>등장인물</label>

        <input
          type="text"
          value={characters}
          onChange={(e) =>
            setCharacters(e.target.value)
          }
          placeholder="예: 홍길동, 이몽룡, 춘향"
        />
      </div>

      <div className={styles.field}>
        <label>회차 정보</label>

        <input
          type="text"
          value={episodeInfo}
          onChange={(e) =>
            setEpisodeInfo(e.target.value)
          }
          placeholder="예 : 총 24화"
        />
      </div>

      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
      >
        <img
          src="/icons/icon-plus.svg"
          alt="icon"
        />
        작품 등록하기
      </button>
    </section>
  )
}

export default Form