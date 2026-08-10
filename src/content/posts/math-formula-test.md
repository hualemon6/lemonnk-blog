---
title: '数学公式测试'
description: '一篇用于验证 KaTeX 渲染的测试文章，包含行内公式、块级公式、上下标、分数、求和与矩阵。'
pubDate: 2026-08-10
tags: ['Notes', 'Math']
---

这是一篇用来验证数学公式渲染的测试文章。

## 行内公式

行内公式写在 `$...$` 里，例如质能方程 $E = mc^2$，或者欧拉恒等式 $e^{i\pi} + 1 = 0$。

上下标也可以行内使用，比如 $x^{2} + y^{2} = z^{2}$、$a_{i,j}$，以及行内分数 $\frac{1}{2}$。

## 块级公式

块级公式单独一行用 `$$` 包裹，自动居中显示：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

求和公式：

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$

Attention 公式：

$$
\mathrm{Attention}(Q,K,V) = \mathrm{softmax}\left(\frac{QK^{\top}}{\sqrt{d_k}}\right) V
$$

## 矩阵

$$
\begin{bmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23}
\end{bmatrix}
$$

再看一个带求和与极限的例子：

$$
\lim_{n \to \infty} \frac{1}{n}\sum_{k=1}^{n} k = \frac{1}{2}
$$

正文中的公式居中且没有背景框，和正文融为一体。
