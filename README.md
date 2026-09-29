# 전장 도우미

하스스톤 전장(Battlegrounds) 개인 공략 정리용 웹앱. React + Vite + TypeScript + Tailwind + Supabase.

## 로컬 개발

```bash
npm install
cp .env.example .env.local   # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 입력
npm run dev
```

## Supabase 설정

`supabase/migrations/` 안의 SQL 파일을 Supabase 대시보드 SQL Editor에서 **파일명 순서대로** 실행한다.

- 테이블: `bg_cards`(카드 캐시), `custom_cards`, `card_notes`, `card_groups`, `card_positions`, `comps`, `info_posts`, `info_post_images`, `app_meta`
- 모든 테이블 RLS 활성화: select는 전체 허용, insert/update/delete는 로그인한 사용자만 허용
  (`bg_cards`, `app_meta`는 쓰기 정책 자체가 없음 — 카드 갱신은 서버리스 함수가 서비스 롤 키로 수행)
- Storage 버킷 `bg-assets` (public) 생성 및 동일한 RLS 정책 적용

## 라우트

- `/` 메인 (조합 보드 + 카드 라이브러리)
- `/comp/:id` 조합 상세
- `/card/:cardId` 카드 활용법
- `/info`, `/info/:id` 기타 정보 게시판

`vercel.json`의 rewrite 설정으로 위 경로를 직접 열거나 새로고침해도 404가 발생하지 않는다.
