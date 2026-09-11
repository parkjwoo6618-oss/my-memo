# 메모 (my-memo)

비밀번호 하나로 들어가는 개인 메모 웹앱. 메모는 이 저장소의 `data/notes.json` 에 저장된다.

## 환경변수

| 키 | 설명 |
| --- | --- |
| `APP_PASSWORD` | 로그인 비밀번호 |
| `GH_TOKEN` | 이 저장소에 쓰기 권한이 있는 GitHub PAT |
| `GH_OWNER` | 저장소 소유자 |
| `GH_REPO` | 저장소 이름 |
| `GH_BRANCH` | 기본값 `main` |
| `GH_PATH` | 기본값 `data/notes.json` |

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
