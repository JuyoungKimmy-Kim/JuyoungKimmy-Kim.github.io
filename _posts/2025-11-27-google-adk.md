---
title: Google ADK 뿌수기 (1)
date: 2025-11-27
categories: [AI]
tags: [Agent, ADK]
image: /assets/images/posts/langgraph/langgraph.png
excerpt: "Agent Development Kit(ADK)는 AI Agent를 개발하고 배포하기 위한 유연한 모듈식의 프레임워크로, Gemini와 Google 생태계에 최적화되어 있지만, 특정 모델이나 배포 방식에 종속되지 않으며, 다른 프레임워크와의 호환성을 염두에 두고 설계되었다."

---

## Agent Development Kit (ADK)
Agent Development Kit(ADK)는 AI Agent를 개발하고 배포하기 위한 유연한 모듈식의 프레임워크로, Gemini와 Google 생태계에 최적화되어 있지만, 특정 모델이나 배포 방식에 종속되지 않으며, 다른 프레임워크와의 호환성을 염두에 두고 설계되었다.
> Agent Development Kit (ADK) is a flexible and modular framework for developing and deploying AI agents. While optimized for Gemini and the Google ecosystem, ADK is model-agnostic, deployment-agnostic, and is built for compatibility with other frameworks. ADK was designed to make agent development feel more like software development, to make it easier for developers to create, deploy, and orchestrate agentic architectures that range from simple tasks to complex workflows.

## Python Quickstart for ADK
### Installation
```bash
(.venv)$ pip install google-adk
```

### Create an agent project
```bash
(.venv)$ adk create my_agent
```
위 명령어를 실행하면 아래와 같이 자동으로 agent project의 구조가 생성된다

```bash
my_agent/
    agent.py      # main agent code
    .env          # set API keys or project IDs
    __init__.py
```

### Update agent project
`agent.py` 파일에는 **root_agent** 정의가 포함되어 있고, 이는 ADK Agent에서 필수적인 요소이다. 또한 Agent가 사용할 **Tool**을 정의할 수도 있다.

#### root agent
ADK에서 root agent는 Agent 애플리케이션의 **entry point** 이자 **중앙 오케스트레이터**
- 사용자 요청을 가장 처음으로 받음
- 요청을 분석하고 필요한 도구 또는 다른 서브 에이전트를 호출
- 워크 플로우 전체를 조정하여 최종 응답 생성

```python
from google.adk.agents.llm_agent import Agent

# Mock tool implementation
def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city."""
    return {"status": "success", "city": city, "time": "10:30 AM"}

root_agent = Agent(
    model='gemini-3-pro-preview',
    name='root_agent',
    description="Tells the current time in a specified city.",
    instruction="You are a helpful assistant that tells the current time in cities. Use the 'get_current_time' tool for this purpose.",
    tools=[get_current_time],
)
```

> 하나의 Agent 안에 여러 개의 Tool을 넣는 Multi-Tool구조가 가능하고, 여러 개의 Agent를 두고 서로 호출하는 Multi-Agent 오케스트레이션도 가능

### Run your agent
#### Run with command-line interface
```bash
adk run my_agent
```

#### Run with web interface
```bash
adk web --port 000
```

## ADK에서 다른 모델 사용하기
### OpenAI provider
#### 환경 변수
기본적으로 Ollama를 쓸 때는 OLLAMA_API_BASE를 쓰지만, OpenAI provider 방식을 사용할 경우 다음 두 가지를 설정해야 함:
```
export OPENAI_API_BASE=http://localhost:11434/v1
export OPENAI_API_KEY=anything
```

#### 중요한 점
- `OPENAI_API_BASE` URL 끝에는 **반드시 /v1이 포함**되어야 함 → OpenAI API 형식 맞추기 위함
- `OPENAI_API_KEY`는 실제 키가 필요하지 않으며 아무 문자열이면 됨
- 이는 ADK 내부가 OpenAI-style API 규격을 통해 모델에 요청하기 때문

#### Agent 코드 예시
```python
root_agent = Agent(
    model=LiteLlm(model="openai/mistral-small3.1"),
    name="dice_agent",
    description=(
        "hello world agent that can roll a dice of 8 sides and check prime numbers."
    ),
    instruction="""
      You roll dice and answer questions about the outcome of the dice rolls.
    """,
    tools=[
        roll_die,
        check_prime,
    ],
)
```
- 모델은 "openai/mistral-small3.1"과 같이 지정
- 실제 모델은 ollama나 vLLM 같은 서버에서 제공되어도 ADK가 OpenAI-style wrapper로 라우팅함


### Reference
- [1] Google Agent Development Kit (https://google.github.io/adk-docs/)
- [2] Google adk-python (https://github.com/google/adk-python)