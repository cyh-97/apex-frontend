<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>个人信息</span>
          </div>
          <div>
            <div class="text-center">
              <img :src="userProfile.avatar" class="user-avatar" v-if="userProfile.avatar" />
              <avatar
                v-else
                :username="userProfile.userName"
                color="#fff"
                :initials="extractLastName(userProfile.userName)"
                :background-color="extractColorByName(userProfile.userName)"
                :size="100"
                :customStyle="{ margin: '0 auto' }"/>
            </div>
            <ul class="list-group list-group-striped">
              <li class="list-group-item">
                <svg-icon icon-class="user" />  用户名称
                <div class="pull-right">{{ userProfile.userName }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="phone" />  手机号码
                <div class="pull-right">{{ userProfile.phone }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="email" />  用户邮箱
                <div class="pull-right">{{ userProfile.email }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="tree" />  所属部门
                <div class="pull-right">{{ userProfile.deptFullName }} -- {{ userProfile.postStr }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon icon-class="peoples" />  所属角色
                <div class="pull-right">{{ userProfile.roleStr }}</div>
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="userProfile" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd :user="userProfile" />
            </el-tab-pane>

          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userInfo from './userInfo'
import resetPwd from './resetPwd'
import Avatar from 'vue-avatar'
import { getUserProfile } from '@/api/auth/user'
import { extractColorByName, extractLastName } from '@/utils/common'

export default {
  name: 'Profile',
  components: { userInfo, resetPwd, Avatar },
  data() {
    return {
      userProfile: {
        userName : ''
      },
      roles: '',
      posts: '',
      activeTab: 'userinfo',
      activeName: 'first'
    }
  },
  created() {
    this.getUser()
  },
  methods: {
    extractColorByName,
    extractLastName,
    getUser() {
      getUserProfile().then((response) => {
        this.userProfile = response.data
      })
    }
  }
}
</script>

<style scoped>
.list-group-striped > .list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
}

.list-group {
  padding-left: 0px;
  list-style: none;
}

.list-group-item {
  border-bottom: 1px solid #e7eaec;
  border-top: 1px solid #e7eaec;
  margin-bottom: -1px;
  padding: 11px 0px;
  font-size: 13px;
}

.pull-right {
  float: right !important;
}

.user-avatar {
  cursor: pointer;
  width: 100px;
  height: 100px;
  border-radius: 10px;
}
</style>
