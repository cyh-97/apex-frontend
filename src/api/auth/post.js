import request from '@/utils/request'

/**
 * 查询岗位列表
 * @param query
 * @returns request
 */
export function listPost(query) {
  return request({
    url: '/auth/api/SysPost/List',
    method: 'get',
    params: query
  })
}

/**
 * 查询岗位详细
 * @param postId
 * @returns request
 */
export function detailPost(postId) {
  return request({
    url: '/auth/api/SysPost/Detail?postId=' + postId,
    method: 'get'
  })
}

/**
 * 新增岗位
 * @param data
 * @returns request
 */
export function addPost(data) {
  return request({
    url: '/auth/api/SysPost/AddPost',
    method: 'post',
    data: data
  })
}

/**
 * 修改岗位
 * @param id
 * @param data
 * @returns request
 */
export function updatePost(id, data) {
  return request({
    url: `/auth/api/SysPost/UpdatePost/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除岗位
 * @param postId
 * @returns request
 */
export function delPost(postId) {
  return request({
    url: `/auth/api/SysPost/DeletePost/${postId}`,
    method: 'delete'
  })
}
