import { useRoutes } from 'react-router-dom'
import { appRoutes } from './router'

function App() {
  return useRoutes(appRoutes)
}

export default App
