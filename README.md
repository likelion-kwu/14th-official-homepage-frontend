# 광운대 멋쟁이사자처럼 14기 공식 홈페이지

운영 주소: **https://www.likelion-kwu.com**
저장소: `likelion-kwu/14th-official-homepage-frontend`

이 문서 하나로 인수인계가 끝나도록 썼습니다. 코드를 못 읽는 운영진이 콘텐츠를
올리는 방법부터, 다음 기수 개발자가 기능을 고치고 새 기수로 넘기는 방법까지
전부 들어 있습니다.

---

## 목차

**운영 인수인계**

- [0. 이 문서를 읽는 법](#0-이-문서를-읽는-법)
- [1. 서비스 개요](#1-서비스-개요)
- [2. 인수인계 체크리스트](#2-인수인계-체크리스트)
- [3. 운영 매뉴얼](#3-운영-매뉴얼)
- [4. 배포와 인프라](#4-배포와-인프라)

**개발 인수인계**

- [5. 개발 환경 세팅](#5-개발-환경-세팅)
- [6. 코드 구조](#6-코드-구조)
- [7. 화면별 수정 가이드](#7-화면별-수정-가이드)
- [8. 자주 하는 작업 레시피](#8-자주-하는-작업-레시피)
- [9. 함정 모음](#9-함정-모음)

**공통**

- [10. 보안 노트](#10-보안-노트)
- [11. 브랜치와 릴리스 규칙](#11-브랜치와-릴리스-규칙)
- [12. 알려진 이슈와 백로그](#12-알려진-이슈와-백로그)
- [13. 참고 링크](#13-참고-링크)

---

## 0. 이 문서를 읽는 법

역할에 따라 읽는 순서가 다릅니다.

| 당신이 | 읽을 곳 |
|---|---|
| 회장·부회장 등 계정을 넘겨받는 사람 | 1장 → 2장 → 4장 |
| 홈페이지에 프로젝트·활동 글만 올릴 사람 | 1.3절 → 3장 |
| 다음 기수 프론트엔드 담당자 | 전부. 특히 8.1절과 9장 |

시간이 없다면 이 세 문장만 기억하면 됩니다.

1. 이 사이트에는 **데이터베이스가 없습니다.** 화면에서 누른 "등록"은 GitHub
   저장소에 커밋을 만들고, 그 커밋이 Vercel 재배포를 일으켜 반영됩니다.
2. 그래서 **콘텐츠 등록은 프로덕션(`www.likelion-kwu.com`)에서만 됩니다.**
   PR 프리뷰 주소에서는 어떤 암호를 넣어도 실패합니다. 버그가 아닙니다.
3. 의존성을 건드릴 때는 **반드시 pnpm** 을 쓰고 `pnpm-lock.yaml`을 같이
   커밋합니다. npm을 쓰면 로컬은 멀쩡한데 배포만 깨집니다.

---

## 1. 서비스 개요

### 1.1 무엇을 하는 사이트인가

광운대 멋쟁이사자처럼의 대외 홍보용 홈페이지입니다. 동아리 소개, 파트별
커리큘럼, 모집 안내, 활동 기록(매거진), 역대 프로젝트 목록을 보여줍니다.
로그인이나 회원 개념은 없고, 방문자는 전부 익명입니다.

운영진만 쓰는 기능이 두 개 있는데(프로젝트 등록, 활동 매거진 편집) 별도 관리자
페이지 없이 해당 화면 안에 버튼으로 붙어 있습니다. 공유 암호 하나로 잠급니다.

### 1.2 페이지 목록

| 경로 | 화면 | 파일 |
|---|---|---|
| `/` | 메인. 히어로, ABOUT, CORE VALUES, CTA | `src/pages/Home.jsx` |
| `/activities` | 주요 활동 소개 + 기수별 활동 매거진 | `src/pages/Activities.jsx` |
| `/recruit` | 모집 안내, 파트 소개, 일정 | `src/pages/Recruit.jsx` |
| `/curriculum/:track` | 파트별 커리큘럼. `track`은 `design`/`frontend`/`backend` | `src/pages/Curriculum.jsx` |
| `/projects` | 역대 프로젝트 목록 + 상세 모달 | `src/pages/Projects.jsx` |
| `/projectshome` | 옛 주소. `/projects`로 리다이렉트만 남김 | `src/App.jsx` |
| `/activities/14th-hackathon` | AFTER HACK — 14기 중앙해커톤 회고 온보딩 | `src/pages/afterhack/Onboarding.jsx` |
| `/activities/14th-hackathon/write` | 회고 답변 작성(질문 선택 카드) | `src/pages/afterhack/Write.jsx` |
| `/activities/14th-hackathon/board/:qid` | 회고 칠판. `qid`는 1~4, 그 외는 `board/1`로 리다이렉트 | `src/pages/afterhack/Board.jsx` |
| 그 외 전부 | `/`로 리다이렉트 | `src/App.jsx` |

AFTER HACK 세 화면은 원래 `kwu-likelion-hack-review`라는 별도 Next.js
저장소/Vercel 프로젝트였다가 이 저장소로 이주해 온 것입니다(2026-09).
디렉터리와 스타일 스코핑 방식이 나머지 화면과 다른 이유는 6.1/9.10을
보세요.

`:track`에 이상한 값이 들어오면 404를 내지 않고 `frontend`로 떨어집니다
(`Curriculum.jsx`의 `safeTrack`).

### 1.3 아키텍처 한 장 요약

```
방문자 브라우저
      |
      v
  Vercel (정적 SPA + 서버리스 함수)
      |
      +-- / , /projects , ... ---> dist/index.html (React Router가 화면 결정)
      |
      +-- /api/*  ---> api/ 아래 Node 서버리스 함수
                          |
                          |  GitHub App 설치 토큰으로 인증
                          v
                    GitHub Contents API
                          |  main 브랜치에 커밋
                          v
              src/data/*.json , public/uploads/*
                          |
                          |  커밋 -> Vercel 자동 재배포
                          v
                    새 빌드가 사이트에 반영
```

**즉 GitHub 저장소가 데이터베이스 역할을 합니다.** 프로젝트 정보는
`src/data/registeredProjects.json`, 활동 매거진은 `src/data/magazines.json`,
업로드된 사진은 `public/uploads/` 안에 파일로 들어갑니다.

이 구조의 대가는 **반영 지연**입니다. 등록 버튼을 눌러도 커밋 → 빌드 → 배포가
끝나야 다른 사람 화면에 보입니다. 보통 1분 안팎입니다. 화면에 "배포가
반영되기까지 1분 정도 걸릴 수 있습니다"라고 안내가 뜨는 이유입니다.

대신 얻는 것도 큽니다. 별도 DB 비용과 운영이 없고, 콘텐츠 변경 이력이 전부 git
로그에 남아 되돌리기 쉽습니다. 동아리처럼 매년 담당자가 바뀌는 조직에는 지킬 게
적은 쪽이 유리합니다.

### 1.4 기술 스택

| 영역 | 사용 |
|---|---|
| 프레임워크 | React 19 + React Router 7 (SPA) |
| 빌드 | Vite 7 |
| 스타일 | Tailwind CSS 3 |
| 패키지 매니저 | **pnpm 10.34.5** (고정) |
| 호스팅·서버리스 | Vercel |
| 콘텐츠 저장소 | GitHub Contents API |
| 부드러운 스크롤 | lenis |
| 매거진 편집 드래그 | @dnd-kit/core |

TypeScript는 쓰지 않습니다. 테스트 코드도 없습니다. 상태 관리 라이브러리 없이
`useState` / `useMemo` 만 씁니다.

---

## 2. 인수인계 체크리스트

계정과 권한부터 넘겨받으세요. 이걸 놓치면 코드를 아무리 잘 알아도 사이트를
고칠 수 없습니다. 실제로 이전 담당자의 개인 Vercel 프로젝트가 삭제되면서
사이트가 통째로 내려간 적이 있습니다(2026-08-28).

| # | 항목 | 어디서 | 확인 방법 | 완료 |
|---|---|---|---|---|
| 1 | GitHub 조직 `likelion-kwu` 멤버 + 저장소 write 권한 | GitHub | 저장소에 브랜치를 푸시할 수 있는지 | ☐ |
| 2 | **Vercel 팀 `likelion-kwu`** 멤버 권한 | Vercel | 프로젝트 `14th-official-homepage-frontend`가 보이는지 | ☐ |
| 3 | 가비아 계정(도메인 `likelion-kwu.com`) | 가비아 | DNS 레코드 편집 화면에 들어가지는지 | ☐ |
| 4 | GitHub App(콘텐츠 등록용)의 소유·설정 권한 | GitHub 조직 Settings | 4.5절 참고 | ☐ |
| 5 | 운영진 공유 암호 `CONTENT_WRITE_PASSPHRASE` 값 | 인수인계자에게 비밀 채널로 | 프로덕션에서 매거진 저장이 되는지 | ☐ |
| 6 | 인스타그램 `@likelion_kwangwoon` 계정 | 인스타그램 | 푸터 링크 대상 | ☐ |
| 7 | 대표 메일 `kwangwoon.univ@likelion.org` | 멋사 계정 | 푸터 Contact 대상 | ☐ |
| 8 | 지원 구글 폼 편집 권한 | 구글 드라이브 | `src/utils/links.js`의 `FORMLINK` | ☐ |

### 절대 하지 말아야 할 것

- **개인 계정 Vercel 프로젝트로 이 저장소를 연결하지 마세요.** 같은 저장소가 두
  프로젝트에 연결되면 푸시마다 두 곳에 배포되고, 커스텀 도메인이 어느 쪽에
  붙었는지 헷갈립니다. 예전에 이 상태였다가 개인 프로젝트가 삭제되면서 사이트가
  다운됐습니다.
- **개인 GitHub PAT로 콘텐츠 API 인증을 바꾸지 마세요.** PAT는 발급한 사람
  계정에 묶여서, 그 사람이 졸업하고 조직을 떠나면 등록 기능이 죽습니다. 지금
  GitHub App을 쓰는 이유가 이것입니다(4.5절).

---

## 3. 운영 매뉴얼

코드를 건드리지 않고 브라우저에서만 하는 작업입니다.

### 3.1 시작하기 전에 알아야 할 세 가지

**첫째, 반드시 `https://www.likelion-kwu.com` 에서 작업합니다.**
PR 프리뷰 주소(`...vercel.app`)에서는 저장·업로드가 **어떤 암호를 넣어도 실패**
합니다. 콘텐츠용 환경변수를 Production 스코프에만 뒀기 때문입니다. 화면에는
"암호가 올바르지 않습니다"라고 뜨지만 암호 문제가 아닙니다. 자세한 이유는
9장을 보세요.

**둘째, 저장 직후에는 화면에 안 보일 수 있습니다.**
커밋 → 빌드 → 배포가 끝나야 반영됩니다. 1분쯤 기다렸다가 새로고침하세요.
여러 번 누르면 커밋만 여러 개 쌓입니다.

**셋째, 사진은 한 장에 4MB까지입니다.**
브라우저가 업로드 전에 가로 1600px로 줄이고 WebP로 다시 인코딩하므로 웬만한
사진은 자동으로 한도 안에 들어옵니다. 그래도 실패하면 원본이 너무 큰
경우이니 미리 줄여서 올리세요.

### 3.2 프로젝트 등록하기

1. `https://www.likelion-kwu.com/projects` 로 갑니다.
2. 기수 필터 줄 오른쪽 끝의 **`+ 프로젝트 등록`** 을 누릅니다.
3. **운영진 암호를 먼저 입력합니다.** 사진 선택보다 암호가 먼저입니다. 암호가
   비어 있으면 사진 업로드 자체가 막힙니다.
4. 나머지 항목을 채웁니다.

| 항목 | 필수 | 설명 |
|---|---|---|
| 제목 | O | 카드에 크게 나오는 이름 |
| 태그 | O | `WEB` 또는 `APP` |
| 한 줄 소개 | O | 카드 아래 회색 글씨 |
| 기수 | O | `14TH` / `13TH` 중 선택 |
| 활동 | O | 아이디어톤 / 중앙해커톤 / 권역별 연합해커톤 |
| 개요 | O | 상세 모달 본문 |
| 주요 기능 | O, 1개 이상 | 항목마다 한 줄씩 |
| 사진 | O, 1~10장 | **첫 번째 장이 목록 카드 썸네일**이 됩니다 |

5. 사진은 화살표 버튼으로 순서를 바꿀 수 있습니다. 썸네일로 쓸 사진을 맨 앞에
   두세요.
6. **등록**을 누릅니다. "등록되었습니다" 안내가 뜨면 성공입니다.

등록하면 목록 맨 앞에 바로 나타나는데, 이건 아직 배포가 안 끝났어도 등록한
사람 화면에서만 보이게 임시로 붙여 놓은 것입니다. 다른 사람에게 보이려면
배포가 끝나야 합니다.

> **주의:** 사진 한 장이 커밋 하나입니다. 10장을 올리면 커밋 11개(사진 10 +
> 데이터 1)가 찍히고 그만큼 배포가 여러 번 돕니다. 정상입니다.

**등록한 프로젝트를 지우거나 고치려면?** 화면에는 수정·삭제 기능이 없습니다.
개발자가 `src/data/registeredProjects.json`에서 해당 항목을 직접 지우고
커밋해야 합니다(8.2절).

### 3.3 활동 매거진 등록·수정·삭제하기

활동 매거진은 `/activities` 페이지 아래쪽에 붙는 활동 기록 글입니다. 활동
종류(OT / 아이디어톤 / 해커톤)와 기수 조합마다 **하나씩만** 가질 수 있습니다.

**등록**

1. `https://www.likelion-kwu.com/activities` 로 갑니다.
2. 위쪽 카드에서 활동을 고르고, 아래 `14th` / `13th` 중 기수를 고릅니다.
   (프로젝트 카드를 누르면 `/projects`로 이동합니다. 매거진이 아닙니다.)
3. **`+ 등록`** 을 누릅니다. 이미 그 자리에 매거진이 있으면 버튼이 회색으로
   비활성화됩니다. 그때는 `수정`을 쓰세요.
4. 제목을 쓰고, 본문 블록을 추가해 채웁니다(3.4절).
5. **운영진 암호를 입력**하고 저장합니다.

**수정**

같은 화면에서 해당 활동·기수를 고른 뒤 `수정`을 누릅니다.

**삭제**

수정 화면 안의 삭제 버튼을 씁니다. 폼에서 활동·기수를 바꿔 놓았더라도 **지워지는
대상은 편집기를 열 때 보고 있던 그 매거진**입니다. 착각하기 쉬우니 확인하고
누르세요.

삭제해도 본문에 넣었던 사진 파일은 `public/uploads/`에 그대로 남습니다.
사진마다 삭제 요청을 더 보내면 중간에 실패했을 때 데이터와 파일이 어긋난 채
남기 때문에 일부러 남겨 둡니다. 용량이 신경 쓰이면 개발자가 나중에 한 번에
정리하면 됩니다.

### 3.4 매거진 본문 작성법

본문은 **행(줄)** 과 **블록**으로 이뤄집니다. 한 행에 블록을 최대 4개까지 나란히
놓을 수 있고, 화면이 좁으면 자동으로 세로로 쌓입니다.

- **텍스트 블록** — 글을 씁니다. 마크다운 일부를 지원합니다.
- **이미지 블록** — 사진 한 장과 설명(캡션)을 넣습니다.

**블록 추가** — 블록 아래쪽 가장자리에 마우스를 올리면 나타나는 `+` 버튼을
누릅니다. **데스크탑에서만 됩니다.** 모바일에서는 이 버튼이 숨겨져 있으니
매거진 작성은 PC에서 하세요.

**블록 이동** — 블록 왼쪽 위의 점 여섯 개 손잡이를 잡고 끕니다.
행과 행 사이 빈 공간에 떨어뜨리면 그 자리에 새 줄이 생기고, 다른 블록 옆에
떨어뜨리면 같은 줄에 나란히 붙습니다.

**쓸 수 있는 마크다운**

| 쓰는 법 | 결과 |
|---|---|
| `**굵게**` | 굵은 글씨 |
| `*기울임*` | 기울인 글씨 |
| `` `코드` `` | 인라인 코드 |
| `[이름](https://주소)` | 링크. `http` / `https` 만 됩니다 |
| `# 제목`, `## 제목`, `### 제목` | 소제목 3단계 |
| `- 항목` | 글머리 목록 |
| `1. 항목` | 번호 목록 |
| `> 인용` | 인용문 |
| 빈 줄 하나 | 문단 나누기 |

이미지 블록이 그 줄에 혼자 있으면 **전체 너비 / 반 너비**를 고를 수 있습니다.
다른 블록과 나란히 놓으면 자동으로 좁아집니다.

### 3.5 운영진 암호 바꾸기

암호가 유출됐거나 기수가 바뀌었으면 바꿉니다. 코드 수정은 필요 없습니다.

1. Vercel → 팀 `likelion-kwu` → 프로젝트 `14th-official-homepage-frontend`
2. Settings → Environment Variables
3. `CONTENT_WRITE_PASSPHRASE` 의 값을 새 값으로 수정 (Production 스코프)
4. **Deployments 탭에서 최신 배포를 Redeploy** 합니다. 환경변수는 저장만
   해서는 반영되지 않고 재배포가 있어야 적용됩니다.
5. 새 암호를 운영진에게 공유합니다.

암호는 길이까지 비교하는 상수 시간 비교로 검증합니다. 짧게 만들 이유가 없으니
넉넉히 긴 값을 쓰세요.

### 3.6 AFTER HACK 회고 답변 관리하기

`/activities/14th-hackathon`의 회고 답변은 다른 콘텐츠(매거진·프로젝트)와
운영 방식이 다릅니다.

- **암호가 없습니다.** 익명 해커톤 참가자가 누구나 바로 제출할 수 있게 하려는
  의도적인 설계입니다(10절). 즉 URL만 알면 누구든 답변을 추가할 수 있습니다.
- **수정·삭제 UI가 없습니다.** 부적절한 내용이 올라오면 `src/data/answers.json`을
  GitHub 웹에서 직접 열어 해당 항목을 지우고 커밋하세요(`id`로 찾으면 됩니다).
  운영진 암호 체계에 편입시키지 않은 이유는, 참가자 제출 난이도를 올리고
  싶지 않아서입니다 — 행사 종료 후에는 필요하면 라우트 자체를 지워도 됩니다.
- 답변은 질문(1~4)별로만 구분되고 팀 이름은 자유 입력이 아니라
  `src/lib/afterhack/teams.js`의 4개 중 하나로 고정됩니다.

### 3.7 운영 트러블슈팅

| 증상 | 원인과 조치 |
|---|---|
| "암호가 올바르지 않습니다"가 계속 뜬다 | ① **프리뷰 주소에서 작업 중일 가능성이 가장 높습니다.** 주소창이 `www.likelion-kwu.com`인지 확인하세요. ② 한/영 전환을 안 하고 입력했을 수 있습니다(편집기가 한글이 섞이면 경고를 띄웁니다). ③ 그래도 안 되면 Vercel 환경변수가 지워졌는지 확인(4.3절) |
| 저장은 됐는데 화면에 안 보인다 | 배포가 아직 안 끝났습니다. 1분 뒤 새로고침. Vercel Deployments에서 진행 상태를 볼 수 있습니다 |
| 사진 업로드가 "4MB 이하" 오류 | 원본이 지나치게 큽니다. 미리 줄여서 올리세요 |
| 사진을 골랐는데 업로드가 안 된다 | 암호를 먼저 입력했는지 확인. 암호가 비면 업로드가 막힙니다 |
| 등록 버튼이 회색이다 (매거진) | 그 활동·기수에 이미 매거진이 있습니다. `수정`을 쓰세요 |
| 방금 올린 사진이 깨져 보인다 | 배포 전이라 서버에 아직 없습니다. 잠시 뒤 강력 새로고침(Ctrl+Shift+R) |
| 사이트 전체가 안 열린다 | 도메인·DNS 문제일 수 있습니다. 4.2절 |
| 회고 칠판에 "이야기를 불러오지 못했어요"가 뜬다 | `/api/answers`가 실패한 겁니다. 4.3절의 GitHub App 환경변수(콘텐츠 API와 같은 세트)가 지워지지 않았는지 확인하세요 |
| 회고 답변에 지워야 할 내용이 있다 | 관리 화면이 없습니다. 3.6절대로 `src/data/answers.json`을 GitHub에서 직접 편집하세요 |

---

## 4. 배포와 인프라

### 4.1 Vercel

- 팀(스코프): **`likelion-kwu`**
- 프로젝트: `14th-official-homepage-frontend`
- 빌드 설정은 따로 없습니다. Vercel이 Vite 프로젝트로 자동 인식해
  `pnpm install --frozen-lockfile` → `pnpm build` → `dist/` 를 서빙합니다.
- `api/` 아래 `.js` 파일은 자동으로 Node 서버리스 함수가 됩니다. 라우팅 설정은
  필요 없고, `api/register-project.js` 가 `/api/register-project` 로 매핑됩니다.
  `api/_lib/` 처럼 밑줄로 시작하는 폴더는 엔드포인트가 되지 않는 공용 모듈입니다.

**프로덕션 상태를 확인할 때는 `.vercel.app` 별칭이 아니라
`https://www.likelion-kwu.com` 을 기준으로 보세요.** 예전에 별칭만 찔러 보고
"환경변수가 하나도 없다"는 잘못된 결론을 낸 적이 있습니다.

`vercel.json`이 하는 일은 두 가지입니다.

```json
{
  "rewrites": [{ "source": "/((?!api/|assets/|uploads/).*)", "destination": "/" }],
  "headers": [ ... ]
}
```

- **SPA 폴백** — `/projects` 같은 주소로 직접 들어와도 `index.html`을 내려줍니다.
  단 `api/`, `assets/`, `uploads/` 는 제외합니다. 이 제외가 없으면 아직 배포되지
  않은 이미지 요청에 HTML이 응답되고, 브라우저가 그 HTML을 이미지 자리에
  캐시해서 계속 깨져 보입니다. 실제로 겪었던 문제입니다(커밋 `d4a11bc`).
- **캐시 헤더** — `/assets/*` 는 1년 불변(파일명에 해시가 붙으므로 안전),
  `/uploads/*` 는 7일.

### 4.2 도메인과 DNS

- 도메인 `likelion-kwu.com` 은 **가비아**에서 관리합니다. 네임서버는
  `ns.gabia.co.kr`.
- Vercel에 도메인을 붙일 때 `_vercel` TXT 레코드로 소유권을 증명합니다.
  **apex(`likelion-kwu.com`)와 `www` 의 값이 서로 다릅니다.** 둘 다 넣어야
  합니다.
- 사이트가 안 열리면 순서대로 봅니다. ① Vercel 프로젝트가 살아 있는지
  ② Domains 설정에 도메인이 붙어 있고 Valid인지 ③ 가비아 DNS 레코드가 그대로인지.

### 4.3 환경변수

Vercel → Settings → Environment Variables. **전부 Production 스코프에만**
있습니다.

| 변수 | 용도 |
|---|---|
| `GITHUB_APP_ID` | GitHub App 식별자 |
| `GITHUB_APP_INSTALLATION_ID` | 이 조직에 설치된 App의 설치 ID |
| `GITHUB_APP_PRIVATE_KEY_BASE64` | `.pem` 개인키를 base64로 **한 줄** 인코딩한 값 |
| `GITHUB_REPO` | `likelion-kwu/14th-official-homepage-frontend` 형식 |
| `CONTENT_WRITE_PASSPHRASE` | 운영진 공유 암호 |

형식과 설명은 저장소의 `.env.example` 에도 남겨 뒀습니다.

개인키를 그냥 붙여넣지 않고 base64로 감싸는 이유는 줄바꿈 때문입니다. PEM은
여러 줄인데 환경변수 입력창을 거치며 줄바꿈이 깨지면 서명이 실패합니다.
한 줄짜리 base64로 만들어 두면 그 사고가 없습니다.

```bash
# 개인키를 한 줄 base64로 만드는 법
base64 -w 0 your-app.private-key.pem                 # Linux
base64 -i your-app.private-key.pem | tr -d "\n"      # macOS
```

**환경변수가 하나라도 빠지면** 서버리스 함수가 예외를 던지고 500을 반환합니다.
다만 암호 검증(`requirePassphrase`)은 그보다 앞에서 돌면서 환경변수를 못 읽으면
조용히 401을 냅니다. **"암호가 올바르지 않습니다"인데 Vercel 로그가 비어 있으면
암호 문제가 아니라 환경변수 누락을 의심하세요.**

### 4.4 배포가 도는 시점

| 무엇을 하면 | 무슨 배포가 도는가 |
|---|---|
| `main`에 푸시 또는 PR 머지 | 프로덕션 배포 |
| 다른 브랜치 푸시 / PR 생성 | 프리뷰 배포 (별도 URL) |
| 화면에서 프로젝트·매거진 등록 | main에 커밋이 생기므로 **프로덕션 배포** |
| Vercel에서 환경변수만 수정 | 아무 배포도 안 돔. 수동 Redeploy 필요 |

### 4.5 GitHub App 설정과 재발급

콘텐츠 등록 API는 개인 토큰이 아니라 **GitHub App 설치 토큰**으로 인증합니다.
개인 토큰은 발급한 사람이 조직을 떠나면 끊기는데, 동아리는 매년 사람이 바뀌기
때문입니다.

동작 순서는 이렇습니다. `GITHUB_APP_PRIVATE_KEY_BASE64`로 10분 미만짜리
JWT(RS256)를 만들고 → 그걸로 설치 토큰(1시간짜리)을 받고 → 그 토큰으로 Contents
API를 호출합니다. 설치 토큰은 함수 인스턴스가 살아 있는 동안 메모리에 캐시해
재발급 왕복을 줄입니다. (`api/_lib/github.js`)

**App에 필요한 권한:** 저장소 `Contents: Read and write` 하나면 충분합니다.

**개인키를 잃어버렸거나 유출됐을 때**

1. GitHub → 조직 Settings → Developer settings → GitHub Apps → 해당 App
2. "Generate a private key" 로 새 `.pem` 발급 (기존 키는 revoke)
3. 위 명령으로 base64 한 줄로 인코딩
4. Vercel 환경변수 `GITHUB_APP_PRIVATE_KEY_BASE64` 교체
5. **Redeploy**
6. 프로덕션에서 매거진 저장이 되는지 확인

`GITHUB_APP_INSTALLATION_ID`는 조직에 App을 설치한 뒤 설치 설정 페이지 URL 끝의
숫자입니다. App을 지웠다 다시 설치하면 이 값이 바뀝니다.

---

## 5. 개발 환경 세팅

### 5.1 필요한 것

- Node.js 20 이상 (`package.json`에 `engines`를 박아 두지 않았습니다. Vercel
  기본값과 맞추면 안전합니다)
- pnpm 10 이상. `package.json`의 `packageManager: pnpm@10.34.5` 가 버전을
  고정하므로, Corepack이 켜져 있으면 자동으로 맞는 버전을 씁니다

```bash
corepack enable        # 한 번만
pnpm install
pnpm dev               # http://localhost:5173
```

### 5.2 사용 가능한 명령

| 명령 | 하는 일 |
|---|---|
| `pnpm dev` | 개발 서버 (HMR) |
| `pnpm build` | `dist/` 로 프로덕션 빌드 |
| `pnpm preview` | 빌드 결과를 로컬에서 확인 |
| `pnpm lint` | ESLint 검사 |
| `pnpm optimize:images` | 정적 이미지 WebP 일괄 변환 (sharp 임시 설치 필요, 8.3절) |
| `pnpm images:card-variants` | 프로젝트 카드용 축소본 생성 (동일) |

### 5.3 로컬에서 안 되는 것

`pnpm dev`는 Vite 개발 서버만 띄웁니다. **`api/` 아래 서버리스 함수는 돌지
않습니다.** 그래서 로컬에서는 이런 게 안 됩니다.

- 프로젝트 등록
- 매거진 저장·삭제
- 이미지 업로드

`/api/...` 호출은 404가 나거나 SPA HTML을 받아 파싱 에러로 이어집니다. 정상입니다.

**등록 화면의 UI만 손볼 때**는 로컬로 충분합니다. 폼을 열고 입력하는 것까지는
문제없고, 저장 버튼을 누르는 순간부터 안 됩니다.

**등록 로직 자체를 고쳐야 한다면** 선택지는 둘입니다.

1. `vercel dev` 로 서버리스 함수까지 로컬에서 실행 (`.env` 파일에 5개 변수를
   채워야 함. `.env`는 `.gitignore`에 있으니 절대 커밋하지 마세요)
2. PR을 만들어 프리뷰에서 UI를 확인하고, 저장 동작은 머지 후 프로덕션에서 확인

2번이 현실적인 이유는 9장을 보세요. 프리뷰에는 콘텐츠 환경변수가 없어서
저장 경로를 프리뷰에서 검증할 수 없습니다.

### 5.4 코딩 스타일

`.prettierrc` 기준입니다. 커밋 전에 포매터를 돌려 주세요.

- 세미콜론 없음, 작은따옴표, JSX 속성도 작은따옴표
- 들여쓰기 2칸, 줄 너비 100
- 후행 쉼표 항상, 줄바꿈 LF

ESLint는 `pnpm lint`. 규칙은 기본 recommended + react-hooks + react-refresh이고,
대문자로 시작하는 미사용 변수만 예외로 허용합니다.

> `api/` 아래 코드는 프리티어 설정과 달리 세미콜론을 씁니다. Node 서버 코드라
> 프론트 코드와 구분되게 둔 것이니, 그 폴더 안에서는 기존 스타일을 따라가세요.

---

## 6. 코드 구조

### 6.1 디렉터리

```
.
├── api/                       Vercel 서버리스 함수 (Node)
│   ├── _lib/
│   │   ├── github.js          GitHub App 인증 + Contents API 읽기/쓰기
│   │   └── request.js         메서드 검사, 암호 검사, 본문 읽기, JSON 응답
│   ├── register-project.js    POST   프로젝트 등록
│   ├── register-magazine.js   PUT    매거진 저장 / DELETE 삭제
│   ├── upload-image.js        POST   이미지 업로드 (multipart 직접 파싱)
│   └── answers.js             GET/POST  AFTER HACK 회고 답변 조회/등록
│                               (암호 없이 누구나 씀 — 익명 참가자 제출용,
│                               나머지 콘텐츠 API와 위협 모델이 다름)
│
├── public/
│   ├── kw-logo.png            파비콘
│   ├── thumbnail.jpg          OG 이미지
│   └── uploads/               운영진이 화면에서 올린 사진이 커밋되는 곳
│       ├── magazines/
│       └── projects/
│
├── scripts/                   오프라인 이미지 도구 (빌드에 안 들어감)
│
├── src/
│   ├── api/                   브라우저 -> /api/* 호출 래퍼
│   │   ├── apiResponse.js     응답 계약 처리 (401을 에러로 승격)
│   │   ├── magazineApi.js     getMagazine / saveMagazine / deleteMagazine
│   │   ├── projectApi.js      registerProject
│   │   └── uploadImage.js     리사이즈 후 업로드
│   ├── assets/                번들에 들어가는 정적 이미지·폰트
│   │   └── afterhack/         AFTER HACK 배경 이미지 (webp)
│   ├── components/
│   │   ├── Header.jsx         고정 상단 네비 (데스크탑 + 모바일 드롭다운)
│   │   ├── Footer.jsx         저작권, 메일, 인스타
│   │   ├── SmoothScroll.jsx   lenis 초기화 (reduced-motion이면 비활성)
│   │   ├── ImageCarousel.jsx  프로젝트 상세 모달의 사진 슬라이드
│   │   ├── ProjectDetailModal.jsx
│   │   ├── ProjectFormModal.jsx     운영진용 프로젝트 등록 폼
│   │   ├── MagazineEditorModal.jsx  운영진용 매거진 편집기
│   │   └── afterhack/          AFTER HACK 전용 컴포넌트 (Brand, StickyNote,
│   │                            AnswerFormDialog, CurtainProvider 등)
│   ├── data/
│   │   ├── generations.js           기수 단일 출처. 새 기수는 여기만 고친다
│   │   ├── curriculumData.js        커리큘럼 본문 (3개 트랙)
│   │   ├── projectsData.js          정적 프로젝트 17개 + 병합 로직
│   │   ├── projectImages.js         프로젝트 이미지 import + srcSet 조립
│   │   ├── projectImageWidths.json  원본 폭 매니페스트 (스크립트 생성물)
│   │   ├── registeredProjects.json  화면에서 등록된 프로젝트 (API가 씀)
│   │   ├── magazines.json           활동 매거진 (API가 씀)
│   │   └── answers.json             AFTER HACK 회고 답변 (api/answers.js가 씀)
│   ├── hooks/useProjects.js   정적 + 등록 프로젝트 병합, 낙관적 추가
│   ├── lib/afterhack/          AFTER HACK 순수 로직 (질문/팀 목록, 포스트잇
│   │                            배치 셔플, prefers-reduced-motion 대기)
│   ├── pages/                 화면 5개 + afterhack/ (온보딩·작성·칠판 3개)
│   ├── styles/afterhack.css   AFTER HACK 전용 스타일. `.after-hack` 클래스
│   │                          아래로 전부 스코핑되어 있다 (9.10 참고)
│   ├── utils/
│   │   ├── fonts.js           로컬 폰트 @font-face 주입
│   │   ├── imageResize.js     업로드 전 canvas 리사이즈
│   │   ├── links.js           외부 링크 상수
│   │   ├── smoothScroll.js    프로그램적 스크롤 헬퍼 (기본 API는 Lenis와 충돌)
│   │   ├── magazineBlocks.js  매거진 행/열 조작 순수 함수
│   │   └── markdown.jsx       자체 마크다운 렌더러
│   ├── App.jsx                라우팅
│   ├── main.jsx                진입점
│   └── index.css              Tailwind + 전역 스타일
│
├── vercel.json                SPA 폴백, 캐시 헤더
├── tailwind.config.js
├── vite.config.js
└── .env.example               필요한 환경변수 목록
```

### 6.2 라우팅

`src/App.jsx` 한 파일이 전부입니다. `Home`만 즉시 로드하고 나머지 네 페이지는
`lazy()`로 코드 분할합니다. 첫 화면 번들을 가볍게 하려는 것이니, 페이지를
추가할 때도 같은 방식을 따르세요.

`ScrollToTop` 컴포넌트가 경로가 바뀔 때마다 스크롤을 맨 위로 올립니다.

### 6.3 데이터 흐름

**프로젝트 목록이 만들어지는 과정**

```
projectImages.js        src/assets/projects-image-{N}.webp 를 import
        |               + import.meta.glob으로 -{폭}w 축소본을 모아 srcSet 조립
        v
projectsData.js         1) 이미지가 있는 id마다 "타이틀 미지정" 기본 객체 생성
        |               2) predefinedProjects 배열의 상세 정보로 덮어쓰기
        |               3) id 내림차순 정렬
        v
getAllProjects()        registeredProjects.json (등록순) + 정적 목록 순으로 합침
        v
useProjects()           방금 등록한 프로젝트를 맨 앞에 낙관적으로 얹음
        v
Projects.jsx            기수 필터 -> 12개씩 무한 스크롤 -> 카드 렌더
```

핵심은 **이미지가 곧 프로젝트**라는 점입니다. `projectImages.js`에 import를
추가하는 순간 그 id의 프로젝트가 목록에 생기고, 상세 정보를 안 적으면
"타이틀 미지정"으로 나옵니다. 그래서 이미지만 추가하고 `predefinedProjects`를
빠뜨리면 빈 껍데기 카드가 노출됩니다.

**매거진이 그려지는 과정**

```
magazines.json          { 활동: { 기수: { title, blocks } } } 형태
        v
getMagazine()           빌드에 포함된 정적 데이터라 네트워크 호출 없이 동기 조회
        v
toRows()                평평한 옛 형식도 한 칸짜리 행으로 감싸 정규화
        v
Activities.jsx          행 단위로 flex 배치, 텍스트는 renderMarkdown으로 렌더
```

`toRows`가 정규화를 맡기 때문에 예전 형식으로 저장된 매거진을 따로 마이그레이션
하지 않아도 됩니다. 편집기와 렌더러가 같은 함수를 공유합니다.

**등록·저장 흐름**

```
브라우저                          서버리스 함수                  GitHub
  |                                   |                            |
  |-- 사진 선택                       |                            |
  |   canvas로 1600px 리사이즈        |                            |
  |-- POST /api/upload-image -------->|                            |
  |   (multipart, 암호 포함)          |-- 확장자는 MIME에서 결정   |
  |                                   |-- PUT contents ----------->| 커밋
  |<-- { url: /uploads/... } ---------|                            |
  |                                   |                            |
  |-- POST/PUT 등록 ----------------->|-- 기존 JSON GET ---------->|
  |   (본문 + 사진 URL + 암호)        |<-- 내용 + sha -------------|
  |                                   |-- 병합 후 PUT ------------>| 커밋
  |<-- { success: true } -------------|                            |
```

`putFile`은 항상 `branch: 'main'` 으로 커밋합니다. 기존 파일을 덮어쓸 때는 GitHub이
요구하는 `sha`를 먼저 읽어서 함께 보냅니다.

### 6.4 스타일 규칙

- 색은 대부분 Tailwind 임의 값으로 직접 씁니다. 자주 나오는 배경색은
  `#1A1A1A`(메인·프로젝트)와 `#111315`(활동·모달)입니다.
- 폰트는 `Space Grotesk`(대부분)와 `Inter`(프로젝트 카드 텍스트)를 로컬 ttf로
  씁니다. `utils/fonts.js`가 `@font-face`를 런타임에 주입합니다.
- 강조색은 오렌지 계열(`orange-300` / `orange-400`)입니다.
- 전역으로 **텍스트 선택이 막혀 있고**(`user-select: none`) **스크롤바가
  숨겨져 있습니다**(`index.css`). 사용자가 본문을 복사할 수 없다는 뜻이라,
  나중에 문제가 되면 여기를 먼저 보세요.
- `tailwind.config.js`에 커스텀으로 넣은 것: `marquee-slow` 애니메이션과
  `.no-scrollbar` 유틸리티.

---

## 7. 화면별 수정 가이드

### 7.1 메인 `/` — `src/pages/Home.jsx`

517줄짜리 한 파일에 네 섹션이 다 들어 있습니다. 컴포넌트로 안 쪼개져 있으니
주석(`{/* ABOUT Section */}` 같은)을 이정표로 삼아 찾으세요.

| 고치고 싶은 것 | 어디 |
|---|---|
| 히어로 중앙 구체 주변 텍스트·버튼 | 131~330행 근처. FRONTEND / BACKEND / UXUI DESIGN 버튼이 각각 `/curriculum/*`로 이동 |
| 지원하기 버튼 동작 | `handleApplyClick`. 토스트를 3초 띄우고 `LINKS.FORMLINK`를 새 탭으로 엽니다 |
| ABOUT 섹션 숫자 4개 | 355~373행. `13`(시작한지), `11,947`, `1,634`, `97` **전부 하드코딩**입니다 |
| CORE VALUES 이미지 | `src/assets/corevalue{1,2,3}.webp` |
| 스크롤 등장 애니메이션 | `IntersectionObserver` 두 개(`aboutRef`, `coreValuesRef`), threshold 0.3 |

### 7.2 모집 `/recruit` — `src/pages/Recruit.jsx`

디자인 시안(1728×3200)을 비율로 환산해 배치한 페이지입니다. 상수
`DESIGN_WIDTH` / `DESIGN_HEIGHT` 를 기준으로 좌표를 잡으므로, 요소를 옮길 때는
픽셀이 아니라 시안 좌표로 생각해야 합니다.

| 고치고 싶은 것 | 어디 |
|---|---|
| 모집 일정 | `scheduleItems` 배열. `{ date, label }` |
| 파트 카드 3개 | `partCards`. 각각 `/curriculum/*`로 링크 |
| 인재상 카드 3개 | `targetCards`. 이미지 자체에 글이 박혀 있습니다 |
| 문구가 박힌 이미지들 | `src/assets/recruit/`. 텍스트 수정은 이미지 재작업이 필요합니다 |

### 7.3 커리큘럼 `/curriculum/:track` — `src/pages/Curriculum.jsx`

내용은 전부 `src/data/curriculumData.js` 에 있습니다. 페이지 파일은 스크롤에
따라 현재 단계를 하이라이트하는 로직만 담당합니다.

트랙마다 `heading`, `logo`, `logoWidth`, `logoHeight`, `items[]`를 가지며
`items`의 각 항목은 `{ title, description }` 입니다. 현재 세 트랙 모두 7개씩입니다.

### 7.4 활동 `/activities` — `src/pages/Activities.jsx`

| 고치고 싶은 것 | 어디 |
|---|---|
| 상단 활동 카드 4개 | `activityCards` 배열. `project` 카드만 매거진이 아니라 `/projects`로 이동 |
| 선택 가능한 기수 | `GENERATIONS = [14, 13]` **하드코딩** |
| 활동 종류 키 | `ACTIVITY_TYPES = { ot: 'OT', ideathon: 'IDEATHON', hackathon: 'HACKATHON' }` |
| 매거진 본문 렌더 | `MagazineItem` / `MagazineContent` (같은 파일 안) |

매거진 편집기는 `lazy()`로 분리돼 있습니다. 드래그 라이브러리까지 딸려 오는데
방문자는 쓸 일이 없기 때문입니다. 편집기를 손볼 때 이 분리를 없애지 마세요.

### 7.5 프로젝트 `/projects` — `src/pages/Projects.jsx`

| 고치고 싶은 것 | 어디 |
|---|---|
| 상단 배너 | `projects-hero-banner-{960,1600,2400}w.webp`. **문구가 이미지 안에 새겨져 있어** 페이지에 텍스트를 얹지 않습니다 |
| 기수 필터 | 하드코딩이 아니라 데이터에서 자동 추출(`generations` useMemo) |
| 카드 열 개수 | `getColumns()`. 768 / 1280을 경계로 1·2·3열 |
| 한 번에 보여줄 개수 | `displayedProjects` 초기 12, 무한 스크롤로 12씩 추가 |
| 카드 이미지 크기 힌트 | `CARD_IMAGE_SIZES` 상수. 그리드 여백 계산과 짝을 이루므로 그리드를 바꾸면 여기도 같이 |

`?id=17` 같은 쿼리로 들어오면 해당 카드로 스크롤하고 테두리를 2초간 하이라이트
합니다. 대상이 첫 12개 밖에 있으면 목록을 그 지점까지 펼친 채로 시작합니다
(`displayedProjects`의 초기값 계산). 스크롤은 `smoothScrollTo`로 합니다(9.9절).

### 7.6 공통 컴포넌트

**Header** — `position: fixed`, 높이는 모바일 44px / 데스크탑 52px입니다.
각 페이지가 이 높이만큼 상단 여백을 직접 줍니다. 헤더 높이를 바꾸면 모든
페이지의 `pt-*`를 같이 고쳐야 합니다. 폭을 `max-w-*`로 제한하지 않는 것은
의도적입니다. 넓은 화면에서 로고와 메뉴가 가운데로 몰려 보였습니다.

**Footer** — `LINKS` 상수를 쓰고 저작권 연도가 하드코딩(`© 2026`)입니다.

**SmoothScroll** — lenis를 켭니다. `prefers-reduced-motion`이 켜진 사용자에게는
아예 초기화하지 않습니다. 프로그램적으로 스크롤할 때는 이 컴포넌트가 아니라
`src/utils/smoothScroll.js`의 `smoothScrollTo`를 씁니다(9.9절). 기본
`behavior: 'smooth'`는 Lenis와 함께 쓰면 동작하지 않습니다.

---

## 8. 자주 하는 작업 레시피

### 8.1 새 기수로 넘기기

매년 반복되는 유일한 정기 작업입니다.

**기수 숫자는 `src/data/generations.js` 한 곳에만 있습니다.**

```js
export const GENERATIONS = [14, 13]   // ← 여기 앞에 15를 더하면 끝
```

이 한 줄이 아래 네 곳에 자동으로 반영됩니다. 예전에는 네 파일에 흩어져 있어서
매번 한두 곳을 빠뜨렸고, 빠뜨려도 화면 대부분은 멀쩡해 보여 한참 뒤에야 발견됐습니다.

| 파생되는 곳 | 무엇이 |
|---|---|
| `/activities` 기수 버튼과 기본 선택 기수 | `GENERATIONS`, `CURRENT_GENERATION` |
| `/projects` 등록 폼의 기수 선택지 | `GENERATION_LABELS` (`14TH` 형식을 자동 생성) |
| `/curriculum/*` 의 "OO기 커리큘럼을 소개합니다" | `CURRENT_GENERATION` |
| 지원 버튼 토스트 문구 | `CURRENT_GENERATION` |

**손으로 함께 고쳐야 하는 것**은 다음뿐입니다.

| # | 파일 | 무엇을 | 왜 자동이 안 되나 |
|---|---|---|---|
| 1 | `index.html` | `<title>`, `og:site_name`, `og:description` 의 "14th" | 정적 HTML이라 JS 모듈을 읽지 못합니다 |
| 2 | `src/pages/Recruit.jsx` | `scheduleItems` 의 날짜 | 기수가 아니라 매년 새로 정하는 일정입니다 |
| 3 | `src/utils/links.js` | `FORMLINK` 를 새 기수 지원 폼 주소로 | 폼 URL은 기수에서 유도할 수 없습니다 |
| 4 | `src/components/Footer.jsx` | `© 2026 LIKELION KWUNIV` 연도 | 아래 설명 참고 |
| 5 | `src/pages/Home.jsx` | ABOUT 섹션 통계 숫자(355~373행) | 갱신할 거라면 |
| 6 | `src/data/curriculumData.js` | 커리큘럼 내용 | 바뀌었다면 |
| 7 | `public/thumbnail.jpg` | 공유 썸네일 | 새로 만들었다면 |
| 8 | `package.json` | `version`을 올리고 태그를 답니다(11장) | |

> 푸터 연도를 `new Date().getFullYear()`로 바꾸지 않은 것은 의도입니다. 저작권
> 표기는 "사이트를 마지막으로 갱신한 해"라서, 아무도 손대지 않은 해에 숫자만
> 저절로 올라가는 편이 오히려 부정확합니다.

추가로 결정할 것 하나. **저장소를 새로 팔지, 이 저장소를 계속 쓸지**입니다.
이름이 `14th-official-homepage-frontend`라 기수가 박혀 있는데, 저장소를 새로
만들면 Vercel 프로젝트 연결과 GitHub App 설치를 다시 해야 하고 콘텐츠 이력도
끊깁니다. **이 저장소를 계속 쓰는 쪽을 권합니다.** 이름이 신경 쓰이면
저장소 이름만 바꾸고(`GITHUB_REPO` 환경변수도 같이 수정) 나머지는 유지하세요.

작업 후 확인:

```bash
pnpm lint && pnpm build
```

머지한 뒤 프로덕션에서 `/activities`의 기수 버튼과 `/projects`의 등록 폼 기수
선택지를 눈으로 확인합니다.

### 8.2 프로젝트 데이터 손보기

**화면에서 등록한 프로젝트를 수정·삭제**

`src/data/registeredProjects.json` 을 직접 편집합니다. 배열이고, 각 항목은
`{ id, title, tag, description, generation, activity, image, detail }` 형태이며
`detail`은 `{ thumbnail, images, overview, features }` 입니다.
등록순이 곧 최신순이라 배열 앞이 먼저 보입니다.

사진까지 지우려면 `public/uploads/projects/` 의 해당 파일도 함께 지웁니다.
JSON에서 참조가 사라진 뒤에 지워야 안전합니다.

**정적 프로젝트를 새로 추가**

1. 이미지를 `src/assets/projects-image-{다음번호}.webp` 로 넣습니다
2. `src/data/projectImages.js` 에 import 문과 `projectImages` 맵 항목을 추가
3. `pnpm images:card-variants` 로 카드용 축소본을 생성 (8.3절)
4. `src/data/projectsData.js` 의 `predefinedProjects` 배열에 상세 정보를 추가

4번을 빠뜨리면 "타이틀 미지정 / 프로젝트 한줄 소개" 카드가 그대로 노출됩니다.
`predefinedProjects`는 id 내림차순으로 정렬해 두었으니 맨 위에 넣으세요.

```js
{
  id: 18,
  generation: '14TH',
  activity: '중앙해커톤',
  title: '프로젝트 이름',
  tag: 'WEB',
  description: '한 줄 소개',
  image: getProjectImage(18),
  detail: {
    thumbnail: getProjectImage(18),
    overview: `마크다운을 쓸 수 있습니다.`,
    features: ['기능 1', '기능 2'],
  },
},
```

`cardSrcSet`은 적지 않아도 됩니다. 기본 객체에 이미 들어가고 얕은 병합으로
그대로 물려받습니다.

### 8.3 이미지 최적화 스크립트

`scripts/` 아래 도구는 **오프라인 일회성 도구**입니다. 앱 런타임이나 빌드에서
호출되지 않습니다. `sharp`가 필요한데, 플랫폼별 네이티브 바이너리를 내려받는
무거운 패키지라 저장소 의존성에 넣지 않습니다. 넣으면 Vercel이 배포할 때마다
설치하느라 빌드 시간만 씁니다.

```bash
pnpm add -D sharp

pnpm run optimize:images        # 래스터 -> WebP 일괄 변환
pnpm run images:card-variants   # /projects 카드용 축소본 생성

# 반드시 되돌리기
git checkout -- package.json pnpm-lock.yaml
pnpm install
```

**되돌리는 걸 잊으면 sharp가 배포 의존성으로 들어갑니다.** `git checkout`은
`package.json`의 다른 변경도 같이 되돌리니, 스크립트 항목 등을 함께 고쳤다면
sharp 항목만 손으로 지우고 `pnpm install`을 돌리세요.

`images:card-variants`는 실행할 때마다 기존 `projects-image-{N}-{폭}w.webp`를
지우고 다시 만듭니다. 원본을 교체했다면 반드시 다시 돌려야 srcSet이 맞습니다.
생성물(`src/assets/*-{폭}w.webp`, `src/data/projectImageWidths.json`)은 커밋합니다.

| 스크립트 | 역할 |
|---|---|
| `optimize-images.mjs` | 정적 래스터 이미지를 WebP로 일괄 변환하고 용량 리포트를 남김 |
| `generate-card-variants.mjs` | 카드용 폭별 축소본(400/800/1280w)과 원본 폭 매니페스트 생성 |
| `analyze-noise.mjs` | 노이즈 텍스처가 타일링 가능한지 통계로 판정 |
| `convert-phase-one.mjs` | 1차 대상 이미지 개별 설정 변환 |

### 8.4 네비게이션에 메뉴 추가

`src/components/Header.jsx` 안에 **데스크탑용과 모바일용 마크업이 따로**
있습니다. 한쪽만 고치면 다른 화면에서 안 보입니다. ABOUT 드롭다운도 두 벌입니다.

### 8.5 새 페이지 추가

1. `src/pages/NewPage.jsx` 생성. `Header`와 `Footer`를 직접 넣습니다(레이아웃
   컴포넌트가 없습니다)
2. `src/App.jsx` 에 `lazy()` import와 `<Route>` 추가
3. 헤더 높이(모바일 44px / 데스크탑 52px)만큼 상단 여백을 줍니다
4. 링크가 필요하면 8.4절

### 8.6 모집 일정·지원 폼 링크만 바꾸기

가장 자주 요청받는 작업입니다.

- 지원 폼 주소: `src/utils/links.js` 의 `FORMLINK`
- 지원 버튼 눌렀을 때 뜨는 토스트 문구: 같은 파일 `MESSAGE`
- 모집 일정: `src/pages/Recruit.jsx` 의 `scheduleItems`

---

## 9. 함정 모음

과거에 실제로 사고가 났던 것들입니다. 하나씩 이유가 있으니 그냥 지키세요.

### 9.1 패키지 매니저는 pnpm입니다

Vercel은 `pnpm-lock.yaml`을 보고 `pnpm install --frozen-lockfile`로 설치합니다.
의존성을 추가·삭제했으면 **`pnpm-lock.yaml`을 반드시 함께 커밋하세요.**
`package.json`만 바뀌고 락파일이 그대로면 배포가 이 오류로 실패합니다.

```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile"
```

npm으로 설치하면 `package-lock.json`이 새로 생기는데 Vercel은 그 파일을 보지
않습니다. **로컬 빌드는 멀쩡한데 배포만 깨지므로 원인 파악이 오래 걸립니다.**
2026-08-28에 이 함정으로 배포가 두 번 깨졌고(`sharp`, `@dnd-kit/core`), 첫 번째는
sharp 자체가 원인이라고 잘못 결론 냈습니다. 그래서 `package-lock.json`을
저장소에서 제거하고 `package.json`에 `packageManager`를 박아 두었습니다.

확인 방법:

```bash
npx pnpm@10 install --frozen-lockfile --lockfile-only
```

### 9.2 프리뷰 배포에서는 콘텐츠 저장이 항상 401입니다

`CONTENT_WRITE_PASSPHRASE`와 GitHub App 변수 4개는 **Production 스코프에만**
있습니다. 프리뷰 배포에서는 `hasValidPassphrase`가 환경변수를 못 읽어 무조건
false를 반환하므로, 어떤 암호를 넣어도 401입니다.

**왜 이렇게 뒀는가.** `putFile`이 `branch: 'main'` 으로 고정돼 있어서, 프리뷰에
변수를 열어 주면 프리뷰에서 누른 저장이 실제 main에 콘텐츠를 커밋합니다.
테스트 편의보다 실데이터 보호를 택했습니다.

**결과.** 등록·수정·삭제·업로드는 프리뷰에서 검증할 수 없습니다. 머지 후
프로덕션에서 확인하세요. 다른 사람에게 프리뷰 URL을 주며 "여기서 저장해
보세요"라고 안내하지 마세요. 이 혼동 때문에 멀쩡한 암호를 계속 틀린 것으로
오진한 적이 있습니다.

프리뷰에서도 테스트가 필요해지면, 변수를 여는 대신 `putFile`이 환경에 따라
대상 브랜치를 고르도록 고치는 쪽이 맞습니다.

### 9.3 sharp를 커밋하지 마세요

8.3절. 작업 후 `package.json`과 `pnpm-lock.yaml`을 되돌립니다.

### 9.4 `vercel.json`의 rewrite 제외 목록을 건드리지 마세요

`api/`, `assets/`, `uploads/` 를 제외하지 않으면 아직 배포되지 않은 이미지
요청에 SPA HTML이 응답되고, 브라우저가 그 HTML을 이미지 자리에 캐시해 버립니다.
한 번 오염되면 강력 새로고침 전까지 계속 깨져 보입니다.

같은 이유로 매거진 편집기는 방금 올린 사진의 미리보기에 원격 URL 대신 로컬
objectURL을 씁니다.

### 9.5 이미지 업로드는 4MB가 상한입니다

Vercel 서버리스 함수의 요청 본문 한도에 맞춘 값입니다. 늘리려면 함수 설정을
먼저 확인해야 합니다. 클라이언트가 canvas로 1600px·품질 0.8 WebP로 미리 줄이기
때문에 보통은 여유가 있습니다.

업로드 파일의 확장자는 **클라이언트가 보낸 파일명이 아니라 검증된 MIME 타입에서만**
결정합니다. 파일명은 위조할 수 있어서 그대로 쓰면 `.html` 등으로 저장되어
저장형 XSS 벡터가 됩니다. 이 부분을 리팩터링할 때 규칙을 깨지 마세요.

### 9.6 등록 한 번에 커밋이 여러 개 생깁니다

사진 한 장 = 커밋 한 개, 데이터 저장 = 커밋 한 개입니다. git 로그가 지저분해
보여도 정상입니다. 커밋 메시지 규약은 `chore(content): upload image ...` 와
`feat(content): ...` 입니다.

### 9.7 전역 스타일이 강합니다

`src/index.css`가 전역으로 텍스트 선택을 막고 스크롤바를 숨깁니다. 특정 영역만
선택 가능하게 하려면 그 요소에 `select-text`를 따로 주세요.

### 9.8 프로젝트 id 타입이 섞여 있습니다

정적 프로젝트는 숫자 id(1~17), 화면에서 등록한 프로젝트는 `git-1735...` 형태의
문자열 id입니다. id로 비교·정렬하는 코드를 새로 쓸 때 **`parseInt`를 쓰지 마세요.**
문자열 id가 `NaN`이 되어 조용히 실패합니다. 비교는 `String(project.id)`로 합니다.

실제로 `/projects`의 `?id=` 딥링크가 이 문제로 등록 프로젝트에 대해 동작하지
않았습니다(2026-09-01 수정).

### 9.9 부드러운 스크롤은 반드시 `smoothScrollTo`로

이 사이트는 Lenis로 부드러운 스크롤을 구현하는데, Lenis가 매 프레임 스크롤 위치를
직접 써 넣습니다. 그래서 브라우저 기본 API는 **아무 일도 하지 않습니다.**

```js
// 이렇게 쓰면 조용히 무시된다. 에러도 안 난다.
window.scrollTo({ top: 0, behavior: 'smooth' })
element.scrollIntoView({ behavior: 'smooth' })

// 이렇게 쓴다.
import { smoothScrollTo } from '../utils/smoothScroll'
smoothScrollTo(0)
smoothScrollTo(element, { offset: -80 })   // offset은 고정 헤더를 피하는 여유분
```

`behavior`를 빼면(즉시 이동) 기본 API도 정상 동작합니다. 경로가 바뀔 때 맨 위로
올리는 `App.jsx`의 `ScrollToTop`이 그 경우라 그대로 두었습니다.

`smoothScrollTo`가 Lenis에게 그냥 넘기지 않고 목표를 직접 숫자로 계산하는 데는
이유가 두 가지 있습니다. Lenis는 ① DOM 요소를 숫자로 바꾸지 못하면 조용히
반환하고, ② 페이지 진입 직후에는 아직 스크롤 가능 거리를 재기 전이라 목표를 0으로
잘라 버립니다. 딥링크가 정확히 이 두 경우에 모두 걸려 죽어 있었습니다. 그래서
헬퍼가 `resize()`를 부르고 좌표를 직접 계산합니다.

> `/projects`의 UP 버튼과 `?id=` 딥링크가 이것 때문에 둘 다 동작하지 않았습니다
> (2026-09-01 수정).

### 9.10 AFTER HACK 스타일은 스코핑되어 있습니다 — 전역 셀렉터를 다시 넣지 마세요

`src/styles/afterhack.css`는 원래 별도 Next.js 저장소(`kwu-likelion-hack-review`)의
`globals.css`를 그대로 가져온 게 아닙니다. 원본은 `:root`, `body`, `*`, `a`,
`button`, `dialog` 같은 **전역 셀렉터**를 썼는데(자기가 유일한 스타일시트라고
가정하고 짠 코드라서), 그대로 옮기면 사이트 나머지 페이지의 폰트·배경·스크롤까지
다 덮어씁니다. 그래서 모든 셀렉터를 `.after-hack` 아래로 다시 감쌌고(postcss로
자동 변환), 폰트 family명(`AfterHackBody`/`AfterHackGaegu`)과 keyframe명
(`afterhack-descend` 등)도 전역 충돌을 피하려고 접두어를 붙였습니다.

이 파일을 고칠 때:
- 새 셀렉터는 항상 `.after-hack .foo` 형태로 쓰세요. `:root`나 `body`에 직접
  쓰면 사이트 전체가 깨집니다.
- `AfterHackLayout.jsx`가 `<div className="after-hack">`으로 감싸고 그 안에서
  `CurtainProvider`(`#curtain` 포함) + `<Outlet/>`을 렌더링합니다. `#curtain`
  셀렉터가 매치하려면 이 div 밖으로 나가면 안 됩니다.
- `app/board/layout.js`(원본 Next.js 쪽에만 있던 파일)가 칠판 페이지를
  `<section className="session">`으로 한 번 더 감싸고 있었습니다. 이 래퍼를
  놓치면 칠판 배경·글자색이 통째로 안 나옵니다 — 이주 중 실제로 한 번
  겪었던 버그입니다. `Board.jsx`의 `<section className="session">`을 지우지
  마세요.

---

## 10. 보안 노트

**인증은 공유 암호 하나뿐입니다.** 사용자 계정이 없고, 암호를 아는 사람은 누구나
콘텐츠를 등록·수정·삭제할 수 있습니다. 동아리 홈페이지 규모에 맞춘 선택이지만,
암호가 유출되면 누가 무엇을 했는지 구분할 수 없습니다. 유출이 의심되면 즉시
3.5절대로 교체하세요. 다행히 모든 변경이 git 커밋으로 남아 되돌리기는 쉽습니다.

**암호는 상수 시간으로 비교합니다.** `timingSafeEqual` + 길이 비교라 타이밍
공격에 안전합니다. 이 부분을 `===` 로 단순화하지 마세요.

**`/api/answers`(AFTER HACK)는 예외적으로 인증이 아예 없습니다.** 위의 공유
암호 모델과 다릅니다 — 익명 해커톤 참가자가 바로 제출할 수 있어야 해서
의도적으로 열어 뒀습니다. 대신 `questionId`/`team`/`text` 형식·길이 검증만
합니다. URL을 아는 사람이면 누구나 계속 글을 남길 수 있다는 뜻이라, 스팸이나
부적절한 제출이 의심되면 3.6절대로 `src/data/answers.json`을 직접 정리하세요.

**매거진 본문은 XSS에 안전합니다.** `utils/markdown.jsx`가
`dangerouslySetInnerHTML`을 쓰지 않고 React 엘리먼트를 직접 만듭니다. 링크는
`http`/`https`만 허용해 `javascript:` 스킴을 막습니다. 마크다운 렌더러를 외부
라이브러리로 교체한다면 이 두 가지를 반드시 확인하세요.

**업로드 파일은 확장자를 서버가 정합니다.** 9.5절.

**`.env`는 커밋 대상이 아닙니다.** `.gitignore`에 들어 있고, 과거에 잘못
추적되던 것을 커밋 `474b71b`에서 제거했습니다. `.env.example`만 커밋합니다.

**API가 노출하는 정보는 최소한입니다.** 실패 시 사용자에게는 한국어 요약만 주고
자세한 내용은 `console.error`로 Vercel 로그에만 남깁니다.

---

## 11. 브랜치와 릴리스 규칙

**브랜치 이름** — `이름/작업내용` 형식입니다. 한글을 씁니다.
예: `SXXNHU/프로젝트-페이지-리디자인`

**커밋 메시지** — Conventional Commits + 한국어 본문입니다.

```
feat(projects): 배너 헤드와 한 줄 기수 필터로 목록 페이지를 재구성 (#40)
fix(magazine): 좌우 배치 사진 여백 개선 (#31)
perf(images): 정적 이미지 WebP 전환 및 렌더링 최적화 (#19)
refactor: /projectshome 페이지와 원형 썸네일 체계를 제거 (#39)
chore(release): 버전을 1.2.0으로 올림 (#41)
```

자주 쓰는 스코프: `projects`, `magazine`, `activities`, `content`, `api`,
`images`, `vercel`, `release`.

`feat(content):` 와 `chore(content):` 는 **서버리스 함수가 자동으로 만드는**
커밋입니다. 사람이 직접 쓰지 마세요.

**흐름** — 브랜치를 파고 PR을 올려 프리뷰에서 확인한 뒤 main에 머지합니다.
main 직접 푸시는 피합니다.

**릴리스** — `package.json`의 `version`을 올리고 같은 이름의 태그를 답니다.
현재 `v1.2.0`. `pre-supabase-migration` 태그는 예전에 Supabase 도입을 검토하다
접었을 때 남긴 지점입니다.

---

## 12. 알려진 이슈와 백로그

다음 담당자가 손대면 좋을 것들입니다. 급하지는 않습니다.

**정리하면 좋을 것**

- `Home.jsx`가 517줄 한 파일입니다. 섹션 단위 컴포넌트로 쪼갤 여지가 있습니다.
- `Header` / `Footer` 를 매 페이지가 직접 넣습니다. 레이아웃 컴포넌트로 묶으면
  헤더 높이 여백 중복도 함께 사라집니다.
- 등록 프로젝트에는 수정·삭제 UI가 없습니다. 지금은 JSON을 직접 고쳐야 합니다.
- 회고 답변(AFTER HACK)도 마찬가지로 수정·삭제 UI가 없습니다(3.6절). 게다가
  제출 자체에 인증이 없어서(10절) 프로젝트/매거진보다 우선순위가 더 높을 수
  있습니다 — 다음 기수에도 이 기능을 재사용한다면 최소한의 관리자 뷰를
  붙이는 걸 권합니다.
- 매거진을 지워도 `public/uploads/` 의 사진이 남습니다. 참조 없는 파일을 찾아
  정리하는 스크립트가 있으면 좋겠습니다.
- 테스트가 하나도 없습니다. 최소한 `utils/magazineBlocks.js` 같은 순수 함수에는
  붙일 만합니다.

**제약으로 안고 가는 것**

- 콘텐츠 저장 경로를 프리뷰에서 검증할 수 없습니다(9.2절). 필요해지면
  `putFile`이 환경에 따라 브랜치를 고르게 고치는 방향입니다.
- 등록이 잦아지면 커밋 수가 빠르게 늘어납니다. 지금 규모에서는 문제가 아닙니다.
- `Recruit.jsx`의 문구 상당수가 이미지에 박혀 있어 텍스트만 고칠 수 없습니다.
  검색 엔진에도 안 잡힙니다.
- AFTER HACK 페이지의 OG 이미지는 사이트 공용 썸네일을 그대로 씁니다. 회고
  전용 이미지를 카카오톡 공유 미리보기에 띄우려면 경로별 메타 태그가
  필요한데, 이 SPA 구조에서는 Edge Middleware 같은 게 추가로 있어야 해서
  이번 이주 범위에서는 보류했습니다(요청자 확인, 2026-09-12).
- `kwu-likelion-hack-review`(AFTER HACK이 원래 있던 별도 Next.js 저장소·Vercel
  프로젝트)는 이 저장소로 완전히 이주된 뒤에도 아직 살아 있습니다. 운영진이
  직접 정리할 예정입니다 — 지우기 전에 `src/data/answers.json`으로 데이터가
  이미 옮겨져 있는지(2026-09-12 기준 95개) 다시 한번 확인하세요.

---

## 13. 참고 링크

| 무엇 | 어디 |
|---|---|
| 운영 사이트 | https://www.likelion-kwu.com |
| 저장소 | https://github.com/likelion-kwu/14th-official-homepage-frontend |
| Vercel 프로젝트 | Vercel → 팀 `likelion-kwu` → `14th-official-homepage-frontend` |
| 도메인 관리 | 가비아 (네임서버 `ns.gabia.co.kr`) |
| 인스타그램 | https://www.instagram.com/likelion_kwangwoon/ |
| 대표 메일 | kwangwoon.univ@likelion.org |
| 이미지 스크립트 상세 | `scripts/README.md` |
| 환경변수 형식 | `.env.example` |

**용어**

- **매거진** — `/activities` 아래에 붙는 활동 기록 글. 활동 종류 × 기수마다 하나
- **블록 / 행** — 매거진 본문 단위. 한 행에 블록 최대 4개
- **정적 프로젝트** — 코드에 박아 둔 17개(`projectsData.js`)
- **등록 프로젝트** — 화면 폼으로 올려 `registeredProjects.json`에 들어간 것
- **운영진 암호** — `CONTENT_WRITE_PASSPHRASE`. 등록·수정·삭제·업로드 공통
- **프리뷰 배포** — PR마다 생기는 임시 주소. 콘텐츠 저장은 안 됩니다

---

문서에서 틀린 부분을 찾거나 새로 알게 된 함정이 있으면 이 파일을 고쳐서
같이 커밋해 주세요. 다음 사람이 같은 곳에서 넘어지지 않습니다.
