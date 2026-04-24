---
title: "[bookclub 개발기] 2. Supabase로 백엔드 해결하기"
date: 2026-04-24
categories: [개발]
tags: [bookclup, supabase, postgresql, rls]
image: /assets/images/posts/bookclub/main.png
excerpt: "별도 백엔드 서버 없이 Supabase 하나로 인증, 데이터베이스, API, 보안을 전부 해결했다. 테이블 설계부터 RLS 정책, 삽질 기록까지."

---

## Supabase란

Supabase는 Firebase의 오픈소스 대안이다. 핵심 차이는 **PostgreSQL** 기반이라는 점.

```
앱 (React Native)  →  Supabase
                        ├── Auth (인증)
                        ├── PostgreSQL (데이터베이스)
                        ├── Auto REST API (자동 API 생성)
                        ├── RLS (Row Level Security)
                        └── Storage (파일 저장)
```

별도 백엔드 서버를 만들 필요가 없다. Supabase가 DB 테이블을 만들면 자동으로 REST API가 생성되고, RLS로 보안까지 처리된다.

### 상용화가 가능한가?

가능하다. 무료 플랜으로 MVP 충분히 운영 가능하고, 사용자가 늘면 Pro($25/월)로 전환하면 된다. PostgreSQL이라 나중에 다른 호스팅으로 마이그레이션도 쉽다. 오픈소스라 셀프 호스팅도 가능하다.

## 테이블 설계

MVP에 필요한 테이블은 10개다.

### 핵심 테이블 관계

```
auth.users (Supabase 내장)
    └── profiles (1:1, trigger로 자동 생성)

books (카카오 API 캐싱, isbn unique)
    ├── reading_records (유저별 독서 상태)
    └── highlights (유저별 하이라이트/메모)

clubs
    ├── club_members (유저-모임 관계)
    └── club_books (월별 지정 책)
            ├── discussions (토론 질문)
            │       └── discussion_comments (댓글)
            └── meeting_notes (모임장 요약)
```

### profiles - Auth 확장

Supabase Auth는 `auth.users` 테이블을 내장하고 있지만, 앱에서 필요한 추가 정보(닉네임, 프로필 사진)는 별도 `profiles` 테이블에 저장한다.

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  avatar_url text,
  created_at timestamptz default now() not null
);
```

회원가입 시 자동으로 profiles에 row가 생성되도록 trigger를 건다.

```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', 'user_' || left(new.id::text, 8))
  );
  return new;
exception when others then
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

### books - 카카오 API 캐싱

카카오 책 검색 API로 찾은 책을 DB에 캐싱한다. 같은 ISBN은 upsert.

```sql
create table books (
  id uuid default gen_random_uuid() primary key,
  isbn text unique not null,
  title text not null,
  author text not null,
  publisher text,
  cover_url text,
  created_at timestamptz default now() not null
);
```

### clubs - 초대 코드 시스템

모임은 6자리 영숫자 초대 코드로 참여한다. 코드는 앱에서 자동 생성.

```sql
create table clubs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  invite_code text unique not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);
```

## RLS (Row Level Security)

Supabase의 가장 강력한 기능이다. **DB 레벨에서 접근 제어**를 한다. 아무리 API를 직접 호출해도 권한 없는 데이터는 볼 수 없다.

### 원칙

- **모든 테이블 RLS 활성화.** 예외 없음.
- 읽기: 본인 데이터 또는 소속 모임 데이터만.
- 쓰기: 본인만. 모임 관련은 멤버십 체크.

### Helper 함수

모임 멤버십 체크가 여러 정책에서 반복되므로 helper 함수를 만들었다.

```sql
create or replace function is_club_member(p_club_id uuid)
returns boolean as $$
  select exists (
    select 1 from club_members
    where club_id = p_club_id and user_id = auth.uid()
  );
$$ language sql security definer stable;
```

### 정책 예시

**개인 데이터** - 본인 것만:
```sql
create policy "본인 독서 기록 조회" on reading_records
  for select using (user_id = auth.uid());
```

**모임 데이터** - 멤버만:
```sql
create policy "소속 모임 토론 조회" on discussions
  for select using (
    exists (
      select 1 from club_books cb
      where cb.id = club_book_id and is_club_member(cb.club_id)
    )
  );
```

**모임장 권한** - owner만:
```sql
create policy "모임장만 책 지정" on club_books
  for insert with check (is_club_owner(club_id));
```

이렇게 하면 앱 코드에서 권한 체크를 안 해도 DB가 알아서 막아준다.

## 클라이언트 연동

React Native에서 Supabase 클라이언트를 초기화하는 코드:

```typescript
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

// 네이티브: SecureStore, 웹: localStorage
const storage = Platform.OS === 'web'
  ? window.localStorage
  : {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

세션 토큰을 네이티브에서는 **SecureStore**(암호화 저장소)에, 웹에서는 **localStorage**에 저장한다. 처음에 SecureStore만 사용했다가 웹에서 `getValueWithKeyAsync is not a function` 에러가 나서 Platform 분기를 추가했다.

## 삽질 기록

### 1. Email Provider 비활성화

Supabase 프로젝트를 처음 만들면 Email provider가 꺼져있을 수 있다. `Authentication → Sign In / Providers → Email`에서 활성화해야 한다.

### 2. Confirm Email

이메일 인증(Confirm email)이 켜져있으면 가입 후 인증 메일을 클릭해야 로그인이 되는데, Supabase 무료 플랜의 기본 SMTP는 발송 제한이 있어서 메일이 안 올 수 있다. **개발 중에는 Confirm email을 꺼두자.**

### 3. Trigger에서 schema 명시

`profiles`가 아니라 `public.profiles`로 명시해야 한다. Supabase의 trigger 함수는 `auth` 스키마 컨텍스트에서 실행될 수 있어서, `public` 스키마를 명시하지 않으면 테이블을 못 찾을 수 있다.

```sql
-- Bad
insert into profiles (id, username) values (...);

-- Good
insert into public.profiles (id, username) values (...);
```

### 4. Trigger 예외 처리

trigger에서 에러가 나면 **회원가입 자체가 실패**한다. `exception when others then return new`를 추가해서 trigger 실패가 회원가입을 막지 않도록 해야 한다.

## 다음 글에서는

인증 흐름과 네비게이션 구조를 정리한다. Expo Router로 Auth 분기를 어떻게 처리했는지, Zustand + TanStack Query 조합을 어떻게 사용했는지.

---

*이 시리즈는 독서 모임 앱 "북클럽"을 만드는 과정을 기록합니다.*
- [bookclub 개발기] #1 MVP 기획과 기술 스택 선정
- **[bookclub 개발기] #2 Supabase로 백엔드 한 방에 해결하기** (현재 글)
- [bookclub 개발기] #3 인증과 네비게이션 (예정)
