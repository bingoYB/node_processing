import fs from "fs";
import yaml from "js-yaml";
import _ from "lodash";
import fetch from "node-fetch";
const { uniqBy, last } = _;
import { logger } from "./log.mjs"

/**
 * 
 * @param {} nodeList 
 * @returns 
 */
export function generateClashConf(nodeList) {
  // todo:
  nodeList = uniqBy(nodeList.filter(n=>n), (node) => node.name);

  const example = fs.readFileSync("./example.yaml");
  const conf = yaml.load(example);
  const proxies = nodeList.filter((node) => {
    return !Number.isNaN(node.port);
  });

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



/**
 * @param {string} url
 */
export function getClashNodesByUrl(url) {
  return fetch(url)
    .then((res) => {
      return res.text();
    }).then(content => {
      const conf = yaml.load(content);
      return conf.proxies;
    }).catch(e => {
      logger.error(e);
    })
}

export async function mergeClashNodes(urls) {
  const allNode = await Promise.all(urls.map(url => getClashNodesByUrl(url)));

  const nodeList = _.flatten(allNode);
  return nodeList;
}

export function getClashNodesByContent(content) {
  const conf = yaml.load(content);
  return conf.proxies;
}