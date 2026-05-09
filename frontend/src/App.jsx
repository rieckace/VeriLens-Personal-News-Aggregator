import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import { useAuth } from './context/AuthContext'

import AuthPage from './pages/AuthPage'
import PreferencesPage from './pages/PreferencesPage'
import FeedPage from './pages/FeedPage'
import ArticlePage from './pages/ArticlePage'
import BookmarksPage from './pages/BookmarksPage'
import HistoryPage from './pages/HistoryPage'
import AnalyticsPage from './pages/AnalyticsPage'
import NotificationsPage from './pages/NotificationsPage'
import CommunityPage from './pages/CommunityPage'
import SubmitCommunityNewsPage from './pages/SubmitCommunityNewsPage'
import AdminCommunityModerationPage from './pages/AdminCommunityModerationPage'
import NotFoundPage from './pages/NotFoundPage'

function HomeRedirect() {
  const { token } = useAuth()
  return <Navigate to={token ? '/feed' : '/login'} replace />
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        <Route
          path="/preferences"
          element={
            <ProtectedRoute>
              <PreferencesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/articles/:id"
          element={
            <ProtectedRoute>
              <ArticlePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/community"
          element={
            <ProtectedRoute>
              <CommunityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/submit"
          element={
            <ProtectedRoute>
              <SubmitCommunityNewsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/community"
          element={
            <AdminRoute>
              <AdminCommunityModerationPage />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  )
}
