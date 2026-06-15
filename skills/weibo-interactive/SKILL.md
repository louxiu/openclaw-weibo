---
name: weibo-interactive
description: |
  微博互动内容分析工具。获取收到的评论列表、获取自己某条微博的所有评论，
  并提供互动回复建议分析能力，根据关注关系和认证状态筛选最值得回复的评论。
  当用户需要查看收到的评论、自己某条微博的评论详情时激活；
  或当用户询问哪些评论值得回复、如何优先回复粉丝评论、互动建议时激活。
metadata:
  version: "1.0.0"
---

# 微博互动内容分析工具

帮助博主发现最值得回复的评论，促进与粉丝之间的真实互动。通过分析评论者的关注关系和认证状态，智能排序推荐优先回复的评论，让每一次互动都更有价值。

## 脚本调用方式

### 获取收到的评论列表

```bash
node scripts/weibo-interactive.js comments-to-me --token=<token> --uid=<uid>
```

### 获取自己某条微博的所有评论

```bash
node scripts/weibo-interactive.js comments-show --token=<token> --uid=<uid> --id=<weibo_id>
```

**参数说明**：

| 参数 | 必填 | 说明 |
|------|------|------|
| `--token` | 是 | 微博 API 访问令牌，通过 `weibo_token` 工具获取 |
| `--uid` | 是 | 用户 uid |
| `--id` | comments-show 必填 | 微博 ID（博文 ID） |

---

## 返回数据结构

### 1. 收到的评论列表

接口路径：`GET /open/interactive/comments/to_me`

返回的 `data` 字段包含以下内容：

#### `data.comments` — 评论列表（数组）

| 字段 | 类型 | 说明 |
|------|------|------|
| `createdAt` | string | 评论创建时间（如 "Mon Jun 15 16:14:47 +0800 2026"） |
| `id` | string | 评论 ID |
| `mid` | string | 评论 mid |
| `postJumpLink` | string | 原博跳转链接（如 "https://weibo.com/1985772915/5305687166161572"） |
| `text` | string | 评论内容 |
| `user` | object | 评论用户信息（见下表） |

#### `data.comments[].user` — 评论用户信息

| 字段 | 类型 | 说明 |
|------|------|------|
| `followMe` | boolean | 是否是我的粉丝（true=该用户关注了我） |
| `following` | boolean | 是否我关注了该用户（true=我关注了该用户） |
| `id` | string | 用户 ID |
| `name` | string | 用户昵称 |
| `verified` | boolean | 是否认证用户（true=认证用户，可能是大V） |

#### `data.count` — 评论总数

| 字段 | 类型 | 说明 |
|------|------|------|
| `count` | number | 评论总数 |

#### `data.msg` — 查询结果消息

| 字段 | 类型 | 说明 |
|------|------|------|
| `msg` | string | 查询结果消息（如 "查询成功"） |

---

### 2. 自己某条微博的所有评论

接口路径：`GET /open/interactive/comments/show`

返回结构与"收到的评论列表"一致，区别在于返回的是自己指定微博 ID 下的所有评论。

#### `data.comments` — 该微博的评论列表（数组）

结构与"收到的评论列表"中的 `data.comments` 相同。

---

## 使用示例

```bash
# 获取收到的评论列表
node scripts/weibo-interactive.js comments-to-me --token=<your_token> --uid=<your_uid>

# 获取自己某条微博的所有评论
node scripts/weibo-interactive.js comments-show --token=<your_token> --uid=<your_uid> --id=<weibo_id>

# 查看帮助
node scripts/weibo-interactive.js help
```

返回示例（comments-to-me）：

```json
{
  "code": 0,
  "data": {
    "code": 0,
    "comments": [
      {
        "createdAt": "Mon Jun 15 16:14:47 +0800 2026",
        "id": "5310105566577890",
        "mid": "5310105566577890",
        "postJumpLink": "https://weibo.com/<uid>/<mid>",
        "text": "评论内容...",
        "user": {
          "followMe": false,
          "following": false,
          "id": "用户ID",
          "name": "用户昵称",
          "verified": false
        }
      }
    ],
    "count": 1,
    "msg": "查询成功"
  },
  "message": "success"
}
```

