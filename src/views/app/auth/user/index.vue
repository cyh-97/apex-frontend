<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!-- 部门筛选及部门树 -->
      <el-col :lg="5" :sm="24">
        <div class="head-container">
          <el-input v-model="deptName"
                    placeholder="请输入部门名称"
                    clearable
                    size="small"
                    prefix-icon="el-icon-search"
                    style="margin-bottom: 20px" />
        </div>
        <div class="head-container">
          <el-tree :data="deptOptions"
                   :props="defaultProps"
                   :expand-on-click-node="false"
                   :highlight-current="true"
                   ref="tree"
                   accordion
                   show-checkbox
                   check-strictly
                   node-key = "id"
                   check-on-click-node
                   :filter-node-method="filterDeptNode"
                   @check-change="handleNodeChange"
                   @check="handleNodeClick" />
        </div>
      </el-col>

      <!-- 用户数据 -->
      <el-col :lg="18" :sm="24">

        <!-- 查询参数form -->
        <el-form :model="queryParams"
                 ref="queryForm"
                 :inline="true"
                 v-show="showSearch"
                 label-width="68px">

          <el-form-item label="用户名称" prop="userName">
            <el-input v-model="queryParams.userName"
                      placeholder="请输入用户名称"
                      clearable
                      size="small"
                      style="width: 240px"
                      @keyup.enter.native="handleQuery" />
          </el-form-item>

          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="queryParams.phone"
                      placeholder="请输入手机号码"
                      clearable
                      size="small"
                      style="width: 240px"
                      @keyup.enter.native="handleQuery" />
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status"
                       placeholder="用户状态"
                       clearable
                       size="small"
                       style="width: 240px">
              <el-option v-for="dict in statusOptions"
                         :key="dict.dictValue"
                         :label="dict.dictLabel"
                         :value="dict.dictValue" />
            </el-select>
          </el-form-item>

          <el-form-item label="创建时间">
            <el-date-picker v-model="dateRange"
                            size="small"
                            style="width: 240px"
                            value-format="yyyy-MM-dd"
                            type="daterange"
                            range-separator="-"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"/>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>

        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary"
                       plain icon="el-icon-plus"
                       size="mini"
                       @click="handleAdd"
                       v-hasPermi="['auth:user:add']">新增</el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button type="info"
                       plain icon="el-icon-upload2"
                       size="mini"
                       @click="handleImport"
                       v-hasPermi="['auth:user:import']">导入</el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button type="warning"
                       plain icon="el-icon-download"
                       size="mini"
                       @click="handleExport"
                       v-hasPermi="['auth:user:export']">导出</el-button>
          </el-col>

          <right-toolbar :showSearch.sync="showSearch" @queryTable="getListFromApi" :columns="columns"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="userList">
          <el-table-column label="编号" align="center" prop="id" width="150" />
          <el-table-column label="账号" align="center" width="120" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <div v-if="checkPermi(['auth:user:detail'])">
                <el-button type="text" @click="showDetail(scope.row)">{{ scope.row.userCode }}</el-button>
              </div>
              <div v-else>
                <el-button type="text" disabled>{{ scope.row.userCode }} </el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="姓名" align="center" prop="userName" width="120" :show-overflow-tooltip="true" />
          <el-table-column label="头像" prop="avatar" width="50">
            <template slot-scope="scope">
              <el-image v-if="scope.row.avatar" :lazy='true' :src="scope.row.avatar" />
              <avatar
                v-else
                :username="scope.row.userName"
                color="#fff"
                :initials="extractLastName(scope.row.userName)"
                :background-color="extractColorByName(scope.row.userName)"
                :size="30"
                :customStyle="{ margin: '0 auto' }"/>
            </template>
          </el-table-column>
          <el-table-column label="部门" align="center" prop="deptName" width="240" :show-overflow-tooltip="true" />
          <el-table-column label="手机号码" align="center" prop="phone" width="120" />
          <el-table-column label="用户状态" align="center">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.status" :disabled="scope.row.id === getAdminUserId()" :active-value="1" :inactive-value="0" @change="handleStatusChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="160"></el-table-column>
          <el-table-column label="登录IP" align="center" prop="loginIp" width="150" v-if="columns[0].checked" />
          <el-table-column label="最后登录时间" align="center" prop="loginDate" width="150" v-if="columns[1].checked">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="创建人" align="center" prop="createBy" width="150" v-if="columns[2].checked"></el-table-column>
          <el-table-column label="备注" align="center" prop="remark" width="150" v-if="columns[3].checked"></el-table-column>
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="200">
            <template slot-scope="scope" v-if="scope.row.id !== getAdminUserId()">
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['auth:user:edit']">修改</el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['auth:user:delete']">删除</el-button>
              <el-button size="mini" type="text" icon="el-icon-key" @click="handleResetPwd(scope.row)" v-hasPermi="['auth:user:reset_pwd']">重置</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getListFromApi" />
      </el-col>
    </el-row>

    <!-- 明细对话框 -->
    <el-dialog :title="detail.title" :visible.sync="detail.open" width="800px">
      <el-form ref="form" :model="form" label-width="80px">
        <el-row>
          <el-col :lg="12">
            <el-form-item label="用户账号" prop="userCode">
              <el-input v-bind:value="form.userCode" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="用户union" prop="unionId">
              <el-input v-bind:value="form.unionId" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :lg="12">
            <el-form-item label="用户名称" prop="userName">
              <el-input v-bind:value="form.userName" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="归属部门" prop="deptId">
              <treeselect v-bind:value="form.deptId" :options="deptOptions" :show-count="true" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :lg="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-bind:value="form.phone" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="电子邮箱">
              <el-input v-bind:value="form.email" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :lg="12">
            <el-form-item label="用户性别">
              <el-select v-bind:value="form.sex">
                <el-option v-for="dict in sexOptions" :key=parseInt(dict.dictValue) :label="dict.dictLabel" :value=parseInt(dict.dictValue)></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="用户状态">
              <el-radio-group v-bind:value="form.status">
                <el-radio v-for="dict in statusOptions" :key=parseInt(dict.dictValue) :label=parseInt(dict.dictValue)>{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :lg="12">
            <el-form-item label="岗位">
              <el-select v-bind:value="form.postIds" multiple>
                <el-option v-for="item in postOptions" :key=item.id :label="item.postName" :value=item.id :disabled="item.status === 1">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="角色">
              <el-select v-bind:value="form.roleIds" multiple @change="selectRole($event)">
                <el-option v-for="item in roleOptions" :key=item.id :label="item.roleName" :value=item.id :disabled="item.status === 1">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :lg="24">
            <el-form-item label="备注">
              <el-input v-bind:value="form.remark" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDetail">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row v-if="form.id === undefined">
          <el-col :lg="12">
            <el-form-item label="用户账号" prop="userCode">
              <el-input :disabled="form.id != undefined" v-model="form.userCode" placeholder="请输入用户账号(用于登陆)" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="用户密码" prop="password">
              <el-input :disabled="form.id != undefined" v-model="form.password" placeholder="请输入用户密码" type="password" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :lg="12">
            <el-form-item label="用户名称" prop="userName">
              <el-input v-model="form.userName" placeholder="请输入用户名称(一般是姓名)" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="归属部门" prop="deptId">
              <treeselect v-model="form.deptId" :options="deptOptions" :show-count="true" placeholder="请选择归属部门" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :lg="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号码" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="电子邮箱">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :lg="12">
            <el-form-item label="用户性别">
              <el-select v-model="form.sex" placeholder="请选择用户性别">
                <el-option v-for="dict in sexOptions" :key=parseInt(dict.dictValue) :label="dict.dictLabel" :value=parseInt(dict.dictValue)></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="用户状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusOptions" :key=parseInt(dict.dictValue) :label=parseInt(dict.dictValue)>{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :lg="12">
            <el-form-item label="岗位">
              <el-select v-model="form.postIds" multiple placeholder="请选择">
                <el-option v-for="item in postOptions" :key=item.id :label="item.postName" :value=item.id >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="角色">
              <el-select v-model="form.roleIds" multiple placeholder="请选择" @change="selectRole($event)">
                <el-option v-for="item in roleOptions" :key=item.id :label="item.roleName" :value=item.id >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :lg="24">
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 用户导入对话框 -->
    <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
      <el-upload name="file" ref="upload" :limit="1" accept=".xlsx, .xls" :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport" :disabled="upload.isUploading" :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess" :auto-upload="false" drag>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="downloadTemplate">下载模板</el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listUser,
  detailUser,
  delUser,
  addUser,
  updateUser,
  exportUser,
  resetUserPwd,
  changeUserStatus,
} from "@/api/auth/user";
import { getDeptTree } from '@/api/auth/dept';
import { getToken } from "@/utils/auth";
import { parseTime, getAdminUserId, extractLastName, extractColorByName } from '@/utils/common'

import defaultSettings from '@/settings';
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import { checkPermi } from '@/utils/permission'
import Avatar from 'vue-avatar/src/Avatar.vue'

export default {
  name: "user",
  components: { Avatar, Treeselect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中userId数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 用户表格数据
      userList: [],
      // 弹出层标题
      title: "",
      // 部门树选项
      deptOptions: undefined,
      // 是否显示弹出层
      open: false,
      // 部门名称
      deptName: undefined,
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 性别状态字典
      sexOptions: [],
      // 岗位选项
      postOptions: [],
      // 角色选项
      roleOptions: [],
      // 表单参数
      form: {},
      // 部门树数据结构
      defaultProps: {
        children: "children",
        label: "label",
      },
      // 明细
      detail: {
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: "",
      },
      // 用户导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/SysUser/ImportUser",
      },
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: undefined,
        phone: undefined,
        status: undefined,
        deptId: undefined,
      },
      // 列信息
      columns: [
        { key: 0, label: `登录IP`, checked: false },
        { key: 1, label: `最后登录时间`, checked: false },
        { key: 2, label: `创建人`, checked: false },
        { key: 3, label: `备注`, checked: false },
      ],
      // 表单校验
      rules: {
        userCode: [
          { required: true, message: "用户账号不能为空", trigger: "blur" },
        ],
        userName: [
          { required: true, message: "用户名称不能为空", trigger: "blur" },
        ],
        deptId: [
          { required: true, message: "归属部门不能为空", trigger: "change" },
        ],
        password: [
          { required: true, message: "用户密码不能为空", trigger: "blur" },
        ],
        email: [
          { required: false, message: "邮箱地址不能为空", trigger: "blur" },
          {
            type: "email",
            message: "'请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        phone: [
          { required: false, message: "手机号码不能为空", trigger: "blur" },
          {
            pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            message: "请输入正确的手机号码",
            trigger: "blur",
          },
        ],
      },
    };
  },
  watch: {
    // 根据名称筛选部门树
    deptName(val) {
      this.$refs.tree.filter(val);
    },
  },
  created() {
    this.getListFromApi();
    this.getDeptTreeFromApi();

    const dictParams = [
      { dictType: 'sys_status', columnName: 'statusOptions' },
      { dictType: 'sys_user_sex', columnName: 'sexOptions' }
    ]

    // 批量获取字典值
    this.getDicts(dictParams).then((response) => {
      response.data.forEach((element) => {
        this[element.columnName] = element.list
      })
    })
  },
  methods: {
    extractColorByName,
    extractLastName,
    checkPermi,
    getAdminUserId,
    parseTime,

    /** 查询部门下拉树结构👌 */
    getDeptTreeFromApi() {
      getDeptTree().then((response) => {
        this.deptOptions = response.data;
      });
    },

    /** 查询用户列表👌 */
    getListFromApi() {
      this.loading = true;
      listUser(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.userList = response.data.result;
          this.total = response.data.totalNum;
          this.loading = false;
        }
      ).catch(
        (err) => {
          this.loading = false;
        }
      );
    },

    /** 筛选部门树节点👌 */
    filterDeptNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },

    /** 切换部门树节点👌  */
    handleNodeChange(data, checked, node) {
      if(checked) {
        this.queryParams.deptId = data.id;
        this.$refs.tree.setCheckedKeys([data.id]);
      } else {
        if (this.queryParams.deptId === data.id) {
          this.queryParams.deptId = undefined;
          this.$refs.tree.setCheckedKeys([]);
        }
      }
    },

    /** 点击部门树节点👌 */
    handleNodeClick(data, checked) {
      if(checked.checkedKeys.length > 0){
        this.queryParams.deptId = data.id;
        this.$refs.tree.setCheckedKeys([data.id],true);
      } else {
        this.queryParams.deptId = undefined;
        this.$refs.tree.setCheckedKeys([]);
      }

      this.getListFromApi();
    },

    /** 搜索按钮操作👌 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getListFromApi();
    },

    /** 重置按钮操作👌 */
    resetQuery() {
      this.dateRange = [];
      this.queryParams.deptId = undefined;
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 新增按钮操作👌 */
    handleAdd() {
      this.reset();
      this.getDeptTreeFromApi();
      detailUser(-1).then((response) => {
        this.postOptions = response.data.posts;
        this.roleOptions = response.data.roles;
        this.open = true;
        this.title = "添加用户";
      });
    },

    /** 导入按钮操作 */
    handleImport() {
      this.upload.title = "用户导入";
      this.upload.open = true;
    },

    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所筛选的全部用户?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        await exportUser(queryParams)
      });
    },

    /** 用户状态修改👌 */
    handleStatusChange(row) {
      let text = row.status === 0 ? "停用" : "启用";
      this.$confirm(
        '确认要"' + text + '""' + row.userName + '"用户吗?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return changeUserStatus(row.id, row.status);
        })
        .then(() => {
          this.msgSuccess(text + "成功");
        })
        .catch(function () {
          row.status = row.status === 0 ? 1 : 0;
        });
    },

    /** 修改按钮操作👌 */
    handleUpdate(row) {
      this.reset();
      this.getDeptTreeFromApi();
      const userId = row.id || this.ids;

      detailUser(userId).then((response) => {
        let data = response.data;
        this.form = {
          id: data.id,
          deptId: data.profile.deptId,
          userCode: data.profile.userCode,
          userName: data.profile.userName,
          password: "",
          phone: data.profile.phone,
          email: data.profile.email,
          sex: data.profile.sex,
          status: data.profile.status,
          remark: data.profile.remark,
          postIds: data.profile.posts,
          roleIds: data.profile.roles,
        };
        this.roleOptions = response.data.roles;
        this.postOptions = response.data.posts;

        this.open = true;
        this.title = "修改用户";
      });
    },

    /** 重置密码按钮操作 */
    handleResetPwd(row) {
      this.$prompt('请输入"' + row.userName + '"的新密码', "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      })
        .then(({ value }) => {
          resetUserPwd(row.id, value).then((response) => {
            this.msgSuccess("修改成功，新密码是：" + value);
          });
        })
        .catch(() => {});
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const userId = row.id;
      if (userId === getAdminUserId()) {
        this.msgError("不能对管理进行删除");
        return;
      }
      this.$confirm(
        '是否确认删除用户编号为"' + userId + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delUser(userId);
        })
        .then(() => {
          this.getListFromApi();
          this.msgSuccess("删除成功");
        });
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateUser(this.form.id, this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getListFromApi();
            });
          } else {
            addUser(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getListFromApi();
            });
          }
        }
      });
    },

    /** 下载模板操作 */
    downloadTemplate() {
      this.download("/SysUser/DownloadTemplate", "用户数据导入模板");
    },

    /** 提交上传文件 */
    submitFileForm() {
      this.$refs.upload.submit();
    },

    /** 文件上传中处理 */
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },

    /** 文件上传成功处理 */
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.data, "导入结果", { dangerouslyUseHTMLString: true });
      this.getListFromApi();
    },

    /** 表单重置 */
    reset() {
      this.form = {
        userId: undefined,
        deptId: undefined,
        userName: undefined,
        nickName: undefined,
        password: undefined,
        phone: undefined,
        email: undefined,
        sex: undefined,
        status: "0",
        remark: undefined,
        postIds: [],
        roleIds: [],
      };
      this.resetForm("form");
    },

    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 展示明细 */
    showDetail(row) {
      this.getDeptTreeFromApi();
      const userId = row.id || this.ids;

      detailUser(userId).then((response) => {
        let data = response.data;
        this.form = {
          id: data.id,
          deptId: data.profile.deptId,
          userCode: data.profile.userCode,
          userName: data.profile.userName,
          password: "",
          phone: data.profile.phone,
          email: data.profile.email,
          sex: data.profile.sex,
          status: data.profile.status,
          unionId: data.profile.unionId,
          remark: data.profile.remark,
          postIds: data.profile.posts,
          roleIds: data.profile.roles,
        };
        this.roleOptions = response.data.roles;
        this.postOptions = response.data.posts;
        this.detail.open = true;
        this.detail.title = "用户详情";
      });
    },

    closeDetail() {
      this.detail.open = false;
    },

    /** 解决编辑时角色选中不了问题 */
    selectRole(e) {
      console.log(e, JSON.stringify(this.form));
      this.$forceUpdate();
    },
  },
};
</script>
