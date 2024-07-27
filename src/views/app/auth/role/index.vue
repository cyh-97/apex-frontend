<template>
  <div class="app-container">

    <!-- 查询参数form -->
    <el-form :model="queryParams"
             ref="queryForm"
             v-show="showSearch"
             :inline="true">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="queryParams.roleName"
                  placeholder="请输入角色名称"
                  clearable size="small"
                  style="width: 240px"
                  @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status"
                   placeholder="角色状态"
                   clearable
                   size="small"
                   style="width: 240px">
          <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 功能按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['auth:role:add']">新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getListFromApi"></right-toolbar>
    </el-row>

    <!-- 数据列表 -->
    <el-table v-loading="loading" :data="roleList" highlight-current-row>
      <el-table-column label="编号" align="center" prop="id" width="160"  />
      <el-table-column label="名称" align="center" prop="roleName" />
      <el-table-column label="显示顺序" align="center" prop="orderNum"/>
      <el-table-column label="权限字符" align="center" prop="roleKey" />
      <el-table-column label="权限范围" align="center" prop="dataScope" :formatter="dataScopeFormat"/>
      <el-table-column label="状态" align="center" width="90">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.status" :disabled="scope.row.roleKey === 'admin'" :active-value='1' :inactive-value='0'
            @change="handleStatusChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="用户个数" align="center" prop="userNum" width="90" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="150" />
      <el-table-column label="备注" align="center" prop="remark" width="150" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button v-if="scope.row.roleKey !== 'admin'" size="mini" type="text" icon="el-icon-edit" @click.stop="handleUpdate(scope.row)" v-hasPermi="['auth:role:edit']">修改</el-button>
          <el-button v-if="scope.row.roleKey !== 'admin'" size="mini" type="text" icon="el-icon-delete" @click.stop="handleDelete(scope.row)" v-hasPermi="['auth:role:delete']">删除</el-button>
          <el-dropdown size="mini" @command="(command) => handleCommand(command, scope.row)" v-hasPermi="['auth:role:edit']">
            <span class="el-dropdown-link">
              <i class="el-icon-d-arrow-right el-icon--right"></i>更多
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="scope.row.roleKey !== 'admin'" command="handleAssignMenu" icon="el-icon-circle-check" v-hasPermi="['auth:role:authorize']">菜单权限</el-dropdown-item>
              <el-dropdown-item command="handleAuthUser" icon="el-icon-user" v-hasPermi="['auth:role:assign']">分配用户</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getListFromApi" />

    <!-- 角色菜单弹框 -->
    <el-dialog title="角色功能菜单分配" :visible.sync="showRoleAssignMenu" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="菜单搜索">
          <el-input placeholder="请输入关键字进行过滤" v-model="searchText"></el-input>
        </el-form-item>
        <el-form-item label="权限字符">
          {{form.roleKey}}
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheck" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree class="tree-border" :data="menuOptions" show-checkbox ref="menu" node-key="id" :check-strictly="!form.menuCheck"
            empty-text="加载中，请稍后" :filter-node-method="menuFilterNode" :props="defaultProps"></el-tree>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitAssignMenu" v-hasPermi="['auth:role:authorize']">保存</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :lg="12">
            <el-form-item label="角色名称" prop="roleName">
              <el-input v-model="form.roleName" placeholder="请输入角色名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="权限字符" prop="roleKey">
              <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="角色顺序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="数据范围">
              <el-select v-model="form.dataScope" @change="dataScopeSelectChange">
                <el-option v-for="item in dataScopeOptions" :key=item.dictValue :label="item.dictLabel" :value=item.dictValue></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusOptions" :key=dict.dictValue :label=parseInt(dict.dictValue)>{{ dict.dictLabel }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="数据权限" v-show="form.dataScope === 2">
              <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')">展开/折叠</el-checkbox>
              <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')">全选/全不选</el-checkbox>
              <el-checkbox v-model="form.deptCheck" @change="handleCheckedTreeConnect($event, 'dept')">父子联动</el-checkbox>
              <el-tree class="tree-border"
                       :data="deptOptions"
                       :expand-on-click-node="false"
                       :highlight-current="true"
                       show-checkbox
                       accordion
                       default-expand-all
                       ref="dept"
                       node-key="id"
                       check-strictly
                       check-on-click-node
                       empty-text="加载中，请稍候"
                       :props="defaultProps"/>
            </el-form-item>
          </el-col>
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

  </div>
</template>

<script>
import {
  addRole,
  assignMenu,
  changeRoleStatus,
  delRole,
  detailRole,
  getRoleDeptTree,
  getRoleMenuTree,
  listRole,
  updateRole
} from '@/api/auth/role'

import { getDeptTree } from '@/api/auth/dept'
import { getAdminRoleId } from '@/utils/common'

