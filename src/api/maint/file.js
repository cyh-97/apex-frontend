import request from '@/utils/request'

/**
 * 从ftp下载文件🆗
 * @param query
 * @returns request
 */
export function downloadFromFtp(query) {
  return request({
    url: '/auth/api/SysFile/DownloadFromFtp?fullName=' + query,
    method: 'get',
  })
}

/**
 * 上传到FTP
 * @param file
 * @param fileName
 * @param projectPath
 * @returns {*}
 */
export function uploadToFtp(data){
  return request({
    url: '/auth/api/SysFile/UploadToFtp',
    method: 'post',
    data: data
  })
}
