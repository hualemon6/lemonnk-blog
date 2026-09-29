---
title: '《理解大模型 Agent》完整教程'
pubDate: 2026-09-29
tags: ['AI', 'Agent']
mode: ai
---

偶然翻到一份写得很扎实的中文教程，主题是「大模型 Agent 到底是什么、怎么跑起来、又该怎么研究」。它没有停在概念罗列上，而是从 ReAct 论文那张反直觉的表开始：HotpotQA 上 ReAct 的 EM 是 27.4，不仅低于 CoT 的 29.4，还低于什么都不查的 Standard（28.7）；换到 FEVER，胜负立刻反转（60.9 对 56.3）。同一套「想一步、查一步」的方法，为什么在两类任务上结论相反——这份教程用四部分十一章把这个问题展开。

结构上分四块：**建立共同语言**（Agent 的判据、一次任务的五格轨迹记法）、**核心架构**（ReAct、Planning 与 Reflection、Tools 与 ACI、Context Engineering 与 Memory、Workflow／单 Agent／多 Agent 选型）、**从能运行到可靠**（Harness Engineering：状态、预算、权限与验证）、**走向科研**（两份最小实现的代码伴读、Agent 评测与研究设计、能力究竟来自 prompt、harness 还是训练）。

几个值得收藏的地方：

- 全书统一用「输入 → 决策 → 动作 → 观察 → 状态」五格记法读轨迹，读日志、读论文都能直接套用；
- 反复强调边界：论文数字只在该实验条件下解释，不同评分口径的分数不能互减、不能外推；
- 每章末尾有易混淆点、自测题和原始资料链接（附访问日期与固定 commit），适合当阅读清单用。

## 链接

[理解大模型 Agent · 完整教程](https://gj2v5xlwsm7mk.ok.kimi.link/)
