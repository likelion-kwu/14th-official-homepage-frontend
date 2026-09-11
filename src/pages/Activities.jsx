import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { getMagazine } from '../api/magazineApi'
import noiseTexture from '../assets/activities/noise-texture-activities-tile.webp'
import dottedCircle from '../assets/activities/Rectangle.webp'
import cardOt from '../assets/activities/활동소개아이콘1.webp'
import cardProject from '../assets/activities/활동소개아이콘2.webp'
import cardHackathon from '../assets/activities/활통소개아이콘3.webp'
import cardIdeathon from '../assets/activities/활동소개아이콘4.webp'
import hackathonReviewBanner from '../assets/activities/hackathon-review-banner.webp'
import { loadFonts } from '../utils/fonts'
import { toRows } from '../utils/magazineBlocks'
import { renderInline, renderMarkdown } from '../utils/markdown'
import { CURRENT_GENERATION, GENERATIONS } from '../data/generations'

// 에디터는 운영진만 열고 드래그 라이브러리까지 딸려 오므로, 방문자 번들에서 떼어낸다.
const MagazineEditorModal = lazy(() => import('../components/MagazineEditorModal'))

const ACTIVITY_TYPES = { ideathon: 'IDEATHON', hackathon: 'HACKATHON', unionHackathon: 'UNION_HACKATHON' }
const activityCards = [
  { id: 'project', title: '프로젝트', description: '기획부터 구현까지\n작업 과정을 배우는 중요한 활동', image: cardOt, width: 270, height: 271 },
  { id: 'ideathon', title: '아이디어톤', description: '3주간 특정 주제에 맞춰,\n무한한 아이디어를 나누는 행사입니다.', image: cardIdeathon, width: 268, height: 268 },
  { id: 'hackathon', title: '중앙 해커톤', description: '3주간 멋쟁이사자처럼과 함께\n진행하는 대규모 무박 2일 해커톤 행사', image: cardHackathon, width: 266, height: 266 },
  { id: 'unionHackathon', title: '권역별 연합해커톤', description: '서울 권역의 다양한 대학의 멋사와\n교류하며 성장할 수 있는 해커톤 행사', image: cardProject, width: 310, height: 310 },
]

function MagazineItem({ item }) {
  // 업로드할 때 저장해 둔 픽셀 크기가 있으면 넘겨 고유 비율을 미리 잡아준다.
  // 크기를 모르면 로드 전 높이가 0이라 행이 접히고, 지연 로딩 대상으로도 안 잡힌다.
  // 가로는 제한하지 않고 세로만 제한한다: max-height와 max-width(100%)를 함께 두면
  // 브라우저가 원본 비율을 유지한 채 둘 중 더 좁게 만드는 쪽으로 자동 축소해 준다.
  if (item.type === 'image') return <figure>
    <img
      src={item.url}
      alt={item.caption || ''}
      width={item.pixelWidth || undefined}
      height={item.pixelHeight || undefined}
      loading='lazy'
      decoding='async'
      className='mx-auto block h-auto max-h-[280px] w-auto max-w-full rounded-xl md:max-h-[460px]'
    />
    {item.caption && <figcaption className='mt-2 text-center text-sm text-white/65'>{item.caption}</figcaption>}
  </figure>
  return item.style === 'heading'
    ? <h3 className='text-xl font-semibold leading-relaxed md:text-3xl'>{renderInline(item.text, 'heading')}</h3>
    : <div className='space-y-3 text-base leading-relaxed text-white/90 md:text-lg'>{renderMarkdown(item.text)}</div>
}

function MagazineContent({ magazine }) {
  // 한 행에 여러 항목이 오면 md 이상에서만 가로로 눕히고, 모바일에서는 세로로 쌓는다.
  const rows = useMemo(() => toRows(magazine.blocks), [magazine.blocks])
  return <article className='py-8 md:py-10'>
    <h2 className='text-2xl font-semibold md:text-4xl'>{magazine.title}</h2>
    {rows.length === 0 ? <p className='mt-6 text-white/70'>등록된 본문이 없습니다.</p> : <div className='mt-7 space-y-6 md:mt-10 md:space-y-8'>
      {rows.map((row) => <div key={row.id} className='flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-12'>
        {/* flex-1은 md 이상에서만. 모바일은 flex-col이라 flex-basis:0이 높이에 걸려 행이 접힌다. */}
        {/* 사진이 다른 항목과 나란히 놓이거나(좌/우 배치) 절반 너비로 지정되면, 페이지 전체 폭의 1/3로 좁힌다. */}
        {/* justify-between: 사진 두 장처럼 항목 너비 합이 행보다 좁을 때, 남는 공간을 항목 사이로 몰아서
            양쪽 끝(좌/우)에 딱 붙게 만든다. flex-1 항목이 있으면 이미 끝까지 채우므로 영향이 없다. */}
        {row.items.map((item) => {
          const sideBySide = row.items.length > 1
          const narrowImage = item.type === 'image' && (sideBySide || item.width === 'half')
          const widthClass = narrowImage
            ? `w-full md:w-1/3 ${sideBySide ? 'md:flex-none' : ''}`
            : 'w-full min-w-0 md:flex-1'
          return <div key={item.id} className={widthClass}>
            <MagazineItem item={item} />
          </div>
        })}
      </div>)}
    </div>}
  </article>
}

