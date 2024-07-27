import request from '@/utils/request'

/**
 * 查询角色列表🆗
 * @param query
 * @returns request
 */
export function listRole(query) {
  return request({
    url: '/auth/api/SysRole/List',
    method: 'get',
    params: query
  })
}

/**
 * 查询角色详细🆗
 * @param roleId
 * @returns request
 */
export function detailRole(roleId) {
  return request({
    url: '/auth/api/SysRole/Detail?roleId=' + roleId,
    method: 'get'
  })
}

/**
 * 新增角色🆗
 * @param data
 * @returns request
 */
export const addRole = (data) => {
  return request({
    url: '/auth/api/SysRole/AddRole',
    method: 'post',
    data: data,
  })
}

/**
 * 修改角色🆗
 * @param id
 * @param data
 * @returns request
 */
export function updateRole(id, data) {
  return request({
    url: `/auth/api/SysRole/UpdateRole/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 修改角色状态🆗
 * @param roleId
 * @param status
 * @returns request
 */
export function changeRoleStatus(roleId, status) {
  const data = {
    value : status
  }
  return request({
    url: `/auth/api/SysRole/ChangeRoleStatus/${roleId}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除角色🆗
 * @param roleId
 * @returns request
 */
export function delRole(roleId) {
  return request({
    url: `/auth/api/SysRole/DeleteRole/${roleId}`,
    method: 'delete'
  })
}

/**
 * 分配角色功能权限🆗
 * @param data
 * @returns request
 */
export function assignMenu(data) {
  return request({
    url: '/auth/api/SysRole/AssignRoleMenu',
    method: 'post',
    data: data
  })
}

/**
 * 根据角色ID查询部门树结构🆗
 * @param roleId
 * @returns request
 */
export function getRoleDeptTree(roleId) {
  return request({
    url: '/auth/api/SysRole/GetRoleDeptTree?id=' + roleId,
    method: 'get'
  })
}

/**
 * 根据角色ID查询菜单树🆗
 * @param roleId
 * @returns request
 */
export function getRoleMenuTree(roleId) {
  return request({
    url: '/auth/api/SysRole/GetRoleMenuTree?id=' + roleId,
    method: 'get',
  })
}