返回示例（comments-show）：

```json
{
  "code": 0,
  "data": {
    "code": 0,
    "comments": [
      {
        "createdAt": "Mon Jun 15 16:14:47 +0800 2026",
        "id": "5310105566577890",
        "mid": "5310105566577890",
        "postJumpLink": "https://weibo.com/<uid>/<mid>",
        "text": "评论内容...",
        "user": {
          "followMe": true,
          "following": false,
          "id": "用户ID",
          "name": "用户昵称",
          "verified": false
        }
      },
      {
        "createdAt": "Mon Jun 15 15:58:46 +0800 2026",
        "id": "5310101537687411",
        "mid": "5310101537687411",
        "postJumpLink": "https://weibo.com/<uid>/<mid>",
        "text": "另一条评论内容...",
        "user": {
          "followMe": false,
          "following": true,
          "id": "用户ID",
          "name": "用户昵称",
          "verified": true
        }
      }
    ],
    "count": 2,
    "msg": "查询成功"
  },
  "message": "success"
}
```

---

## 注意事项

1. 需要有效的 `token`，可通过 `weibo_token` 工具获取
2. `uid` 参数为当前用户的 uid
3. `comments-show` 接口的 `id` 参数为微博 ID（博文 ID），不是评论 ID
4. `postJumpLink` 可直接用于定位到评论对应的原博，格式为 `https://weibo.com/<uid>/<mid>`
5. 评论中的 `followMe` 和 `following` 字段反映了评论发出时与博主的关系，可能随时间变化

---

## 数据分析能力

本技能在基础数据之上，提供互动回复建议分析能力。当用户询问哪些评论值得回复、如何优先回复、互动建议等问题时，综合运用以下能力输出分析报告。

> ⚠️ **分析报告必须遵守以下规则**：
> 1. **报告中提及的每一条评论，都必须附带该评论对应的原博链接**（`postJumpLink`），无论出现在哪个部分，确保用户可以直接点击跳转查看原博和评论上下文。不允许出现没有链接的评论提及。**原博链接必须使用 Markdown 链接格式** `[url](url)` 输出。
> 2. 每条评论必须给出 **AI 建议的回复示例**（用 `💬 AI回复示例：` 标识），根据评论内容、关系类型和认证状态量身定制，语气自然友好，供用户参考或直接复制使用。
> 3. 每条评论必须给出**简短的回复思路说明**（用 `📝 回复思路：` 标识），解释 AI 回复示例为什么这么写——即回复策略和措辞背后的考量，一句话即可。

---

### 一、互动回复建议分析

针对收到的评论，通过关注关系和认证状态维度分析，给出建议博主最值得回复的评论，促进博主和粉丝之间的互动。

#### 关系字段说明

| 字段 | 含义 | 互动价值 |
|------|------|----------|
| `followMe=true` | 发评论的用户是我的粉丝 | 回复粉丝能增强粘性 |
| `following=true` | 我关注了发评论的用户 | 回复关注的人能维护关系 |
| `followMe=true && following=true` | 发评论的用户和我是互粉关系 | 最值得互动的核心用户 |
| `verified=true` | 发评论的用户是认证用户，可能是大V | 回复大V能提升曝光 |

#### 优先级排序规则

值得回复的评论按以下优先级排序：

1. **互粉关系**（`followMe=true && following=true`）> **我的粉丝**（`followMe=true && following=false`）> **我关注的**（`followMe=false && following=true`）> **无关系**（`followMe=false && following=false`）
2. 在上一条规则基础上，如果发评论的用户是认证用户（`verified=true`），则更加值得优先回复

#### 分析步骤

**第一步：获取评论数据**

调用 `comments-to-me` 接口获取收到的评论列表。若用户指定了自己的某条微博，则调用 `comments-show` 接口获取该微博下的所有评论。

**第二步：分类统计**

