import request from '@/utils/request'

/**
 * 查询部门列表🆗
 * @param query
 * @returns request
 */
export function listDept(query) {
  return request({
    url: '/auth/api/SysDept/List',
    method: 'get',
    params: query
  })
}

/**
 * 部门详细🆗
 * @param deptId
 * @returns request
 */
export function getDept(deptId) {
  return request({
    url: '/auth/api/SysDept/Detail?deptId=' + deptId,
    method: 'get'
  })
}

/**
 * 新增部门🆗
 * @param data
 * @returns request
 */
export function addDept(data) {
  return request({
    url: '/auth/api/SysDept/AddDept',
    method: 'post',
    data: data
  })
}

/**
 * 修改部门🆗
 * @param id
 * @param data
 * @returns request
 */
export function updateDept(id, data) {
  return request({
    url: `/auth/api/SysDept/UpdateDept/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除部门
 * @param id
 * @returns request
 */
export function delDept(id) {
  return request({
    url: `/auth/api/SysDept/DeleteDept/${id}`,
    method: 'delete'
  })
}

/**
 * 查询部门列表（排除节点）🆗
 * @param deptId
 * @returns request
 */
export function getDeptListWithOtherNode(deptId) {
  return request({
    url: `/auth/api/SysDept/GetDeptListWithOtherNode/${deptId}`,
    method: 'get'
  })
}


/**
 * 获取部门树🆗
 * @returns request
 */
export function getDeptTree() {
  return request({
    url: '/auth/api/SysDept/GetDeptTree',
    method: 'get'
  })
}

/**
 * 根据角色ID查询部门树结构
 * @param roleId
 * @returns request
 */
export function getRoleDeptTree(roleId) {
  return request({
    url: '/auth/api/SysDept/GetRoleDeptTree/?roleId=' + roleId,
    method: 'GET'
  })
}
