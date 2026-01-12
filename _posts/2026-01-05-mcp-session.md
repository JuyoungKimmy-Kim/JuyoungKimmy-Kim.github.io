---
title: MCP session
date: 2026-01-05
categories: [AI]
tags: [mcp]
image: /assets/images/posts/mcp/mcp.png
excerpt: "MCP는 세션 기반 프로토콜이므로 세션 생명주기라는 개념을 포함한다. 생명주기란 세션이 생성되고, 활성화되고, 비활성화되고, 최종적으로 종료되는 전체 과정을 의미한다."

---

## MCP Session 생명 주기
> MCP는 세션 기반 프로토콜이므로 **세션 생명주기**라는 개념을 포함한다. 생명주기란 세션이 생성되고, 활성화되고, 비활성화되고, 최종적으로 종료되는 전체 과정을 의미

### 초기화 (Initialization)

#### Initialization 요청 (Client → Server)
Client가 먼저 `initialize` 요청을 보내는데, 이 요청은 아래 예시와 같고 세 가지 핵심 정보를 포함함
* **protocolVersion**: client가 나는 이 버전의 MCP를 이해할 수 있다라고 선언
* **capabilities**: 클라이언트가 나는 이런 일을 할 수 있다라고 능력을 밝히는 것 (`roots`: 파일 시스템 관리, `sampling`: 텍스트 생성, `elicitation`: 사용자 정보 수집 능력)
* **clientInfo**: 클라이언트의 정체성을 밝히는 것으로, `name`은 고유 식별자, `title`은 사용자에게 보여질 이름, `version`은 버전 정보를 의미

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "elicitation": {}
    },
    "clientInfo": {
      "name": "example-client",
      "version": "1.0.0"
    }
  }
}
```

#### Initialize 응답 (Server → Client)
Server는 Client의 `initialize`요청을 받으면, 자신의 능력과 정보를 담은 응답을 보냄. 이 응답에는 Client 요청과 대칭되는 정보들이 포함되지만, 각각의 의미와 역할은 다름.
* **protocolVersion**: Server가 실제로 사용할 프로토콜 버전을 명시하며, Client가 요청한 버전을 지원한다면 그 버전을 그대로 사용하고, 지원하지 않는다면 Server가 지원하는 최신 버전을 제시
* **capabilities**: Server가 제공할 수 있는 기능들을 나열 (`tools`: 도구 제공, `resources`: 리소스 관리, `prompts`: 프롬프트 템플릿, `logging`: 로깅 기능)
* **serverInfo**: Server의 정체 (Client 정보와 마찬가지로 `name, title, version`를 포함하지만, 여기에 추가로 `instructions` 필드가 있음)
* **Mcp-Session-Id**: Server가 이 세션을 위한 고유 식별자를 발급하며 이는 HTTP 헤더 `Mcp-Session-Id`에 포함되어 전송되며, 앞으로의 모든 요청에서 이 세션을 식별하는 데 사용함.

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-06-18",
    "capabilities": {
      "tools": {
        "listChanged": true
      },
      "resources": {}
    },
    "serverInfo": {
      "name": "example-server",
      "version": "1.0.0"
    }
  }
}
```

#### Client의 Initialized 알림
모든 `initialize`가 완료되면, Client는 `initialized`알림을 보냄
```json
{
  "jsonrpc": "2.0",
  "method": "notifications/initialized",
  "params": {}
}
```

이 알림과 함께, Client는 Server가 발급한 Session ID를 HTTP 헤더에 포함하여 전송

```bash
POST /mcp HTTP/1.1
Content-Type: application/json
Mcp-Session-Id: 1868a90c-7b3d-4e5f-9a1b-2c3d4e5f6a7b
```

초기화 이후의 모든 요청과 응답에는 세션 ID가 **Mcp-Session-Id** 헤더에 포함되어야 하며, Server는 이 세션 ID를 통해 해당 Client 상태를 식별하고, 적절한 응답을 제공한다. 만약 세션이 만료되거나 Server가 세션을 종료하면, 해당 세션 ID로의 요청은 `HTTP 404 Not Found`로 거부 된다.

Client가 **Initialized notification**을 서버에게 보낸다는 것은 중요한 의미가 있다. `JSON-RPC`에서 notification은 응답을 기대하지 않는 단방향 메시지로, Client가 Server에게 확인을 기다리지 않는다. 이는 이 순간부터 초기화 과정을 마무리 하고, 이후의 정상적인 요청-응답 패턴이 시작된다는 선언이다.

### 운영 (Operation)
초기화가 완료되면 MCP 세션은 본격적인 운영 단계에 진입하며, 이 단계에서 Client와 Server가 협상된 능력에 따라 자유롭게 상호작용한다. 

#### 협상된 능력의 존중
초기화 과정에서 합의한 버전의 모든 메시지 형식과 동작 방식을 정확히 준수

#### 양방향 상호작용의 시작
운영 단계에서 Client와 Server 모두 능동적으로 요청을 보낼 수 있다. 단순 요청-응답 패턴이 아니라, 두 개의 지능적인 에이전트가 서로의 능력을 활용하여 협력하는 관계로, Server가 Client의 파일 시스템에 접근하여 정보를 수집하고, 그 정보를 바탕으로 도구를 실행하는 것과 같은 복잡한  워크플로우가 가능해진다.

#### 세션 상태의 유지
운영 단계에서는 세션 ID를 통해 상태가 지속적으로 유지되며, Client가 특정 리소스를 구독하거나, 도구 실행의 중간 결과를 저장하거나, 파일 시스템의 특정 상태를 기억하는 것과 같은 상태 정보가 세션별로 독립적으로 관리된다. (맥락 유지)

#### 연결 상태의 지속적 확인
운영 단계에서 Client와 Server 모두 연결 상태를 지속적으로 확인하기 위해 **ping 메커니즘**을 제공하며, ping은 단순한 JSON-RPC 요청으로, 파라미터 없이 `method: "ping"`만 포함한다. (양방향성)

```json
{
  "jsonrpc": "2.0",
  "id": "123",
  "method": "ping"
}
```
수신자는 아래와 같이 즉시 빈 응답으로 응답해야 한다.
```json
{
  "jsonrpc": "2.0",
  "id": "123",
  "result": {}
}
```

### 종료 (Shutdown)
MCP에서는 특별한 종료 메시지를 선언하지 않고, 기본 전송 메커니즘을 통해 연결 종료를 신호한다. 특별한 종료 메시지를 정의하지 않는 이유는 단순함과 신뢰성을 우선시하기 때문이고, 대신 기본 전송 메커니즘의 종료 신호를 활용함으로써, 구현의 복잡성을 줄이면서도 안정적인 종료를 보장한다.

Server는 해당 세션에 할당된 메모리, 파일 핸들, 네트워크 연결, 도구 인스턴스 등을 해제해야 하고, 동시에 사용자의 작업 결과나 중요한 상태 정보는 적절히 보존되어야 한다.

## Reference
- [1] https://modelcontextprotocol.io/docs/learn/architecture
- [2] https://wikidocs.net/286336
- [3] fastcampus 강의 - MCP와 A2A로 끝내는 상상도 못할 Multi-Agent 구축 