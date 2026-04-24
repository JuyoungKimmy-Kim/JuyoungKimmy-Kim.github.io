---
title: "[bookclub 개발기] 1. MVP, 기술 스택 선정"
date: 2026-04-24
categories: [개발]
tags: [bookclup, react-native, expo, mvp]
image: /assets/images/posts/bookclub/main.png
excerpt: "독서 모임 앱을 만들어보기로 했다. 기능을 줄이되 구조는 확장 가능하게. MVP 범위를 정하고 기술 스택을 선정한 과정을 정리한다."

---

## 왜 bookclub app 인가?

![](/assets/images/posts/bookclub/main.png)

나는 책읽는 걸 좋아한다. 책 읽는 행위를 넘어 활자를 읽는 모든 행위를 좋아한다. (심지어는 거리에 있는 간판을 읽는 것도 좋아한다) 그런 내가 매년 새해 다짐으로 꼭 한 줄씩 채워넣는 게 있는데, '책을 읽고 짧은 생각과 질문 작성하기'이다. 책을 읽고 나서 기록을 남기거나 누군가와 이야기를 나누지 않으면 너무 빨리 휘발되는 느낌이 들어서다. 

그래서 **기록 + 토론 정리**에 특화된 독서 모임 앱을 만들어보기로 했다.

원래 올해 목표가 수익을 창출할 수 있는 toy project를 만드는 것이었는데, 수익 창출을 목표로 하는 건 아니고 나와 내 친구들이 함께 나눌 수 있는 정도의 수준부터 시작하려고 한다. 우선 app의 이름은 bookclub app 이라고 하였지만 이름은 차차 생각해보는 걸로..!

## MVP 범위 정하기

사이드 프로젝트에서 가장 중요한 건 **스코프 관리**다. 만들고 싶은 기능은 끝이 없지만, 출시를 못 하면 의미가 없다. 원칙을 하나 세웠다.

> 기능을 줄이되, 구조는 확장 가능하게

### 만들 것 (MVP)

1. **인증** - 이메일/소셜 로그인
2. **책 + 개인 기록** - 책 검색/등록, 하이라이트, 메모, 내 서재
3. **모임** - 생성, 초대 코드로 참여, 이번 달 책 지정
4. **토론 보드** - 모임별 질문 스레드, 댓글, 모임장 수기 요약

### 만들지 않을 것

- AI 자동 요약 / 녹음 회의록
- 독서 통계 리포트
- 독서 메이트 매칭
- 소셜 피드 / 팔로우

이런 기능들은 2차 스코프로 미뤘다. 나중에 붙이기 쉬운 구조만 지금 잡아두면 된다.

## 기술 스택 선정

혼자 개발하는 사이드 프로젝트에서 가장 중요한 건 **생산성**이다. 최대한 적은 코드로, 빠르게, iOS와 Android를 동시에 커버해야 한다.

| 영역 | 선택 | 이유 |
|---|---|---|
| 런타임 | **Expo** (managed workflow) | iOS/Android 동시 빌드, OTA 업데이트 |
| 언어 | **TypeScript** (strict) | 타입 안정성 |
| 라우팅 | **Expo Router** | 파일 기반 라우팅, 딥링크 쉬움 |
| 상태관리 | **Zustand** | 가볍고 boilerplate 없음 |
| 서버 상태 | **TanStack Query** | 캐싱, 동기화, mutation 패턴 |
| 백엔드 | **Supabase** | Auth + Postgres + Storage + Realtime |
| 스타일 | **StyleSheet.create** | MVP는 UI 라이브러리 없이 기본으로 |
| 책 검색 | **카카오 책 검색 API** | 국내 서비스 기준 안정적 |

### 왜 Supabase인가

별도 백엔드 서버를 만들지 않기로 했다. Supabase 하나로 인증, 데이터베이스, API, 보안(RLS)을 전부 해결할 수 있다. PostgreSQL 기반이라 나중에 다른 곳으로 마이그레이션도 가능하다. 이 부분은 다음 글에서 자세히 다룬다.

### 의존성 추가 원칙

- 추가 전에 필요성을 한 번 더 검토. 직접 짜는 게 더 간단하면 그렇게.
- UI 라이브러리(NativeBase, Tamagui 등) 도입 금지. 기본 컴포넌트로 시작.
- 상태관리는 Zustand 하나만.

## 폴더 구조 설계

확장성을 위해 **도메인별 feature 폴더 구조**를 채택했다.

```
app/                        # Expo Router. 라우트만.
├── (auth)/                 # 비로그인 사용자
├── (tabs)/                 # 탭 네비게이션
├── book/[id].tsx
└── club/[id]/

src/
├── features/               # 도메인별 모듈
│   ├── auth/
│   ├── books/
│   ├── clubs/
│   └── discussions/
│       ├── api.ts          # Supabase 호출
│       ├── hooks.ts        # TanStack Query 훅
│       ├── types.ts
│       └── components/     # 도메인 전용 UI
├── components/             # 공용 UI (Button, Input)
├── lib/                    # 외부 서비스 클라이언트
├── stores/                 # Zustand
├── hooks/                  # 공용 훅
├── types/                  # 전역 타입
└── utils/
```

핵심 원칙:
- **`app/`은 얇게.** 비즈니스 로직 없이 `features/`의 훅을 호출만.
- **도메인별 완결.** `features/clubs/` 안에서 clubs 관련 코드가 전부 끝남.
- **Supabase 호출은 반드시 `api.ts`를 통해서.** 화면에서 직접 DB 호출 금지.

## 새 기능 추가 순서

기능을 추가할 때는 항상 이 순서를 따른다:

1. `types.ts`에 타입 정의
2. Supabase 마이그레이션 (필요시)
3. `api.ts`에 데이터 함수
4. `hooks.ts`에 TanStack Query 훅
5. `components/`에 UI
6. `app/`에 라우트 연결

타입부터 시작하면 나머지 코드를 짤 때 자동완성의 도움을 받을 수 있고, api → hooks → UI 순서로 쌓으면 각 레이어가 아래 레이어에만 의존하게 된다.

## 다음 글에서는

Supabase를 백엔드로 사용하는 방법을 정리한다. 테이블 설계, RLS(Row Level Security) 정책, Auth 연동까지.

---

*이 시리즈는 독서 모임 앱 "북클럽"을 만드는 과정을 기록합니다.*
- **[bookclub 개발기] #1 MVP 기획과 기술 스택 선정** (현재 글)
- [bookclub 개발기] #2 Supabase로 백엔드 한 방에 해결하기
