<template>
  <div class="app-container">

    <!-- 查询参数form -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="策略编号" prop="dictName">
        <el-input v-model="queryParams.policyCode" placeholder="请输入策略编号" clearable size="small" style="width: 240px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="策略名称" prop="dictType">
        <el-input v-model="queryParams.policyName" placeholder="请输入策略名称" clearable size="small" style="width: 240px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 头部功能按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['maint:serialpolicy:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['maint:serialpolicy:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['maint:serialpolicy:delete']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getListFromApi"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="policyList" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="150" />
      <el-table-column label="编号" align="center" prop="code" width="150" />
      <el-table-column label="名称" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="前缀" align="center" prop="prefix" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="statusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>

      <el-table-column label="时间格式" align="center" prop="timeFormatType" :show-overflow-tooltip="true" />
      <el-table-column label="流水长度(不足长度补0)" align="center" prop="serialLength" :show-overflow-tooltip="true" />
      <el-table-column label="连接符" align="center" prop="connectStr" :show-overflow-tooltip="true" />
      <el-table-column label="当前值" align="center" prop="currentValue" :show-overflow-tooltip="true" />
      <el-table-column label="重置策略" align="center" prop="resetPolicy" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['maint:dict:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['maint:dict:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getListFromApi" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="字典状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label=parseInt(dict.dictValue)>{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="系统内置" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio v-for="dict in typeOptions" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dictDataVisible" width="60%" :lock-scroll="false">
      <dict-data :dictId="dictId"></dict-data>
    </el-dialog>

  </div>
</template>

<script>

import {
  listPolicy,
  detailPolicy,
  addPolicy,
  updatePolicy,
  delPolicy
} from "@/api/maint/serial";
import { checkPermi } from '@/utils/permission'

export default {
  name: "policy",
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
      // 策略表格数据
      policyList:[],
      // 总条数
      total: 0,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        policyCode: undefined,
        policyName: undefined
      },

      policyId: 0,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dictName: [
          { required: true, message: "字典名称不能为空", trigger: "blur" },
        ],
        dictType: [
          { required: true, message: "字典类型不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getListFromApi();
  },
  methods: {
    checkPermi,

    /** 查询策略列表👌 */
    getListFromApi() {
      this.loading = true;
      listPolicy(this.queryParams).then(
        (response) => {
          this.policyList = response.data.result;
          this.total = response.data.totalNum;
          this.loading = false;
        }
      ).catch((err) => {
        this.loading = false;
      });
    },

    /** 搜索按钮操作👌 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getListFromApi();
    },

    /** 重置按钮操作👌 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加流水策略";
    },

    /** 修改按钮操作👌 */
    handleUpdate(row) {
      this.reset();
      const policyId = row.id || this.ids;
      detailPolicy(policyId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改流水策略";
      });
    },

    /** 删除按钮操作👌 */
    handleDelete(row) {
      const policyIds = row.id || this.ids;
      this.$confirm(
        '是否确认删除字典编号为"' + policyIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(function () {
          return delPolicy(policyIds);
        })
        .then(() => {
          this.getListFromApi();
          this.msgSuccess("删除成功");
        });
    },

    /** 提交按钮👌 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updatePolicy(this.form.id, this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getListFromApi();
            });
          } else {
            addPolicy(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getListFromApi();
            });
          }
        }
      });
    },

    /** 取消按钮👌 */
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 表单重置👌 */
    reset() {
      this.form = {
        id: undefined,
        policyCode: undefined,
        policyName: undefined,
        status: 1,
        type: "N",
        remark: undefined,
      };
      this.resetForm("form");
    },

    /** 多选框选中数据👌 */
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
  },
};
</script>