export default {
  name: 'role',
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 表格高度
      tableHeight: window.innerHeight,
      // 总条数
      total: 0,
      // 角色表格数据
      roleList: [],
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      menuExpand: true,
      menuNodeAll: false,
      deptExpand: true,
      deptNodeAll: false,
      // 日期范围
      dateRange: [],
      // 状态数据字典
      statusOptions: [],
      // 是否显示下拉菜单分配
      showRoleAssignMenu: false,
      // 数据范围选项
      dataScopeOptions: [
        {
          dictValue: 1,
          dictLabel: '全部'
        },
        {
          dictValue: 2,
          dictLabel: "自定义",
        },
        {
          dictValue: 3,
          dictLabel: '本部门'
        },
        {
          dictValue: 4,
          dictLabel: "本部门及以下数据权限",
        },
        {
          dictValue: 5,
          dictLabel: '仅本人'
        }
      ],
      // 菜单列表
      menuOptions: [],
      // 部门列表
      deptOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        roleName: undefined,
        roleKey: undefined,
        status: undefined
      },
      searchText: '',
      // 表单参数
      form: { },
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      // 表单校验
      rules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ],
        roleKey: [
          { required: true, message: '权限字符不能为空', trigger: 'blur' }
        ],
        roleSort: [
          { required: true, message: '角色顺序不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    searchText(val) {
      this.$refs.menu.filter(val)
    }
  },
  created() {
    this.getListFromApi()
    this.getDicts('sys_status').then((response) => {
      this.statusOptions = response.data
    })
  },
  methods: {

    /** 查询角色列表👌 */
    getListFromApi() {
      this.loading = true
      listRole(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.roleList = response.data.result
          this.total = response.data.totalNum
          this.loading = false
        }
      ).catch(
        (err) => {
          this.loading = false;
        }
      );
    },

    /** 查询部门树结构👌 */
    getDeptTreeFromApi() {
      getDeptTree().then((response) => {
        this.deptOptions = response.data
      })
    },

    /** 修改 根据角色ID查询部门树结构👌 */
    getRoleDeptTreeFromApi(roleId) {
      return getRoleDeptTree(roleId).then((response) => {
        this.deptOptions = response.data.deptTree
        return response
      })
    },

    /** 根据角色ID查询菜单树结构👌 */
    getRoleMenuTreeFromApi(roleId) {
      return getRoleMenuTree(roleId).then((response) => {
        this.menuOptions = response.data.menuTree
        return response
      })
    },

    /** 搜索按钮操作👌 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getListFromApi()
    },

    /** 重置按钮操作👌 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },

    /** 新增按钮操作👌 */
    handleAdd() {
      this.reset()
      this.getDeptTreeFromApi()
      this.open = true
      this.title = '添加角色'
      this.showRoleAssignMenu = false
    },

    /** 修改按钮操作👌 */
    handleUpdate(row) {
      this.reset();
      this.showRoleAssignMenu = false;
      const roleId = row.id;
      const roleDeptTreeselect = this.getRoleDeptTreeFromApi(row.id);
      detailRole(roleId).then((response) => {
        this.form = response.data
        this.open = true
        this.title = '修改角色'
        this.$nextTick(() => {
          roleDeptTreeselect.then((res) => {
            this.$refs.dept.setCheckedKeys(res.data.checkedDeptIdList)
          })
        })
      })
    },

    /** 新增与修改 提交按钮👌 */
    submitForm: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined && this.form.id > 0) {
            this.form.deptIds = this.getDeptAllCheckedKeys()
            updateRole(this.form.id, this.form).then((response) => {
              this.msgSuccess('修改成功')
              this.open = false
              this.getListFromApi()
            })
          } else {
            this.form.deptIds = this.getDeptAllCheckedKeys()
            addRole(this.form).then((response) => {
              console.log(response)
              this.open = false
              if (response.code === 200) {
                this.msgSuccess('新增成功')
                this.getListFromApi()
              } else {
                this.msgInfo(response.msg)
              }
            })
          }
        }
      })
    },

    /** 数据权限 */
    dataScopeFormat(row, column) {
      return this.selectDictLabel(this.dataScopeOptions, row.dataScope)
    },

    /** 新增与修改 获取选择的所有部门节点数据👌 */
    getDeptAllCheckedKeys() {
      return this.$refs.dept.getCheckedKeys()
    },

    /** 选择角色权限范围触发👌 */
    dataScopeSelectChange(value) {
      if (value !== 2) {
        this.$refs.dept.setCheckedKeys([])
      }
    },

    /** 树权限（展开/折叠）👌 */
    handleCheckedTreeExpand(value, type) {
      if (type === 'menu') {
        const treeList = this.menuOptions
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.menu.store.nodesMap[treeList[i].id].expanded = value
        }
      } else if (type === 'dept') {
        const treeList = this.deptOptions
        for (let i = 0; i < treeList.length; i++) {
          this.$refs.dept.store.nodesMap[treeList[i].id].expanded = value
        }
      }
    },

    /** 树权限（全选/全不选）👌 */
    handleCheckedTreeNodeAll(value, type) {
      if (type === 'menu') {
        if (value) {
          this.$refs.menu.setCheckedNodes(this.menuOptions)
        } else {
          this.$refs.menu.setCheckedKeys([])
        }
      } else if (type === 'dept') {
        if (value) {
          this.$refs.dept.setCheckedNodes(this.deptOptions)
        } else {
          this.$refs.dept.setCheckedKeys([])
        }
      }
    },

    /** 树权限（父子联动）👌 */
    handleCheckedTreeConnect(value, type) {
      if (type === 'menu') {
        this.form.menuCheck = !!value
      } else if (type === 'dept') {
        this.form.deptCheck = !!value
      }
    },

    /** 菜单筛选👌 */
    menuFilterNode(value, data) {
      if (!value) return true
      return data.label.indexOf(value) !== -1
    },

    /** 角色状态修改👌 */
    handleStatusChange(row) {
      const text = row.status === 1 ? '启用' : '停用'
      this.$confirm(
        '确认要"' + text + '""' + row.roleName + '"角色吗?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return changeRoleStatus(row.id, row.status)
        })
        .then(() => {
          this.msgSuccess(text + '成功')
        })
        .catch(function() {
          row.status = row.status === 0 ? 1 : 0
        })
    },

    /** 删除按钮操作👌 */
    handleDelete(row) {
      const roleIds = row.id || this.ids
      this.$confirm(
        '是否确认删除角色编号为"' + roleIds + '"的数据项?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(function() {
          return delRole(roleIds)
        })
        .then(() => {
          this.getListFromApi()
          this.msgSuccess('删除成功')
        })
    },

    /** 更多操作触发👌 */
    handleCommand(command, row) {
      switch (command) {
        case 'handleAssignMenu':
          this.handleAssignMenu(row)
          break
        case 'handleAuthUser':
          this.handleAuthUser(row)
          break
        default:
          break
      }
    },

    /** 分配角色权限按钮操作👌 */
    handleAssignMenu(row) {
      if (row.id === getAdminRoleId()) {
        this.showRoleAssignMenu = false;
        return;
      }
      this.reset();
      this.showRoleAssignMenu = true;
      const roleId = row.id || this.ids;
      const roleMenu = this.getRoleMenuTreeFromApi(roleId);
      let that = this
      this.$nextTick(() => {
        roleMenu.then((res) => {
          //hat.$refs.menu.setCheckedKeys(res.data.checkedMenuIdList)
          res.data.checkedMenuIdList.forEach(value => {
            this.$refs.menu.setChecked(value, true, false);
          })
        })
      })

      this.form = {
        id: row.id,
        roleId: row.id,
        roleName: row.roleName,
        roleKey: row.roleKey,
        menuCheck: row.menuCheck
      }
    },

    /** 分配用户操作👌 */
    handleAuthUser: function(row) {
      const roleId = row.id
      this.$router.push({ path: '/auth/roleusers', query: { roleId }})
    },

    /** 菜单权限 提交按钮👌 */
    submitAssignMenu: function() {
      if (this.form.id !== undefined) {
        this.form.menuIds = this.getMenuAllCheckedKeys()
        assignMenu(this.form).then((response) => {
          this.msgSuccess('修改成功')
          this.getListFromApi()
          this.cancel()
        })
      } else {
        this.msgError('请选择角色')
      }
    },

    /** 获取选择的所有菜单节点数据👌 */
    getMenuAllCheckedKeys() {
      let ids = []
      ids = ids.concat(this.$refs.menu.getCheckedKeys())
      ids = ids.concat(this.$refs.menu.getHalfCheckedKeys())
      return ids
    },

    /** 取消按钮👌 */
    cancel() {
      this.open = false
      this.showRoleAssignMenu = false
      this.reset()
    },

    /** 表单重置👌 */
    reset() {
      if (this.$refs.menu !== undefined) {
        this.$refs.menu.setCheckedKeys([])
      }
      this.menuExpand = false
      this.menuNodeAll = false
      this.deptExpand = true
      this.deptNodeAll = false
      this.form = {
          id: undefined,
          roleName: undefined,
          roleKey: undefined,
          orderNum: 99,
          status: 1,
          menuIds: [],
          deptIds: [],
          dataScope: 1,
          menuCheck: 1,
          deptCheck: 1,
          remark: undefined
      }
      this.resetForm('form')
    },

  }
}
</script>

<style scoped>
.tree-border {
  margin-top: 5px;
  border: 1px solid #e5e6e7;
  background: #ffffff none;
  border-radius: 4px;
}
</style>
