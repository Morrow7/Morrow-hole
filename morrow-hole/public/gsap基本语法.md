### 1. 核心对象：`gsap` 对象（全局静态方法）
这是最基础的用法，直接调用 `gsap.xxx` 来控制动画。
*   **`gsap.to(target, vars)`**
    
    *   **含义**：从当前状态变化到指定状态（最常用）。
    *   **例子**：让方块向右移 100px。
        ```javascript
        gsap.to(".box", { x: 100, duration: 1 });
        ```
*   **`gsap.from(target, vars)`**
    *   **含义**：从指定状态“变回”当前状态（通常用于进场动画）。
    *   **例子**：方块从上方 100px 处掉下来。
        ```javascript
        gsap.from(".box", { y: -100, duration: 1 });
        ```
*   **`gsap.fromTo(target, fromVars, toVars)`**
    *   **含义**：精确控制“起始状态”和“结束状态”。
    *   **例子**：从透明变到不透明，同时位移。
        ```javascript
        gsap.fromTo(".box", 
            { opacity: 0, x: 0 },    // 起始状态
            { opacity: 1, x: 100 }   // 结束状态
        );
        ```
*   **`gsap.set(target, vars)`**
    *   **含义**：立即设置属性（无动画，持续时间为 0）。
    *   **场景**：初始化元素位置，避免页面刚加载时闪烁。
        ```javascript
        gsap.set(".box", { x: 100 }); // 瞬间移动，没有过程
        ```
---
### 2. 进阶编排：`Timeline`（时间轴）
在做复杂交互（比如 vue-grab 的抓取流程）时，单靠上面的方法很难管理时间顺序。Timeline 可以把多个动画串起来。
*   **`gsap.timeline(config)`**
    *   创建一个时间轴实例。
    ```javascript
    const tl = gsap.timeline();
    ```
*   **链式调用**
    *   Timeline 会默认按顺序播放动画。
    ```javascript
    tl.to(".red", { x: 100 })   // 第一步
      .to(".green", { x: 100 }) // 第二步（等第一步做完）
      .to(".blue", { x: 100 }); // 第三步（等第二步做完）
    ```
---
### 3. 常用配置属性
不管是 `to`、`from` 还是 `timeline`，第二个参数里的属性（vars）是通用的。
*   **核心属性**
    *   `duration`: 动画持续时间（秒），默认 0.5。
    *   `delay`: 延迟几秒开始。
    *   `repeat`: 重复次数。`-1` 表示无限循环。
    *   `yoyo`: 布尔值。如果为 `true`，重复时像溜溜球一样往回播（需配合 repeat）。
    *   `ease`: 缓动函数。决定动画快慢节奏（如 `"power2.out"`, `"elastic.out(1, 0.3)"`）。
*   **变换属性**
    *   `x`, `y`: 水平/垂直位移（px）。
    *   `rotation`: 旋转（度）。
    *   `scale`: 缩放。
    *   `opacity`: 透明度。
    *   `backgroundColor`: 背景色（注意用驼峰命名）。
---
### 4. 特殊控制参数（在时间轴里非常重要）
当你把动画加入 `timeline` 时，除了动画本身的属性，还可以加一个**位置参数**。
```javascript
tl.to(".box", { x: 100 }, 2) // <--- 这个 "2" 就是位置参数
```
*   **数字**：绝对时间（秒）。例如 `2` 表示在第 2 秒开始播。
*   **字符串**：
    *   `"+=1"`：在上一个动画结束**之后**，延迟 1 秒开始。
    *   `"-=1"`：在上一个动画结束**之前** 1 秒开始（重叠播放）。
    *   `"<"`：与上一个动画同时开始。
    *   `">"`：在上一个动画结束时开始。
---
### 5. 控制方法
动画或时间轴创建后，你可以像控制播放器一样控制它。
```javascript
const tween = gsap.to(".box", { x: 100 });
const tl = gsap.timeline();
// 播放
tween.play();
tl.play();
// 暂停
tween.pause();
// 反转（倒着播）
tween.reverse();
// 重启（从头开始）
tween.restart();
// 进度跳转
tween.progress(0.5); // 跳到 50% 的位置
```


****

### 6.to和form的区别

to:现在的样子——>变成我指定的样子

form：从指定的状态——>变回现在的样子





![image-20251225200336210](C:\Users\45379\AppData\Roaming\Typora\typora-user-images\image-20251225200336210.png)



***



### 总结

**谁+干什么+怎么干**

1.  **谁**：`target` (`.box`, `div`)
2.  **干什么**：`vars` ({ x: 100, opacity: 0 })
3.  **怎么干**：`config` (Timeline 的位置参数，或者 ease, duration 等)
先把这些基础语法练熟，再结合你的 Vue 项目实战，很快就能上手！