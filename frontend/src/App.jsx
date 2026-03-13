// import { Routes, Route } from 'react-router-dom'
// import Navbar from './components/Navbar'
// import Home from './pages/Home'
// import Post from './pages/Post'
// import Archive from './pages/Archive'
// import About from './pages/About'
// import Series from './pages/Series'
// import SeriesDetail from './pages/SeriesDetail'
// import SignIn from './pages/SignIn'
// import SignUp from './pages/SignUp'
// import AdminWrite from './pages/AdminWrite'
// import ProtectedRoute from './components/ProtectedRoute'
// import ForgotPassword from './pages/ForgotPassword'

// export default function App() {
//   return (
//     <>
//       <Navbar />
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/post/:slug" element={<Post />} />
//         <Route path="/archive" element={<Archive />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/series" element={<Series />} />
//         <Route path="/series/:seriesSlug" element={<SeriesDetail />} />
//         <Route path="/signin" element={<SignIn />} />
//         <Route path="/signup" element={<SignUp />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route
//           path="/admin/write"
//           element={
//             <ProtectedRoute adminOnly>
//               <AdminWrite />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </>
//   )
// }


// import { Routes, Route, useLocation } from 'react-router-dom'
// import Navbar from './components/Navbar'
// import Home from './pages/Home'
// import Post from './pages/Post'
// import Archive from './pages/Archive'
// import About from './pages/About'
// import Series from './pages/Series'
// import SeriesDetail from './pages/SeriesDetail'
// import SignIn from './pages/SignIn'
// import SignUp from './pages/SignUp'
// import AdminWrite from './pages/AdminWrite'
// import ProtectedRoute from './components/ProtectedRoute'
// import ForgotPassword from './pages/ForgotPassword'
// import ResetPassword from './pages/ResetPassword'

// export default function App() {
//   const location = useLocation()

//   // Routes where header should be hidden
//   const hideHeaderRoutes = ['/signin', '/signup', '/forgot-password']
//   const shouldHideHeader = hideHeaderRoutes.includes(location.pathname) ||
//     location.pathname.startsWith('/reset-password')

//   return (
//     <>
//       {!shouldHideHeader && <Navbar />}
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/post/:slug" element={<Post />} />
//         <Route path="/archive" element={<Archive />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/series" element={<Series />} />
//         <Route path="/series/:seriesSlug" element={<SeriesDetail />} />
//         <Route path="/signin" element={<SignIn />} />
//         <Route path="/signup" element={<SignUp />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password/:token" element={<ResetPassword />} />
//         <Route
//           path="/admin/write"
//           element={
//             <ProtectedRoute adminOnly>
//               <AdminWrite />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </>
//   )
// }

import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Post from './pages/Post'
import Archive from './pages/Archive'
import About from './pages/About'
import Series from './pages/Series'
import SeriesDetail from './pages/SeriesDetail'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import AdminWrite from './pages/AdminWrite'
import AdminDashboard from './pages/AdminDashboard'
import AdminMedia from './pages/AdminMedia'
import AdminPosts from './pages/AdminPosts'
import AdminEditPost from './pages/AdminEditPost'
import UserDashboard from './pages/UserDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  const location = useLocation()

  const hideHeaderRoutes = ['/signin', '/signup', '/forgot-password']
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/reset-password')

  return (
    <>
      {!shouldHideHeader && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/post/:slug" element={<Post />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/about" element={<About />} />
        <Route path="/series" element={<Series />} />
        <Route path="/series/:seriesSlug" element={<SeriesDetail />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/edit/:postId" element={
          <ProtectedRoute adminOnly>
            <AdminEditPost />
          </ProtectedRoute>
        } />
        <Route
          path="/admin/write"
          element={
            <ProtectedRoute adminOnly>
              <AdminWrite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/media"
          element={
            <ProtectedRoute adminOnly>
              <AdminMedia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/posts"
          element={
            <ProtectedRoute adminOnly>
              <AdminPosts />
            </ProtectedRoute>
          }

        />
        {/* USER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}