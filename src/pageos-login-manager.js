// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

/*
 * @fileoverview PageOS Login Manager
 * @author PJ568
 * @license MPL-2.0
 */

// 使用无沙箱模式实现登录管理器扩展
(function (Scratch) {
  "use strict";

  const DEFAULT_CSS = `#auth {
    height: 100%;
    width: 100%;
  }
  h1 {
    font-size: xx-large;
  }
  summary {
    text-decoration: underline;
  }
  button,
  summary {
    cursor: pointer;
  }
  .auth-container {
    box-sizing: border-box;
    height: 100%;
    width: 100%;
    color: black;
    background-color: white;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 0.1rem solid black;
    padding: 1rem;
  }
  .auth-container .auth-interface {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .loading .auth-interface {
    display: none;
  }
  .auth-container input {
    box-sizing: border-box;
    width: 100%;
  }
  .auth-container .load {
    display: none;
    color: white;
    text-align: center;
    padding: 0.2rem;
    background-color: grey;
  }
  .loading .load {
    display: block;
  }
  .auth-container .log {
    border: 0.1rem solid black;
    padding: 0.5rem;
    font-size: smaller;
    max-height: 10rem;
    overflow-y: auto;
  }
  .auth-container .warn {
    color: orange;
  }
  .auth-container .error {
    color: red;
  }`;

  const DEFAULT_HTML = `<form id="auth" class="loading">
    <div class="auth-container">
      <h1>PageOS 登录</h1>
      <span class="load">正加载</span>
      <div class="auth-interface">
        <label class="prompt">
          <div>用户名：</div>
        </label>
        <input
          id="input"
          type="text"
          placeholder="请输入用户名"
          autocomplete="username"
        />
        <button type="submit" class="submit-btn">提交</button>
      </div>
      <details>
        <summary>高级</summary>
        <p>环境变量：</p>
        <input
          id="session-env"
          type="text"
          placeholder="LANG=zh_CN.UTF-8"
          autocomplete="session-env"
        />
        <p>启动命令：</p>
        <input
          id="session-cmd"
          type="text"
          value="%SESSION_COMMAND%"
          placeholder="pageos-core --command 'cage -s -- firefox --kiosk --no-remote http://127.0.0.1:12800'"
          autocomplete="session-cmd"
        />
        <p>日志：</p>
        <div class="log"></div>
      </details>
    </div>
  </form>`;

  class PageOSLoginExtension {
    constructor() {
      this.customElement = null;
      this.overlay = null;
      this.ws = null;

      // 状态变量
      this.x = 0;
      this.y = 0;
      this.width = -1;
      this.height = -1;
      this.visible = true;
      this.isLoading = false;
      this.currentState = "username";
      this.logs = [];
      this.customCSS = DEFAULT_CSS;
    }

    getInfo() {
      return {
        id: "pageosLoginManager",
        name: "PageOS 登录管理器",
        blocks: [
          {
            opcode: "create",
            blockType: Scratch.BlockType.COMMAND,
            text: "创建登录控件 websocket地址: [WS_URL] 自定义CSS: [CSS]",
            arguments: {
              WS_URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "ws://localhost:8080/ws",
              },
              CSS: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: DEFAULT_CSS,
              },
            },
          },
          {
            opcode: "show",
            blockType: Scratch.BlockType.COMMAND,
            text: "显示登录控件",
          },
          {
            opcode: "hide",
            blockType: Scratch.BlockType.COMMAND,
            text: "隐藏登录控件",
          },
          {
            opcode: "close",
            blockType: Scratch.BlockType.COMMAND,
            text: "关闭登录控件",
          },
          {
            opcode: "setX",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置登录控件的X坐标到 [X]",
            arguments: {
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "0",
              },
            },
          },
          {
            opcode: "setY",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置登录控件的Y坐标到 [Y]",
            arguments: {
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "0",
              },
            },
          },
          {
            opcode: "setWidth",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置登录控件的宽度为 [WIDTH]",
            arguments: {
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "300",
              },
            },
          },
          {
            opcode: "setHeight",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置登录控件的高度为 [HEIGHT]",
            arguments: {
              HEIGHT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "400",
              },
            },
          },
          {
            opcode: "getStatus",
            blockType: Scratch.BlockType.REPORTER,
            text: "登录控件的 [PROP]",
            arguments: {
              PROP: {
                type: Scratch.ArgumentType.STRING,
                menu: "statusMenu",
                defaultValue: "x",
              },
            },
          },
          {
            opcode: "onError",
            blockType: Scratch.BlockType.EVENT,
            text: "当发生连接错误",
            isEdgeActivated: false,
          },
          {
            opcode: "onClose",
            blockType: Scratch.BlockType.EVENT,
            text: "当连接关闭",
            isEdgeActivated: false,
          },
          {
            opcode: "isLoading",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "（正）加载中？",
          },
          {
            opcode: "clearLogs",
            blockType: Scratch.BlockType.COMMAND,
            text: "清空日志",
          },
        ],
        menus: {
          statusMenu: {
            acceptReporters: true,
            items: ["x", "y", "width", "height", "state", "logs", "all"],
          },
        },
      };
    }

    createElement(wsUrl, css) {
      this.closeElement();
      this.customCSS = css || DEFAULT_CSS;

      // 创建容器元素
      this.customElement = document.createElement("div");
      this.customElement.style.position = "absolute";
      this.customElement.style.overflow = "hidden";
      this.customElement.style.pointerEvents = "auto";
      this.customElement.style.top = "0";
      this.customElement.style.left = "0";

      // 添加样式
      const style = document.createElement("style");
      style.textContent = this.customCSS;
      this.customElement.appendChild(style);

      // 添加HTML内容
      this.customElement.innerHTML += DEFAULT_HTML;

      // 添加到舞台
      this.overlay = Scratch.renderer.addOverlay(
        this.customElement,
        "scale-centered"
      );
      this.updateElementAttributes();

      // 初始化WebSocket
      this.initWebSocket(Scratch.Cast.toString(wsUrl));
    }

    updateElementAttributes() {
      if (!this.customElement) return;

      const { stageWidth, stageHeight } = Scratch.vm.runtime;
      const effectiveWidth = this.width >= 0 ? this.width : stageWidth;
      const effectiveHeight = this.height >= 0 ? this.height : stageHeight;

      this.customElement.style.width = `${effectiveWidth}px`;
      this.customElement.style.height = `${effectiveHeight}px`;
      this.customElement.style.transform = `translate(${
        -effectiveWidth / 2 + this.x
      }px, ${-effectiveHeight / 2 - this.y}px)`;
      this.customElement.style.display = this.visible ? "" : "none";
    }

    closeElement() {
      if (this.customElement) {
        Scratch.renderer.removeOverlay(this.customElement);
        this.customElement = null;
        this.overlay = null;
      }
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    }

    initWebSocket(wsUrl) {
      if (!this.customElement) return;

      try {
        const auth = this.customElement.querySelector("#auth");
        const loadElm = auth.querySelector(".auth-container span.load");
        const ai = auth.querySelector(".auth-container .auth-interface");
        const promptElm = auth.querySelector(".auth-container label.prompt");
        const inputElm = auth.querySelector(".auth-container input#input");
        const submitBtn = auth.querySelector(".auth-container .submit-btn");
        const statusLog = auth.querySelector(".auth-container .log");

        // 重置状态
        this.currentState = "username";
        this.logs = [];
        this.isLoading = false;

        // 显示加载状态
        const showLoading = (message = "正加载") => {
          loadElm.textContent = message;
          auth.classList.add("loading");
          this.isLoading = true;
        };

        // 隐藏加载状态
        const hideLoading = () => {
          auth.classList.remove("loading");
          inputElm.focus();
          this.isLoading = false;
        };

        // 日志记录
        const logMessage = (msg, type = "info") => {
          const time = new Date().toLocaleTimeString();
          const logEntry = `${time}：${msg}`;
          this.logs.push({ message: logEntry, type });

          const div = document.createElement("div");
          div.textContent = logEntry;
          if (type === "error") div.className = "error";
          else if (type === "warn") div.className = "warn";
          statusLog.appendChild(div);
          statusLog.scrollTop = statusLog.scrollHeight;
        };

        // 新增提示
        const addPrompt = (text, type = "info") => {
          const message = document.createElement("div");
          message.textContent = text;
          message.className = type;
          promptElm.appendChild(message);
          promptElm.scrollTop = promptElm.scrollHeight;
        };

        // 清空提示
        const clearPrompt = () => {
          promptElm.innerHTML = "";
        };

        // 更新界面文本
        const updateInterface = (
          prompt = "用户名：",
          type = "info",
          input_type = "text",
          placeholder = "请输入用户名"
        ) => {
          addPrompt(prompt, type);
          inputElm.type = input_type;
          inputElm.placeholder = placeholder;
          inputElm.value = "";
          hideLoading();
        };

        // 重置表单
        const resetForm = () => {
          clearPrompt();
          updateInterface();
          hideLoading();
          this.currentState = "username";
        };

        // 创建WebSocket连接
        this.ws = new WebSocket(wsUrl);

        // 连接打开
        this.ws.onopen = () => {
          logMessage("已连接到服务器");
          hideLoading();
        };

        // 连接关闭
        this.ws.onclose = () => {
          logMessage("连接已关闭", "warn");
          resetForm();
          Scratch.vm.runtime.startHats("pageosLoginManager_onClose");
        };

        // 连接错误
        this.ws.onerror = (err) => {
          logMessage(`连接错误：${err}`, "error");
          Scratch.vm.runtime.startHats("pageosLoginManager_onError");
        };

        // 接收消息
        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            logMessage(`收到：${JSON.stringify(msg)}`);

            switch (msg.type) {
              case "AUTH_PROMPT":
                this.currentState = "auth";
                if (msg.message_type === "SECRET") {
                  updateInterface(
                    msg.message,
                    "info",
                    "password",
                    "请输入密钥"
                  );
                } else if (msg.message_type === "VISIBLE") {
                  updateInterface(msg.message, "info", "text", "请输入文本");
                } else if (msg.message_type === "INFO") {
                  addPrompt(msg.message);
                } else if (msg.message_type === "ERROR") {
                  logMessage(`✖ greetd 错误：${msg.message}`, "error");
                  addPrompt(msg.message, "error");
                }
                break;
              case "AUTH_SUCCESS":
                logMessage("✔ 登录成功! 正在启动会话……");
                showLoading("登录成功，正启动会话");
                const envStr = document.getElementById("session-env").value;
                const cmdStr = document.getElementById("session-cmd").value;
                const cmd =
                  cmdStr
                    .match(/[^\s"']+|"([^"]*)"|'([^']*)'/g)
                    ?.map((arg) => arg.replace(/^["']|["']$/g, "")) || [];
                const env =
                  envStr
                    .match(/[^\s"']+|"([^"]*)"|'([^']*)'/g)
                    ?.map((arg) => arg.replace(/^["']|["']$/g, "")) || [];
                this.ws.send(
                  JSON.stringify({ type: "START_SESSION", cmd, env })
                );
                break;
              case "AUTH_ERROR":
                logMessage(`✖ 错误：${msg.reason}`, "error");
                resetForm();
                break;
            }
            hideLoading();
          } catch (e) {
            logMessage(`消息解析错误：${e}`, "error");
            addPrompt(`消息解析错误：${e}`, "error");
          }
        };

        // 表单提交处理
        auth.addEventListener("submit", (e) => {
          e.preventDefault();
          if (this.currentState === "username") {
            const username = inputElm.value.trim();
            if (!username) {
              logMessage("请输入用户名", "warn");
              addPrompt("请输入用户名", "warn");
              return;
            }
            showLoading();
            this.ws.send(JSON.stringify({ type: "AUTH_REQUEST", username }));
          } else {
            const response = inputElm.value;
            if (!response) {
              logMessage("请输入信息", "warn");
              addPrompt("请输入信息", "warn");
              return;
            }
            showLoading();
            this.ws.send(JSON.stringify({ type: "AUTH_RESPONSE", response }));
          }
        });

        hideLoading();
      } catch (e) {
        console.error("初始化登录控件失败:", e);
      }
    }

    // 块操作实现
    create(args) {
      const wsUrl = Scratch.Cast.toString(args.WS_URL);
      const css = Scratch.Cast.toString(args.CSS);
      this.createElement(wsUrl, css);
    }

    show() {
      this.visible = true;
      this.updateElementAttributes();
    }

    hide() {
      this.visible = false;
      this.updateElementAttributes();
    }

    close() {
      this.closeElement();
    }

    setX(args) {
      this.x = Scratch.Cast.toNumber(args.X);
      this.updateElementAttributes();
    }

    setY(args) {
      this.y = Scratch.Cast.toNumber(args.Y);
      this.updateElementAttributes();
    }

    setWidth(args) {
      this.width = Scratch.Cast.toNumber(args.WIDTH);
      this.updateElementAttributes();
    }

    setHeight(args) {
      this.height = Scratch.Cast.toNumber(args.HEIGHT);
      this.updateElementAttributes();
    }

    getStatus(args) {
      const prop = Scratch.Cast.toString(args.PROP);
      switch (prop) {
        case "x":
          return this.x;
        case "y":
          return this.y;
        case "width":
          return this.width;
        case "height":
          return this.height;
        case "state":
          return this.currentState;
        case "logs":
          return this.logs.map((log) => log.message).join("\n");
        case "all":
          return JSON.stringify({
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            state: this.currentState,
            logs: this.logs,
          });
        default:
          return "";
      }
    }

    isLoading() {
      return this.isLoading;
    }

    clearLogs() {
      this.logs = [];
      if (this.customElement) {
        const statusLog = this.customElement.querySelector(
          ".auth-container .log"
        );
        if (statusLog) statusLog.innerHTML = "";
      }
    }
  }

  // 注册扩展
  Scratch.extensions.register(new PageOSLoginExtension());
})(Scratch);
