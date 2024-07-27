<template>
  <div class="login" v-loading="pageLoading">
    <!--底部-->
    <div class="bottom-part">
      <span>{{ copyRight }}
        <a href="https://beian.miit.gov.cn/" target="_blank"/>
        <a id="icp_record" href="//beian.miit.gov.cn" target="_blank">鄂公网安备 42011302000248号</a>
      </span>
    </div>

    <!--左上角logo-->
    <div class="float-logo">
      <img alt="" :src="logo" class="img-logo" />
    </div>

    <!--左部-->
    <div class="left-part">
      <div class="env-part" v-if="envInfo === 1">
        <el-alert
          title="请注意,这是测试环境！！"
          center
          type="error"
          :closable="false"/>
      </div>
      <div class="env-part" v-if="envInfo === 0">
        <el-alert
          title="请注意,这是开发环境！！"
          center
          type="error"
          :closable="false"/>
      </div>
      <div class="welcome">
        欢迎来到
        <span class="text-highlight">{{ title }}, 请登录~</span>
      </div>

      <div class="login-photo"></div>
    </div>

    <!--右部-->
    <div class="right-part">
      <div class="login-panel">

        <div class="form-switch">
          <span class="switch-tip">{{switchLoginTypeName === 'qr-code' ? '账号登录与注册' : '扫码登录'}}</span>
          <span class="switch-img" :class="switchLoginTypeName === 'account' ? 'with-account':'with-code'" @click="switchLoginType"></span>
        </div>

        <div v-show="switchLoginTypeName === 'account'">
          <el-tabs v-model="activeName">
            <el-tab-pane label="验证码登录" name="phoneType" style="margin-top: 20px">
              <el-form
                ref="loginFormByVerify"
                :model="loginFormByVerify"
                :rules="loginRulesByVerify"
                class="login-form"
                size="medium">
                <el-form-item prop="phoneNumber" size="medium">
                  <el-input v-model="loginFormByVerify.phoneNumber" size="medium" clearable oninput="value=value.replace(/[^\d]/g,'')"
                         maxlength="11" type="text" autocomplete="off" placeholder="请输入手机号码">
                    <svg-icon
                      slot="prefix"
                      icon-class="phone"
                      class="el-input__icon input-icon"
                      size="medium"/>
                  </el-input>
                </el-form-item>
                <el-form-item prop="verifyCode" size="medium">
                  <el-input
                    v-model="loginFormByVerify.verifyCode"
                    auto-complete="off"
                    placeholder="手机验证码"
                    style="width: 50%"
                    size="medium"
                    @keyup.enter.native="handleLoginByVerify"
                    ref="codeTxt">
                    <svg-icon
                      slot="prefix"
                      icon-class="validCode"
                      class="el-input__icon input-icon"
                      size="medium"/>
                  </el-input>
                  <el-button size="medium" type="primary" style="width: 45%; float: right" @click="sendVerifyCode" :disabled="!isPhoneNumber || isSending || countdown > 0">
                    {{ isSending ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
                  </el-button>
                </el-form-item>
                <el-form-item style="width: 100%;">
                  <el-button
                    :loading="loading"
                    size="medium"
                    type="primary"
                    style="width: 100%;"
                    @click.native.prevent="handleLoginByVerify">
                    <span v-if="!loading">登 录</span>
                    <span v-else>登 录 中...</span>
                  </el-button>
                </el-form-item>
                <el-form-item style="width: 100%;">
                  <el-button
                    size="medium"
                    style="width: 100%;"
                    @click.native.prevent="handleRegister"
                    >外部用户注册
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="密码登录" name="passwordType" style="margin-top: 20px">
              <el-form
                ref="loginFormByPassword"
                :model="loginFormByPassword"
                :rules="loginRulesByPassword"
                class="login-form"
                size="medium">
                <el-form-item prop="username" size="medium">
                  <el-input
                    v-model="loginFormByPassword.username"
                    type="text"
                    auto-complete="off"
                    placeholder="账号"
                    size="medium">
                    <svg-icon
                      slot="prefix"
                      icon-class="user"
                      class="el-input__icon input-icon"
                      size="medium"/>
                  </el-input>
                </el-form-item>
                <el-form-item prop="password" size="medium">
                  <el-input
                    v-model="loginFormByPassword.password"
                    type="password"
                    auto-complete="off"
                    placeholder="密码"
                    size="medium"
                    @keyup.enter.native="handleLogin">
                    <svg-icon
                      slot="prefix"
                      icon-class="password"
                      class="el-input__icon input-icon"
                      size="medium"/>
                  </el-input>
                </el-form-item>
                <el-form-item
                  prop="code"
                  size="medium">
                  <el-input
                    v-model="loginFormByPassword.code"
                    auto-complete="off"
                    placeholder="验证码"
                    style="width: 60%"
                    size="medium"
                    @keyup.enter.native="handleLoginByPassword"
                    ref="codeTxt">
                    <svg-icon
                      slot="prefix"
                      icon-class="validCode"
                      class="el-input__icon input-icon"
                      size="medium"/>
                  </el-input>
                  <div class="login-code">
                    <canvas
                      ref="checkCode"
                      @click="getCode"
                      class="login-code-img"
                    ></canvas>
                  </div>
                </el-form-item>
                <el-form-item style="height: 30px">
                  <span style="float: left">
                    <el-checkbox
                      v-model="loginFormByPassword.rememberMe"
                      style="margin: 0px 0px 25px 0px"
                    >记住密码</el-checkbox>
                  </span>
                  <el-link type="warning" style="float: right; font-size: 14px;">忘记密码</el-link>
                </el-form-item>
                <el-form-item style="width: 100%;">
                  <el-button
                    :loading="loading"
                    size="medium"
                    type="primary"
                    style="width: 100%;"
                    @click.native.prevent="handleLoginByPassword">
                    <span v-if="!loading">登 录</span>
                    <span v-else>登 录 中...</span>
                  </el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div v-show="switchLoginTypeName !== 'account'">
          <div class="ding-talk-title">
            <img src="../assets/image/dingtalk-logo.svg" class="ding-talk-logo">
            手机钉钉扫码
          </div>
          <div id="login_container" style="transform: scale(0.8)"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
import defaultSettings from '@/settings'
import { GetUrlQueryString } from '@/utils/common'
import { getSessionCode, getSmsVerifyCode } from '@/api/auth/login'

export default {
  name: "Login",
  data() {
    // 验证码验证
    let validateCode = (rule, value, callback) => {
        if (value === '' || value === undefined) {
          callback(new Error('验证码不能为空'));
        } else {
          if (eval(value) !== eval(this.expressValue)) {
            callback(new Error('验证码输入错误'));
          }
          callback();
        }
      };
    // 手机号验证
    let validatePhone = (rule, value, callback) => {
      if (!value) {
        this.isPhoneNumber = false
        return callback(new Error('手机号不能为空'));
      } else {
        const reg = /^1[3456789]\d{9}$/
        if (reg.test(value)) {
          this.isPhoneNumber = true
          callback();
        } else {
          this.isPhoneNumber = false
          return callback(new Error('请输入正确的手机号'));
        }
      }
    };

    return {
      loginFormByPassword: {
        username: "",
        password: "",
        rememberMe: false,
        phoneNumber: "",
        verifyCode: "",
        code: "",
        uuid: "",
      },
      loginFormByVerify: {
        username: "",
        password: "",
        rememberMe: false,
        phoneNumber: "",
        verifyCode: "",
        code: "",
        uuid: "",
      },
      title: defaultSettings.title,
      logo:require("../assets/image/kingsrich.png"),
      loginRulesByVerify: {
        phoneNumber: [
          { required: true, message: "请输入正确手机号", trigger: "blur" },
          { validator: validatePhone, trigger: 'change'}
        ],
        verifyCode: [
          { required: true, message: "手机验证码不能为空", trigger: "blur" },
        ],
      },
      loginRulesByPassword: {
        username: [
          { required: true, trigger: "blur", message: "用户名不能为空" },
        ],
        password: [
          { required: true, trigger: "blur", message: "密码不能为空" },
        ],
        code: [
          { validator: validateCode, trigger: "change" },
        ],
      },

      loading: false,
      pageLoading:false,
      redirect: undefined,
      switchLoginTypeName: 'qr-code',
      activeName: "phoneType",
      isPhoneNumber: false,
      isSending: false,
      countdown: 0,
      isInitComplete: false,
      checkCode: "", // 图片验证码的值
      expressValue: "", // 表达式的值
      // canvas各种设置
      cvs: {
        w: 100, // 给出默认宽度  宽度会在图片绘制时根据长度更改
        h: 40, // 高 与input保持一致
        fontSize: 24, // 字体大小
        str: "+-", // 符号生成范围
        line: 0, // 噪音线个数
      },
    };
  },
  computed: {
    copyRight: function () {
      return defaultSettings.copyRight;
    },
    envInfo:function () {
       if (process.env.VUE_APP_TITLE.includes("测试")) {
         return 1;
       } else if (process.env.VUE_APP_TITLE.includes("开发")) {
         return 0;
       } else {
         return 2;
       }
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  created() {

    this.checkLoginAndGetSessionCode(false);

    this.checkLogout();

    // 根据地址栏参数中的code参数判断
    // code为null则说明是第一次进入此页面
    // code有值说明是扫码登录后重定向过来的
    if (GetUrlQueryString("code") === null) {
      this.getCookie();
      // 获取验证码
      this.$nextTick(()=>{ this.getCode(); })
    } else {
      this.handleDingCodeLogin();
    }
  },
  methods: {

    /**
     * 切换登录方式(账号登录还是扫码登录)
     */
    switchLoginType() {
      if (this.switchLoginTypeName === 'account') {
        this.switchLoginTypeName = 'qr-code'
        if (!this.isInitComplete) {
          this.isInitComplete = this.dingTalkLoginInit();
        }
      } else {
        this.switchLoginTypeName = 'account'
      }
    },

    /**
     * 发送验证码
     */
    sendVerifyCode() {
      if (this.countdown > 0 || this.isSending) {
        return; // 防止重复点击发送
      }

      // 假设在这个方法中实现发送验证码的逻辑
      // 可以调用sendVerificationCode()方法发送验证码
      // 这里只是简单模拟发送过程
      this.isSending = true;
      this.startCountdown();

      getSmsVerifyCode(this.loginFormByVerify.phoneNumber).then((res) => {
        const { code, data } = res;
        if (code === 200) {
          this.msgSuccess(data);
        } else {
          this.msgError(data);
        }
        this.isSending = false;
      }).catch(() => {
        this.isSending = false;
      });
    },

    /**
     * 验证码倒计时
     */
    startCountdown() {
      this.countdown = 60;
      const timer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    },

    /**
     * 校验是否登录并获取sessionCode
     */
    checkLoginAndGetSessionCode(check) {
      let urlSearchParams = new URLSearchParams(window.location.search)
      console.log("获取sessio-begin")
      let appId = urlSearchParams.get('appId')
      let redirectUri = urlSearchParams.get('redirectUri')
      let loginFlag=urlSearchParams.get('loginFlag')
      console.log("获取sessio-1")
      if (!check && ( loginFlag== 1 || redirectUri === null)) return;

      getSessionCode(appId, redirectUri).then((res) => {
        this.pageLoading=false
        const { code, data } = res;
        if (code === 200) {
          window.location.href = redirectUri + '?sessionCode=' + data
        }
      }).catch(() => {

      })
    },

    /**
     * 校验统一登出
     */
    checkLogout() {
      let urlSearchParams = new URLSearchParams(window.location.search)
      let appId = urlSearchParams.get('appId')
      let logoutParam = urlSearchParams.get('logout')
      if (logoutParam === null || appId !== logoutParam) return;

      this.$store.dispatch("Logout").then(() => {
        location.href = process.env.VUE_APP_ROUTER_PREFIX;
      });
    },

    /**
     * 获取验证码
     */
    getCode() {
      let domCvs = this.$refs.checkCode;
      this.drawCode(domCvs);
    },

    /**
     * 获取cookie中的登录信息
     */
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberMe");

      this.loginFormByPassword = {
        username: username === undefined ? this.loginFormByPassword.username : username,
        password: password === undefined ? this.loginFormByPassword.password : password,
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },

    /**
     * 登录事件处理
     */
    handleLoginByVerify() {
      this.$refs.loginFormByVerify.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("LoginByVerifyCode", this.loginFormByVerify)
            .then(() => {
              this.msgSuccess("登录成功");
              //this.$router.push({ path: this.redirect || "/" });
              this.loginSuccessHref()
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("未完成");
        }
      });
    },

    /**
     * 登录事件处理
     */
    handleLoginByPassword() {
      this.$refs.loginFormByPassword.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginFormByPassword.rememberMe) {
            Cookies.set("username", this.loginFormByPassword.username, { expires: 30 });
            Cookies.set("password", this.loginFormByPassword.password, { expires: 30 });
            Cookies.set("rememberMe", this.loginFormByPassword.rememberMe, {
              expires: 30,
            });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberMe");
          }
          this.$store
            .dispatch("Login", this.loginFormByPassword)
            .then(() => {
              this.msgSuccess("登录成功");
              //this.$router.push({ path: this.redirect || "/" });
              this.loginSuccessHref()
            })
            .catch(() => {
              this.loading = false;
              this.getCode();
              this.$refs.codeTxt.focus();
            });
        } else {
          console.log("未完成");
        }
      });
    },

    /** 钉钉扫码登录处理 */
    handleDingCodeLogin() {
      let dingTalkCode = GetUrlQueryString("code");
      this.$store
        .dispatch("LoginByDingTalkCode", dingTalkCode)
        .then(() => {
          this.msgSuccess("登录成功");
          //this.$router.push({ path: this.redirect || "/" });
          this.dingLoginSuccessHref()
        })
        .catch(() => {
          this.loading = false;
          this.getCode();
          this.$refs.codeTxt.focus();
        });
    },

    /** 加工厂注册 */
    handleRegister(){
      window.location.href = process.env.VUE_APP_REGISTER
    },
    /**
     * 钉钉扫码登录初始化
     */
    dingTalkLoginInit() {
      let urlSearchParams = new URLSearchParams(window.location.search)
      let redirectUri = urlSearchParams.get('redirectUri')
      let appId = urlSearchParams.get('appId')


      let url = encodeURIComponent(defaultSettings.callbackUrl)
      if(redirectUri !== null && appId !== null)
      {
        localStorage.setItem("appId",appId)
        localStorage.setItem("redirectUri",redirectUri)
      }

      let appKey = defaultSettings.dingTalkAppKey;
      let goto = encodeURIComponent(
        `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${appKey}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${url}`
      );

      DDLogin({
        id: "login_container",
        goto: goto,
        style: "border:none;background-color:#FFFFFF;",
        width: "100%",
        height: "300",
      });

      let handleMessage = (event) => {
        let origin = event.origin;
        // 判断是否来自ddLogin扫码事件。
        if (origin === "https://login.dingtalk.com") {
          let loginTmpCode = event.data;
          // 此步拿到临时loginTmpCode换取正式code
          window.location.href = `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${appKey}&response_type=code&scope=snsapi_login&state=STATE&redirect_uri=${url}&loginTmpCode=${loginTmpCode}`;
        }
      };

      if (typeof window.addEventListener != "undefined") {
        window.addEventListener("message", handleMessage, false);
      } else if (typeof window.attachEvent != "undefined") {
        window.attachEvent("onmessage", handleMessage);
      }

      return true;
    },

    /**
     * 登录成功跳转
     */
    loginSuccessHref(){
     this.pageLoading=true
     let urlSearchParams = new URLSearchParams(window.location.search)
     let redirectUri = urlSearchParams.get('redirectUri')

     if(redirectUri === null)
     {
      this.$router.push({ path: this.redirect || "/" });
      this.pageLoading=false
     }
     else
     {
      this.checkLoginAndGetSessionCode(true)
     }
    },

    /**
     * 钉钉登录成功跳转
     */
    dingLoginSuccessHref(){
     this.pageLoading=true
     var appId = localStorage.getItem("appId")
     var redirectUri = localStorage.getItem("redirectUri")

     if(redirectUri === null)
     {
      this.$router.push({ path: this.redirect || "/" });
      this.pageLoading=false
     }
     else
     {
      getSessionCode(appId, redirectUri).then((res) => {
        this.pageLoading=false
        const { code, data } = res;
        if (code === 200) {
          window.location.href = redirectUri + '?sessionCode=' + data
        }
      }).catch(() => {

      })
     }

     localStorage.removeItem("appId")
     localStorage.removeItem("redirectUri")

    },

    /**
     * 验证码图片绘制
     */
    drawCode(domCvs) {
      let _this = this;
      // 随机表达式
      let checkCode = this.rCode();
      // 宽设置
      this.cvs.w = 10 + this.cvs.fontSize * this.checkCode.length;

      // 判断是否支持canvas
      if (domCvs !== null && domCvs.getContext && domCvs.getContext("2d")) {
        // 设置显示区域大小
        domCvs.style.width = _this.cvs.w;
        // 设置画板宽高
        domCvs.setAttribute("width", _this.cvs.w);
        domCvs.setAttribute("height", _this.cvs.h);
        // 画笔
        let pen = domCvs.getContext("2d");
        // 背景: 颜色  区域
        pen.fillStyle = "#eee";
        pen.fillRect(0, 0, _this.cvs.w, _this.cvs.h);
        // 水平线位置
        pen.textBaseline = "middle"; // top middle bottom
        // 内容
        for (let i = 0; i < _this.checkCode.length; i++) {
          pen.fillStyle = _this.rColor(); // 随机颜色
          pen.font = `bold ${_this.cvs.fontSize}px 微软雅黑`; // 字体设置
          // 字符绘制: (字符, X坐标, Y坐标)
          pen.fillText(
            checkCode.charAt(i),
            10 + _this.cvs.fontSize * i,
            17 + _this.rInt(10)
          );
        }
        // 噪音线
        for (let i = 0; i < _this.cvs.line; i++) {
          // 起点
          pen.moveTo(_this.rInt(_this.cvs.w) / 2, _this.rInt(_this.cvs.h));
          // 终点
          pen.lineTo(_this.rInt(_this.cvs.w), _this.rInt(_this.cvs.h));
          // 颜色
          pen.strokeStyle = _this.rColor();
          // 粗细
          pen.lineWidth = "2";
          // 绘制
          pen.stroke();
        }
      } else {
        this.$message.error("不支持验证码格式，请升级或更换浏览器重试");
      }
    },

    /**
     * 生成随机表达式
     */
    rCode() {
      let a = this.rInt(100);
      let b = this.rInt(10);
      let op = this.cvs.str.charAt(this.rInt(this.cvs.str.length));
      // 表达式
      let code = `${a}${op}${b}=`;
      this.checkCode = code;
      // 表达式的值
      this.expressValue = eval(code.substr(0, code.length - 1));
      return code;
    },

    /**
     * 随机整数生成器，范围[0, max)
     */
    rInt(max) {
      return Math.floor((Math.random() * 100000) % max);
    },

    /**
     * 生成随机颜色 rgba格式
     */
    rColor() {
      let a = ((Math.random() * 5 + 5) / 10).toFixed(2);
      return `rgba(${this.rInt(256)}, ${this.rInt(256)}, ${this.rInt(
        256
      )}, ${a})`;
    },
  },
  mounted() {
    if (!this.isInitComplete) {
      this.isInitComplete = this.dingTalkLoginInit();
    }
  }
};
</script>

