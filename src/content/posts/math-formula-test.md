---
title: '接雨水'
pubDate: 2026-08-10
tags: ['LeetCode']
mode: dual
---

## Related Links

* LeetCode 42：[接雨水](https://leetcode.cn/problems/trapping-rain-water/)
* 借鉴题解：https://leetcode.cn/problems/trapping-rain-water/solutions/185678/trapping-rain-water-by-ikaruga
* LeetCode 84：[柱状图中最大的矩形](https://leetcode.cn/problems/largest-rectangle-in-histogram/)
* 借鉴题解：https://leetcode.cn/problems/largest-rectangle-in-histogram/solutions/108083/84-by-ikaruga

## Solution

单调栈

## Chapter Start

**单调栈**即栈内元素保持单调的栈结构，以单调递增栈为例，在操作时，新元素比栈顶元素大，直接**入栈**成为新“站长”，反之，则循环将栈内元素弹出，直至栈顶元素小于新元素，再入栈。

```cpp
//以下是单调递增栈的代码实现，后续分析也将依靠这个代码
stack<int> st;
vector<int> nums = {3,1,4,2};
for(int i=0;i<(int)nums.size();i++){
    while(!st.empty() && nums[st.top()]>nums[i]){
        st.pop();
    }
    st.push(i);
}
```

单调递增栈的维护有很多不错的性质[1]：

* 栈顶元素出栈时，**新元素**是其**右边**第一个比他小的数
* 栈顶元素出栈时，**新栈顶元素**可以帮助我们确定其**左侧边界**

我们可以很惊奇的发现，对于每一个栈顶元素出栈，我们都可以同时确定它左右两侧的边界。

```cpp
// 以下是单调递增栈的改良，我们想求每个元素左右的边界
// 很遗憾这是一个错误的代码，要写对这一串代码，还要考虑边界如何控制
stack<int> st;
vector<int> nums = {3,1,4,2};
vector<int> left(nums.size()), right(nums.size());

int j = 0;
for(int i=0;i<(int)nums.size();i++){
    while(!st.empty() && nums[st.top()]>nums[i]){
        j = st.top();
        st.pop();
        right[j] = i;
        left[j] = st.top();
    }
    st.push(i);
}
```

我们可以通过加哨兵节点来规避两个问题：

* **开头**：在第一次循环将哨兵压入栈底，此后弹出普通元素后 `st.top()` 不会越界，省掉弹栈后的 `st.empty()` 判空。
* **结尾**：它比所有柱子都小，会把栈里剩余的原始元素**全部弹出来**，省掉 for 结束后的收尾循环。

```cpp
vector<int> nums = {3,1,4,2};
nums.insert(nums.begin(), INT_MIN);  // 开头哨兵：比所有元素都小
nums.push_back(INT_MIN);             // 结尾哨兵：触发所有元素出栈
int n = (int)nums.size();
vector<int> left(n), right(n);
stack<int> st;
int j = 0;

for(int i = 0; i < n; i++){
    while(!st.empty() && nums[st.top()] > nums[i]){
        j = st.top();
        st.pop();
        right[j] = i;
        left[j] = st.top();          // 不用判空
    }
    st.push(i);
}
```

这样 [LeetCode 84](https://leetcode.cn/problems/largest-rectangle-in-histogram/) 应该很轻易地解出来。

然后我们再来看 [LeetCode 42](https://leetcode.cn/problems/trapping-rain-water/) 万恶之源的接雨水就很 easy 了，单调递减栈 + 判空，甚至不需要哨兵节点。

> 84：pop 一个柱子，是为了找“这个高度最多能向左右延伸多远”。
> 42：pop 一个柱子，是因为找到了“这个坑的左右挡板”。

## Comment

[1] 单调栈中 `>` 与 `>=` 往往都能写出正确算法，但它们处理重复元素的方式不同。因此，与其机械记忆“左右第一个更小”，不如始终分析元素出栈时栈中究竟保持着什么关系。
