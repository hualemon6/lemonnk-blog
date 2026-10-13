---
title: 'Code as Policies：让 LLM 写代码控制机器人'
pubDate: 2026-10-13
tags: ['AI', 'Robotics']
mode: me
---

2022 年 9 月公开 · ICRA 2023

这次的 Paper 是 CaP，CaP 是 LLM 进入具身机器人控制领域的代表性早期工作，主要贡献在于提出了"代码作为策略"（Code as Policies）的方法，使用大型语言模型，生成可执行程序，作为根据自然语言指令控制机器人的策略。

## Motivation

在 CaP 之前，SayCan 等工作已经尝试利用 LLM 进行机器人任务规划，但主要依赖于**预定义的技能库**：LLM 根据自然语言指令选择并组合已有技能，而难以生成新的控制逻辑。

这种方式限制了机器人对复杂指令的泛化能力，尤其是在需要空间几何推理、精细控制参数调整以及环境反馈的任务中。

CaP 提出了一个新的思路：**既然 Coding LLM 已经具备代码生成与逻辑组合能力，能否直接利用这些能力生成机器人控制策略，而不只是选择已有技能？**

因此，CaP 将机器人策略表示为可执行的 Python 程序，通过代码中的计算、控制流和机器人 API 调用，将预训练 LLM 的通用编程能力迁移到具身控制领域。

## Method

这个 method 部分主要讲的是怎么利用 **Coding LLM** 生成一个 **CaP**

> **LMP** 由语言模型生成并在某个系统上执行的任何程序
>
> **CaP** 一类 LMP，将自然语言指令映射为代码片段。这些代码片段能够：
>
> 1. **响应感知输入**，即来自传感器或构建在传感器之上的模块的输入；
> 2. **为控制原语 API 设置参数**；
> 3. **直接在机器人上编译并执行**。

主要是四个关键点：

- **III-A 提示词构造**
- **III-B 低层 LMP 示例**
- **III-C 高层 LMP 示例**
- **III-D LMP 作为策略**

### III-A 提示词构造

prompt 主要就是两部分：

- Hints

  ```python
  import numpy as np
  from utils import get_obj_names, put_first_on_second
  ```

  告知模型可用的 API 及其使用方式

- Examples

  ```python
  # put the red block on the blue bowl.
  put_first_on_second("red block", "blue bowl")
  ```

  指令（以 Python 注释表示）+ 对应代码

Prompt 会被追加历史指令及其生成结果，维持多轮交互上下文。

### III-B 低层 LMP 示例

通过四类示例，展示 **Coding LLM 生成 LMP 的基础能力**。

实验使用 Codex `code-davinci-002`，`temperature=0`（贪心解码）。

- **Pure Python（基础 Python）**

  ```python
  ret_val = a + b
  ```

  根据自然语言指令生成基础 Python 代码，并统一使用 `ret_val` 保存结果。

- **Third-party Libraries（第三方库）**

  ```python
  ret_val = np.mean(pts_np, axis=0)
  ```

  利用 NumPy 等已有库完成空间坐标计算、几何推理等任务，无需从头实现算法。

- **First-party Libraries（第一方库）**

  ```python
  target_pos = get_pos('red block') + [0.1, 0]
  put_first_on_second('red block', target_pos)
  ```

  通过 Hints 和 Examples，让模型学会调用机器人系统提供的感知 API 和控制 API，即使这些 API 未出现在预训练数据中。

- **Language Reasoning（语言推理）**

  ```python
  # sea-colored block
  ret_val = 'blue block'
  ```

  根据物体描述、类别及历史上下文，推断对应的物体名称。

这里的 Low-Level 强调基础功能层次，并不等同于机器人底层运动控制。

### III-C 高层 LMP 示例

在低层 LMP 的基础上，进一步展示如何通过 **控制流、LMP 组合和层级函数生成**，构建更复杂的机器人策略。

- **Control Flow（控制流）**

  ```python
  while get_pos('red block')[0] < get_pos('blue bowl')[0]:
      target_pos = get_pos('red block') + [0.05, 0]
      put_first_on_second('red block', target_pos)
  ```

  利用 `if-else`、`while` 等控制结构，根据实时感知状态决定动作，实现 **Feedback Policy（反馈策略）**。

