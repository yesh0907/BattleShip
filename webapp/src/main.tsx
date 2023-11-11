import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Don't want multiple renders during dev, so not using strict mode
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />,
)
