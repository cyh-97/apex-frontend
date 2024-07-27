import request from '@/utils/request'

/**
 * 查询参数列表🆗
 * @param query
 * @returns request
 */
export function listConfig(query) {
  return request({
    url: '/auth/api/SysConfig/List',
    method: 'get',
    params: query
  })
}

/**
 * 查询参数详细🆗
 * @param configId
 * @returns request
 */
export function getConfig(configId) {
  return request({
    url: '/auth/api/SysConfig/Detail?configId=' + configId,
    method: 'get'
  })
}

/**
 * 新增参数配置🆗
 * @param data
 * @returns request
 */
export function addConfig(data) {
  return request({
    url: '/auth/api/SysConfig/AddConfig',
    method: 'post',
    data: data
  })
}

/**
 * 修改参数配置🆗
 * @param id
 * @param data
 * @returns {*}
 */
export function updateConfig(id, data) {
  return request({
    url: `/auth/api/SysConfig/UpdateConfig/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除参数配置🆗
 * @param configId
 * @returns request
 */
export function delConfig(configId) {
  return request({
    url: '/auth/api/SysConfig/DeleteConfig?ids=' + configId,
    method: 'delete'
  })
}

/**
 * 根据参数键名查询参数值🆗
 * @param configKey
 * @returns request
 */
export function getConfigKey(configKey) {
  return request({
    url: '/auth/api/SysConfig/GetConfigByKey?key=' + configKey,
    method: 'get'
  })
}











