<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户名称" prop="account">
        <el-input v-model="queryParams.account" placeholder="请输入用户名称" clearable style="width: 240px;" size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="登录时间">
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
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="用户账号" align="center" prop="userCode" />
      <el-table-column label="用户名称" align="center" prop="userName" />
      <el-table-column label="登录消息" align="center" prop="message" width="130" :show-overflow-tooltip="true" />
      <el-table-column label="登录IP" align="center" prop="operateIp" />
      <el-table-column label="登录日期" align="center" prop="loginTime" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.loginTime }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script>
import {
  getLoginLogs
} from "@/api/maint/log";

export default {
  name: "loginLog",
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
      // 状态数据字典
      statusOptions: [],
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        account: undefined,
        status: undefined,
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("sys_common_status").then((response) => {
      this.statusOptions = response.data;
    });
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true;
      getLoginLogs(this.addDateRange(this.queryParams, this.dateRange)).then(
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

    // 登录状态字典翻译
    statusFormat(row, column) {
      return this.selectDictLabel(this.statusOptions, row.status);
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
    }
  }
};
</script>

