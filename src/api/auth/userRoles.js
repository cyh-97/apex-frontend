import request from '@/utils/request'

/**
 * 查询角色已添加用户列表🆗
 * @param query
 * @returns request
 */
export function getAssignedUserList(query) {
  return request({
    url: '/auth/api/SysRole/GetAssignedUserList',
    method: 'get',
    params: query,
  })
}

/**
 * 查询角色未添加用户列表🆗
 * @param query
 * @returns request
 */
export function getUnAssignedUserList(query) {
  return request({
    url: '/auth/api/SysRole/GetUnAssignedUserList',
    method: 'get',
    params: query,
  })
}

/**
 * 添加角色用户🆗
 * @param data
 * @returns request
 */
export function batchAssignUser(data) {
  return request({
    url: '/auth/api/SysRole/BatchAssignUser',
    method: 'post',
    data
  })
}

/**
 * 删除角色用户🆗
 * @param data
 * @returns request
 */
export function deleteRoleUsers(data) {
  return request({
    url: '/auth/api/SysRole/BatchUnAssignUser',
    method: 'post',
    data
  })
}



