// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

/*
 * @fileoverview PageOS 环境检测扩展
 * @author PJ568
 * @license MPL-2.0
 */

// 本扩展需要非沙盒环境运行：读取 window.location
// This extension requires disabling sandboxing: access window.location
(function (Scratch) {
  ("use strict");
  const vm = Scratch.vm;
  const runtime = vm.runtime;
  const Cast = Scratch.Cast;

  class PageOSEnvironmentExtension {
    constructor() {
      this.currentEnv = "未知环境"; // '未知环境', '网页环境', '登录环境', '用户环境'
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
            blockType: Scratch.BlockType.EVENT,
            opcode: "onEnvDetected",
            text: "当检测到 PageOS 环境为[ENV]",
            isEdgeActivated: false,
            arguments: {
              ENV: {
                type: Scratch.ArgumentType.STRING,
                menu: "environmentMenu",
                defaultValue: "网页环境",
              },
            },
          },
          {
            opcode: "getCurrentEnv",
            blockType: Scratch.BlockType.REPORTER,
            text: "当前 PageOS 环境",
          },
          {
            opcode: "getState",
            blockType: Scratch.BlockType.REPORTER,
            text: "PageOS 环境值：[PROP]",
            arguments: {
              PROP: {
                type: Scratch.ArgumentType.STRING,
                menu: "environmentMenu",
                defaultValue: "网页环境",
              },
            },
          },
        ],
        menus: {
          environmentMenu: {
            acceptReporters: false,
            items: [
              {
                text: "未知环境",
                value: "未知环境",
              },
              {
                text: "网页环境",
                value: "网页环境",
              },
              {
                text: "登录环境",
                value: "登录环境",
              },
              {
                text: "用户环境",
                value: "用户环境",
              },
            ],
          },
        },
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
        if (!port || port === "80" || port === "443") {
          this.currentEnv = "网页环境";
        } else {
          this.currentEnv = "未知环境";
        }
      }

      // 触发环境检测事件
      // 使用完整 opcode: extensionid_opcode
      runtime.startHats("pageosEnvDetector_onEnvDetected", {
        ENV: this.currentEnv,
      });
    }

    getCurrentEnv() {
      return this.currentEnv;
    }

    getState(args) {
      const prop = Cast.toString(args.PROP);
      switch (prop) {
        case "未知环境":
          return "未知环境";
        case "网页环境":
          return "网页环境";
        case "登录环境":
          return "登录环境";
        case "用户环境":
          return "用户环境";
        default:
          return "未知环境";
      }
    }
  }

  Scratch.extensions.register(new PageOSEnvironmentExtension());
})(Scratch);
