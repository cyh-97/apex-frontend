<template>
  <div class="app-container">

    <!-- 查询参数form -->
    <el-form :inline="true" @submit.native.prevent>
      <el-form-item label="角色名">
        <el-input v-model="roleUserQueryParams.roleName" disabled />
      </el-form-item>
      <el-form-item label="角色字符串">
        <el-input v-model="roleUserQueryParams.roleKey" disabled />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="roleUserQueryParams.userName" placeholder="请输入用户名称" clearable prefix-icon="el-icon-search" @keyup.enter.native="searchAssignedUserList" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="searchAssignedUserList">搜索</el-button>
      </el-form-item>
    </el-form>

    <!-- 功能按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain size="mini" icon="el-icon-plus" @click="getUnAssignedUserListFromApi" v-hasPermi="['auth:roleusers:add']">添加用户
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain size="mini" icon="el-icon-circle-close" @click="cancelAuthUserAll" v-hasPermi="['auth:roleusers:delete']">批量取消授权</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="el-icon-close" size="mini" @click="handleClose">关闭</el-button>
      </el-col>
    </el-row>

    <!-- 数据列表 -->
    <el-table ref="roleUserTable" v-loading="loadingRoleUser" :data="dataRoleUserTable" row-key="userId" stripe border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="id" align="center" label="用户id" width="150" />
      <el-table-column prop="userCode" align="center" label="用户名" width="150" />
      <el-table-column prop="userName" align="center" label="用户昵称" width="150" />
      <el-table-column prop="email" align="center" label="邮箱" />
      <el-table-column prop="status" align="center" label="账号状态" width="80">
        <template slot-scope="scope">
					<dict-tag :options="statusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column prop="remark" :show-overflow-tooltip="true" align="center" label="备注" />
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-circle-close" @click="handleCancelPerm(scope.row)"  v-hasPermi="['auth:roleusers:delete']">取消授权</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="dataRoleUserCount" :page.sync="roleUserQueryParams.pageNum" :limit.sync="roleUserQueryParams.pageSize" @pagination="getAssignedUserListFromApi" />

    <!-- 添加或修改对话框 -->
    <el-dialog title="添加用户" :visible.sync="open" append-to-body @close="cancel">
      <el-form style="display:flex" :inline="true" @submit.native.prevent>
        <el-form-item style="margin-left:auto">
          <el-input v-model="userQueryParams.userName" placeholder="请输入用户名称" clearable prefix-icon="el-icon-search" @keyup.enter.native="searchUnAssignedUserList" />
        </el-form-item>
      </el-form>
      <el-row>
        <el-col>
          <el-table ref="userTable" v-loading="loadingUser" :data="dataUserTable" row-key="id" stripe border :height="tableHeight*0.5">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column prop="id" align="center" label="用户id" width="150" />
            <el-table-column prop="userCode" align="center" label="用户账号" width="150" />
            <el-table-column prop="userName" align="center" label="用户名称" width="150" />
            <el-table-column prop="status" align="center" label="用户状态">
              <template slot-scope="scope" label="操作">
                <i :style="scope.row.status === '0' ?'color:green':'color:red'"
                  :class="scope.row.status === '0' ? 'el-icon-success ':'el-icon-error'" />
              </template>
            </el-table-column>
          </el-table>
          <pagination :total="dataUserCount" :page.sync="userQueryParams.pageNum" :limit.sync="userQueryParams.pageSize" @pagination="getUnAssignedUserListFromApi" />
        </el-col>
      </el-row>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>

import { detailRole } from "@/api/auth/role";

