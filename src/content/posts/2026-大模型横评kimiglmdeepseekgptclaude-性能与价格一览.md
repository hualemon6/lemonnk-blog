---
title: '20260814 大模型横评'
pubDate: 2026-08-14
mode: ai
draft: true
---

> 数据截至 **2026 年 8 月 14 日**。
> 综合测评优先采用 Artificial Analysis 当前统一口径；价格采用各厂商官方 API 价格。DeepSeek **直接使用 8 月 16 日起生效的新价格**。

## 1. 综合能力排名

Artificial Analysis Intelligence Index v4.1.1，统一取高能力档位。

| 模型                         | AA Intelligence |            输出速度 | Context | 权重 |
| -------------------------- | --------------: | --------------: | ------: | -- |
| **Claude Opus 5**          |          **63** |      52.7 tok/s |      1M | 闭源 |
| **Claude Fable 5**         |          **62** |       ≈64 tok/s |      1M | 闭源 |
| **GPT-5.6 Sol**            |          **61** |      61.7 tok/s |      1M | 闭源 |
| **Kimi K3**                |          **60** |      39.1 tok/s |      1M | 开放 |
| **GPT-5.6 Terra**          |          **57** |     115.5 tok/s |      1M | 闭源 |
| **Claude Sonnet 5**        |          **55** |      65.8 tok/s |      1M | 闭源 |
| **GLM-5.2**                |          **53** |     107.4 tok/s |      1M | 开放 |
| **DeepSeek V4 Pro 0813**   |          **53** |      78.4 tok/s |      1M | 开放 |
| **GPT-5.6 Luna**           |          **52** | **155.3 tok/s** |      1M | 闭源 |
| **DeepSeek V4 Flash 0731** |          **52** |     119.9 tok/s |      1M | 开放 |

([Artificial Analysis][1])

---

## 2. Coding Agent 独立测评

Artificial Analysis Coding Agent Index **v1.3**。该榜单统一由 DeepSWE、Terminal-Bench v2、SWE-Atlas-QnA 三项组成。

| 模型 / Agent                             | Coding Index | DeepSWE | Terminal-Bench v2 | SWE-Atlas-QnA |
| -------------------------------------- | -----------: | ------: | ----------------: | ------------: |
| **Claude Opus 5 xhigh / Claude Code**  |       **67** |     60% |               85% |       **55%** |
| **GPT-5.6 Sol max / Codex**            |       **67** | **69%** |           **88%** |           43% |
| **Claude Fable 5 max / Claude Code**   |       **66** |     66% |               83% |           49% |
| **GPT-5.6 Terra max / Codex**          |       **62** |     67% |               84% |           36% |
| **Kimi K3 / Kimi Code**                |       **61** |     64% |               84% |           37% |
| **GPT-5.6 Luna max / Codex**           |       **59** |     63% |               80% |           33% |
| **DeepSeek V4 Flash max / Codex**      |       **55** |     43% |           **85%** |           39% |
| **GLM-5.2 / Claude Code**              |       **43** |     29% |               72% |           29% |
| **DeepSeek V4 Pro high / Claude Code** |       **31** |      9% |               66% |           20% |

([Artificial Analysis][2])

---

## 3. 三个最新国产模型：公开 Agent Benchmark

| Benchmark               |  Kimi K3 |  GLM-5.3 | DeepSeek V4 Pro 0813 |
| ----------------------- | -------: | -------: | -------------------: |
| **DeepSWE v1.1**        | **67.3** |     66.9 |                 62.7 |
| **Terminal-Bench 2.1**  | **88.3** |        — |                 87.9 |
| **Terminal-Bench 3.0**  |        — | **28.3** |                    — |
| **Agents' Last Exam**   |        — | **28.5** |                 25.7 |
| **CyberGym**            |        — | **84.5** |                 83.3 |
| **ExploitBench**        |        — | **54.4** |                    — |
| **Toolathlon-Verified** |        — |        — |             **74.1** |
| **BrowseComp**          | **90.4** |        — |                    — |
| **FrontierSWE**         | **81.2** |        — |                    — |
| **GDPval-AA v2 Elo**    |        — | **1769** |                    — |

([Kimi AI][3])

---

# 4. API 价格总表

单位全部为 **美元 / 100 万 Token**。

DeepSeek 使用 **2026 年 8 月 16 日 16:00 UTC 起的新价格**。

| 模型                               | Cached Input |     Input |     Output | AA Intelligence |
| -------------------------------- | -----------: | --------: | ---------: | --------------: |
| **Claude Fable 5**               |        $1.00 |    $10.00 | **$50.00** |              62 |
| **GPT-5.6 Sol**                  |        $0.50 |     $5.00 | **$30.00** |              61 |
| **Claude Opus 5**                |        $0.50 |     $5.00 | **$25.00** |          **63** |
| **Kimi K3**                      |        $0.30 |     $3.00 | **$15.00** |              60 |
| **GPT-5.6 Terra**                |        $0.20 |     $2.00 | **$12.00** |              57 |
| **Claude Sonnet 5**              |        $0.20 |     $2.00 | **$10.00** |              55 |
| **GLM-5.2**                      |        $0.26 |     $1.40 |  **$4.40** |              53 |
| **DeepSeek V4 Pro · Peak**       |       $0.044 |     $1.32 |  **$3.96** |              53 |
| **DeepSeek V4 Pro · Off-Peak**   |       $0.022 |     $0.66 |  **$1.98** |              53 |
| **DeepSeek V4 Flash · Peak**     |       $0.014 |     $0.44 |  **$1.32** |              52 |
| **GPT-5.6 Luna**                 |        $0.02 | **$0.20** |  **$1.20** |              52 |
| **DeepSeek V4 Flash · Off-Peak** |   **$0.007** | **$0.22** |  **$0.66** |              52 |

