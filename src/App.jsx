import React, { useEffect, useState } from 'react'
import './App.scss'
import Header from './components/header/Header'
import Form from './components/form/Form'
import Stats from './components/stats/Stats'
import ArchiveTabs from './components/archive/ArchiveTabs'

import { mockData } from './utils/mockData'

function App() {
  const [archives, setArchives] = useState([])

  useEffect(() => {
    const savedData = localStorage.getItem('archives')

    if (savedData) {
      setArchives(JSON.parse(savedData))
    } else {
      localStorage.setItem(
        'archives',
        JSON.stringify(mockData)
      )
      setArchives(mockData)
    }
  }, [])

  return (
    <div className="app">
      <Header />

      <main className="layout">
        <aside className="sidebar">
          <Form
            archives={archives}
            setArchives={setArchives}
          />

          <Stats archives={archives} />
        </aside>

        <section className="content">
          <ArchiveTabs archives={archives} />
        </section>
      </main>
    </div>
  )
}

export default App
