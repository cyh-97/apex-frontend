import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { GetUrlQueryStr } from '@/utils/common'

NProgress.configure({
  showSpinner: false
})

// 路由白名单
const whiteList = ['/login', '/auth-redirect', '/bind', '/demo']


router.beforeEach((to, from, next) => {
  NProgress.start()
  // 检查是否含有token,有的话直接跳转,通过后台去判断token是否有效
  // 如果没有token,判断是否是白名单路由,如果是直接跳转,否则重定向到登录页面
  if (getToken()) {
    to.meta.title && store.dispatch('settings/setTitle', to.meta.title)
    if (to.path === '/login') {
      if (to.query.appId !== 'undefined' && to.query.redirectUri !== 'undefined') {
        next()
        NProgress.done()
      } else {
        next({ path: '/' })
        NProgress.done()
      }
    } else {
      if (store.getters.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        store.dispatch('GetUserInfo').then(() => {
          store.dispatch('GenerateRoutes').then(accessRoutes => {
            router.addRoutes(accessRoutes)      // 动态添加可访问路由表
            next({ ...to, replace: true })  // hack方法 确保addRoutes已完成
          })
        }).catch(err => {
          store.dispatch('Logout').then(() => {
            // console.log('弹框登录失败')
            Message.error(err !== undefined ? err : '登录失败')
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
