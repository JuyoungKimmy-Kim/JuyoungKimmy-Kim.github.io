---
title: "[bookclub 개발기] 3. 소셜 로그인 삽질기 (카카오/구글/네이버)"
date: 2026-04-24
categories: [개발]
tags: [bookclup, supabase, kakao, google, oauth]
image: /assets/images/posts/bookclub/main.png
excerpt: "카카오/구글/네이버 소셜 로그인을 Supabase에 붙이면서 만난 삽질들. KOE101, KOE205, Unable to exchange external code 에러와 웹 호환성 이슈까지."

---

## 카카오 소셜 로그인을 붙이자

이메일 로그인만으로는 부족하다. 요즘 누가 이메일로 회원가입을 하나. 카카오/구글/네이버 소셜 로그인을 붙이기로 했다. Supabase가 OAuth Provider를 기본 지원하니까 금방 될 줄 알았는데, 삽질의 연속이었다.

## 전체 구조

```
사용자 → 카카오 로그인 버튼 클릭
  → 카카오 인증 페이지 이동
  → 동의 후 Supabase callback URL로 리다이렉트
  → Supabase가 카카오 토큰 교환
  → 세션 생성 후 앱으로 리다이렉트
  → onAuthStateChange에서 세션 감지
  → 로그인 완료
```

간단해 보이지만, 설정할 게 카카오 개발자 콘솔, Supabase 대시보드, 앱 코드 세 곳에 걸쳐 있다.

## 필요한 설정 (카카오 개발자 콘솔)

### 1. 카카오 로그인 활성화

카카오 개발자 콘솔 → 제품 설정 → 카카오 로그인 → 일반 → 상태 **ON**

### 2. Redirect URI 등록

**주의: 메뉴 위치가 바뀌었다.**

이전에는 "카카오 로그인 > 일반"에 있었는데, 지금은 **앱 > 플랫폼 키 > REST API 키 상세**로 이동했다. 여기에 Supabase의 callback URL을 등록한다:

```
https://<project-ref>.supabase.co/auth/v1/callback
```

### 3. 플랫폼 웹 도메인 등록

앱 설정 → 제품 링크 관리 → 웹 도메인에 아래 등록:

```
http://localhost
http://localhost:8081
https://<project-ref>.supabase.co
```

이걸 안 하면 **KOE101** 에러가 난다.

### 4. 동의항목 설정

카카오 로그인 → 동의항목에서 닉네임, 프로필 사진을 선택 동의로 설정.

이메일(`account_email`)은 **비즈 앱**이어야 사용 가능하다. 개인 개발자 계정에서는 권한 없음으로 뜬다.

### 5. Client Secret 설정

**이것도 메뉴 위치가 바뀌었다.** 이전에는 "보안" 메뉴에 있었는데, 지금은 **앱 > 플랫폼 키 > REST API 키 상세**에 있다. "카카오 로그인" 쪽 Client Secret을 생성하고 **활성화 상태를 "사용함"**으로 변경해야 한다.

## 필요한 설정 (Supabase 대시보드)

Authentication → Sign In / Providers → Kakao:

- **Kakao enabled**: ON
- **REST API Key**: 카카오 REST API 키
- **Client Secret Code**: 카카오에서 생성한 Client Secret
- **Allow users without an email**: ON (비즈 앱이 아닌 경우)

## 만난 에러들

### 에러 1: KOE101 (Admin Settings Issue)

```
An error in the service settings prevents the service from being used.
```

**원인**: 플랫폼 웹 도메인에 `localhost`와 Supabase 도메인이 등록되지 않음.

**해결**: 제품 링크 관리 → 웹 도메인에 `http://localhost`, `http://localhost:8081`, `https://<project-ref>.supabase.co` 추가.

### 에러 2: KOE205 (Invalid Request)

```
An error in the bookclub service settings prevents the service from being used.
```

**원인**: Supabase가 기본적으로 `account_email` scope를 요청하는데, 개인 개발자 앱에서는 이 scope를 사용할 수 없다. Supabase의 알려진 이슈다.

**해결**: 코드에서 카카오 로그인 시 scope를 명시적으로 지정:

```typescript
if (provider === 'kakao') {
  options.scopes = 'profile_nickname profile_image account_email';
}
```

비즈 앱 전환 전에는 `account_email`을 빼고, 전환 후에 추가하면 된다.

### 에러 3: Unable to exchange external code

```
error=server_error&error_code=unexpected_failure
&error_description=Unable+to+exchange+external+code
```

**원인**: 카카오 Client Secret이 제대로 설정되지 않음. Supabase가 카카오에 인증 코드를 토큰으로 교환하려는데 Client Secret이 없거나 틀리면 이 에러가 난다.

**해결**: 카카오 개발자 콘솔에서 "카카오 로그인" 쪽 Client Secret을 생성하고 활성화한 뒤, Supabase에 정확히 입력.

## 웹에서의 추가 이슈

### React Native 웹 호환성

네이티브에서는 `expo-web-browser`로 OAuth 인증 창을 열지만, 웹에서는 그냥 브라우저 리다이렉트를 사용해야 한다. Platform 분기가 필요하다:

```typescript
if (Platform.OS === 'web') {
  // 웹: 브라우저 리다이렉트
  await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });
} else {
  // 네이티브: WebBrowser로 인증 창 열기
  const { data } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectUrl, skipBrowserRedirect: true },
  });
  await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
}
```

