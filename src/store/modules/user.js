import { login, logout, getUserInfo, loginByDingCode, loginByVerifyCode } from '@/api/auth/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import defaultSettings from '@/settings'

const user = {
  state: {
    userInfo: '',
    token: getToken(),
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_PERMISSIONS: (state, permissions) => {
      state.permissions = permissions
    },
    SET_USERINFO: (state, value) => {
      state.userInfo = value
    }
  },

  actions: {
    /**
     * 登录
     * @param commit
     * @param userInfo
     * @returns {Promise<unknown>}
     * @constructor
     */
    Login({ commit }, userInfo) {
      const userCode = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      return new Promise((resolve, reject) => {
        login(userCode, password, code, uuid).then(res => {
          if (res.code === 200) {
            setToken(res.data.token)
            //提交上面的mutaions方法
            commit('SET_TOKEN', res.data.token)
            resolve() //then处理
          } else {
            console.log('login error ' + res);
            reject(res) //catch处理
          }
        }).catch(err => {
          reject(err);
        })
      })
    },

    /**
     * 钉钉扫码登录
     * @param commit
     * @param dingTalkCode
     * @returns {Promise<unknown>}
     * @constructor
     */
    LoginByDingTalkCode({ commit }, dingTalkCode) {
      return new Promise((resolve, reject) => {
        loginByDingCode(dingTalkCode).then(res => {
          if (res.code === 200) {
            setToken(res.data.token)
            //提交上面的mutaions方法
            commit('SET_TOKEN', res.data.token)
            resolve() //then处理
          } else {
            console.log('login error ' + res);
            reject(res) //catch处理
          }
        }).catch(err => {
          reject(err);
        })
      })
    },

    /**
     * 手机验证码登录
     * @param commit
     * @param userInfo
     * @returns {Promise<unknown>}
     * @constructor
     */
    LoginByVerifyCode({ commit }, userInfo) {
      const phoneNumber = userInfo.phoneNumber
      const verifyCode = userInfo.verifyCode
      return new Promise((resolve, reject) => {
        loginByVerifyCode(phoneNumber, verifyCode).then(res => {
          if (res.code === 200) {
            setToken(res.data.token)
            //提交上面的mutaions方法
            commit('SET_TOKEN', res.data.token)
            resolve() //then处理
          } else {
            console.log('login error ' + res);
            reject(res) //catch处理
          }
        }).catch(err => {
          reject(err);
        })
      })
    },

    /**
     * 获取用户信息
     * @param commit
     * @param state
     * @returns {Promise<unknown>}
     * @constructor
     */
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo(process.env.VUE_APP_APP_ID).then(res => {
          const data = res.data
          if (data.roleKeyList && data.roleKeyList.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.roleKeyList)
            commit('SET_PERMISSIONS', data.permissionList)
          } else {
            commit('SET_ROLES', ['ROLE_DEFAULT'])
          }
          commit('SET_NAME', data.userName)
          commit('SET_AVATAR', data.avatar)
          //commit('SET_USERINFO', data.user) //新加
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    },

    /**
     * 退出登录
     * @param commit
     * @param state
     * @returns {Promise<unknown>}
     * @constructor
     */
    Logout({ commit, state }) {
      console.log('退出登录')
      return new Promise((resolve, reject) => {
        logout().then((res) => {
          removeToken() // 必须先移除token
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          resolve(res)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default user