export default function Activities() {
  const navigate = useNavigate()
  const [selectedActivity, setSelectedActivity] = useState('hackathon')
  const [selectedGeneration, setSelectedGeneration] = useState(CURRENT_GENERATION)
  // null이면 닫힘, 'create'는 새 매거진, 'edit'은 현재 보고 있는 매거진 수정.
  const [editorMode, setEditorMode] = useState(null)
  const [savedNotice, setSavedNotice] = useState('')

  useEffect(() => { loadFonts() }, [])

  // magazines.json은 빌드에 함께 커밋된 정적 데이터이므로 동기적으로 조회한다.
  const magazine = useMemo(
    () => getMagazine(ACTIVITY_TYPES[selectedActivity], selectedGeneration),
    [selectedActivity, selectedGeneration],
  )

  const selectCard = (cardId) => {
    if (cardId === 'project') { navigate('/projects'); return }
    setSelectedActivity(cardId); setSelectedGeneration(CURRENT_GENERATION)
  }
  const selectGeneration = (generation) => {
    setSelectedGeneration(generation)
  }
  const handleCardKeyDown = (event, cardId) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectCard(cardId) }
  }
  const openEditor = (mode) => { setSavedNotice(''); setEditorMode(mode) }
  const handleSaved = ({ activityType, generation }) => {
    const activityId = Object.entries(ACTIVITY_TYPES).find(([, type]) => type === activityType)?.[0]
    if (activityId) setSelectedActivity(activityId)
    setSelectedGeneration(generation)
    setEditorMode(null)
    setSavedNotice('저장되었습니다. 배포가 반영되기까지 1분 정도 걸릴 수 있습니다.')
  }
  const handleDeleted = () => {
    setEditorMode(null)
    setSavedNotice('삭제되었습니다. 배포가 반영되기까지 1분 정도 걸릴 수 있습니다.')
  }

  return <div className='relative flex min-h-screen flex-col overflow-x-hidden text-white' style={{ backgroundColor: '#111315', fontFamily: 'Space Grotesk' }}>
    <div className='pointer-events-none absolute inset-0 z-[1] opacity-[0.82]' style={{ backgroundImage: `url(${noiseTexture})`, backgroundRepeat: 'repeat', backgroundSize: '256px 256px', backgroundPosition: 'top center' }} />
    <Header />
    <main className='relative z-10 flex-1 overflow-x-hidden px-4 pb-12 pt-28 md:px-6 md:pt-36 lg:pt-20'>
      <section className='relative mx-auto max-w-[1360px] overflow-x-hidden'>
        <img src={dottedCircle} alt='' width='1200' height='925' loading='eager' decoding='async' className='pointer-events-none absolute left-1/2 top-[28%] w-[860px] max-w-[72vw] -translate-x-1/2 -translate-y-1/2 opacity-85' />
        <h1 className='text-center text-[14px] font-semibold tracking-tight md:text-[20px]'>광운대 멋쟁이사자처럼의 활동을 소개합니다.</h1>
        <div className='mb-[30px] mt-10 grid grid-cols-1 gap-[30px] sm:grid-cols-2 sm:gap-5 lg:mt-8 lg:grid-cols-4 lg:gap-0.5'>
          {activityCards.map((card) => {
            // 호버는 md 이상(데스크탑)에서만 활성 표시를 만든다. 모바일은 호버가 없어서
            // 대신 현재 선택된 카드에 max-md:로 같은 스타일을 유지한다.
            const selected = card.id === selectedActivity
            return <article key={card.id} role='button' tabIndex={0} onClick={() => selectCard(card.id)} onKeyDown={(event) => handleCardKeyDown(event, card.id)} className={`group relative mx-auto flex h-[136px] w-full max-w-[268px] cursor-pointer flex-row items-center gap-4 overflow-hidden rounded-[16px] border border-white/85 bg-white/[0.22] px-5 py-4 transition md:hover:border-orange-300 md:hover:shadow-[0_0_20px_rgba(255,153,102,0.3)] sm:h-[500px] sm:flex-col sm:items-center sm:rounded-[30px] sm:px-6 sm:pb-8 sm:pt-10 lg:h-[420px] lg:max-w-[276px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-300 ${selected ? 'max-md:border-orange-300 max-md:shadow-[0_0_20px_rgba(255,153,102,0.3)]' : ''}`} aria-label={card.id === 'project' ? '프로젝트 페이지로 이동' : `${card.title} 매거진 보기`}>
              <span aria-hidden='true' className='activity-card-shine pointer-events-none absolute inset-y-[-20%] left-0 z-10 w-[35%] bg-gradient-to-r from-transparent via-white/45 to-transparent' />
              <div className='flex h-[82px] w-[82px] shrink-0 items-center justify-center sm:h-[220px] sm:w-full'><img src={card.image} alt='' width={card.width} height={card.height} loading='eager' decoding='async' className='w-full object-contain sm:w-[85%]' /></div>
              <div className='flex-1 sm:mt-auto sm:w-full sm:flex-none sm:-translate-y-[50px]'><h2 className='text-left text-[18px] font-normal leading-[1.1] sm:flex sm:h-[76px] sm:items-end sm:justify-center sm:text-center sm:text-[26px] sm:font-semibold lg:text-[24px]'>{card.title}</h2><p className='mt-2 whitespace-pre-line text-left text-[12px] font-normal leading-[1.28] text-white/95 sm:mt-4 sm:min-h-[116px] sm:text-center sm:text-[16px] sm:font-medium sm:leading-[1.28] lg:text-[14px]'>{card.description}</p></div>
            </article>
          })}
        </div>
        <section className='relative mt-12 pb-6 md:mt-16' aria-label='활동 매거진'>
          <div className='flex items-center justify-between gap-4'><div className='flex gap-2'>{GENERATIONS.map((generation) => {
            const active = generation === selectedGeneration
            return <button key={generation} type='button' onClick={() => selectGeneration(generation)} className={`inline-flex h-10 min-w-12 items-center justify-center rounded-full border px-4 text-sm font-semibold transition ${active ? 'border-orange-300 bg-white text-orange-500 shadow-[0_0_16px_rgba(255,153,102,0.35)]' : 'border-white/35 bg-transparent text-white hover:border-white/70'}`}>{generation}th</button>
          })}</div><div className='flex items-center gap-1'>
            <button type='button' onClick={() => openEditor('create')} disabled={Boolean(magazine)} title={magazine ? '이 활동·기수에는 이미 매거진이 있습니다. 수정하거나 삭제해 주세요.' : '새 매거진 등록'} className='inline-flex h-8 items-center rounded-full px-2 text-sm font-medium text-white/40 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 disabled:cursor-not-allowed disabled:text-white/15 disabled:hover:text-white/15' aria-label='매거진 등록'>+ 등록</button>
            {magazine && <button type='button' onClick={() => openEditor('edit')} className='inline-flex h-8 items-center rounded-full px-2 text-sm font-medium text-white/40 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60' aria-label='현재 매거진 수정'>수정</button>}
          </div></div>
          <div className='mt-5 border-t border-white/25' />
          {savedNotice && <div role='status' className='mt-5 rounded-lg border border-orange-300/60 bg-orange-300/10 px-4 py-3 text-sm text-orange-200'>{savedNotice}</div>}
          {!magazine && <div className='py-12 text-center text-white/65'>등록된 매거진이 없습니다.</div>}
          {magazine && <MagazineContent magazine={magazine} />}
        </section>
        <a
          href='https://www.likelion-kwu.com/activities/14th-hackathon'
          target='_blank'
          rel='noopener noreferrer'
          aria-label='14기 중앙해커톤 회고 다시 보기'
          className='group relative mt-4 block overflow-hidden rounded-[20px] border border-white/20 transition md:hover:border-orange-300 md:hover:shadow-[0_0_24px_rgba(255,153,102,0.3)]'
        >
          <img
            src={hackathonReviewBanner}
            alt='AFTER HACK — 끝난 줄 알았지? 우리의 다음은 지금부터. 14기 중앙해커톤 회고'
            width={2555}
            height={1262}
            loading='lazy'
            decoding='async'
            className='block w-full transition duration-500 md:group-hover:scale-[1.02]'
          />
          <div className='pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition md:group-hover:opacity-100' />
          <span className='absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-[#111315] opacity-0 transition md:bottom-6 md:right-7 md:text-sm md:group-hover:opacity-100'>
            회고 다시 보기 ↗
          </span>
        </a>
      </section>
    </main>
    <div className='relative z-20 w-full px-4 pb-3'><Footer /></div>
    {editorMode && <Suspense fallback={<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 text-sm text-white/70'>편집기를 불러오는 중…</div>}>
      <MagazineEditorModal initialActivity={ACTIVITY_TYPES[selectedActivity]} initialGeneration={selectedGeneration} initialMagazine={editorMode === 'edit' ? magazine : null} onClose={() => setEditorMode(null)} onSaved={handleSaved} onDeleted={handleDeleted} />
    </Suspense>}
  </div>
}
