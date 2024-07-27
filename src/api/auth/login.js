import request from '@/utils/request'
import { praseStrZero } from '@/utils/common'

/**
 * 登录🆗
 * @param userCode 用户名
 * @param password 密码
 * @param captchaCode 验证码编码
 * @param captchaUid 验证码UID
 * @returns  request
 */
export function login(userCode, password, captchaCode, captchaUid) {
  const data = {
    userCode,
    password,
    captchaCode,
    captchaUid,
    loginType: 1
  }
  return request({
    url: '/auth/api/SysAuth/Login',
    method: 'post',
    data: data,
  })
}

/**
 * 钉钉扫码登录
 * @param dingTalkCode
 * @returns request
 */
export function loginByDingCode(dingTalkCode) {
  const data = {
    userCode: "ding",
    loginCode: dingTalkCode,
    loginType: 2,
    deviceType: 0
  }
  return request({
    url: '/auth/api/SysAuth/Login',
    method: 'post',
    data: data,
  })
}

/**
 * 手机验证码登录登录
 * @param phoneNumber
 * @param verifyCode
 * @returns request
 */
export function loginByVerifyCode(phoneNumber, verifyCode) {
  const data = {
    userCode: "ding",
    phoneNumber,
    verifyCode,
    loginType: 5,
    deviceType: 0
  }
  return request({
    url: '/auth/api/SysAuth/Login',
    method: 'post',
    data: data,
  })
}

/**
 * 获取sso sessionCode🆗
 * @param appId
 * @param redirectUri
 * @returns {*}
 */
export function getSessionCode(appId, redirectUri) {
  return request({
    url: `/auth/api/SysAuth/GetLoginSessionCode?appId=${appId}&redirectUri=${redirectUri}`,
    method: 'get'
  })
}

/**
 * 发送手机验证码
 * @param phoneNumber
 * @returns {*}
 */
export function getSmsVerifyCode(phoneNumber) {
  const data = {
    code: '',
    phoneNumber
  }
  return request({
    url: '/auth/api/SysAuth/SendSmsCode',
    method: 'POST',
    data: data,
  })
}

/**
 * 获取用户详细信息
 * @param appId 应用模块ID
 * @returns {*}
 */
export function getUserInfo(appId) {
  return request({
    url: `/auth/api/SysAuth/GetUserValidatedInfo?appId=${appId}&deviceType=0`,
    method: 'get'
  })
}

/**
 * 退出登录
 * @returns request
 */
export function logout() {
  return request({
    url: '/auth/api/SysAuth/Logout',
    method: 'delete'
  })
}

/**
 * 获取验证码🆗
 * @returns request
 */
export function getCaptchaImage() {
  return request({
    url: '/auth/api/SysAuth/GetCaptchaImage',
    method: 'get'
  })
}

/**
 * 北森token
 * @returns request
 */
export function beisunToken() {
  return request({
    url: '/auth/api/SysAuth/beisunToken',
    method: 'post'
  })
}

