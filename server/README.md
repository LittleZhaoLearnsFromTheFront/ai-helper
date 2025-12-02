# AI System Server

基于 **LangChain** 的统一 AI 对接服务，支持 DeepSeek、OpenAI、Anthropic 等多种 AI 提供商。

## 功能特性

- ✅ **基于 LangChain** - 使用 LangChain 统一接口，支持所有兼容的 AI 提供商
- ✅ **多提供商支持** - DeepSeek、OpenAI、Anthropic (Claude) 等
- ✅ **自动识别** - 自动识别提供商类型并创建对应的 LangChain 模型
- ✅ **OpenAI 兼容** - 支持所有 OpenAI 兼容的 API（Groq、Together AI 等）
- ✅ **统一接口** - 所有提供商使用相同的 API 接口
- ✅ **完整日志** - 详细的请求和响应日志
- ✅ **环境变量配置** - 安全的 API Key 管理

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件（或直接在系统环境变量中设置）：

```bash
# DeepSeek
DEEPSEEK_API_KEY=your_deepseek_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Anthropic (Claude)
ANTHROPIC_API_KEY=your_anthropic_api_key

# 其他 OpenAI 兼容的提供商
# GROQ_API_KEY=your_groq_api_key
# TOGETHER_API_KEY=your_together_api_key
```

### 3. 启动服务器

```bash
npm run dev
```

服务器将在 `http://localhost:4000` 启动。

## API 使用说明

### 1. 健康检查

```bash
GET /health
```

### 2. 获取可用的 AI 提供商

```bash
GET /api/ai/providers
```

响应示例：
```json
{
  "success": true,
  "data": {
    "providers": ["deepseek", "openai"],
    "count": 2
  }
}
```

### 3. 发送聊天请求

#### 方式一：通过请求体指定提供商

```bash
POST /api/ai/chat
Content-Type: application/json

{
  "provider": "deepseek",
  "messages": [
    {
      "role": "user",
      "content": "你好，请介绍一下你自己"
    }
  ],
  "model": "deepseek-chat",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

#### 方式二：通过 URL 路径指定提供商

```bash
POST /api/ai/chat/deepseek
Content-Type: application/json

{
  "messages": [
    {
      "role": "system",
      "content": "你是一个有用的助手"
    },
    {
      "role": "user",
      "content": "什么是 TypeScript？"
    }
  ],
  "model": "deepseek-chat"
}
```

### 请求参数

- `provider` (可选): AI 提供商名称，默认为 `deepseek`
- `messages` (必需): 消息数组，每个消息包含：
  - `role`: `"system"` | `"user"` | `"assistant"`
  - `content`: 消息内容
- `model` (可选): 模型名称
  - DeepSeek: `deepseek-chat` (默认)
  - OpenAI: `gpt-3.5-turbo` (默认)
  - Anthropic: `claude-3-sonnet-20240229` (默认)
  - 其他提供商: 根据提供商文档设置
- `temperature` (可选): 温度参数，默认 0.7
- `max_tokens` (可选): 最大 token 数

### 响应格式

成功响应：
```json
{
  "success": true,
  "data": {
    "content": "AI 回复内容",
    "model": "deepseek-chat",
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 20,
      "total_tokens": 30
    }
  }
}
```

错误响应：
```json
{
  "success": false,
  "error": "错误信息"
}
```

## 使用示例

### cURL 示例

```bash
# 使用 DeepSeek
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "deepseek",
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'

# 使用 OpenAI
curl -X POST http://localhost:4000/api/ai/chat/openai \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "stream":true
  }'
```

### JavaScript/TypeScript 示例

```typescript
const response = await fetch('http://localhost:4000/api/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    provider: 'deepseek',
    messages: [
      { role: 'user', content: '解释一下什么是 RESTful API' }
    ],
    temperature: 0.7
  })
});

const data = await response.json();
console.log(data.data.content);
```

## 配置说明

配置文件：`config.yaml`

```yaml
server:
  name: 端口号
  port: 4000
  loggerLevel: debug

logger:
  level: debug

ai:
  providers:
    deepseek:
      apiKey: ${DEEPSEEK_API_KEY}
      baseUrl: https://api.deepseek.com
    openai:
      apiKey: ${OPENAI_API_KEY}
      baseUrl: https://api.openai.com
```

API Key 可以通过环境变量设置，格式为 `${ENV_VAR_NAME}`。

## 支持的 AI 提供商

### 已内置支持

1. **DeepSeek** - 使用 OpenAI 兼容接口
2. **OpenAI** - GPT 系列模型
3. **Anthropic** - Claude 系列模型

### 添加新的 AI 提供商

由于使用了 LangChain，添加新的提供商非常简单：

#### 方式一：OpenAI 兼容的 API

如果提供商支持 OpenAI 兼容的 API（如 Groq、Together AI 等），只需在 `config.yaml` 中添加配置：

```yaml
ai:
  providers:
    groq:
      apiKey: ${GROQ_API_KEY}
      baseUrl: https://api.groq.com/openai/v1
      model: llama-3-8b-8192
```

系统会自动识别并使用 OpenAI 兼容接口。


1. 在 `config.yaml` 中添加配置：

```yaml
ai:
  providers:
    google:
      apiKey: ${GOOGLE_API_KEY}
      model: gemini-pro
```

## 开发

```bash
# 开发模式（自动重启）
npm run dev

# 构建
npm run build
```

