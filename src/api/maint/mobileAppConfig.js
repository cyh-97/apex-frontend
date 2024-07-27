import request from '@/utils/request'

/**
 * 查询应用包列表🆗
 * @param query
 * @returns request
 */
export function listAppPackage(query) {
  return request({
    url: '/auth/api/MobileAppConfig/AppPackageList',
    method: 'get',
    params: query
  })
}

/**
 * 查询应用包详细🆗
 * @param appPackageId
 * @returns request
 */
export function getAppPackage(appPackageId) {
  return request({
    url: '/auth/api/MobileAppConfig/PackageListDetail?appPackageId=' + appPackageId,
    method: 'get'
  })
}

/**
 * 新增应用包🆗
 * @param data
 * @returns request
 */
export function addAppPackage(data) {
  return request({
    url: '/auth/api/MobileAppConfig/AddAppPackage',
    method: 'post',
    data: data
  })
}

/**
 * 修改应用包🆗
 * @param id
 * @param data
 * @returns {*}
 */
export function updateAppPackage(id, data) {
  return request({
    url: `/auth/api/MobileAppConfig/UpdateAppPackage/${id}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除应用包🆗
 * @param appPackageId
 * @returns request
 */
export function delAppPackage(appPackageId) {
  return request({
    url: '/auth/api/MobileAppConfig/DeleteAppPackage?ids=' + appPackageId,
    method: 'delete'
  })
}

/**
 * 上传应用
 * @param data
 * @returns {*}
 */
export function uploadToApk(data){
  return request({
    url: '/auth/api/MobileAppConfig/UploadApk',
    method: 'post',
    data: data
  })
}









