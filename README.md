# [pageos-extension](https://github.com/swaybien/pageos-extension)

本仓库用于存放 [PageOS](https://github.com/swaybien/pageos) 项目相关的 Scratch/Turbowarp 扩展：

- [pageos-custom-html-extension.js](src/pageos-custom-html-extension.js)：
  - 用于在舞台上显示自定义 HTML 元素内容
  - 支持创建、更新、显示/隐藏、关闭自定义 HTML 元素
  - 支持设置元素的位置和尺寸
  - 支持获取元素的属性
- [pageos-env-extension.js](src/pageos-env-extension.js)：
  - 用于判断当前 [PageOS](https://github.com/swaybien/pageos) 环境处于什么状态
  - 可以检测网页环境、登录环境、用户环境等
  - 提供环境检测事件和状态获取功能
- [pageos-login-manager.js](src/pageos-login-manager.js)：
  - 提供图形界面用于和 [pageos-greet](https://github.com/swaybien/pageos-greet) 登录管理器 API 交互
  - 支持创建登录控件，通过 WebSocket 连接进行认证
  - 支持自定义 CSS 样式
  - 提供显示/隐藏/关闭登录控件的功能
  - 支持设置控件位置和尺寸
  - 提供状态获取和日志管理功能
- ~~[pageos-greet-extension.js](src/pageos-greet-extension.js)：~~
  - ~~与 [pageos-login-manager.js](src/pageos-login-manager.js) 功能相似，但不提供图形界面，已被弃用。~~
- [pageos-weather.js](src/pageos-weather.js)：
  - 实现了温度、体感温度、下雨概率、湿度等多种天气数据的获取
  - 支持缓存机制，提高数据获取效率
  - 通过 wttr.in API 获取天气数据
  - 支持获取未来多小时的天气预报
<!-- - [pageos-program-manager.js](src/pageos-program-manager.js)：
  - 程序管理器，用于创建和管理程序窗口
  - 支持创建程序、添加脚本、运行脚本
  - 支持创建可拖动的窗口
  - 支持子程序管理
  - 提供窗口焦点管理功能 -->
