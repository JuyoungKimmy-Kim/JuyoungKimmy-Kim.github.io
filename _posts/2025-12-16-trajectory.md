---
title: Agents 평가 방법
date: 2025-12-16
categories: [AI]
tags: [Agent, ADK]
image: /assets/images/posts/mas/trajectory.png
excerpt: "Agent의 평가는 AI Agent 특성상 단순한 정답 비교(pass, fail) 방식이 아니라 agent가 어떤 과정을 통해 답을 만들었는지 평가해야한다. 전통적인 unit test는 deterministic 하지만 LLM 기반 agent는 확률적이므로, 의사결정 과제 자체를 평가한다."

---

## Evaluate Agents

![](/assets/images/posts/mas/trajectory.png)

* AI Agent 특성상 단순한 정답 비교(pass, fail) 방식이 아니라 agent가 어떤 과정을 통해 답을 만들었는지 평가해야함
* 전통적인 unit test는 deterministic 하지만 LLM 기반 agent는 확률적이므로, **의사결정 과제 자체를 평가**

## Trajectory
> The trajectory is just a list of steps the agent took before it returned to the user.

* 사용자의 입력을 이해하기 위한 분석, 기존 세션/히스토리와 비교/필요한 도구 호출, API 호출 또는 데이터 조회와 같은 일련의 과정 전체를 의미
* 이를 expected trajectory와 비교함으로써 잘못된 행동, 불필요한 tool 사용, 비효율적인 순서 등을 파악
* Trajectory 평가를 통해 출력은 맞는데, 내부적으로 망가진 agent를 잡아낼 수 있음

## Preparing for Agent Evaluations
> Agent 평가를 자동화하기 전에, "무엇을 잘했다고 볼 것인지" 정의

* Define Success: 이 agent가 언제 생공했다고 말할 수 있는가?
* Identify Critical Tasks: 이 agent가 반드시 수행해야 하는 행동들
* Choose Relevant Metrics: 무엇을 점수로 볼 것인가 (e.g. tool 호출 순서 정확도, 불필요한 step수, expected trajectory와의 일치도)

## How Evaluation works with the ADK

### 1. Test File 사용 (단위 테스트용)
> 개발자가 agent를 만드는 도중에 빠르게 기능을 확인하기 위해 사용

* 단일 세션(Single Session): 하나의 파일에 하나의 대화 세션만 담음
* 단순함: 복잡한 시나리오보다는, 특정 기능이 잘 작동하는지 확인하는 용도
* 파일 형식: `*.test.json`이라는 이름으로 끝나는 json 파일

#### 파일구조
> 하나의 테스트 케이스는 다음 4가지 요소를 포함

1. **User Content**: 사용자의 질문
2. **Expected Intermediate Tool Use**: Agent가 정답을 맞추기 위해 반드시 거쳐야 하는 도구 사용 경로 (Trajectory)
3. **Expected Intermediate Agent Responses**: Agent가 도구를 쓰는 도중 내뱉는 중간 응답
4. **Final Response**: 기대하는 최종 답변

### 2. Evalset File 사용 (통합 테스트용)
> Agent 개발이 어느 정도 완료된 후, 복잡하고 긴 대화를 시뮬레이션하기 위해 사용

* Multiple Session: 하나의 파일 안에 여러 개의 독립적인 대화 시나리오(Eval cases)를 담을 수 있음
* Multi-turn: 사용자와 Agent가 여러 번 말을 주고받는 긴 호흡의 대화를 테스트하기 좋음
* User Simulation: 고정된 대화뿐만 아니라, AI가 사용자 역할을 맡아 동적으로 대화를 진행하는 시뮬레이션 테스트도 지원

## ADK가 제공하는 Trajectory 평가 매커니즘
ADK는 trajectory를 평가하기 위한 몇 가지 기준(criteria)을 제공

### 도구 사용 평가 (과정 평가)
 
 *  `tool_trajectory_avg_scroe`: Agent가 도구를 예상한 순서대로 정확하게 사용했는지 평가하는 방식으로, 무조건 A 도구를 먼저 쓰고, B 도구를 써야 해 라고 정해져 있을 때 사용
 * `rubric_based_tool_use_quality_v1`: 도구 사용이 논리적으로 타당했는지 LLM이 판단하는 방식으로, 순서는 틀렸어도 논리적으로 말이 되게 도구를 썼으면 합격과 같이 유연한 평가가 필요할 때

## Reference
* [1] https://google.github.io/adk-docs/evaluate/
* [2] https://www.researchgate.net/figure/Multi-agent-trajectory-forecasting-methods-are-optimized-for-single-agent-metrics-like_fig1_370656674