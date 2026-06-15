import React from 'react'
import './App.scss'
import Header from './components/header/Header'
import Form from './components/form/Form'
import Stats from './components/stats/Stats'
import ArchiveTabs from './components/archive/ArchiveTabs'

function App() {

  return (
    <div className="app">
      <Header />

      <main className="layout">
        <aside className="sidebar">
          <Form />
          <Stats />
        </aside>
        
        <section className="content">
          <ArchiveTabs />
        </section>
      </main>
    </div>
  )
}

export default App
