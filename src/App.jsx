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
  const [showForm, setShowForm] = useState(false);

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
        {!editingItem && (
          <button className="floating-btn" onClick={() => setShowForm(true)}>
            +
          </button>
        )}

        {showForm && !editingItem && (
          <div className="form-fullscreen">
            <button className="close-btn" onClick={() => setShowForm(false)}>
              ✕
            </button>
            <CreateForm
              archives={archives}
              setArchives={setArchives}
              setEditingItem={setEditingItem}
            />
          </div>
        )}

        {editingItem && (
          <div className="form-fullscreen mobile-only">
            <div className="edit-mode-banner">
              <img src="/icons/icon-pencil.svg" alt="수정" />
              <span>수정 모드 활성화 중</span>
            </div>

            <EditForm
              archives={archives}
              setArchives={setArchives}
              editingItem={editingItem}
              setEditingItem={setEditingItem}
            />
          </div>
        )}

        {(!showForm || editingItem) && (
          <>
            <aside className={`sidebar ${editingItem ? "selected" : ""}`}>
              {editingItem && (
                <div className="edit-mode-banner">
                  <img src="/icons/icon-pencil.svg" alt="수정" />
                  <span>수정 모드 활성화 중</span>
                </div>
              )}

              <div className="form-area">
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
              </div>

              <div className="stats-area desktop-stats">
                <Stats archives={archives} />
              </div>
            </aside>

            <section className="content">
              {page === "archive" && (
                <ArchivePage
                  archives={archives}
                  setArchives={setArchives}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                />
              )}
              {page === "favorite" && (
                <FavoritePage
                  archives={archives}
                  setArchives={setArchives}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                />
              )}
            </section>

            <div className="stats-area mobile-stats">
              <Stats archives={archives} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App
