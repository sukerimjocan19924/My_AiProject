import React from 'react'
import ArchiveCard from '../components/archive/ArchiveCard'

const FavoritePage = ({ archives, setArchives }) => {
  const favorites = archives.filter(item => item.favorite)

  return (
    <div>
      <h2>즐겨찾기한 작품</h2>
      {favorites.length === 0 ? (
        <p>즐겨찾기한 작품이 없습니다.</p>
      ) : (
        favorites.map(item => (
          <ArchiveCard
            key={item.id}
            item={item}
            archives={archives}
            setArchives={setArchives}
          />
        ))
      )}
    </div>
  )
}

export default FavoritePage
