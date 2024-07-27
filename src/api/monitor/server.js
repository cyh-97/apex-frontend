import request from '@/utils/request'

/**
 * 查询服务器详细
 * @returns request
 */
export function getServer() {
  return request({
    url: '/Monitor/ServerInfo',
    method: 'GET'
  })
}