- **LMP Composition（LMP 组合）**

  ```python
  block_name = parse_obj('the left most block')
  ```

  通过函数调用组合多个 LMP，例如高层 LMP 调用 `parse_obj` LMP 解析物体名称，实现模块化的策略生成，同时缓解单个 Prompt 的上下文长度限制。

- **Hierarchical Function Generation（层级函数生成）**

  ```python
  def get_objs_bigger_than_area_th(obj_names, bbox_area_th):
      return [name for name in obj_names
              if get_obj_bbox_area(name) > bbox_area_th]
  ```

  允许 LMP 调用**尚未定义的函数**（如 `get_obj_bbox_area`），再通过 **AST（抽象语法树）** 检测缺失函数，调用专门的函数生成 LMP 自动补全实现，并以深度优先方式递归生成依赖函数。

  由此实现从高层逻辑到具体函数实现的逐层展开，生成的函数还可以积累和复用。

- **Combining Capabilities（能力组合）**

  将控制流、LMP 组合与层级函数生成结合，完成涉及物体筛选、空间关系判断和重复操作的复杂机器人任务。

**总结：** C 节主要展示 Coding LLM 如何利用程序控制结构、模块化函数调用和递归函数生成，将基础代码生成能力扩展为复杂的机器人策略。其中，**Hierarchical Function Generation 是重要的方法创新**。

### III-D LMP 作为机器人策略

这一部分说明如何将生成的 LMP 应用于实际机器人控制。

**1. 核心机制：Perception → LMP → Control**

- **Perception（感知）**：通过 ViLD、MDETR 等视觉模型获取物体位置、边界框等环境状态。
- **LMP（策略逻辑）**：处理感知结果，完成空间计算、条件判断，并确定控制参数。
- **Control（控制）**：通过机器人控制 API 执行具体动作。

感知与控制 API 通过 Hints 和 Examples 提供给 LLM，使生成的策略代码能够与真实机器人系统交互。

**2. 主要优势**

- **Task Generalization（任务泛化）**：根据未见过的自然语言指令，生成新的策略逻辑及控制参数。
- **Object & Environment Generalization（物体与环境泛化）**：借助开放词汇感知模型，适应新的物体和环境。
- **Training-Free（无需额外训练）**：利用预训练 LLM 和现有感知、控制模块，无需针对新指令额外采集数据或重新训练模型。

此外，代码形式使生成的策略具有较好的 **Interpretability（可解释性）**，便于修改与复用。

我觉得这里可以忘记刚刚的内容总结来说：

**CaP 的关键不在于赋予 LLM 新的底层运动控制能力，而在于利用代码这一具有组合性和可执行性的表达形式，将预训练 LLM 的已有能力迁移到机器人策略生成中。**

## Experiment

| 实验              | 实验内容                    | 核心验证目标                       |
| ----------------- | --------------------------- | ---------------------------------- |
| IV-A 代码生成基准 | RoboCodeGen、HumanEval      | 层级代码生成是否优于平铺代码生成？ |
| IV-B 绘制图形     | UR5e 机械臂绘制二维图形     | 能否根据自然语言生成空间路径？     |
| IV-C 桌面抓取放置 | UR5e 机械臂抓取、移动物体   | 能否理解物体属性与空间关系？       |
| IV-D 桌面操作仿真 | 与 CLIPort、NL Planner 对比 | CaP 的任务成功率与泛化能力如何？   |
| IV-E 移动机器人   | 真实厨房中的导航与操作      | 能否适配不同机器人与控制 API？     |

其中，IV-A 和 IV-D 是定量实验；IV-B、IV-C、IV-E 主要是定性展示，论文没有为后三组提供系统性的任务成功率统计。

**实验结论：**

1. **Hierarchical Code Generation** 显著提升代码生成能力，尤其有利于复杂逻辑的生成。
2. **Code-based Reasoning** 能通过程序计算完成精确的空间几何推理。
3. **Task Generalization** 是 CaP 的主要优势，在未见任务与属性上的表现尤其突出。
4. **Cross-Embodiment Applicability** 得到定性展示，CaP 可以结合不同机器人的感知和控制 API。
