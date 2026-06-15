#!/usr/bin/env node

/**
 * 微博互动内容脚本
 *
 * 使用方法:
 *   node weibo-interactive.js <command> [options]
 *
 * 命令:
 *   comments-to-me    获取收到的评论列表
 *   comments-show     获取某条微博的所有评论
 *   help              显示帮助信息
 */

import https from 'https';
import http from 'http';
import { URL } from 'url';

const BASE_URL = 'https://open-im.api.weibo.com';

// ============================================================================
// HTTP 请求
// ============================================================================

/**
 * 发送 HTTP 请求
 * @param {string} method - HTTP 方法
 * @param {string} url - 请求 URL
 * @param {object|null} data - 请求数据（POST 时使用）
 * @returns {Promise<object>} 响应数据
 */
function request(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const req = httpModule.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`解析响应失败: ${body}`)); }
      });
    });

    req.on('error', (e) => { reject(e); });
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// ============================================================================
// API 函数
// ============================================================================

/**
 * 获取收到的评论列表
 *
 * 接口路径：GET /open/interactive/comments/to_me
 *
 * @param {string} token - 认证令牌
 * @param {string} uid - 用户 uid（字符串，避免超大整数精度丢失）
 * @returns {Promise<object>} 收到的评论列表
 */
async function getCommentsToMe(token, uid) {
  const params = new URLSearchParams({ token, uid: String(uid) });
  const url = `${BASE_URL}/open/interactive/comments/to_me?${params.toString()}`;
  return request('GET', url);
}

/**
 * 获取自己某条微博的所有评论
 *
 * 接口路径：GET /open/interactive/comments/show
 *
 * @param {string} token - 认证令牌
 * @param {string} uid - 用户 uid（字符串，避免超大整数精度丢失）
 * @param {string} weiboId - 微博 ID（博文 ID，字符串，避免超大整数精度丢失）
 * @returns {Promise<object>} 该微博的评论列表
 */
async function getCommentsShow(token, uid, weiboId) {
  const params = new URLSearchParams({ token, uid: String(uid), id: String(weiboId) });
  const url = `${BASE_URL}/open/interactive/comments/show?${params.toString()}`;
  return request('GET', url);
}

// ============================================================================
// 命令行参数解析
// ============================================================================

/**
 * 解析命令行参数
 * @param {string[]} args - 命令行参数
 * @returns {object} 解析后的参数对象
 */
function parseArgs(args) {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, ...valueParts] = arg.slice(2).split('=');
      const value = valueParts.join('=') || args[++i] || true;
      result[key] = value;
    }
  }
  return result;
}

// ============================================================================
// 帮助信息
// ============================================================================

function printHelp() {
  console.log(`
微博互动内容脚本

使用方法:
  node weibo-interactive.js <command> [options]

命令:
  comments-to-me    获取收到的评论列表
  comments-show     获取某条微博的所有评论
  help              显示帮助信息

选项:
  --token=<token>   微博 API 访问令牌（必填，通过 weibo_token 工具获取）
  --uid=<uid>       用户 uid（必填）
  --id=<id>         微博 ID / 博文 ID（comments-show 命令必填）

示例:
  # 获取收到的评论列表
  node weibo-interactive.js comments-to-me --token=<your_token> --uid=1234567890

  # 获取某条微博的所有评论
  node weibo-interactive.js comments-show --token=<your_token> --uid=1234567890 --id=5305687166161572
`);
}

// ============================================================================
// 主函数
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = parseArgs(args.slice(1));

  if (!command || command === 'help') {
    printHelp();
    return;
  }

  try {
    let result;

    switch (command) {
      case 'comments-to-me': {
        if (!options.token) {
          console.error('需要指定 --token 参数，请先通过 weibo_token 工具获取');
          process.exit(1);
        }
        if (!options.uid) {
          console.error('需要指定 --uid 参数');
          process.exit(1);
        }
        result = await getCommentsToMe(options.token, options.uid);
        break;
      }

      case 'comments-show': {
        if (!options.token) {
          console.error('需要指定 --token 参数，请先通过 weibo_token 工具获取');
          process.exit(1);
        }
        if (!options.uid) {
          console.error('需要指定 --uid 参数');
          process.exit(1);
        }
        if (!options.id) {
          console.error('需要指定 --id 参数（微博 ID / 博文 ID）');
          process.exit(1);
        }
        result = await getCommentsShow(options.token, options.uid, options.id);
        break;
      }

      default:
        console.error(`未知命令: ${command}`);
        console.log('使用 "node weibo-interactive.js help" 查看帮助信息');
        process.exit(1);
    }

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error(`请求失败: ${error.message}`);
    process.exit(1);
  }
}

// 导出函数供模块使用
export {
  getCommentsToMe,
  getCommentsShow,
};

main();
