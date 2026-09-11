// src/App.jsx
import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import SmoothScroll from './components/SmoothScroll'

const Recruit = lazy(() => import('./pages/Recruit'))
const Curriculum = lazy(() => import('./pages/Curriculum'))
const Activities = lazy(() => import('./pages/Activities'))
const Projects = lazy(() => import('./pages/Projects'))

const AfterHackLayout = lazy(() => import('./components/afterhack/AfterHackLayout'))
const AfterHackOnboarding = lazy(() => import('./pages/afterhack/Onboarding'))
const AfterHackWrite = lazy(() => import('./pages/afterhack/Write'))
const AfterHackBoard = lazy(() => import('./pages/afterhack/Board'))

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll />
      <ScrollToTop />
      <Suspense fallback={<div className='min-h-screen bg-[#1A1A1A]' />}>
        <Routes>
          {/* 메인 페이지 */}
          <Route path='/' element={<Home />} />
          <Route path='/activities' element={<Activities />} />
          <Route path='/recruit' element={<Recruit />} />
          <Route path='/curriculum/:track' element={<Curriculum />} />

          {/* 프로젝트 리스트 */}
          <Route path='/projects' element={<Projects />} />

          {/* 14기 중앙해커톤 회고 (AFTER HACK) */}
          <Route path='/activities/14th-hackathon' element={<AfterHackLayout />}>
            <Route index element={<AfterHackOnboarding />} />
            <Route path='write' element={<AfterHackWrite />} />
            <Route path='board/:qid' element={<AfterHackBoard />} />
          </Route>

          {/* 옛 프로젝트 홈. 북마크와 외부 링크가 살아 있어 리다이렉트만 남긴다 */}
          <Route path='/projectshome' element={<Navigate to='/projects' replace />} />

          {/*그 외 모든 경로 Home */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
