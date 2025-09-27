import { RouterProvider } from 'react-router-dom'
import { router } from './app/routes'
import { WalletContextProvider } from './providers/WalletContextProvider'

function App() {
  return (
    <WalletContextProvider>
      <RouterProvider router={router} />
    </WalletContextProvider>
  )
}

export default App