import {
  getAssignedUserList,
  batchAssignUser,
  deleteRoleUsers,
  getUnAssignedUserList,
} from "@/api/auth/userRoles";
import { getAdminUserId } from '@/utils/common'
export default {
  name: "roleusers",
  data() {
    return {
      // 遮罩层
      loadingRole: false,
      loadingUser: false,
      loadingRoleUser: false,
      // 表格高度
      tableHeight: window.innerHeight,
      // 角色列表
      dataRoleTable: [],
      // 已添加用户列表
      dataRoleUserTable: [],
      dataRoleUserCount: 0,
      // 未添加用户列表
      dataUserTable: [],
      dataUserCount: 0,
      // 勾选添加用户列表
      addSelections: [],
      // 勾选删除用户列表
      delSelections: [],
      // 过滤查询
      search: "",
      // 角色id
      roleId: 0,
      // 是否显示弹出层
      open: false,
      // 角色用户查询参数
      roleUserQueryParams: {
        pageNum: 1,
        pageSize: 10,
        roleId: undefined,
        userName: undefined,
        roleName: undefined,
        roleKey: undefined,
      },
      userQueryParams: {
        pageNum: 1,
        pageSize: 10,
        roleId: undefined,
        userName: undefined,
      },
      // 状态字典
      statusOptions: [],
    };
  },
  created() {
    this.getDicts("sys_status").then((response) => {
      this.statusOptions = response.data;
    });

    let roleId = this.$route.query.roleId;
    if (roleId) {
      this.roleId = parseInt(roleId);
      detailRole(roleId).then((response) => {
        const { code, data } = response;
        if (code === 200) {
          this.roleUserQueryParams.roleName = data.roleName;
          this.roleUserQueryParams.roleKey = data.roleKey;
        }
      });
      this.searchAssignedUserList();
    } else {
      this.msgError("暂不支持");
    }
  },
  methods: {

    /** 获取角色用户(当前角色已分配的用户)👌 */
    getAssignedUserListFromApi() {
      this.loadingRoleUser = true;
      this.roleUserQueryParams.roleId = this.roleId;
      getAssignedUserList(this.roleUserQueryParams).then((response) => {
        this.dataRoleUserTable = response.data.result;
        this.dataRoleUserCount = response.data.totalNum;
        this.loadingRoleUser = false;
      });
    },

    /** 获取未添加角色列表👌 */
    getUnAssignedUserListFromApi() {
      this.open = true;
      this.loadingUser = true;
      this.userQueryParams.roleId = this.roleId;
      getUnAssignedUserList(this.userQueryParams).then((response) => {
        this.dataUserTable = response.data.result;
        this.dataUserCount = response.data.totalNum;
        this.loadingUser = false;
      });
    },

    /** 查询已分配👌 */
    searchAssignedUserList() {
      this.roleUserQueryParams.pageNum = 1;
      this.getAssignedUserListFromApi();
    },


    /** 查询未分配👌 */
    searchUnAssignedUserList() {
      this.userQueryParams.pageNum = 1;
      this.getUnAssignedUserListFromApi();
    },

    /** 新增用户角色👌 */
    handleSubmit() {
      this.addSelections = [];
      this.$refs.userTable.selection.forEach((element) => {
        this.addSelections.push(element.id);
      });
      batchAssignUser({
        roleId: this.roleId,
        userIds: this.addSelections,
      }).then((response) => {
        if (response.code === 200) {
          this.$message({
            message: "成功添加",
            type: "success",
          });
          this.getAssignedUserListFromApi();
          this.open = false;
        }
      });
    },

    /** 关闭按钮👌 */
    handleClose() {
      const obj = { path: "/auth/role" };
      this.$tab.closeOpenPage(obj);
    },

    /** 批量删除角色用户👌 */
    cancelAuthUserAll() {
      this.delSelections = [];
      this.$refs.roleUserTable.selection.forEach((element) => {
        this.delSelections.push(element.id);
      });
      if (this.delSelections.length === 0) {
        this.msgError("请选择要删除的用户");
        return;
      }
      this.$confirm(
        "是否确认删除选中的 " + this.delSelections.length + " 条数据?",
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          deleteRoleUsers({
            roleId: this.roleId,
            userIds: this.delSelections,
          }).then((response) => {
            if (response.code === 200) {
              this.$message({
                message: "成功删除",
                type: "success",
              });
              this.getAssignedUserListFromApi();
            }
          });
        })
        .catch(() => {});
    },

    /** 取消授权👌 */
    handleCancelPerm(row) {
      this.delSelections = [];
      this.delSelections.push(row.id);

      deleteRoleUsers({
        roleId: this.roleId,
        userIds: this.delSelections,
      }).then((response) => {
        if (response.code === 200) {
          this.$message({
            message: "成功删除",
            type: "success",
          });
          this.getAssignedUserListFromApi();
        }
      });
    },

    /** 取消👌 */
    cancel() {
      this.open = false;
    },
  },
};
</script>