<style scoped rel="stylesheet/scss" lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/image/login-bg.svg");
  background-size: cover;
}
.float-logo {
  height: 80px;
  position: fixed;
  top: 10px;
  left:10px;
  .img-logo{
    width: 70px;
    height: 60px;
  }
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #ffaa00;
}

.left-part {
  position: absolute;
  top: 15vh;
  left: 10vw;
}

.right-part {
  position: absolute;
  right: 10vw;
  top: 50%;
  transform: translateY(-50%);
  width: 320px;
}

.env-part {
  position: absolute;
  top: -20%;
}

.bottom-part {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.welcome {
  font-size: 20px;
  margin-bottom: 46px;
  align-items: center;
  display: flex;
  color: #2c3e50;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.text-highlight {
  margin-left: 11px;
  font-size: 28px;
  color: #ff981f;
}

.login-photo {
  height: 61vh;
  width: 82vw;
  background-image: url("../assets/image/login-photo.svg");
  background-size: 55% 105%;
  background-repeat: no-repeat;
  margin-top: -5px;
  margin-left: 10px;
}

.login-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: 0.375rem;
  --tw-bg-opacity: 1;
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity));
  box-shadow: 0 5px 31px #acc7e442;
  width: 100%;
  height: 450px;
}

.login-form {
  border-radius: 2px;
  background-color: hsla(0, 0%, 100%, 0.3);
  width: 100%;

  .el-input {
    height: 42px;
    input {
      height: 48px;
    }
  }
  .input-icon {
    height: 40px;
    width: 16px;
    margin-left: 2px;
    margin-top: 0px;
  }
}

