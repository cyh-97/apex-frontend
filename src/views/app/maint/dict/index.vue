<template>
  <div class="app-container">

    <!-- 查询参数form -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="字典名称" prop="dictName">
        <el-input v-model="queryParams.dictName" placeholder="请输入字典名称" clearable size="small" style="width: 240px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="字典类型" prop="dictType">
        <el-input v-model="queryParams.dictType" placeholder="请输入字典类型" clearable size="small" style="width: 240px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="字典状态" clearable size="small" style="width: 240px">
          <el-option v-for="dict in statusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否内置" prop="type">
        <el-select v-model="queryParams.type" placeholder="是否内置" clearable size="small" style="width: 240px">
          <el-option v-for="dict in typeOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 头部功能按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['maint:dict:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['maint:dict:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['maint:dict:delete']">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getListFromApi"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table :data="typeList" border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字典编号" align="center" prop="id" width="150" />
      <el-table-column label="字典类型" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <div v-if="checkPermi(['maint:dict:detail'])">
            <el-button type="text" @click="showDictData(scope.row)">{{ scope.row.dictType }}</el-button>
          </div>
          <div v-else>
            <el-button type="text" disabled>{{ scope.row.dictType }} </el-button>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="字典名称" align="center" prop="dictName" :show-overflow-tooltip="true" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="statusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="是否系统内置" align="center" prop="type">
        <template slot-scope="scope">
          <dict-tag :options="typeOptions" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />

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
import dictData from "@/views/components/dictData";

import {
  listType,
  detailType,
  delType,
  addType,
  updateType,
  exportType,
} from "@/api/maint/dict";
import { checkPermi } from '@/utils/permission'

export default {
  name: "dict",
  components: { dictData },
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
      // 字典表格数据
      typeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 字典弹出层
      dictDataVisible: false,
      // 状态数据字典
      statusOptions: [],
      // 是否内置
      typeOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined,
      },
      // 字典Id传值给子组件
      dictId: 0,
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

    const dictParams = [
      { dictType: 'sys_status', columnName: 'statusOptions' },
      { dictType: 'sys_yes_no', columnName: 'typeOptions' }
    ]

    // 批量获取字典值
    this.getDicts(dictParams).then((response) => {
      response.data.forEach((element) => {
        this[element.columnName] = element.list
      })
    })
  },
  methods: {
    checkPermi,

    /** 查询字典类型列表👌 */
    getListFromApi() {
      this.loading = true;
      listType(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.typeList = response.data.result;
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
      this.title = "添加字典类型";
    },

    /** 修改按钮操作👌 */
    handleUpdate(row) {
      this.reset();
      const dictId = row.id || this.ids;
      detailType(dictId).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改字典类型";
      });
    },

    /** 删除按钮操作👌 */
    handleDelete(row) {
      const dictIds = row.id || this.ids;
      this.$confirm(
        '是否确认删除字典编号为"' + dictIds + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(function () {
          return delType(dictIds);
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
            updateType(this.form.id, this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getListFromApi();
            });
          } else {
            addType(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getListFromApi();
            });
          }
        }
      });
    },

    /** 展示字典数据👌 */
    showDictData(row) {
      this.dictId = row.id;
      this.dictDataVisible = true;
    },

    /** 字典状态字典格式化 */
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
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
        dictName: undefined,
        dictType: undefined,
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
