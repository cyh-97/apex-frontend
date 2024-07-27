import request from '@/utils/request'

/**========================字典类型 start==========================**/

/**
 * 查询字典类型列表🆗
 * @param query
 * @returns request
 */
export function listType(query) {
  return request({
    url: '/auth/api/SysDict/DictTypeList',
    method: 'get',
    params: query
  })
}

/**
 * 查询字典类型详细🆗
 * @param typeId
 * @returns request
 */
export function detailType(typeId) {
  return request({
    url: '/auth/api/SysDict/DictTypeDetail/?typeId=' + typeId,
    method: 'get'
  })
}

/**
 * 新增字典类型🆗
 * @param data
 * @returns request
 */
export function addType(data) {
  return request({
    url: '/auth/api/SysDict/AddDictType',
    method: 'post',
    data: data
  })
}

/**
 * 修改字典类型🆗
 * @param id
 * @param data
 * @returns {*}
 */
export function updateType(id, data) {
  return request({
    url: `/auth/api/SysDict/UpdateDictType/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除字典类型🆗
 * @param dictId
 * @returns request
 */
export function delType(dictId) {
  return request({
    url: '/auth/api/SysDict/DeleteDictType/?ids=' + dictId,
    method: 'delete'
  })
}

/**========================字典类型 end==========================**/


/**========================字典数字 start==========================**/

/**
 * 查询字典数据列表🆗
 * @param query
 * @returns request
 */
export function listData(query) {
  return request({
    url: '/auth/api/SysDict/DictDataList',
    method: 'get',
    params: query
  })
}

/**
 * 查询字典数据详细🆗
 * @param dataId
 * @returns request
 */
export function detailData(dataId) {
  return request({
    url: '/auth/api/SysDict/DictDataDetail/?dataId=' + dataId,
    method: 'get'
  })
}

/**
 * 新增字典数据🆗
 * @param data
 * @returns request
 */
export function addData(data) {
  return request({
    url: '/auth/api/SysDict/AddDictData',
    method: 'post',
    data: data
  })
}

/**
 * 修改字典数据🆗
 * @param id
 * @param data
 */
export function updateData(id, data) {
  return request({
    url: `/auth/api/SysDict/UpdateDictData/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除字典数据🆗
 * @param id
 * @returns request
 */
export function delData(id) {
  return request({
    url: `/auth/api/SysDict/DeleteDictData/${id}`,
    method: 'delete'
  })
}

/**
 * 根据字典类型查询字典数据🆗
 * @param dictType 字典类型
 * @returns request
 */
export function getDicts(dictType) {
  if (typeof (dictType) === "object") {
    return request({
      url: '/auth/api/SysDict/GetDictDataByDictType',
      data: dictType,
      method: 'post'
    })
  } else {
    return request({
      url: '/auth/api/SysDict/GetDictDataByDictType?dictType=' + dictType,
      method: 'get'
    })
  }
}

/**========================字典数字 end==========================**/
