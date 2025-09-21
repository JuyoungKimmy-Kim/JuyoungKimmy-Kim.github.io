---
title: Agentic Design Pattern
date: 2025-09-21
categories: [AI]
tags: [Agent]
image: /assets/images/posts/agent/design_pattern.png
excerpt: "Agentic Design Patterns는 AI모델이 더 자율적으로 작동하도록 하는 설계 패턴으로, 기존 단일 프롬프트 방식과는 달리, 에이전트 기반 접근 방식에서는 AI가 작업을 단계적으로 처리하고 각 단계를 반복적으로 개선하도록 설계된다"

---

## Agentic Design Pattern
![](/assets/images/posts/agent/design_pattern.png)

Agentic Design Patterns는 AI모델이 더 자율적으로 작동하도록 하는 설계 패턴으로, 기존 단일 프롬프트 방식과는 달리, 에이전트 기반 접근 방식에서는 AI가 작업을 **단계적으로 처리하고 각 단계를 반복적으로 개선**하도록 설계된다
ß
### Reflection Pattern
![](/assets/images/posts/agent/reflection_pattern.png)
- Agent는 자신의 출력을 평가하고, 그 피드백을 활용하여 반복적으로 응답을 개선 (생성된 콘텐츠를 마치 사람처럼 리뷰)
- 구조: LLM이 사용자 질의에 대해 초기 결과 생성 -> 같은 LLM 또는 별도의 Critical LLM이 해당 결과를 평가 및 피드백 -> 피드백을 반영해 결과를 반복적으로 개선 (Iterative refinement) -> 최종적으로 개선된 결과를 사용자에게 반환
- **SELF-RAG**라는 프레임워크는 이 패턴을 기반으로, 생성된 텍스트의 정확성과 관련성을 지속적으로 평가하고 개선하는 과정을 통해 신뢰할 수 있는 결과 제공
- 콘텐츠 생성, 문제 해결, 코드 작성 등 정밀성을 요구하는 작업에 적합 

### Tool Use Pattern
![](/assets/images/posts/agent/tool_use_pattern.png)
- AI가 외부 도구를 활용하여 내부 지식만으로는 해결할 수 없는 문제를 처리하도록 함 (실시간 정보 접근, 특화 기능을 활용)
- 구조: LLM이 사용자 쿼리를 받고 필요한 경우 외부 Tool을 호출하고 도구의 결과를 받아 통합하고 최종 응답을 생성해 사용자에게 반환
- AI가 단순한 텍스트 생성기를 넘어 **실제 문제 해결 도구**로 발전시키는 데 기여함

### ReAct(Reason and Act) Pattern
- 추론(Reasoning)과 행동(Acting)을 반복적으로 수행하며 문제를 해결하는 패턴
- 구조: LLM이 쿼리에 대해 추론 -> 필요한 행동을 수행 -> 결과를 받아 다시 추론, 이 과정을 반복하여 최종 응답 생성

### Planning Pattern
![](/assets/images/posts/agent/planning_pattern.png)
- 문제를 여러 하위 작업으로 분해하고, 체계적으로 계획을 세워 실행하는 패턴
- 복잡한 Multi-Step 문제를 해결하며, 대규모 프로젝트나 장기적 목표에 적합
- 구조: LLM이 전체 목표를 분석, 여러 하위 작업(Task)으로 분해 -> 각 작업을 순차적으로 실행 -> 각 단계별 결과를 확인, 필요 시 계획을 수정 -> 모든 작업이 완료되면 최종 결과 반환

### Multi-agent Pattern
![](/assets/images/posts/agent/multi_agent_pattern.png)
- 하나 이상의 Agent가 협력하거나, Agent간 역할을 분할하여 복잡한 작업을 처리하는 패턴
- 역할(Persona)기반 분업과 협력, 복잡한 문제를 효율적으로 분산 처리
- 구조: 사용자 쿼리가 여러 역할별에게 분배 -> 각 Agent가 자신의 역할에 맞는 작업 수행 -> 필요시 다른 Agent에게 작업 위임 -> 결과를 통합해 최종 응답 생성

#### 협업형 에이전트 vs 감독형 에이전트
- 협업형: 각 에이전트가 특정 작업을 담당하며, 결과를 공유하여 최종 목표를 달성
- 감독성: 중앙 관리자가 다른 에이전트를 감도갛여 품질을 보장

## Reference
- [1] https://day-to-day.tistory.com/82
- [2] https://www.skax.co.kr/insight/trend/3094
- [3] https://cloud.google.com/discover/what-are-ai-agents?hl=ko
- [4] https://digitalbourgeois.tistory.com/682
- [5] https://blog.dailydoseofds.com/p/5-agentic-ai-design-patterns