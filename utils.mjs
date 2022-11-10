import fs from "fs";
import yaml from "js-yaml";
import _ from "lodash";
const { last, uniqBy } = _;

export const Base64 = {
  decode(content) {
    return Buffer.from(content, "base64").toString("utf-8");
  },

  encode(content) {
    return Buffer.from(content, "utf-8").toString("base64");
  },
};

function strToParam(str) {
  const obj = {};
  str.split("&").forEach((item) => {
    const [key, value] = item.split("=");
    obj[key] = value;
  });

  return obj;
}

export function parseV2ray(content) {
  const nodeList = Base64.decode(content).split(/\r?\n/);
  const jsonList = [];
  for (let i = 0; i < nodeList.length; i++) {
    const raw_node_str = nodeList[i];
    const [protocol, node_info_str] = raw_node_str.split("://");

    try {
      switch (protocol) {
        case "vmess":
          const node = JSON.parse(Base64.decode(node_info_str));
          jsonList.push({
            type: "vmess",
            name: node.ps.replace(/\s/g, "") + i,
            ...(node.path
              ? {
                  "ws-opts": {
                    path: node.path,
                    ...(node.host
                      ? {
                          headers: {
                            host: node.host,
                          },
                        }
                      : {}),
                  },
                }
              : {}),
            server: node.add,
            port: +node.port,
            uuid: node.id,
            alterId: 0,
            cipher: "auto",
            network: node.net === "tcp" ? "auto" : node.net,
            ...(node.tls ? { tls: true } : {}),
          });
          break;
        case "ss":
          // 'YWVzLTEyOC1jZmI6UWF6RWRjVGdiMTU5QCQq@14.29.124.174:11034#🇭🇰 _CN_中国->🇭🇰_HK_香港'
          var [password, next] = node_info_str.split("@");
          var [server, next] = next.split(":");
          var [port, name] = next.split("#");
          name = decodeURI(name).replace(/\s/g, "");
          port = +port;

          jsonList.push({
            type: protocol,
            name,
            server,
            port,
            password,
            cipher: "aes-128-gcm",
          });
          break;
        case "trojan":
          // trojan://DigitalOcean@digitalocean.kinhproxy.com:443#github.com/freefq%20-%20%E6%96%B0%E5%8A%A0%E5%9D%A1DigitalOcean%E6%95%B0%E6%8D%AE%E4%B8%AD%E5%BF%83%2016
          var [password, next] = node_info_str.split("@");
          var [server_str, name] = next.split("#");
          var [server, port] = server_str.split(":");
          port = +port;
          name = decodeURI(name).replace(/\s/g, "");
          // var param = strToParam(param_str);
          jsonList.push({
            type: protocol,
            name,
            server,
            port,
            password,
            udp: true,
            "skip-cert-verify": true,
          });
          break;
        default:
          console.log("协议未匹配");
          console.log(protocol, node_info_str);
          break;
      }
    } catch (error) {
      console.log("error:", protocol, node_info_str);
      console.log(error);
    }
  }

  return jsonList;
}

/**
 *
 * @param {string} content 内容
 * @param {json} module 模板
 */
export function v2rayToClash(content, module) {
  const nodeList = Base64.decode(content);
}

export function generateClashConf(nodeList) {
  // todo:
  nodeList = uniqBy(nodeList, (node) => node.name);

  const example = fs.readFileSync("./example.yaml");
  const conf = yaml.load(example);
  const proxies = nodeList.filter((node) => !Number.isNaN(node.prot));
  // .map((node) => JSON.stringify(node));
  const names = nodeList.map((node) => node.name);

  conf.proxies = proxies;
  const group = conf["proxy-groups"];
  // 🚀 节点选择
  group[0].proxies = [...group[0].proxies, ...names];
  // ♻️ 自动选择
  group[1].proxies = [...names];
  // 🌍 国外媒体
  group[2].proxies = [...group[2].proxies, ...names];
  // 漏网之鱼
  last(group).proxies = [...last(group).proxies, ...names];

  return yaml.dump(conf);
}
