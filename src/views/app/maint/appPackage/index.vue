<template>
  <div class="app-container">

    <!-- 查询参数form -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="应用包名" prop="appKey">
        <el-input v-model="queryParams.appKey" placeholder="请输入应用包名" clearable size="small" style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 功能按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['system:config:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5" v-if="false">
        <el-button type="success" plain icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['maint:config:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5" v-if="false">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['maint:config:delete']">删除</el-button>
      </el-col>
      <right-toolbar v-if="false" :showSearch.sync="showSearch" @queryTable="getListFromApi"></right-toolbar>
    </el-row>

    <!-- 数据列表 -->
    <el-table v-loading="loading" :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="应用包名" align="center" prop="appKey" width="140" />
      <el-table-column label="文件名称" align="center" prop="fileName" width="320" />
      <el-table-column label="更新状态" align="center" prop="updateStatus" width="150">
        <template slot-scope="scope">
          <template v-if="scope.row.updateStatus === 0">
            <el-tag size="small" type="danger" >不更新</el-tag>
          </template>
          <template v-if="scope.row.updateStatus === 1">
            <el-tag size="small" type="success">非强制升级更新</el-tag>
          </template>
          <template v-if="scope.row.updateStatus === 2">
            <el-tag size="small" type="info">强制升级更新</el-tag>
          </template>
          <template v-if="scope.row.updateStatus === 3">
            <el-tag size="small" type="warning" >可忽略版本升级更新</el-tag>
          </template>
        </template>
      </el-table-column>
      <el-table-column label="版本号" align="center" prop="versionCode" />
      <el-table-column label="版本名称" align="center" prop="versionName" width="120" />
      <el-table-column label="大小(M)" align="center" prop="fileSize">
        <template slot-scope="scope">
          <span>{{(scope.row.fileSize / 1024).toFixed(2)}}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新内容" width="320" prop="modifyContent" :show-overflow-tooltip="true" />
      <el-table-column label="下载链接" width="200" prop="downloadUrl" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{scope.row.createTime}}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="230" fixed="right" >
        <template slot-scope="scope">
          <el-button type="success" icon="el-icon-download" circle @click="handleDownload(scope.row)" v-hasPermi="['maint:app:download']"/>
          <el-button type="primary" icon="el-icon-edit" circle @click="handleUpdate(scope.row)" v-hasPermi="['maint:app:edit']"/>
          <el-button type="danger" icon="el-icon-delete" circle @click="handleDelete(scope.row)" v-hasPermi="['maint:app:delete']"/>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getListFromApi" />

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="文件" prop="file" :rules="{ required: this.form.id === undefined, message: '请选择审核结果', trigger: 'blur'  }">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :on-remove="handleRemove"
            :on-change="handleChange"
            :file-list="form.file"
            :multiple="false"
            :limit="1"
            :auto-upload="false">
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
        </el-form-item>
        <el-form-item label="应用包名" prop="appKey">
          <el-input size="small" v-model="form.appKey" placeholder="请输入" readonly />
        </el-form-item>
        <el-form-item label="版本号" prop="versionCode">
          <el-input size="small" v-model="form.versionCode" placeholder="请输入" readonly />
        </el-form-item>
        <el-form-item label="版本名称" prop="versionName">
          <el-input size="small" v-model="form.versionName" placeholder="请输入" readonly />
        </el-form-item>
        <el-form-item label="文件大小" prop="fileSize">
          <el-input size="small" v-model="form.fileSize" placeholder="请输入" readonly />
        </el-form-item>
        <el-form-item label="文件MD5" prop="fileMd5">
          <el-input size="small" v-model="form.fileMd5" placeholder="请输入" readonly />
        </el-form-item>
        <el-form-item label="更新状态" prop="updateStatus">
          <el-select v-model="form.updateStatus" size="small" placeholder="请选择" >
            <el-option label="不更新" :value="0" />
            <el-option label="不需要强制升级" :value="1" />
            <el-option label="需要强制升级" :value="2" />
            <el-option label="可忽略版本" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="更新内容" prop="modifyContent">
          <el-input type="textarea" :show-word-limit="true" maxlength="200" autosize v-model="form.modifyContent" placeholder="请输入更新内容" />
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
import SparkMD5 from "spark-md5";
import {
  listAppPackage,
  addAppPackage,
  updateAppPackage,
  delAppPackage,
  uploadToApk
} from "@/api/maint/mobileAppConfig";
import {uploadToFtp} from "@/api/maint/file";

export default {
  name: "config",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
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
      // 参数表格数据
      configList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 日期范围
      dateRange: [],
      // 系统是否
      sysYesNoOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        sortStr: 'VersionCode DESC',
        appKey: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        updateStatus: [
          { required: true, message: "更新状态不能为空", trigger: "blur" },
        ],
        modifyContent: [
          { required: true, message: "更新内容不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getDicts("sys_yes_no").then((response) => {
      this.sysYesNoOptions = response.data;
    });
    this.getListFromApi();
  },
  methods: {

    /** 查询参数列表👌 */
    getListFromApi() {
      this.loading = true;
      listAppPackage(this.addDateRange(this.queryParams, this.dateRange)).then(
        (response) => {
          this.configList = response.data.result;
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
      this.title = "添加参数";
    },
    handleRemove(file, fileList) {
      this.form.file = undefined
    },
    /** 图片列表变更 */
    handleChange(file, fileList) {
      this.form.file = fileList
      let names = file.name.split('-')
      if (names.length < 4){
        this.form.file = undefined
        this.msgWarning('文件名称格式不符')
      }else {
        this.form.appKey = names[1]
        this.form.versionCode = names[4]
        this.form.versionName = names[3]
        this.form.fileSize = parseInt(file.size / 1024)
        this.form.fileName = file.name
        let that = this
        let fileReader = new FileReader();
        let Spark = new SparkMD5.ArrayBuffer();
        fileReader.readAsArrayBuffer(file.raw);
        fileReader.onload = function (e) {
          Spark.append(e.target.result);
          let md5 = Spark.end();
          console.log(md5);
          that.form.fileMd5 = md5
        };
      }
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.open = true
      this.form = row
    },
    /** 下载按钮 */
    handleDownload(row){
      window.open(row.downloadUrl);
    },

    /** 删除按钮操作 */
    handleDelete(row) {
      const configIds = row.id || this.ids;
      this.$confirm('是否确认删除参数编号为"' + configIds + '"的数据项？')
        .then(function () {
          return delAppPackage(configIds);
        })
        .then(() => {
          this.getListFromApi();
          this.msgSuccess("删除成功");
        })
        .catch(() => {});
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined){
            updateAppPackage(this.form.id, this.form).then(response => {
              this.msgSuccess('修改成功')
              this.open = false;
              this.getListFromApi()
            })
          }else {
            let formData = new FormData()
            formData.append('file', this.form.file[0].raw)
            formData.append('fileName', this.form.file[0].name)
            formData.append('projectPath', '/')

            this.form.downloadUrl = `https://auth.kingsrich.com/prod-api/auth/api/SysFile/DownloadApk?fullName=${this.form.file[0].name}&appId=${process.env.VUE_APP_APP_ID}`

            let that = this
            uploadToFtp(formData).then(res => {

              addAppPackage(this.form).then(response => {
                this.msgSuccess('新增成功')
                this.open = false;
                this.getListFromApi()
              })
            })
          }

        }
      });
    },

    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 表单重置 */
    reset() {
      this.form = {
        id: undefined,
        file: undefined,
        appKey: undefined,
        versionCode: undefined,
        versionName: undefined,
        fileSize: undefined,
        updateStatus: undefined,
        modifyContent: undefined,
        fileMd5: undefined,
      };
      this.resetForm("form");
    },

    /** 多选框选中数据 */
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
  },
};
</script>
