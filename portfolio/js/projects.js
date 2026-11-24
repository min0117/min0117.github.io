/* =========================================================
   PROJECT LIST — edit this file to add, remove or reorder work.

   Each entry becomes one item on the WORK page and one project page
   (address: #work-<id>, e.g. #work-emora). Order here = order on the page,
   and the numbers 01, 02 … are given automatically.

   ▸ IMAGES (이미지 교체 위치)
     cover   – the image shown on the WORK page
     images  – the images on the project page, top to bottom.
               Put two paths in [ ] to show them side by side.
     Put your files in assets/ and change the paths below.

   ▸ LAYOUT on the WORK page (desktop; phones always use one column, 4:3)
     col     – which of the 12 columns it spans, e.g. '1 / 8' (start / end)
     ratio   – image shape, e.g. '4 / 3', '4 / 5', '16 / 9'
     offset  – extra space above it, e.g. '14vw' to push it down
     Leave layout out and a default is used.

   ※ year, and the descriptions marked "예시", are placeholders — replace them.
   ========================================================= */
window.PROJECTS = [
  {
    id: 'emora',
    title: 'Emora',
    category: 'UI/UX Design',
    year: '2025',
    cover: 'assets/work/emora-cover.svg',
    images: ['assets/work/emora-cover.svg'],
    roles: ['UI/UX Design'],
    description: ['예시 · 프로젝트 설명을 입력하세요.'],
    layout: { col: '1 / 8', ratio: '4 / 3', offset: '0vw' }
  },
  {
    id: 'kon',
    title: 'K:ON',
    category: 'Service Design',
    year: '2025',
    cover: 'assets/work/kon-cover.svg',
    images: ['assets/work/kon-cover.svg'],
    roles: ['Service Design'],
    description: ['예시 · 프로젝트 설명을 입력하세요.'],
    layout: { col: '9 / 13', ratio: '4 / 5', offset: '16vw' }
  },
  {
    id: 'yanolja',
    title: 'Yanolja Redesign',
    category: 'UI/UX Design',
    year: '2025',
    cover: 'assets/ux-thumb.jpg',
    images: [
      'assets/ux-thumb.jpg',
      ['assets/ux-home.png', 'assets/ux-ticket.png']
    ],
    roles: ['UI/UX Design', 'Redesign'],
    description: [
      '야놀자 앱의 복잡한 정보 구조를 분석하고, 사용자가 필요한 정보를 빠르게 찾을 수 있도록 화면의 우선순위와 구성을 재정리했습니다.',
      '블루 톤과 여행 오브제를 활용해 직관적이고 일관된 사용자 경험을 구성한 UI/UX 리디자인 작업입니다.'
    ],
    layout: { col: '3 / 13', ratio: '16 / 9', offset: '0vw' }
  },
  {
    id: 'funkita',
    title: 'FUNKITA',
    category: 'Brand Campaign',
    year: '2025',
    cover: 'assets/work/funkita-cover.svg',
    images: ['assets/work/funkita-cover.svg'],
    roles: ['Brand Campaign'],
    description: ['예시 · 프로젝트 설명을 입력하세요.'],
    layout: { col: '1 / 6', ratio: '3 / 4', offset: '0vw' }
  },
  {
    id: 'shape-color',
    title: 'Shape & Color',
    category: 'Visual Communication',
    year: '2025',
    cover: 'assets/vc-thumb.jpg',
    images: [
      ['assets/vc-wave.jpg', 'assets/vc-depth.jpg'],
      ['assets/vc-bon.jpg', 'assets/vc-force.jpg']
    ],
    roles: ['Visual Communication', 'Poster'],
    description: [
      '형태와 색의 관계를 탐구하고, 단순한 조형 요소를 반복·분할하며 화면 안에서 새로운 구조를 만든 포스터 작업입니다.',
      '기본 형태를 반복·분할·배치하며 화면의 균형과 리듬을 조절했고, 색의 대비와 조화를 통해 시각적 흐름을 구성했습니다.'
    ],
    layout: { col: '7 / 13', ratio: '2 / 1', offset: '12vw' }
  }
];
