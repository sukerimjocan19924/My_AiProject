import React from 'react'
import Header from './components/header/Header'
import Form from './components/form/Form'
import List from './components/list/List'

function App() {

  return (
    <div className="app">
      <Header />

      <main>
        <Form />
        <List />
      </main>
    </div>
  )
}

export default App
