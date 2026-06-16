import React, { useEffect, useState } from 'react'
import './App.scss'
import Header from './components/header/Header'
import ArchivePage from './pages/ArchivePage'
import FavoritePage from './pages/FavoritePage'
import CreateForm from './components/form/CreateForm'
import Stats from './components/stats/Stats'
import { mockData } from './utils/mockData'

function App() {
  const [archives, setArchives] = useState([])
  const [page, setPage] = useState('archive')

  useEffect(() => {
    const savedData = localStorage.getItem('archives')
    if (savedData) {
      setArchives(JSON.parse(savedData))
    } else {
      localStorage.setItem('archives', JSON.stringify(mockData))
      setArchives(mockData)
    }
  }, [])

  return (
    <div className="app">
      <Header page={page} setPage={setPage} />

      <main className="layout">
        <aside className="sidebar">
          <CreateForm archives={archives} setArchives={setArchives} />
          <Stats archives={archives} />
        </aside>

        <section className="content">
          {page === 'archive' && (
            <ArchivePage archives={archives} setArchives={setArchives} />
          )}
          {page === 'favorite' && (
            <FavoritePage archives={archives} setArchives={setArchives} />
          )}
        </section>
      </main>
    </div>
  )
}

export default App
