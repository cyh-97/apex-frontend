import request from '@/utils/request'

/**
 * 查询登录日志🆗
 * @param query
 * @returns request
 */
export function getLoginLogs(query) {
  return request({
    url: '/auth/api/SysLog/GetLoginLogs',
    method: 'GET',
    params: query
  })
}

/**
 * 查询操作日志🆗
 * @param query
 * @returns request
 */
export function getOpsLogs(query) {
  return request({
    url: '/auth/api/SysLog/GetOpsLogs',
    method: 'GET',
    params: query
  })
}

/**
 * 查询用户操作日志🆗
 * @param query
 * @returns request
 */
export function getUserOpsLogs(query) {
  return request({
    url: '/auth/api/SysLog/GetUserOpsLogs',
    method: 'GET',
    params: query
  })
}



