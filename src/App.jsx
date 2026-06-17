import React, { useEffect, useState } from 'react'
import './App.scss'
import Header from './components/header/Header'
import ArchivePage from './pages/ArchivePage'
import FavoritePage from './pages/FavoritePage'
import CreateForm from './components/form/CreateForm'
import EditForm from './components/form/EditForm'
import Stats from './components/stats/Stats'
import { mockData } from './utils/mockData'

function App() {
  const [archives, setArchives] = useState([])
  const [page, setPage] = useState('archive')
  const [editingItem, setEditingItem] = useState(null)

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
          {editingItem ? (
            <EditForm
              archives={archives}
              setArchives={setArchives}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
            />
          ) : (
            <CreateForm
              archives={archives}
              setArchives={setArchives}
              setEditingItem={setEditingItem}
            />
          )}
          <Stats archives={archives} />
        </aside>

        <section className="content">
          {page === 'archive' && (
            <ArchivePage
              archives={archives}
              setArchives={setArchives}
              editingItem={editingItem} 
              setEditingItem={setEditingItem}
            />
          )}
          {page === 'favorite' && (
            <FavoritePage
              archives={archives}
              setArchives={setArchives}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
            />
          )}
        </section>
      </main>
    </div>
  )
}

export default App
