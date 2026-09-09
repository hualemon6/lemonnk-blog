---
title: 'RNN 与 LSTM/GRU：三张图理清循环神经网络'
pubDate: 2026-09-09
tags: ['Deep Learning', 'Notes']
---

最近在补循环神经网络的基础。从最朴素的 Vanilla RNN，到它到底怎么训练，再到为什么要引入 LSTM / GRU 的门控，正好用三张图把这条主线串一遍。

## Vanilla RNN 的结构

RNN 的核心想法很简单：用一个隐藏状态 $h_t$ 在时间维度上传递信息。同一个 RNN 单元在每个时间步重复使用，参数 $(W_x, W_h, b, W_y, b_y)$ 全部共享，因此可以处理任意长度的序列。

![Vanilla RNN 的结构](/lemonnk-blog/images/posts/rnn-lstm-gru/01-vanilla-rnn.png)

关键就是两条公式：

$$h_t = \phi(W_x x_t + W_h h_{t-1} + b)$$

$$y_t = W_y h_t + b_y$$

隐藏状态不断更新，把"到当前为止的信息"一层层往后传；输出 $y_t$ 可以在每个时间步产生（如语言模型逐词预测），也可以只在最后一步产生（如句子分类）。

## RNN 怎么训练：BPTT

训练时把序列按时间展开成一张前向计算图，每个时间步都产生一个输出 $\hat{y}_t$，和目标 $y_t$ 比较得到损失 $L_t$，总损失是所有时间步损失的和（或取平均）。

![RNN 怎么训练：BPTT](/lemonnk-blog/images/posts/rnn-lstm-gru/02-rnn-training-bptt.png)

然后把误差**从后往前**沿时间一层层传回去，这就是 BPTT（Backpropagation Through Time），让每个时间步都知道自己的输出影响了多少最终结果。

问题也随之而来：时间步一长，梯度在反向传播时容易越来越小（梯度消失）或越来越大（梯度爆炸），很久之前的信息很难稳定地保留下来。

## 为什么要有 LSTM / GRU

普通 RNN 靠一个 $h_t$ 一股脑往后传，"记住什么、忘掉什么"全靠同一个状态硬扛。LSTM / GRU 的思路是加一组可控的"开关"——门，有选择地保留、更新和输出信息。

![LSTM / GRU：为什么要引入门控](/lemonnk-blog/images/posts/rnn-lstm-gru/03-lstm-gru.png)

- **LSTM** 有两个状态：cell state $c_t$（长期记忆）和 hidden state $h_t$（当前输出），配遗忘门、输入门、输出门三个门，分别决定旧信息保留多少、新信息写入多少、当前输出暴露多少。
- **GRU** 更简洁，只有 $h_t$，用重置门 $r$ 和更新门 $z$ 两个门控制信息流动：$h_t = (1-z)\times$ 旧信息 $+ z\times$ 新信息。

两者没有绝对的好坏，实际任务里都常用，按数据和算力来选。

## 小结

一条线串起来：普通 RNN 用隐藏状态在时间上传递信息 → 按时间展开后用 BPTT 训练，但长序列会梯度消失 / 爆炸 → LSTM / GRU 用门控有选择地记住和忘掉，因此更擅长处理长期依赖。
