import request from '@/utils/request'

/**
 * 查询应用列表
 * @param query
 * @returns request
 */
export function listApp(query) {
  return request({
    url: '/auth/api/SysApp/List',
    method: 'get',
    params: query
  })
}

/**
 * 查询应用详细
 * @param appId
 * @returns request
 */
export function detailApp(appId) {
  return request({
    url: '/auth/api/SysApp/Detail?appId=' + appId,
    method: 'get'
  })
}

/**
 * 新增应用
 * @param data
 * @returns request
 */
export function addApp(data) {
  return request({
    url: '/auth/api/SysApp/AddApp',
    method: 'post',
    data: data
  })
}

/**
 * 修改应用
 * @param id
 * @param data
 * @returns request
 */
export function updateApp(id, data) {
  return request({
    url: `/auth/api/SysApp/UpdateApp/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除应用
 * @param appId
 * @returns request
 */
export function delApp(appId) {
  return request({
    url: `/auth/api/SysApp/DeleteApp/${appId}`,
    method: 'delete'
  })
}

/**
 * 获取导航明细列表
 * @returns {*}
 */
export function getAppNav() {
  return request({
    url: `/auth/api/SysApp/GetAppNav`,
    method: 'get'
  })
}