.form-switch {
  position: absolute;
  top: 0;
  right: 0;
}

.switch-tip {
  position: relative;
  display: inline-block;
  border-radius: .25rem;
  vertical-align: top;
  font-size: 14px;
  color: #fea032;
  padding: 4px 15px;
  border: 1px solid #fea032;
  margin-top: 3px;
  margin-right: 5px
}

.switch-tip::after {
  position: absolute;
  display: inline-block;
  height: 8px;
  width: 8px;
  --tw-bg-opacity: 1;
  background-color: rgba(255,255,255,var(--tw-bg-opacity));
  content: "";
  border: 1px solid #fea032;
  border-left-color: transparent;
  border-bottom-color: transparent;
  right: -5px;
  top: 9px;
  transform: rotate(45deg);
  -webkit-transform: rotate(45deg);
}

.switch-img {
  display: inline-block;
  cursor: pointer;
  vertical-align: bottom;
  width: 48px;
  height: 48px;
}

.switch-img.with-code {
  background-image: url(../assets/image/login-with-qrcode.svg)
}

.switch-img.with-account {
  background-image: url(../assets/image/login-with-account.svg)
}

.ding-talk-title {
  margin-top: 70px;
  margin-bottom: -30px;
  height: 24px;
  line-height: 24px;
  color: #38adff;
  font-size: 20px;
  text-align: center;
}

