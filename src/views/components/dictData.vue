<template>
  <div>

    <!-- 查询参数form -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="字典名称" prop="dictType">
        <el-select v-model="queryParams.dictType" size="small" @change="handleQuery">
          <el-option v-for="item in typeOptions" :key="item.dictId" :label="item.dictName" :value="item.dictType" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="数据状态" clearable size="small" @change="handleQuery">
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
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['maint:dict:add']">新增数据</el-button>
      </el-col>
    </el-row>

    <!-- 数据列表 -->
    <el-table :data="dataList">
      <el-table-column label="字典编码" align="center" prop="id" width="150" />
      <el-table-column label="字典标签" align="center" prop="dictLabel">
        <template slot-scope="scope">
          <span v-if="scope.row.styleType === '' || scope.row.styleType === 'default'">{{scope.row.dictLabel}}</span>
          <el-tag v-else :type="scope.row.styleType === 'primary' ? '' : scope.row.styleType">{{scope.row.dictLabel}}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="字典键值" align="center" prop="dictValue" />
      <el-table-column label="字典排序" align="center" prop="dictSort" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <dict-tag :options="statusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['maint:dict:edit']">编辑</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['maint:dict:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getDataListFromApi" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="form.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="回显样式" prop="styleType">
          <el-select v-model="form.styleType">
            <el-option v-for="item in styleTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.dictValue" :label=parseInt(dict.dictValue)>{{dict.dictLabel}}</el-radio>
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

  </div>
</template>

<script>
import {
  listData,
  detailData,
  delData,
  addData,
  updateData,
  listType,
  detailType
} from "@/api/maint/dict";
export default {
  name: "dictData",
  props: {
    dictId: {
      type: Number,
      default: 0,
    },
  },
  watch: {
    dictId: {
      handler(newVal, oldVal) {
        this.dictId = newVal;
        if (newVal) {
          this.getTypeDetailFromApi(newVal);
          this.getTypeListFromApi();
          this.getDicts("sys_status").then((response) => {
            this.statusOptions = response.data;
          });
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      // 总条数
      total: 0,
      // 字典表格数据
      dataList: [],
      // 默认字典类型
      defaultDictType: "",
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 数据标签回显样式
      styleTypeOptions: [
        {
          value: "default",
          label: "默认",
        },
        {
          value: "primary",
          label: "主要",
        },
        {
          value: "success",
          label: "成功",
        },
        {
          value: "info",
          label: "信息",
        },
        {
          value: "warning",
          label: "警告",
        },
        {
          value: "danger",
          label: "危险",
        },
      ],
      // 状态数据字典
      statusOptions: [],
      // 类型数据字典
      typeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        dictName: undefined,
        dictType: undefined,
        status: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        dictLabel: [
          { required: true, message: "数据标签不能为空", trigger: "blur" },
        ],
        dictValue: [
          { required: true, message: "数据键值不能为空", trigger: "blur" },
        ],
        dictSort: [
          { required: true, message: "数据顺序不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    // const dictId = this.$route.params && this.$route.params.dictId;
  },
  mounted() {},
  methods: {

    /** 查询字典类型详细(传入字典类型id查询类型详情)👌 */
    getTypeDetailFromApi(dictId) {
      detailType(dictId).then((response) => {
        this.queryParams.dictType = response.data.dictType;
        this.defaultDictType = response.data.dictType;
        this.getDataListFromApi();
      });
    },

    /** 查询字典数据列表👌 */
    getDataListFromApi() {
      this.loading = true;
      listData(this.queryParams).then((response) => {
        this.dataList = response.data.result;
        this.total = response.data.totalNum;
        this.loading = false;
      });
    },

    /** 查询字典类型列表👌 */
    getTypeListFromApi() {
      listType().then((response) => {
        this.typeOptions = response.data.result;
      });
    },

    /** 搜索按钮操作👌 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getDataListFromApi();
    },

    /** 重置按钮操作👌 */
    resetQuery() {
      this.resetForm("queryForm");
      this.queryParams.dictType = this.defaultDictType;
      this.handleQuery();
    },

    /** 新增按钮操作👌 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加字典数据";
      this.form.dictType = this.queryParams.dictType;
    },

    /** 修改按钮操作👌 */
    handleUpdate(row) {
      this.reset();
      const dictCode = row.id;
      detailData(dictCode).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改字典数据";
      });
    },

    /** 删除按钮操作👌 */
    handleDelete(row) {
      const dictCodes = row.id;
      this.$confirm(
        '是否确认删除字典编码为"' + dictCodes + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delData(dictCodes);
        })
        .then(() => {
          this.getDataListFromApi();
          this.msgSuccess("删除成功");
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
        dictLabel: undefined,
        dictValue: undefined,
        dictSort: 1,
        styleType: undefined,
        status: 1,
        remark: undefined,
      };
      this.resetForm("form");
    },

    /** 提交按钮👌 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateData(this.form.id, this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getDataListFromApi();
            });
          } else {
            addData(this.form).then((response) => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getDataListFromApi();
            });
          }
        }
      });
    },


  },
};
</script>
