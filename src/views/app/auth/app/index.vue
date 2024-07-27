<template>
  <div class="app-container">

    <!-- 查询参数form -->
    <el-form :model="queryParams"
             ref="queryForm"
             v-show="showSearch"
             :inline="true">
      <el-form-item label="应用编码" prop="appCode">
        <el-input v-model="queryParams.appCode"
                  placeholder="请输入应用编码"
                  clearable size="small"
                  style="width: 240px"
                  @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="应用名称" prop="appName">
        <el-input v-model="queryParams.appName"
                  placeholder="请输入应用名称"
                  clearable size="small"
                  style="width: 240px"
                  @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type"
                   placeholder="应用类型"
                   clearable
                   size="small"
                   style="width: 240px">
          <el-option v-for="dict in appTypeOptions"
                     :key="dict.dictValue"
                     :label="dict.dictLabel"
                     :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型分组" prop="groupName">
        <el-select v-model="queryParams.groupName"
                   placeholder="应用类型分组"
                   clearable
                   size="small"
                   style="width: 240px">
          <el-option v-for="dict in appTypeGroupOptions"
                     :key="dict.dictValue"
                     :label="dict.dictLabel"
                     :value="dict.dictValue" />
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
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['auth:app:add']">新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getListFromApi"></right-toolbar>
    </el-row>

    <!-- 数据列表 -->
    <el-table v-loading="loading" :data="appList" highlight-current-row>
      <el-table-column label="ID" align="center" prop="id" width="160"  />
      <el-table-column label="编号" align="center" prop="appCode" width="160"  />
      <el-table-column label="名称" align="center" prop="appName" width="160" />
      <el-table-column label="类型" align="center" prop="type" width="160">
        <template slot-scope="scope">
          <dict-tag :options="appTypeOptions" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="分组" align="center" prop="groupName" width="160">
        <template slot-scope="scope">
          <dict-tag :options="appTypeGroupOptions" :value="scope.row.groupName" />
        </template>
      </el-table-column>
      <el-table-column label="组内排序" align="center" prop="sortNum" width="160" />
      <el-table-column label="Icon" align="center" prop="icon" width="200">
        <template slot-scope="scope">
          <el-image v-if="scope.row.icon" :lazy='true' :src="scope.row.icon" style="width:32px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="appDesc" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope" v-if="scope.row.roleKey !== 'admin'">
          <el-button size="mini" type="text" icon="el-icon-edit" @click.stop="handleUpdate(scope.row)" v-hasPermi="['auth:app:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click.stop="handleDelete(scope.row)" v-hasPermi="['auth:app:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getListFromApi" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="应用编码" prop="appCode">
          <el-input v-model="form.appCode" placeholder="请输入应用编码" />
        </el-form-item>
        <el-form-item label="应用名称" prop="appName">
          <el-input v-model="form.appName" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="应用描述" prop="appDesc">
          <el-input v-model="form.appDesc" placeholder="请输入应用描述" />
        </el-form-item>
        <el-form-item label="应用URL" prop="url">
          <el-input v-model="form.url" placeholder="请输入应用URL" />
        </el-form-item>
        <el-form-item label="应用类型" prop="type">
          <el-select v-model="form.type" >
            <el-option v-for="dict in appTypeOptions" :key=dict.dictValue :label="dict.dictLabel" :value=dict.dictValue></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="应用类型分组" prop="groupName">
          <el-select v-model="form.groupName" >
            <el-option v-for="dict in appTypeGroupOptions" :key=dict.dictValue :label="dict.dictLabel" :value=dict.dictValue></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分组内排序" prop="sortNum">
          <el-input-number v-model="form.sortNum" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标" />
        </el-form-item>
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
  listApp,
  detailApp,
  updateApp,
  addApp,
  delApp
} from "@/api/auth/app";

export default {
  name: "post",
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
      // 总条数
      total: 0,
      // 应用表格数据
      appList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 状态数据字典
      statusOptions: [],
      // 应用模块类型数据字典
      appTypeOptions: [],
      // 应用模块类型分组数据字典
      appTypeGroupOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        appCode: undefined,
        appName: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        appCode: [
          { required: true, message: "编号不能为空", trigger: "blur" },
        ],
        appName: [
          { required: true, message: "名称不能为空", trigger: "blur" },
        ],
        type: [
          { required: true, message: "类型不能为空", trigger: "blur" },
        ],
        groupName: [
          { required: true, message: "分组不能为空", trigger: "blur" },
        ],
        sortNum: [
          { required: true, message: "排序不能为空", trigger: "blur" },
        ],
      },
      dictTypeList: [
        {"DictType":"sys_app_type"},
        {"DictType":"sys_app_type_group"}
      ],
    };
  },
  created() {
    this.getDicts(this.dictTypeList).then((response) => {
      let typeInfoList = response.data.filter(x=> {return x.dictType === 'sys_app_type'});
      let groupInfoList = response.data.filter(x=> {return x.dictType === 'sys_app_type_group'});
      this.appTypeOptions = typeInfoList[0].list;
      this.appTypeGroupOptions = groupInfoList[0].list;
    });
    this.getListFromApi();
  },
  methods: {

    /** 查询岗位列表 */
    getListFromApi() {
      this.loading = true;
      listApp(this.queryParams).then((response) => {
        this.appList = response.data.result;
        this.total = response.data.totalNum;
        this.loading = false;
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getListFromApi();
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加应用";
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const appId = row.id;
      detailApp(appId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改应用";
      });
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateApp(this.form.id, this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getListFromApi();
            });
          } else {
            addApp(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getListFromApi();
            });
          }
        }
      });
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const appIds = row.id;
      this.$confirm(
        '是否确认删除应用编号为"' + appIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delApp(appIds);
        })
        .then(() => {
          this.getListFromApi();
          this.msgSuccess("删除成功");
        });
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        appCode: undefined,
        appName: undefined
      };
      this.resetForm("form");
    }
  },
};
</script>

<style scoped>
.tree-border {
  margin-top: 5px;
  border: 1px solid #e5e6e7;
  background: #ffffff none;
  border-radius: 4px;
}
</style>
