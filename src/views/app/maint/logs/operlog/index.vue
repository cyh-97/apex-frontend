<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="系统模块" prop="method">
        <el-input v-model="queryParams.method" placeholder="请输入系统模块" clearable style="width: 200px;" size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人员" prop="account">
        <el-input v-model="queryParams.account" placeholder="请输入操作人员" clearable style="width: 160px;" size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="操作时间">
        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list">
      <el-table-column label="操作日期" align="center" prop="operateTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.operateTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="系统模块" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="业务方法" prop="method" align="center" :show-overflow-tooltip="true" />
      <el-table-column label="操作人员" align="center" prop="operator" :show-overflow-tooltip="true"/>
      <el-table-column label="操作IP" align="center" prop="operateIp" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="操作用时" align="center" prop="elapsed">
        <template slot-scope="scope">
          <span :style="scope.row.elapsed < 1000 ? 'color:green':scope.row.elapsed < 3000 ?'color:orange':'color:red'">{{ scope.row.elapsed }}
            ms</span>
        </template>
      </el-table-column>
      <el-table-column label="日志内容" align="center" prop="msg" :show-overflow-tooltip="true" />
      <el-table-column label="SQL异常" align="center" prop="errSql" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="req" align="center" prop="requestModel"  v-if="false" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleView(scope.row,scope.index)">详细
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" label-width="100px" size="mini">
        <el-row>
          <el-col :lg="12">
            <el-form-item label="操作模块：">{{ form.title }} </el-form-item>
            <el-form-item label="业务方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="请求地址：">{{ form.host }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.httpMethod }}</el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="请求参数：">{{ form.reqParam }}</el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="返回结果：">
              {{ form.response }}
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="操作时间：">{{ parseTime(form.operateTime) }}</el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="操作信息：">{{ form.msg }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="open = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  getOpsLogs
} from "@/api/maint/log";
import {parseTime} from "@/utils/common";

export default {
  name: "operlog",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      statusOptions: [],
      // 业务类型（0其它 1新增 2修改 3删除）选项列表 格式 eg:{ dictLabel: '标签', dictValue: '0'}
      businessTypeOptions: [],
      // 日期范围
      dateRange: [],
      // 表单参数
      form: {},
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 20,
        method: undefined,
        account: undefined
      },
    };
  },
  created() {
    this.getList();
  },
  methods: {
    parseTime,

    /** 查询登录日志 */
    getList() {
      this.loading = true;
      getOpsLogs(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.loading = false;
          if (response.code === 200) {
            this.list = response.data.result;
            this.total = response.data.totalNum;
          } else {
            this.total = 0;
            this.list = [];
          }
        }
      );
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },

    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 详细按钮操作 */
    handleView(row) {
      this.open = true;
      this.form = row;
    },

  },
};
</script>

