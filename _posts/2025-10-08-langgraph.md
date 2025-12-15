---
title: LangGraph 개념 및 기본 예제
date: 2025-10-08
categories: [AI]
tags: [Agent, RAG, LangGraph]
image: /assets/images/posts/langgraph/langgraph.png
excerpt: "angGraph는 LangChain 생태계 안에서 개발된 AI Agent 워크플로우 오케스트레이션 프레임워크로, 단순 Chain이나 Prompt기반 흐름보다 더 복잡하고 유연한 제어 흐름을 지원한다"

---

# LangGraph?
![](/assets/images/posts/langgraph/langgraph.png)

- LangGraph는 LangChain 생태계 안에서 개발된 AI Agent 워크플로우 오케스트레이션 프레임워크로, 단순 Chain이나 Prompt기반 흐름보다 더 복잡하고 유연한 제어 흐름을 지원 (조건 분기, 루프, 상태 기반 전환 등)
- 기본적으로 **상태(stateful), 순환(cyclic), 복수 에이전트(multi-actor)** 워크플로우를 그래프 구조로 정의하고 제어할 수 있게 함 (상태를 유지하고, 여러 단계에 걸쳐 작동하는 에이전트)
- 장시간 실행하거나 상태를 유지해야 하는 워크플로우에 적합하도록 **중단/재개, 컨텍스트 유지, 디버깅/관찰성** 기능 등을 제공

## LangChain vs LangGraph
> LangGraph는 LangChain의 확장 계층으로, 단일 체인 중심의 LangChain을 상태 기반 Agentic Workflow로 발전시킨 프레임워크

### LangChain
![](/assets/images/posts/langgraph/langchain_workflow.png)
- 체인(직선 흐름)으로 컴포넌트를 조립하고, 간단한 파이프라인을 가짐

### LangGraph
![](/assets/images/posts/langgraph/langgraph_workflow.png)
- LangGraph는 처음부터 멀티에이전트 워크플로우 설계를 염두하고 만들어짐
- 상태 제어, 반복(루프), 분기 처리, 실패 시 재실행 같은 기능을 더 안정적으로 제공

| 구분             | **LangChain**                  | **LangGraph**                                        |
| -------------- | ------------------------------ | ---------------------------------------------------- |
| **기본 개념**      | 한 흐름에서 순차적 실행 (체인 중심) | 여러 흐름을 상태 기반으로 제어 (그래프 중심)            |
| **단위 구성요소**    | Chain, Tool, Agent             | Node, Edge, State, Graph                             |
| **데이터 흐름**     | 입력 → 출력 (일방향)                  | 상태(State)가 여러 노드 간을 오가며 업데이트                         |
| **상태 관리**      | 기본적으로 Stateless (메모리 기능 별도)    | 내장된 State 객체로 명시적 상태 관리                              |
| **조건 분기 / 반복** | Python 코드로 직접 구현 필요            | 그래프 엣지로 명시적 정의 (조건부, 반복 가능)                          |
| **복잡한 워크플로우**  | 구성 어려움 (Chain 안에 Chain을 중첩)    | 자연스럽게 표현 가능 (노드 연결 기반)                               |



## LangGraph 핵심 구성 요소
### 상태 (State)
- 그래프의 memory로, 각 단계를 거치면서 **데이터가 어떻게 변하고 유지**되는지 정의하는 객체
- 대화 기록, 중간 결과, 사용자 정보 등 에이전트가 작업을 수행하는 동안 기억해야 할 모든 정보가 이 상태에 담김
- python의 TypeDict를 사용하여 명확한 구조로 정의 (python의 일반 dict과 달리, 각 키의 타입이 명시되어 있음)

### 노드 (Node)
- 그래프의 '작업 단위'로, 특정 작업을 수행하는 python 함수라고 생각할 수 있음
- 현재 상태(State)를 입력받아, LLM을 호출하거나 도구를 사용하는 등의 작업을 처리한 뒤, 변경된 상태를 반환

### 엣지 (Edges)
- 노드와 노드를 연결하는 경로로, 정보와 제어 흐름이 어떤 순서로 이어질지를 결정

## 예제코드
> 사용자의 질문을 받고, 관련 문서를 검색하고, 요약한 뒤 최종 답변을 생성하는 LangGraph 예시

### 상태(State) 정의

LangGraph는 각 노드 사이를 state 객체가 오가면서 데이터를 전달하는데, 이전 노드의 결과를 다음 노드가 이어받아 처리함
```python
from langgraph.graph.state import State

class QAState(State):
    question: str           # 사용자의 질문
    docs: list[str] = []    # 검색된 문서들
    summary: str = ""       # 요약 결과
    answer: str = ""        # 최종 답변
```
- State는 Pydantic 모델처럼 동작하며, 명시적으로 필드를 정의함
- 이후 노드에서 `state.docs, state.summary`처럼 접근 가능

### 노드(Node) 정의

```python
def retrieve(state: QAState):
    # (실제로는 RAG 검색 등을 수행)
    state.docs = [f"Document related to: {state.question}"]
    return state

def summarize(state: QAState):
    state.summary = "This is a short summary of the retrieved documents."
    return state

from langchain_openai import ChatOpenAI

def generate_answer(state: QAState):
    llm = ChatOpenAI(model="gpt-4o-mini")
    res = llm.invoke(f"Question: {state.question}\nSummary: {state.summary}")
    state.answer = res.content
    return state
```
- 각 함수는 `state`를 입력받고, `state`를 반환해야 함

### 그래프(Graph) 생성

```python
from langgraph.graph import Graph, END

graph = Graph()

# 노드 등록
graph.add_node("retriever", retrieve)
graph.add_node("summarizer", summarize)
graph.add_node("generator", generate_answer)
```
- 각 노드에 이름을 붙여 등록하고, 이름은 그래프 내에서 식별자 역할을 함

### 엣지(Edge)로 흐름 연결

```python
graph.add_edge("retriever", "summarizer")
graph.add_edge("summarizer", "generator")
graph.add_edge("generator", END)
# retriever → summarizer → generator → END
```
- 각 노드 간의 실행 순서를 정의
- 이 경우 단순한 직선형 흐름이지만, LangGrpah는 조건부 엣지도 지원함

### 그래프 컴파일 및 실행

```python
app = graph.compile()

initial_state = QAState(question="What is LangGraph?")
final_state = app.invoke(initial_state)
```
- LangGraph는 그래프를 실행 가능한 형태로 `compile()`한 후 초기 상태를 만들어 실행


## Reference 
- [1] https://lsjsj92.tistory.com/696
- [2] https://velog.io/@ohback/LangGraph
- [3] https://wikidocs.net/261577
