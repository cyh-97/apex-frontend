<template>
  <div class="nav_container" >
    <div id="main">
      <!--顶部导航栏-->
      <div class="navbar">
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
            <screenfull id="screenfull" class="right-menu-item hover-effect" />
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
              <router-link to="/admin" v-hasPermi="['auth:app:list']">
                <el-dropdown-item>后台管理</el-dropdown-item>
              </router-link>
              <el-dropdown-item divided @click.native="logout">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <!--
      <el-row type="flex" class="row-bg" justify="center">
        <el-col :xs="20" :sm="16" :md="12" :lg="8" id="col-search">
          <component-search></component-search>
        </el-col>
      </el-row>
      -->
      <div class="nav-photo"></div>

      <el-row type="flex" class="row-bg" justify="center" id="row-linkbox" >
        <el-col :span="22" :xs="24" id="col-linkbox">
          <el-tabs stretch>
            <el-tab-pane
              v-for="navTypeDict in navArr"
              :key="navTypeDict.dictValue"
              :label="navTypeDict.dictLabel">

              <el-collapse accordion v-model="activeCol">
                <el-collapse-item
                  v-for="(item_group, index) in getNavTypeGroup(navTypeDict.dictValue)"
                  :name="index">
                  <template slot="title">{{getNavTypeGroupName(item_group.groupName)}}
                  </template>
                  <div>
                    <el-row :gutter="20" class="item" style="margin: 0 10px -20px 10px; padding-top: 5px" >

                      <el-col
                        v-for="item_sub in getNavDetail(navTypeDict.dictValue, item_group.groupName)"
                        :key="item_sub.id"
                        :md="4"
                        :lg="4"
                        :xs="24"
                        class="item-sub-wrap"
                        @click.native="jumpLink(item_sub)">

                        <el-tooltip class="item" effect="dark" :content="
                      item_sub.description
                        ? item_sub.description
                        : item_sub.title
                    " placement="top-end">
                          <div class="item-sub">
                            <div>
                              <el-image
                                :src="item_sub.imageSrc"
                                :title="item_sub.title"
                                class="img-item">
                                <div slot="error" class="image-slot">
                                  <i class="el-icon-picture-outline"></i>
                                </div>
                              </el-image>
                            </div>

                            <div>
                              <div class="title-item"><strong>{{ item_sub.title }}</strong></div>
                              <div class="desc-item">{{item_sub.description}}</div>
                            </div>
                          </div>
                        </el-tooltip>

                      </el-col>
                    </el-row>
                  </div>

                </el-collapse-item>
              </el-collapse>

            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>


  </div>
</template>
<script>

import { mapGetters } from "vuex";
import Screenfull from '@/components/Screenfull/index.vue'
import Avatar from "vue-avatar";

import Search from '@/components/Nav/Search/index.vue'

import { extractColorByName, extractLastName } from '@/utils/common'
import { getAppNav } from '@/api/auth/app'
import { beisunToken } from '@/api/auth/login'