.ding-talk-logo {
  width: 29px;
  height: 24px;
  vertical-align: top;
  display: inline-block;
}

::v-deep .el-tabs{
  width: 100%;
  padding: 40px 20px 0 20px;
  .el-tabs__header{
    .el-tabs__nav-wrap{
      .el-tabs__nav-scroll{
        .el-tabs__nav{
          .el-tabs__active-bar{
            position: absolute;
            border-radius: .375rem;
            content: "";
            background-color: #fea032;
            width: 48px;
            height: 7px;
            bottom: 0px;
            transform: translate(-50%)
          }

          .el-tabs__item.is-active{
            font-weight: 700;
            font-size: 20px;
            color: #333
          }
        }
      }
    }
  }
  .el-tabs__nav-wrap::after{
    display: none;
  }
}

::v-deep .el-button--primary {
  color: #FFFFFF;
  background-color: #fea032;
  border-color: #fea032;
}

::v-deep  .el-button--primary.is-disabled, .el-button--primary.is-disabled:hover, .el-button--primary.is-disabled:focus, .el-button--primary.is-disabled:active {
  background: rgb(255, 208, 153);
  border: rgb(255, 208, 153);
}




.login-tip {
  font-size: 16px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 30%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}

.login-code-img {
  height: 36px;
  width: 80px;
}
</style>
