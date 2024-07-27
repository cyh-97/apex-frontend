import request, {downFile} from '@/utils/request'
import { praseStrZero } from "@/utils/common";

/**
 * 查询用户列表🆗
 * @param query
 * @returns request
 */
export function listUser(query) {
  return request({
    url: '/auth/api/SysUser/List',
    method: 'get',
    params: query
  })
}

/**
 * 获取用户详细信息🆗
 * @param userId
 * @returns request
 */
export function detailUser(userId) {
  return request({
    url: '/auth/api/SysUser/Detail?userId=' + praseStrZero(userId),
    method: 'get'
  })
}

/**
 * 改变用户状态🆗
 * @param userId 用户ID
 * @param status 最新的状态
 * @returns request
 */
export function changeUserStatus(userId, status) {
  const data = {
    value: status
  }
  return request({
    url: `/auth/api/SysUser/ChangeUserStatus/${userId}`,
    method: 'put',
    data: data
  })
}

/**
 * 重置密码🆗
 * @param userId
 * @param password
 * @returns request
 */
export function resetUserPwd(userId, password) {
  const data = {
    value: password
  }
  return request({
    url: `/auth/api/SysUser/ResetPassword/${userId}`,
    method: 'put',
    data: data
  })
}

/**
 * 新增用户🆗
 * @param data
 * @returns request
 */
export function addUser(data) {
  return request({
    url: '/auth/api/SysUser/AddUser',
    method: 'POST',
    data: data
  })
}

/**
 * 修改用户🆗
 * @param id
 * @param data
 * @returns {*}
 */
export function updateUser(id, data) {
  return request({
    url: `/auth/api/SysUser/UpdateUser/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除用户🆗
 * @param userId
 * @returns request
 */
export function delUser(userId) {
  return request({
    url: `/auth/api/SysUser/DeleteUser/${userId}`,
    method: 'delete'
  })
}

/**
 * 下载用户导入模板
 * 写在VIEW组件中
 * @returns request
 */
export function downloadTemplate() {
  return request({
    url: '/auth/api/SysUser/DownloadTemplate',
    method: 'GET',
    responseType: 'blob'//1.首先设置responseType对象格式为 blob:
  })
}

/**
 * 导出查询的用户列表
 * @param query
 * @returns request
 */
export async function exportUser(query) {
   await downFile('/auth/api/SysUser/ExportUser', { ...query })
}

/**
 * 查询用户个人信息🆗
 * @returns request
 */
export function getUserProfile() {
  return request({
    url: '/auth/api/SysUser/GetUserProfile',
    method: 'get'
  })
}

/**
 * 用户密码重置
 * @param id
 * @param oldPassword
 * @param newPassword
 * @returns request
 */
export function updateUserPwd(id, oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: `/auth/api/SysUser/UpdatePassword/${id}`,
    method: 'put',
    data: data
  })
}


