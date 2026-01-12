---
title: Core Concept and Components in A2A
date: 2026-01-10
categories: [AI]
tags: [a2a]
image: /assets/images/posts/adk/core-concept.png
excerpt: "A2A 프로토콜의 핵심 개념은 서로 다른 시스템의 Agent들이 협력하기 위한 빌딩 블록으로 구성된다."

---

> A2A 프로토콜의 핵심 개념은 서로 다른 시스템의 Agent들이 협력하기 위한 빌딩 블록으로 구성된다.

## Core Actor
![](/assets/images/posts/adk/core-concept.png)
### User
- Agent의 자원이 필요한 요청이나 목표를 제공하는 역할
- 최종 사용자 (인간 또는 자동화 서비스)

### A2A Client (Client Agent)
- 사용자를 대신하여 A2A Server에 행동이나 정보를 요청하는 주체
- A2A 프로토콜을 사용해 통신을 시작

### A2A Server (Remote Agent)
- Remote Agent: A2A 프로토콜을 구현한 HTTP 엔드포인트를 노출하는 AI Agent - 클라이언트로부터 요청을 받아 작업을 처리하고 결과나 상태 업데이트 반환

### 참고 (예시)
일본 도쿄 비즈니스 출장 계획 및 예약이 있다고 할 때, User는 CEO, A2A Client는 대리인, A2A Server는 각 요청에 응답하는 예약 에이전트라고 할 수 있다.

CEO가 다음주 수요일 도쿄로 2박 3일 긴자 근처로 출장을 가야해서, 이용하기 편한 항공권과 호텔을 예약하고 일정표를 작성해달라는 요청을 A2A Client에게 보낸다. 그 후 A2A Client는 요청을 분석해 항공 예약과 호텔 예약이 필요함을 파악하고, 네트워크에서 신뢰할 수 있는 A2A Server를 검색한다. 항공사 에이전트 (Server)에게 스케줄을 물어보고, 호텔 에이전트(Server)에게 빈 방을 확인하여 두 서버로부터 받은 정보를 취합해 사용자에게 최종 확답을 받는다.

### Multi-turn 협상
Client 에이전트가 제약 조건(긴차 근처, 수요일 오전 도착)을 가지고 여러 서버에 동시에 요청을 보내는 경우가 있을 수 있다. 이때 각 서버로부터 답변이 왔는데, 조건이 서로 맞지 않는 상황이 발생할 경우, A2A 에이전트들은 대안을 가지고 협상을 시작한다.

이때, Client가 협상을 주도하고, Server는 Agentic 하게 대답함으로써 협상에 참여한다. 예를 들어 항공사 에이전트(Server)가 대안을 제시했을 경우, 클라이언트는 비교 및 대조, 컨텍스트 통합을 통해 전략을 수립하여 User에게 전달한다.


## Fundamental Communication Elements

### Agent Card
- A2A 서버를 설명하는 JSON 메타데이터
- 일반적으로 알려진 URL로 요청/공개 가능 (`/.well-knwon/agent.json`)

#### 주요 포함 정보
- 에이전트의 이름 및 설명, 서비스 엔드포인트 URL
- 지원하는 A2A 기능 (스트리밍, 푸시 알림 등)
- 제공하는 특정 기술 (Skills) 또는 서비스 목록
- 기본 입출력 양식, 인증 요구 사항 등

### Message
- 클라이언트와 에이전트 간 단일 대화 턴(turn) 또는 통신 단위

#### 주요 속성
- role: `user(클라이언트 발송) | agent(서버 발송)`
- messageId: 메시지 발신자가 설정하는 고유 식별자
- 하나 이상의 Part 객체를 포함하여 실제 콘텐츠 (지시, 맥락, 질문, 답변 등) 전달

### Parts
- 메시지(Message) 또는 아티펙트(Artifact)내 콘텐츠의 기본 단위

#### 주요 유형
- 각 파트는 특정 타입을 가지면 다른 종류의 데이터를 운반
- TextPart: 일반 텍스트 콘텐츠
- FilePart: 파일 (인라인 base64 인코딩 또는 URI 참조 방식), 파일명, 미디어 타입 등 메타데이터 포함
- DataPart: 구조화된 JSON 데이터 (파라미터, 폼 등 기계가 읽을 수 있는 정보)

### Artifact
- Task 처리 중 Remote Agent가 생성한 유형의(Tangible) 결과물

#### 주요 특징
- 하나 이상의 Part 객체로 구성
- 증분 방식(incrementally), 즉 부분적으로 나누어 스트리밍 가능
- e.g. 생성된 문서, 이미지, 스프레드 시트, 구조화된 데이터 결과물 (JSON, CSV 등)

### 주요 흐름
![](/assets/images/posts/adk/message.jpeg)

1. A2A 클라이언트는 먼저 액세스 가능한 모든 A2A 서버 에이전트 카드에서 검색을 실행하고 해당 정보를 활용하여 연결 클라이언트를 빌드한다. 
2. 필요한 경우 A2A 클라이언트는 A2A 서버에 메시지를 전송하고 서버는 이를 완료해야 하는 작업으로 평가한다.
3. 푸시 알림 수신자 URL이 A2A 클라이언트에 구성되어 있고, A2A 서버에서 지원되는 경우 서버는 클라이언트의 수신 엔드포인트에 작업 진행 상태를 게시할 수도 있다.
4. 작업이 완료되면 A2A 서버가 응답 아티팩트를 A2A 클라이언트에게 전송한다.



## Reference
- [1] https://a2a-protocol.org/latest/topics/key-concepts/skwndds
- [2] https://codelabs.developers.google.com/intro-a2a-purchasing-concierge?hl=ko#0