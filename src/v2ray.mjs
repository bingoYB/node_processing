import _ from "lodash";
import { logger } from "./log.mjs";
import fetch from "node-fetch";
import { Base64 } from "../utils.mjs";
import { getNodesHooks as hooks } from "./hooks.mjs";

/**
 * Parsing v2ray content into clash nodes list
 * @param {string} content v2ray content
 * @returns 
 */
export function parseV2rayToClashNodes(content) {
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
          var [port, next] = port.split("?");
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
          logger.info("协议未匹配", protocol);
          logger.info(protocol, node_info_str);
          break;
      }
    } catch (error) {
      logger.error("error:", protocol, node_info_str);
      logger.error(error);
    }
  }

  return jsonList;
}

export async function batchV2rayToClashNodes(urls) {
  const batch = urls.map((url) =>
    fetch(url)
      .then((res) => res.text())
      .then((content) => parseV2rayToClashNodes(content))
      .then(
        (nodes) => {
          if(hooks[url]){
            return hooks[url](nodes)
          }
          return nodes
        }
      )
  );

  let nodeSet = await Promise.all(batch);
  return _.flatten(nodeSet);
}