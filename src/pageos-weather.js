(function (Scratch) {
  "use strict";

  // 天气数据缓存
  const weatherCache = {};
  const CACHE_EXPIRY = 3600000; // 1小时缓存有效期

  class WeatherExtension {
    constructor() {
      this.lastCity = ""; // 添加扩展级存储
    }

    getInfo() {
      return {
        id: "pageosWeatherExtension",
        name: "PageOS 天气信息",
        color1: "#009688",
        color2: "#00695c",
        color3: "#004d40",
        blocks: [
          {
            opcode: "fetchWeather",
            blockType: Scratch.BlockType.COMMAND,
            text: "获取 [CITY] 的天气数据",
            arguments: {
              CITY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "（城市名称，留空则获取当前位置）",
              },
            },
          },
          {
            opcode: "getTemperature",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的温度 (°C)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getFeelsLike",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的体感温度 (°C)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getRainChance",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的下雨概率 (%)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getHumidity",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的湿度 (%)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getWindSpeed",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的风速 (km/h)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getWindDirection",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的风向",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getPrecipitation",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的降水量 (mm)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getVisibility",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的能见度 (km)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getPressure",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的气压 (hPa)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getUVIndex",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的紫外线指数",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getCloudCover",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的云量 (%)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getSunshineChance",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的晴天概率 (%)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getSnowChance",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的下雪概率 (%)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getThunderChance",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的打雷概率 (%)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getWindyChance",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的刮风概率 (%)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getFogChance",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的雾天概率 (%)",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "getWeatherDescription",
            blockType: Scratch.BlockType.REPORTER,
            text: "[HOURS] 小时后的天气描述",
            arguments: {
              HOURS: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
        ],
        // 声明为非沙盒扩展
        unsandboxed: true,
      };
    }

    // 获取天气数据
    fetchWeather(args, util) {
      const target = util.target; // 同步保存目标引用
      const city = args.CITY;
      this.lastCity = city; // 存储到实例变量

      return new Promise((resolve) => {
        // 检查缓存
        if (
          weatherCache[city] &&
          Date.now() - weatherCache[city].timestamp < CACHE_EXPIRY
        ) {
          resolve();
          return;
        }

        // 从API获取天气数据
        fetch(`https://wttr.in/${city}?format=j1`)
          .then((response) => response.json())
          .then((data) => {
            weatherCache[city] = {
              data: data,
              timestamp: Date.now(),
            };
            target.setCustomState({ lastCity: city }); // 使用保存的引用
            resolve();
          })
          .catch((error) => {
            console.error("获取天气数据失败:", error);
            resolve();
          });
      });
    }

    // 获取指定时间点的天气数据
    getWeatherData(hours, city) {
      if (!weatherCache[city]) return null;

      const data = weatherCache[city].data;
      const now = new Date();
      const targetTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

      // 计算目标日期和小时
      const targetDayIndex = Math.floor(hours / 24);
      const targetHour = targetTime.getHours();

      // 确保索引在有效范围内
      if (targetDayIndex >= data.weather.length) {
        return data.weather[data.weather.length - 1].hourly[0];
      }

      const dayData = data.weather[targetDayIndex];
      const hourData = dayData.hourly.find((h) => {
        const hourNum = parseInt(h.time);
        const hour = Math.floor(hourNum / 100);
        return hour === targetHour;
      });

      return hourData || dayData.hourly[0];
    }

    // 获取温度
    getTemperature(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.tempC : 0;
    }

    // 获取体感温度
    getFeelsLike(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.FeelsLikeC : 0;
    }

    // 获取下雨概率
    getRainChance(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.chanceofrain : 0;
    }

    // 获取湿度
    getHumidity(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.humidity : 0;
    }

    // 获取风速
    getWindSpeed(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.windspeedKmph : 0;
    }

    // 获取风向
    getWindDirection(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.winddir16Point : "";
    }

    // 获取降水量
    getPrecipitation(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.precipMM : 0;
    }

    // 获取能见度
    getVisibility(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.visibility : 0;
    }

    // 获取气压
    getPressure(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.pressure : 0;
    }

    // 获取紫外线指数
    getUVIndex(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.uvIndex : 0;
    }

    // 获取云量
    getCloudCover(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.cloudcover : 0;
    }

    // 获取晴天概率
    getSunshineChance(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.chanceofsunshine : 0;
    }

    // 获取下雪概率
    getSnowChance(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.chanceofsnow : 0;
    }

    // 获取打雷概率
    getThunderChance(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.chanceofthunder : 0;
    }

    // 获取刮风概率
    getWindyChance(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.chanceofwindy : 0;
    }

    // 获取雾天概率
    getFogChance(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);
      return hourData ? hourData.chanceoffog : 0;
    }

    // 获取天气描述
    getWeatherDescription(args) {
      const hours = args.HOURS;
      const city = this.lastCity || "";
      const hourData = this.getWeatherData(hours, city);

      if (!hourData) return "";

      // 优先使用中文描述，如果没有则使用英文
      if (
        hourData.lang_zh &&
        hourData.lang_zh[0] &&
        hourData.lang_zh[0].value
      ) {
        return hourData.lang_zh[0].value;
      }

      if (
        hourData.weatherDesc &&
        hourData.weatherDesc[0] &&
        hourData.weatherDesc[0].value
      ) {
        return hourData.weatherDesc[0].value;
      }

      return "";
    }
  }

  // 注册扩展
  Scratch.extensions.register(new WeatherExtension());
})(Scratch);