export default {
  data() {
    return {
      logo:require("../assets/logo/logo.png"),
      dictTypeList: [
        {"DictType":"sys_app_type"},
        {"DictType":"sys_app_type_group"}
      ],
      navArr:[],
      navDataArr:[],
      navGroupArr:[],
      activeCol:0
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
  created() {
    this.getDicts(this.dictTypeList).then((response) => {
      let typeInfoList = response.data.filter(x=> {return x.dictType === 'sys_app_type'});
      let groupInfoList = response.data.filter(x=> {return x.dictType === 'sys_app_type_group'});
      this.navArr = typeInfoList[0].list.filter(x => { return x.dictValue !== 'self_sys' });
      this.navGroupArr = groupInfoList[0].list;
    });
    this.getNavListFromApi();
  },
  methods: {
    extractColorByName,
    extractLastName,

    // 跳转链接
    jumpLink(item_sub) {
      //北森特殊处理
      if(item_sub.id== 3001)
      {
        this.getBeisunToken(item_sub.link)
      }else{
        window.open(item_sub.link);
      }
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
    },

    /** 查询岗位列表 */
    getNavListFromApi() {
      this.loading = true;
      getAppNav().then((response) => {
        this.navDataArr = response.data;
        this.loading = false;
      });
    },

    getNavTypeGroup(type) {
      let list = this.navDataArr.filter((item) => { return item.appType === type});
      if (list.length > 0) {
        return list[0].groupList
      } else return []
    },

    getNavTypeGroupName(group) {
      console.log(group);
      console.log(this.navGroupArr)
      let list = this.navGroupArr.filter((item) => { return item.dictValue === group});
      if (list.length > 0) {
        return list[0].dictLabel
      } else return '默认'
    },

    getNavDetail(type, group) {
      let list = this.navDataArr.filter((item) => { return item.appType === type});
      if (list.length > 0) {
        let groupList = list[0].groupList.filter((item) => { return item.groupName === group})
        if (groupList.length > 0) {
          return groupList[0].detailList
        }
        return []
      }
      else return []
    },
    
    //北森登录
    getBeisunToken(link)
    {
      beisunToken().then((res)=>{
        link = link.replace(/{id_token}/,res.data)
        link=encodeURI(link)
        window.open(link);
      })
     
    }

  },
  mounted() {
    this.$nextTick(() => {

    });
  },
  components: {
    Screenfull,
    Avatar,
    "component-search": Search,
  }
};
</script>
<style lang="scss" scoped>

.nav_container {
  height: 100%;
  //background-image: linear-gradient(rgba(50, 0, 0, 0.05) 1px, transparent 0), linear-gradient(90deg, rgba(50, 0, 0, 0.05) 1px, transparent 0);
  //background-size: 15px 15px;
  background-color: #F5EFE1;
  display: flex;
  flex-direction: column;
  #main {
    flex: 1;
    overflow-x: hidden;
    overflow-y: auto;
    box-sizing: border-box;
  }
}

// 头部
.navbar {
  height: 50px;
  overflow: hidden;
  position: sticky;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

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

#col-search {
  margin-top: 2%;
}

#row-linkbox {
  padding-top: 1rem;
}

#col-linkbox {
  padding: 1rem 0.5rem 0.5rem 0.5rem;
  border-radius: 4px;
}

.item {
  .item-sub-wrap {
    padding: 5px 5px;
    .item-sub {
      display: flex;
      align-items: center;
      padding: 10px 5px 5px 5px;
      height: 80px;
      border-radius: 3px;
      background-color: #fff;
      box-shadow: 0 0 4px #e8e8e8;
      .img-item {
        align-self: start;
        margin: 0 10px 0 10px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
      .title-item {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        overflow: hidden;
        font-size: 15px;
        color: #373e4a;
      }
      .desc-item {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        margin-top: 5px;
        font-size: 14px;
        height: 30px;
        color: #979898;
      }
      &:hover {
        cursor: pointer;
        box-shadow: 0 0 14px #b9b8b8;
        animation: zoom 0.8s ease-in-out;
      }
      @keyframes zoom {
        50% {
          transform: translateY(-6px);
        }
        100% {
          transform: translateY(0);
        }
      }
    }
  }
}

::v-deep .el-tabs{
  width: 95%!important;
  margin: 0 auto!important;
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

::v-deep .el-collapse-item__header {
  font-weight: bold;
  font-size: 14px;
  padding-left: 10px;
}

::v-deep .el-collapse-item__content {
  //background-image: linear-gradient(rgba(50, 0, 0, 0.05) 1px, transparent 0), linear-gradient(90deg, rgba(50, 0, 0, 0.05) 1px, transparent 0);
  //background-size: 15px 15px;
  background-color: #F5EFE1;
}


.nav-photo {
  height: 7vh;
  width: 100vw;
  background-image: url("../assets/logo/logo.png");
  //background-size: 55% 105%;
  background-repeat: no-repeat;
  margin-top: 40px;
  margin-left: 7%;
}

</style>