对评论按关注关系分类统计：

| 分类 | 判断条件 | 说明 |
|------|----------|------|
| 互粉用户评论 | `followMe=true && following=true` | 与博主互粉，最值得回复 |
| 粉丝评论 | `followMe=true && following=false` | 博主的粉丝，次值得回复 |
| 我关注的用户评论 | `followMe=false && following=true` | 博主关注的人，第三优先 |
| 无关系用户评论 | `followMe=false && following=false` | 无关注关系，优先级最低 |

同时统计认证用户评论数（`verified=true`）。

**第三步：按优先级排序筛选**

对每条评论计算优先级分数：

| 关系类型 | 基础分 | 认证用户加成 |
|----------|--------|-------------|
| 互粉 | 30 | +5 |
| 我的粉丝 | 20 | +5 |
| 我关注的 | 10 | +5 |
| 无关系 | 0 | +5 |

按优先级分数降序排列，分数相同时按评论时间降序（最新优先）。

默认筛选出前 **5** 条值得回复的评论，最大建议不超过 **20** 条。

**第四步：输出分析报告**

报告包含：
- **分类统计摘要**：一行紧凑展示各类型评论数量
- **推荐回复的评论列表**：每条评论含排名、关系类型、用户昵称、评论内容、时间、建议回复原因、AI 回复示例、评论对应的原博链接（`postJumpLink`）
- **引导获取更多评论**：提示用户可通过指定微博ID获取该微博下的完整评论列表

#### 报告结构

> ⚠️ 报告中每条评论的原博链接**必须使用 Markdown 链接格式** `[url](url)` 输出，方便用户点击跳转。

```
📊 互动回复建议报告

评论统计：共 12 条（互粉 2 | 粉丝 4 | 我关注 1 | 认证用户 3 | 无关系 5）

建议回复的评论（按优先级排序）：

  1. 🌟 互粉 · 认证用户 | 科技博主老王
     「这个观点很有深度，补充一下…」 · 06-15 16:14
     💬 AI回复示例：感谢补充！你说的这个角度确实值得深入探讨，回头我整理一下展开聊聊～
     📝 回复思路：对方补充了观点，顺势表示认同并承诺后续展开，既回应了内容又留下互动钩子
     🔗 [https://weibo.com/uid/mid](https://weibo.com/uid/mid)

  2. 🌟 互粉 | 小明
     「支持！说得对」 · 06-15 15:30
     💬 AI回复示例：谢谢支持！有你认同我就放心了😄
     📝 回复思路：评论简短，回复也保持轻松，加入情感表达让互动更真实自然
     🔗 [https://weibo.com/uid/mid](https://weibo.com/uid/mid)

  3. 💬 粉丝 · 认证用户 | 行业观察者
     「期待更多这样的内容」 · 06-15 14:20
     💬 AI回复示例：感谢关注！会继续分享这类内容，有想了解的话题也可以告诉我～
     📝 回复思路：回应期待的同时邀请对方提需求，把单向互动变成双向对话
     🔗 [https://weibo.com/uid/mid](https://weibo.com/uid/mid)

  4. 💬 粉丝 | 小红
     「学到了，感谢分享」 · 06-15 13:10
     💬 AI回复示例：能帮到你就好！以后还会分享更多实用内容，记得关注哦～
     📝 回复思路：肯定对方的收获感，顺带引导关注，自然不突兀
     🔗 [https://weibo.com/uid/mid](https://weibo.com/uid/mid)

  5. 👁 我关注的 | 大V张三
     「有意思」 · 06-15 12:00
     💬 AI回复示例：哈哈谢谢！你那边也经常发有趣的内容，互相学习～
     📝 回复思路：评论很简短，回复轻松回应即可，顺带夸对方内容，维护平等的社交关系
     🔗 [https://weibo.com/uid/mid](https://weibo.com/uid/mid)

💡 想查看自己某条微博的更多评论？告诉我微博ID，我可以帮你获取该微博下的完整评论列表，发现更多值得互动的内容。
```