### Alert.alert 웹 미지원

React Native의 `Alert.alert`는 웹에서 동작하지 않는다. 옵션 선택 Alert(버튼 여러 개)는 아예 반응이 없다. 공용 유틸을 만들어서 플랫폼별로 분기 처리했다:

- 네이티브: `Alert.alert` 그대로
- 웹 (단순 메시지): `window.alert`
- 웹 (확인/취소): `window.confirm`

### 조건부 렌더링 && 패턴

```jsx
// 웹에서 에러 발생
{someString && <Text>{someString}</Text>}

// 안전한 방식
{someString ? <Text>{someString}</Text> : null}
```

React Native 웹에서 `&&` 패턴으로 문자열 값을 조건부 렌더링하면, 빈 문자열 `''`이 `<View>` 안에 텍스트 노드로 렌더되어 에러가 난다. 삼항 연산자로 바꿔야 한다.

## 구글 로그인

카카오에 비하면 구글은 훨씬 수월했다. Supabase가 구글을 기본 Provider로 지원하고, 설정도 직관적이다.

### Google Cloud Console 설정

1. [console.cloud.google.com](https://console.cloud.google.com)에서 새 프로젝트 생성
2. **API 및 서비스** → **OAuth 동의 화면** 구성
   - 앱 이름, 이메일 입력
   - User Type: 외부
3. **사용자 인증 정보** → **OAuth 클라이언트 ID** 생성
   - 애플리케이션 유형: 웹 애플리케이션
   - 승인된 리디렉션 URI에 Supabase callback URL 추가:
   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```
4. 생성된 **Client ID**와 **Client Secret** 복사

### Supabase 대시보드 설정

Authentication → Sign In / Providers → Google:

- **Google enabled**: ON
- **Client ID**: Google에서 복사한 값
- **Client Secret**: Google에서 복사한 값
- Save

카카오와 달리 scope 문제도 없고, Client Secret 활성화 같은 추가 단계도 없다. 설정하고 바로 동작했다.

### 카카오 vs 구글 비교

| | 카카오 | 구글 |
|---|---|---|
| 설정 난이도 | 높음 | 낮음 |
| Redirect URI 위치 | 메뉴가 바뀌어서 찾기 어려움 | 직관적 |
| Client Secret | 별도 활성화 필요 | 생성 시 바로 사용 |
| 이메일 scope | 비즈 앱 필요 | 기본 제공 |
| 에러 발생 | 3번 | 0번 |

## 네이버 로그인은 왜 빠졌나

네이버는 **OIDC(OpenID Connect)를 지원하지 않는다.** OAuth 2.0만 지원한다. Supabase의 Custom Provider는 OIDC 기반이라 네이버를 직접 연동할 수 없다.

네이버를 붙이려면 Supabase Edge Function으로 중간 서버를 만들어야 하는데, MVP 단계에서 그 복잡도는 불필요하다고 판단했다. 카카오 + 구글이면 국내 사용자 대부분을 커버할 수 있다. 네이버는 추후 Edge Function으로 검토 예정.

## 코드 구조

소셜 로그인의 핵심 코드는 `src/lib/socialAuth.ts` 하나에 모여 있다:

```typescript
export async function performSocialLogin(provider: SocialProvider) {
  if (Platform.OS === 'web') {
    // 웹: 브라우저 리다이렉트 방식
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
        scopes: provider === 'kakao'
          ? 'profile_nickname profile_image account_email'
          : undefined,
      },
    });
  } else {
    // 네이티브: expo-web-browser로 인증 창 열기
    const { data } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    // result에서 토큰 추출 후 세션 설정
  }
}
```

Provider를 추가할 때는 이 함수와 `SocialLoginButtons` 컴포넌트에 버튼만 추가하면 된다. Supabase가 OAuth 흐름을 전부 처리해주기 때문에 앱 코드는 간결하게 유지된다.

## 교훈

1. **Supabase + 카카오 조합은 생각보다 설정이 많다.** 코드보다 대시보드 설정에서 더 많이 막힌다. 구글은 비교적 수월하다.
2. **카카오 개발자 콘솔 메뉴가 자주 바뀐다.** 블로그 글이나 공식 문서의 스크린샷이 현재와 다를 수 있다. 메뉴를 못 찾겠으면 카카오 데브톡에서 최신 정보를 확인하자.
3. **웹과 네이티브는 다른 세상이다.** React Native로 둘 다 커버한다고 해도, OAuth 흐름, Alert, 조건부 렌더링 등에서 플랫폼 차이가 계속 나온다.
4. **에러 메시지를 정확히 읽자.** Network 탭의 response header에 `x-sb-error-code`가 있고, 이게 디버깅의 핵심이다.
5. **Provider마다 난이도가 다르다.** 구글처럼 한 번에 되는 것도 있고, 카카오처럼 삽질이 필요한 것도 있다. 쉬운 것부터 붙여서 전체 흐름을 확인하고, 어려운 걸 나중에 하는 것도 방법이다.

---

*이 시리즈는 독서 모임 앱 "북클럽"을 만드는 과정을 기록합니다.*
- [bookclub 개발기] 1. MVP, 기술 스택 선정
- [bookclub 개발기] 2. Supabase로 백엔드 해결하기
- **[bookclub 개발기] 3. 소셜 로그인 삽질기 (카카오/구글)** (현재 글)
