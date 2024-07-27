
// import Cookies from 'js-cookie'

const TokenKey = 'ui-Token'

export function getToken() {
  return localStorage.getItem(TokenKey)
}

export function setToken(token) {
  // console.log('set token=' + token)
  return localStorage.setItem(TokenKey, token)
}

export function removeToken() {
  return localStorage.removeItem(TokenKey)
}
