import request from '@/utils/request'

/**
 * 查询流水策略列表🆗
 * @param query
 * @returns request
 */
export function listPolicy(query) {
  return request({
    url: '/auth/api/SysBizSerialPolicy/List',
    method: 'get',
    params: query
  })
}

/**
 * 查询流水策略详细🆗
 * @param policyId
 * @returns request
 */
export function detailPolicy(policyId) {
  return request({
    url: '/auth/api/SysBizSerialPolicy/PolicyDetail/?policyId=' + policyId,
    method: 'get'
  })
}

/**
 * 新增流水策略🆗
 * @param data
 * @returns request
 */
export function addPolicy(data) {
  return request({
    url: '/auth/api/SysBizSerialPolicy/AddPolicy',
    method: 'post',
    data: data
  })
}

/**
 * 修改流水策略🆗
 * @param id
 * @param data
 * @returns {*}
 */
export function updatePolicy(id, data) {
  return request({
    url: `/auth/api/SysBizSerialPolicy/UpdatePolicy/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除流水策略🆗
 * @param policyId
 * @returns request
 */
export function delPolicy(policyId) {
  return request({
    url: '/auth/api/SysBizSerialPolicy/DeletePolicy?ids=' + policyId,
    method: 'delete'
  })
}
