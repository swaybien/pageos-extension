// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

// 本扩展需要非沙盒环境运行：读取 window.location
// This extension requires disabling sandboxing: access window.location
class PageOSEnvironmentExtension {
  constructor(runtime) {
    this.runtime = runtime;
    this.currentEnv = "未知环境";
  }

  getInfo() {
    return {
      id: "pageosEnvDetector",
      name: "PageOS 环境检测",
      blocks: [
        {
          opcode: "detectEnvironment",
          blockType: Scratch.BlockType.COMMAND,
          text: "检测当前 PageOS 环境",
        },
        {
          opcode: "onDetectionComplete",
          blockType: Scratch.BlockType.EVENT,
          text: "当检测当前 PageOS 环境执行完毕",
        },
        {
          opcode: "getCurrentEnv",
          blockType: Scratch.BlockType.REPORTER,
          text: "当前 PageOS 环境",
        },
        {
          opcode: "unknownEnv",
          blockType: Scratch.BlockType.REPORTER,
          text: "未知环境",
          disableMonitor: true,
        },
        {
          opcode: "webEnv",
          blockType: Scratch.BlockType.REPORTER,
          text: "网页环境",
          disableMonitor: true,
        },
        {
          opcode: "loginEnv",
          blockType: Scratch.BlockType.REPORTER,
          text: "登录环境",
          disableMonitor: true,
        },
        {
          opcode: "userEnv",
          blockType: Scratch.BlockType.REPORTER,
          text: "用户环境",
          disableMonitor: true,
        },
      ],
      // 声明为非沙盒扩展以访问window对象
      unsandboxed: true,
    };
  }

  detectEnvironment() {
    const host = window.location.host;

    if (host === "127.0.0.1:12800" || host === "localhost:12800") {
      this.currentEnv = "用户环境";
    } else if (host === "127.0.0.1:12801" || host === "localhost:12801") {
      this.currentEnv = "登录环境";
    } else {
      const port = window.location.port;
      if (!port || port === "80") {
        this.currentEnv = "网页环境";
      } else {
        this.currentEnv = "未知环境";
      }
    }

    // 触发完成事件
    this.runtime.startHats("pageosEnvDetector_onDetectionComplete");
  }

  onDetectionComplete() {
    return true;
  }

  getCurrentEnv() {
    return this.currentEnv;
  }

  unknownEnv() {
    return "未知环境";
  }

  webEnv() {
    return "网页环境";
  }

  loginEnv() {
    return "登录环境";
  }

  userEnv() {
    return "用户环境";
  }
}

Scratch.extensions.register(new PageOSEnvironmentExtension());
