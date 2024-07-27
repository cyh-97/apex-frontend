<template>
  <div class="navbar">
    <!-- 展开折叠左边菜单栏 -->
    <hamburger
      id="hamburger-container"
      class="hamburger-container"
      :is-active="sidebar.opened"
      @toggleClick="toggleSideBar"/>

    <!-- 面包屑导航 -->
    <breadcrumb
      id="breadcrumb-container"
      class="breadcrumb-container"
      v-if="!topNav"/>
    <top-nav id="topmenu-container" class="topmenu-container" v-if="topNav" />

    <div class="right-menu">

      <template v-if="device !== 'mobile'">
        <div v-if="envInfo === 1">
          <el-alert
            title="请注意,这是测试环境！！"
            center
            type="error"
            :closable="false"/>
        </div>
        <div v-if="envInfo === 0">
          <el-alert
            title="请注意,这是开发环境！！"
            center
            type="error"
            :closable="false"/>
        </div>
        <search id="header-search" class="right-menu-item" />
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <size-select id="size-select" class="right-menu-item hover-effect" />
      </template>

      <el-dropdown
        class="avatar-container right-menu-item hover-effect"
        trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar" v-if="avatar" />
          <avatar
            v-else
            :username="name"
            color="#fff"
            :initials="extractLastName(name)"
            :background-color="extractColorByName(name)"
            :size="40"/>
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Breadcrumb from "@/components/Breadcrumb";
import TopNav from "@/components/TopNav";
import Hamburger from "@/components/Hamburger";
import Screenfull from "@/components/Screenfull";
import SizeSelect from "@/components/SizeSelect";
import Search from "@/components/HeaderSearch";
import Avatar from "vue-avatar";
import { extractColorByName, extractLastName } from '@/utils/common'

export default {
  components: {
    Breadcrumb,
    TopNav,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    Avatar,
  },
  data() {
    return {
      isShowUserNewsPopover: false,
    };
  },
  computed: {
    ...mapGetters(["sidebar", "avatar", "device", "name"]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings;
      },
      set(val) {
        this.$store.dispatch("settings/changeSetting", {
          key: "showSettings",
          value: val,
        });
      },
    },
    topNav: {
      get() {
        return this.$store.state.settings.topNav;
      },
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
  methods: {
    extractColorByName,
    extractLastName,
    toggleSideBar() {
      this.$store.dispatch("app/toggleSideBar");
    },
    async logout() {
      this.$confirm("确定注销并退出系统吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.$store.dispatch("Logout").then(() => {
          location.href = process.env.VUE_APP_ROUTER_PREFIX;
        });
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.el-menu {
  display: inline-table;
  line-height: 46px !important;
  .el-menu-item {
    vertical-align: center;
  }
}
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 5px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
