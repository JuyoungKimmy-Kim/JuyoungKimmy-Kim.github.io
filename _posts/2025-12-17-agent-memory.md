---
title: Agent Memories
date: 2025-12-17
categories: [AI]
tags: [Agent, ADK]
image: /assets/images/posts/mas/memory.png
excerpt: "Agent는 맥락 유지대화의 흐름과 핵심 정보의 지속적 파알을 위해 short-term memory, long-term memory를 구현한다"

---

## Agent는 메모리의 목표
* 맥락 유지대화의 흐름과 핵심 정보의 지속적 파악
* 개인화(Personalization): 사용자 선호도 및 과거 이력에 기반한 맞춤형 상호작용
* 지속적 학습: 과거의 성공과 실패 경험으로부터 점진적으로 성능을 개선하는 자기 성장 능력

## Short-term Memory

![](/assets/images/posts/mas/short-term.png)

### 개념
* 현재 대화의 맥락(Context) 그 자체
* LLM Context Window 내에서 관리되는 Agent의 작업 기억
* RAM과 유사하게, 현재 처리 중인 정보를 빠르고 효율적으로 접근하기 위한 휘발성 공간

### 특징
* LLM이 직접 접근 가능하여 즉각적인 맥락 파악에 유리
* 대화 세션 종료 또는 컨텍스트 창의 한계 초과 시 정보 휘발

### 단점
* 대화가 길어질수록 오래된 정보를 잊어버림
* 컨텍스트 창이 클수록 API 호출 비용과 응답 지연 시간(Latency)이 기하급수적으로 증가하는 엔지니어링 Trade-off 존재
* 요약 매커니즘 필요

## Long-term Semantic Memory


![](/assets/images/posts/mas/long-term.png)

### 의미 기억 (Semantic Memory)
* 대화가 끝나도 유지되는 Agent의 영구적인 Knowledge Base
* 작업을 수행하기 위한 일반적인 사실과 이용자에 대한 정보
* 데이터, 문서 등 Agent의 활동에 대한 기억
* 오류 및 디버깅에 대한 기억 
* 기술적인 접근 방법: RAG

### 장기 기억 (Episodic Memory)
* 단순히 정보를 저장하는 것을 넘어, 특정 작업의 성공 또는 실패 경험을 저장
* 각 에피소드를 구조화된 데이터로 저장하여 학습 효율 극대화 및 시행착오 단축 (과거의 성공적인 문제 해결 절차를 학습하고 유사한 미래 문제에 재사용)

### 기억의 한계
1. 흩어진 정보 점들 사이의 관계는 어떻게 파악 하는가
2. Agent가 피상적인 정보 나열을 넘어, 깊이 있는 추론을 하는 데 있어 결정적인 장벽으로 작용

### 하이브리드 접근법 (RAG + Knowledge Graph)
RAG의 비정형 텍스트 검색 능력과 지식 그래프의 정형적 관계 추론 능력을 결헙하여 기억의 깊이와 정확성을 극대화
1. RAG(점찾기): 질문과 관련된 비정형 텍스트를 신속하여 검색하여 풍부한 서술형 정보 제공
2. Knowledge Grap(선 긋기): 세상의 지식을 노드와 간선으로 구성된 그래프 형태로 저장하여 정보 간 구조적, 인과적 관계 표현

```
e.g. 
Query: 알파벳이 딥마인드를 인수한 후, 데미스 하사비스의 역할은 어떻게 변했나?
1. RAG: Agent가 RAG 시스템을 통해 관련 뉴스 기사, 인터뷰, 공식 발표문 등 다수의 텍스트 문서를 검색
2. KG 조회(선 잇기): Agent가 내부 지식 그래프에서 알파벳, 딥마인드, 데미스 하사비스 노드를 조회
3. 종합 추론(점과 선의 결합): 'Agent는 KG를 통해 누가 누구를 인수했고, 누가 어디 소속인지' 라는 구조적 뼈대를 이해하고 그 뼈대 위에 RAG가 찾아온 정보를 붙여 최종 답변 생성 
```