价格均来自厂商官方定价页面。Kimi K3 官方价为 (0.30 / )3 / (15；GLM-5.2 为 )0.26 / (1.40 / )4.40；Claude Fable / Opus / Sonnet 分别为 (10/)50、(5/)25、(2/)10；GPT-5.6 Sol / Terra / Luna 标准短上下文分别为 (5/)30、(2/)12、(0.20/)1.20。([Kimi AI][4])

DeepSeek 新定价中，V4 Pro 为 Peak (1.32/)3.96、Off-Peak (0.66/)1.98；V4 Flash 为 Peak (0.44/)1.32、Off-Peak (0.22/)0.66。([DeepSeek API Docs][5])

---

# 5. 把“性能”和“花多少钱”直接摆在一起

统一假设一次工作量：

**1M 非缓存输入 + 200K 输出**

不计算缓存。

| 成本排名 | 模型                               | AA Intelligence |     一次工作量成本 |
| ---: | -------------------------------- | --------------: | ----------: |
|    1 | **DeepSeek V4 Flash · Off-Peak** |              52 |  **$0.352** |
|    2 | **GPT-5.6 Luna**                 |              52 |  **$0.440** |
|    3 | **DeepSeek V4 Flash · Peak**     |              52 |  **$0.704** |
|    4 | **DeepSeek V4 Pro · Off-Peak**   |              53 |  **$1.056** |
|    5 | **DeepSeek V4 Pro · Peak**       |              53 |  **$2.112** |
|    6 | **GLM-5.2**                      |              53 |  **$2.280** |
|    7 | **Claude Sonnet 5**              |              55 |  **$4.000** |
|    8 | **GPT-5.6 Terra**                |              57 |  **$4.400** |
|    9 | **Kimi K3**                      |              60 |  **$6.000** |
|   10 | **Claude Opus 5**                |          **63** | **$10.000** |
|   11 | **GPT-5.6 Sol**                  |              61 | **$11.000** |
|   12 | **Claude Fable 5**               |              62 | **$20.000** |

价格基础数据：([DeepSeek API Docs][5])

---

# 6. 最简版数据结论

| 维度                           | 当前结果                                 |
| ---------------------------- | ------------------------------------ |
| **AA 综合最高**                  | Claude Opus 5 — **63**               |
| **国产 / 开放模型综合最高**            | Kimi K3 — **60**                     |
| **Coding Agent Index 最高**    | GPT-5.6 Sol / Claude Opus 5 — **67** |
| **国产 Coding Agent Index 最高** | Kimi K3 — **61**                     |
| **最快输出**                     | GPT-5.6 Luna — **155.3 tok/s**       |
| **52 分档最低 API 成本**           | DeepSeek V4 Flash Off-Peak           |
| **53 分档最低 API 成本**           | DeepSeek V4 Pro Off-Peak             |
| **60+ 分档最低固定工作量成本**          | Kimi K3 — **$6.00**                  |
| **当前综合最高开放模型**               | Kimi K3                              |
| **最新但尚无 AA 统一分数**            | GLM-5.3                              |

---

## 数据说明

* **GLM-5.3 于 8 月 14 日发布，AA 尚未完成统一评测，因此不拿 GLM-5.2 的 53 分冒充 GLM-5.3。** GLM-5.3 的官方 API 目前仍标为 coming soon，因此价格表继续使用可正式按 Token 调用的 GLM-5.2。([Overview - Z.AI DEVELOPER DOCUMENT][6])
* DeepSeek 全文已经直接采用**新价格**；Peak 为 UTC 01:00–04:00、06:00–10:00，其余时间为 Off-Peak。([DeepSeek API Docs][5])
* OpenAI 表格采用 Standard、Short Context 价格；长上下文请求有独立费率。([OpenAI Developers][7])
* Coding Agent 测试会受到 Agent Harness 影响，因此单独使用 AA Coding Agent Index，不和厂商自测结果混算。([Artificial Analysis][8])

[1]: https://artificialanalysis.ai/models/comparisons/gpt-5-6-sol-vs-claude-fable-5?utm_source=chatgpt.com "GPT-5.6 Sol (max) vs Claude Fable 5 (Adaptive Reasoning ..."
[2]: https://artificialanalysis.ai/agents/coding-agents/comparisons/codex-vs-kimi-code-cli?utm_source=chatgpt.com "Codex vs Kimi Code CLI: Coding Agent Comparison"
[3]: https://www.kimi.com/blog/kimi-k3?utm_source=chatgpt.com "Kimi K3 Tech Blog: Open Frontier Intelligence"
[4]: https://www.kimi.com/blog/kimi-k3 "Kimi K3 Tech Blog: Open Frontier Intelligence"
[5]: https://api-docs.deepseek.com/quick_start/pricing/ "Models & Pricing | DeepSeek API Docs"
[6]: https://docs.z.ai/guides/llm/glm-5.3 "GLM-5.3 - Overview - Z.AI DEVELOPER DOCUMENT"
[7]: https://developers.openai.com/api/docs/pricing "Pricing | OpenAI API"
[8]: https://artificialanalysis.ai/agents/coding-agents?utm_source=chatgpt.com "AI Coding Agent Benchmarks & Leaderboard"
