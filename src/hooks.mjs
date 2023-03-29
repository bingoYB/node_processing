import { getIPGeoInfo } from "../utils.mjs"
import { logger } from "./log.mjs";

export const getNodesHooks = {
    "https://raw.githubusercontent.com/zhangkaiitugithub/passcro/main/speednodes.yaml": async (nodes) => {
        const nextNodes = await Promise.all(nodes.map(async (node) => {
            try {
                const geo = await getIPGeoInfo(node.server)
                node.name = geo.country + "_" + node.name;
                // todo: del cn node
                return node
            } catch (error) {
                logger.error("获取地址信息错误", error.message);
                return node
            }

        }))

        return nextNodes;
    }
}