import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import CategoriesPage from './pages/CategoriesPage'
import StockHistoryPage from './pages/StockHistoryPage'
import { InventoryProvider } from './context/InventoryContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <InventoryProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="history" element={<StockHistoryPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </InventoryProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

export default App
