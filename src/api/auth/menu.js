import request from '@/utils/request'

/**
 * 查询菜单列表🆗
 * @param query
 * @returns request
 */
export function listMenu(query) {
  return request({
    url: '/auth/api/SysMenu/List',
    method: 'get',
    params: query
  })
}

/**
 * 查询菜单详细🆗
 * @param menuId
 * @returns request
 */
export function detailMenu(menuId) {
  return request({
    url: '/auth/api/SysMenu/Detail?menuId=' + menuId,
    method: 'get',
  })
}

/**
 * 新增菜单
 * @param data
 * @returns request
 */
export const addMenu = (data) => {
  return request({
    url: '/auth/api/SysMenu/AddMenu',
    method: 'post',
    data: data,
  })
}

/**
 * 修改菜单🆗
 * @param id
 * @param data
 * @returns request
 */
export function updateMenu(id, data) {
  return request({
    url: `/auth/api/SysMenu/UpdateMenu/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除菜单
 * @param menuId
 * @returns request
 */
export function delMenu(menuId) {
  return request({
    url: `/auth/api/SysMenu/DeleteMenu/${menuId}`,
    method: 'delete'
  })
}

/**
 * 修改菜单顺序
 * @param data
 * @returns request
 */
export function changeMenuSort(data) {
  return request({
    url: '/SysMenu/ChangeSort',
    method: 'POST',
    data: data
  })
}

/**
 * 获取菜单路由信息🆗
 * @param query
 * @returns request
 */
export const getRouters = (query) => {
  return request({
    url: '/auth/api/SysMenu/GetRouters',
    method: 'get',
    params: query
  })
}

/**
 * 根据角色ID查询菜单树
 * @param roleId
 * @returns request
 */
export function getRoleMenuTree(roleId) {
  return request({
    url: '/SysMenu/GetRoleMenuTree/?roleId=' + roleId,
    method: 'GET',
  })
}
