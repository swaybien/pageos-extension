// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

/*
 * @fileoverview PageOS Custom HTML
 * @author PJ568
 * @license MPL-2.0
 */

// Description: Display custom HTML elements without sandbox restrictions.
// Context: Unsandboxed extension for direct DOM manipulation.
(function (Scratch) {
  "use strict";

  /** @type {HTMLDivElement|null} */
  let customElement = null;
  let overlay = null;

  // 状态变量
  let x = 0;
  let y = 0;
  let width = -1;
  let height = -1;
  let visible = true;
  let htmlContent = "";

  // 更新元素位置和尺寸
  const updateElementAttributes = () => {
    if (!customElement) return;

    const { stageWidth, stageHeight } = Scratch.vm.runtime;
    const effectiveWidth = width >= 0 ? width : stageWidth;
    const effectiveHeight = height >= 0 ? height : stageHeight;

    customElement.style.width = `${effectiveWidth}px`;
    customElement.style.height = `${effectiveHeight}px`;
    customElement.style.transform = `translate(${-effectiveWidth / 2 + x}px, ${
      -effectiveHeight / 2 - y
    }px)`;
    customElement.style.display = visible ? "" : "none";
  };

  // 创建自定义元素
  const createElement = (html) => {
    closeElement();
    htmlContent = html;

    customElement = document.createElement("div");
    customElement.style.position = "absolute";
    customElement.style.overflow = "hidden";
    customElement.style.pointerEvents = "auto";
    customElement.style.top = "0";
    customElement.style.left = "0";
    customElement.innerHTML = html;

    overlay = Scratch.renderer.addOverlay(customElement, "scale-centered");
    updateElementAttributes();
  };

  // 关闭元素
  const closeElement = () => {
    if (customElement) {
      Scratch.renderer.removeOverlay(customElement);
      customElement = null;
      overlay = null;
    }
  };

  // 监听舞台变化
  Scratch.vm.on("STAGE_SIZE_CHANGED", updateElementAttributes);
  Scratch.vm.runtime.on("RUNTIME_DISPOSED", closeElement);

  class CustomHTMLExtension {
    getInfo() {
      return {
        name: "PageOS Custom HTML",
        id: "pageosCustomHtml",
        blocks: [
          {
            opcode: "display",
            blockType: Scratch.BlockType.COMMAND,
            text: "show custom HTML [HTML]",
            arguments: {
              HTML: {
                type: Scratch.ArgumentType.STRING,
                defaultValue:
                  '<div style="background:red;width:100%;height:100%">Hello!</div>',
              },
            },
          },
          "---",
          {
            opcode: "update",
            blockType: Scratch.BlockType.COMMAND,
            text: "update HTML to [HTML]",
            arguments: {
              HTML: {
                type: Scratch.ArgumentType.STRING,
                defaultValue:
                  '<div style="background:blue;width:100%;height:100%">Updated!</div>',
              },
            },
          },
          "---",
          {
            opcode: "show",
            blockType: Scratch.BlockType.COMMAND,
            text: "show element",
          },
          {
            opcode: "hide",
            blockType: Scratch.BlockType.COMMAND,
            text: "hide element",
          },
          {
            opcode: "close",
            blockType: Scratch.BlockType.COMMAND,
            text: "close element",
          },
          "---",
          {
            opcode: "setX",
            blockType: Scratch.BlockType.COMMAND,
            text: "set element x position to [X]",
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
            text: "set element y position to [Y]",
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
            text: "set element width to [WIDTH]",
            arguments: {
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "100",
              },
            },
          },
          {
            opcode: "setHeight",
            blockType: Scratch.BlockType.COMMAND,
            text: "set element height to [HEIGHT]",
            arguments: {
              HEIGHT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: "100",
              },
            },
          },
          {
            opcode: "getProperty",
            blockType: Scratch.BlockType.REPORTER,
            text: "element [PROPERTY]",
            arguments: {
              PROPERTY: {
                type: Scratch.ArgumentType.STRING,
                menu: "propertyMenu",
              },
            },
          },
        ],
        menus: {
          propertyMenu: {
            acceptReporters: true,
            items: [
              { text: "x position", value: "x" },
              { text: "y position", value: "y" },
              { text: "width", value: "width" },
              { text: "height", value: "height" },
              { text: "visibility", value: "visible" },
              { text: "HTML content", value: "html" },
            ],
          },
        },
      };
    }

    display({ HTML }) {
      createElement(Scratch.Cast.toString(HTML));
    }

    update({ HTML }) {
      if (customElement) {
        htmlContent = Scratch.Cast.toString(HTML);
        customElement.innerHTML = htmlContent;
      }
    }

    show() {
      visible = true;
      updateElementAttributes();
    }

    hide() {
      visible = false;
      updateElementAttributes();
    }

    close() {
      closeElement();
    }

    setX({ X }) {
      x = Scratch.Cast.toNumber(X);
      updateElementAttributes();
    }

    setY({ Y }) {
      y = Scratch.Cast.toNumber(Y);
      updateElementAttributes();
    }

    setWidth({ WIDTH }) {
      width = Scratch.Cast.toNumber(WIDTH);
      updateElementAttributes();
    }

    setHeight({ HEIGHT }) {
      height = Scratch.Cast.toNumber(HEIGHT);
      updateElementAttributes();
    }

    getProperty(args) {
      const property = Scratch.Cast.toString(args.PROPERTY);
      switch (property) {
        case "x":
          return x;
        case "y":
          return y;
        case "width":
          return width;
        case "height":
          return height;
        case "visible":
          return visible;
        case "html":
          return htmlContent;
        default:
          return 0;
      }
    }
  }

  Scratch.extensions.register(new CustomHTMLExtension());
})(Scratch);
