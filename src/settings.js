let date = new Date()
let update = date.getFullYear()

module.exports = {

  /**
   * 后端API ip和端口
   */
  apiTarget: 'http://localhost:3000',

  /**
   * 框架版本号
   */
  version: '1.0.2',

  /**
   * 标题-->系统名称
   */
  title: '统一认证导航平台',

  /**
   * 主题颜色
   */
  theme: '#aaaaff',
  /**
   * 侧边栏主题 深色主题theme-dark，浅色主题theme-light
   */
  sideTheme: 'theme-light',

  /**
   * 显示是否系统布局配置
   */
  showSettings: false,

  /**
   * 是否显示顶部导航
   */
  topNav: false,

  /**
   * 是否显示 tagsView
   */
  tagsView: true,

  /**
   * 是否固定头部
   */
  fixedHeader: true,

  /**
   * 是否显示logo
   */
  sidebarLogo: true,

  /**
   * 是否显示动态标题
   */
  dynamicTitle: false,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production',

  /**
   * 版权所有
   */
  copyRight: `Copyright ©2002-${update} 武汉凯骏服装集团有限责任公司 All Right Reserved.`,

  /**
   * 钉钉登录回调地址
   */
  callbackUrl: "https://auth.kingsrich.com",

  /**
   * 应用Id
   */
  dingTalkAgentId: "不需要",

  /**
   * ding 应用AppKey
   */
  dingTalkAppKey: "dingqevlf58qakn941ou",

  /**
   * ding AppSecret
   */
  dingTalkAppSecret: "不需要",
}
