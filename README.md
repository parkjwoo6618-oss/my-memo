# 메모 (my-memo)

비밀번호 하나로 들어가는 개인 메모 웹앱. 서버는 Vercel, 데이터는 Supabase(`notes` 테이블).

## 준비

1. Supabase 프로젝트 생성 → SQL Editor 에서 `supabase.sql` 실행
2. 아래 환경변수를 Vercel 에 설정

| 키 | 설명 |
| --- | --- |
| `APP_PASSWORD` | 로그인 비밀번호 |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 service_role 키 (절대 클라이언트 노출 금지) |
| `SUPABASE_TABLE` | 기본값 `notes` |

## 로컬 실행

```bash
npm install
npm run dev
```

## 기능
- 비밀번호 로그인 (쿠키 1년 유지)
- 메모 작성 / 수정 / 삭제
- 검색, 고정(핀), 정렬(수정순·작성순·제목순)
- 다크 모드, 모바일 홈화면 설치(PWA manifest)
