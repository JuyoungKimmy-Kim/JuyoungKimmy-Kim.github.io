---
title: Agentic RAG
date: 2025-09-27
categories: [AI]
tags: [Agent, RAG]
image: /assets/images/posts/agent/agenticRAG_single.png
excerpt: "gentic RAG는 기존 RAG를 기반으로, 동적으로 작업을 실행할 수 있는 자율적인 의사 결정 주체인 Agent를 도입한 것으로 단순히 데이터 검색과 응답 생성에 그치는 것이 아니라, Agent가 자율적으로 계획을 세우고 의사결정을 내리며 외부 도구와 협력해 최적의 결과 제공한다"

---

## Agentic RAG = RAG + Agent
- Agentic RAG는 기존 RAG를 기반으로, 동적으로 작업을 실행할 수 있는 자율적인 의사 결정 주체인 Agent를 도입한 것
- 단순히 데이터 검색과 응답 생성에 그치는 것이 아니라, Agent가 **자율적으로 계획을 세우고 의사결정을 내리며 외부 도구와 협력**해 최적의 결과 제공
- 작업을 Agent들에게 분산시키고, 오케스트레이터가 조율하여 검색과 추론을 가속하면서 정확도를 유지
- Evaluator Agent는 생성된 답변의 품질을 검사하고, Optimizer Agent는 필요한 경우 계획 수정

### Traditional RAG vs Agentic RAG

| 구분 | Traditional RAG | Agentic RAG |
|---| ---| --- |
| 정보 검색 방식| 정적이고 단일 단계의 검색 | 반복적이고 능동적인 검색|
| 응답 생성 과정 | 단순히 검색된 정보를 바탕으로 응답 생성 | 검색된 정보를 요약, 통합, 분석 후 응답 생성 |
| 복잡한 요청 처리 | 제한적인 특질성 처리 | 다단계 요청을 처리하며, 불확실성을 해결하도록 반복 처리 |
| 실시간성 | 최신 정보 반영 어려움 (확보된 문서 기준 처리) | 최신 정보와 실시간 데이터 반영 가능 | 
| 적용 사례 | Simple Q&A, FAQ | In-depth Q&A, 검색 기반 보고서 생성 |

### Agentic RAG의 주요 특징
#### 자율적 의사 결정
Agentic RAG의 에이전트는 사용자의 질문을 이해한 후 **어떤 정보 소스를 사용할지, 어떤 도구를 활용할지**를 스스로 판단하고, 사용자는 더 정교하고 개인화된 답변을 받을 수 있음

#### 동적 정보 검색
Agentic RAG는 사용자의 요구에 따라 **검색 전략을 유연하게 조정**한다. 예를 들어 사용자가 특정 데이터의 최신 상태를 요구한다면, 에이전트는 **관련된 API를 호출해 실시간 데이터를 가져옴**

#### 심화된 맥락 이해
Agentic RAG는 **표면적인 응답을 제공하는 것을 넘어, 데이터 간 관계를 분석하고 심화된 답변을 제공**한다. 예를 들어, 의료 분야에서 AI 모델의 활용 가능성을 묻는다면, 기술적 장점뿐 아니라 법적 규제나 실제 사례까지 포함한 통합적인 답변을 생성

### Agentic RAG Architecture
#### Single-Agent Agentic RAG :Router
![](/assets/images/posts/agent/agenticRAG_single.png)
- 단일 Agent가 전체 검색과 생성 과정을 제어하므로 아키텍처 설계, 구현 및 유지 관리가 간편
- 간소화된 시스템으로 도구나 데이터 소스가 제한된 환경이 특히 효과적
- 순차적 추론이 필요한 작업에 적합

#### Multi-Agent Agentic RAG Systems
![](/assets/images/posts/agent/agenticRAG_multi.png)
- 여러 에이전트가 검색, 계획, 작성, 평가 등 전문 역할을 나누어 협업
- **협력과 경쟁**을 통해 **답변의 품질을 높이고 환각을 줄일** 수 있으나, 조정 및 통신 오버헤드로 효율이 떨어질 수 있음
- 예를들어 사용자 질의 -> Retrieval Agent가 관련 문서를 가져옴 -> Reasoning Agent가 답변을 작성 -> Critic Agent가 응답 및 보정 수행

#### Hierarchical Agentic RAG System
![](/assets/images/posts/agent/agenticRAG_hier.png)
- 계층형 구조는 Agent를 여러 층으로 조직
- 상위 Agent가 작업을 계획하고 하위 Agent에게 하위 작업을 위임
- 긴 문서 요약이나 지식 베이스 구축같은 워크플로우를 지원

#### Agentic Corrective RAG
![](/assets/images/posts/agent/agenticRAG_corrective.png)
- 검색 문서에 대한 **self-reflection**과 **self-grading**을 포함하는 RAG
- 검색 결과를 **반복적으로 개선**하고, **피드백 루프를 도입**하여 문서 활용도와 응답 품질 향상 (데이터의 신뢰도가 중요한 도메인에서 사용)
- 검색된 문서를 **평가**하고, **관련성이 낮은 문서는 시정 조치**
- 쿼리 정제 에이전트가 검색 성능을 개선하고 더 나은 응답 생성을 위해 쿼리 재작성

#### Adaptive Agentic RAG
![](/assets/images/posts/agent/agenticRAG_adaptive.png)
- 쿼리 분석과 active/self-corrective RAG를 결합한 RAG
- 쿼리 복잡도에 따라 분류하는 분류기를 도입하여 적절한 검색 전략을 선택하고 필요할 때 검색을 반복
- 각 쿼리에 대한 검색 프로세스를 맞춤 설정하여 효율성과 정확성을 향상시키는 것이 목표
- 단순한 질의에는 불필요한 검색을 피하고, 복잡한 질의에는 다단계 검색을 수행하도록 함 (쉬운 질의는 Single-Agent로 빠르게 처리, 복잡한 질의는 Multi-Agent 또는 Hierarchical 모드로 전환)


## Reference 
- [1] https://digitalbourgeois.tistory.com/679
- [2] https://velog.io/@lyj_0316/Agentic-RAG

