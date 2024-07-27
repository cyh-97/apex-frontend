<template>
  <div class="app-container">
    <!-- 查询参数form -->
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="菜单名称" prop="menuName">
        <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="菜单状态" clearable size="small">
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
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['auth:menu:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="el-icon-sort" size="mini" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getListFromApi"></right-toolbar>
    </el-row>

    <!-- 数据列表 -->
    <el-table v-if="refreshTable" v-loading="loading" :data="menuList" :default-expand-all="isExpandAll" row-key="id" border
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
      <el-table-column prop="menuName" label="菜单名称" :show-overflow-tooltip="true" width="160"></el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="80">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="menuType" label="类型" align="center" width="80">
        <template slot-scope="scope">
          <el-tag type="danger" v-if="scope.row.menuType === 'M' && scope.row.isFrame === 1">链接</el-tag>
          <el-tag v-else-if="scope.row.menuType === 'C'">菜单</el-tag>
          <el-tag type="success" v-else-if="scope.row.menuType === 'M'">目录</el-tag>
          <el-tag type="warning" v-else-if="scope.row.menuType === 'F'">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" width="90" align="center">
        <template slot-scope="scope">
          <span v-show="editIndex !== scope.$index" @click="editCurrRow(scope.$index,'rowkeY')">{{scope.row.orderNum}}</span>
          <el-input :id="scope.$index+'rowkeY'" size="mini" v-show="(editIndex === scope.$index)" v-model="scope.row.orderNum"
            @blur="handleChangeSort(scope.row)"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="permStr" label="权限标识" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="path" label="路由地址" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="component" label="组件路径" :show-overflow-tooltip="true"></el-table-column>
      <el-table-column prop="visible" label="显示" width="70">
        <template slot-scope="scope">
          <dict-tag :options="visibleOptions" :value="scope.row.visible" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="70">
        <template slot-scope="scope">
          <dict-tag :options="statusOptions" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['auth:menu:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAdd(scope.row)" v-hasPermi="['auth:menu:add']">新增</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['auth:menu:delete']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改菜单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :lg="24">
            <el-form-item label="上级菜单">
              <treeselect v-model="form.parentId" :options="menuOptions" :normalizer="normalizer" :show-count="true" @select="handleTreeSelect"
                placeholder="选择上级菜单" />
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group size="mini" v-model="form.menuType">
                <el-radio-button label="M">目录</el-radio-button>
                <el-radio-button label="C">菜单</el-radio-button>
                <el-radio-button label="F">按钮</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" :min="0" :value="999" />
            </el-form-item>
          </el-col>
          <el-col :lg="24" v-if="form.menuType !== 'F'">
            <el-form-item label="菜单图标" prop="icon">
              <el-popover placement="bottom-start" width="460" trigger="click" @show="$refs['iconSelect'].reset()">
                <IconSelect ref="iconSelect" @selected="selected" />
                <el-input slot="reference" v-model="form.icon" placeholder="点击选择图标" clearable="" readonly>
                  <svg-icon v-if="form.icon" slot="prefix" :icon-class="form.icon" class="el-input__icon"  />
                  <i v-else slot="prefix" class="el-icon-search el-input__icon"></i>
                </el-input>
              </el-popover>
            </el-form-item>
          </el-col>
          <el-col :lg="24">
            <el-form-item v-if="form.menuType !== 'F'" label="路由地址" prop="path">
              <span slot="label">
                <el-tooltip content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                路由地址
              </span>
              <el-input v-model="form.path" placeholder="请输入路由地址" />
            </el-form-item>
          </el-col>
          <el-col :lg="12" v-if="form.menuType === 'C'">
            <el-form-item label="组件路径" prop="component">
              <span slot="label">
                <el-tooltip content="访问的组件路径，如：`system/user/index`，默认在`views`目录下" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                组件路径
              </span>
              <el-input v-model="form.component" placeholder="请输入组件路径" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item v-if="form.menuType !== 'M'" label="权限标识">
              <span slot="label">
                <el-tooltip content="控制器中定义的权限字符，如：[ActionPermissionFilter(Permission = 'system:user:delete')])" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                权限字符
              </span>
              <el-input v-model="form.permStr" placeholder="权限名，规范([分类]:[页面]:[动作])" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item v-if="form.menuType !== 'F'" label="显示状态">
              <span slot="label">
                <el-tooltip content="选择隐藏则路由将不会出现在侧边栏也不可以访问" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                显示状态
              </span>
              <el-radio-group v-model="form.visible">
                <el-radio v-for="dict in visibleOptions" :key="dict.dictValue" :label="dict.dictValue">{{dict.dictLabel}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item v-if="form.menuType !== 'F'" label="是否外链">
              <span slot="label">
                <el-tooltip content="选择是外链则路由地址需要以`http(s)://`开头" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                是否外链
              </span>
              <el-radio-group v-model="form.isFrame">
                <el-radio :label=0>否</el-radio>
                <el-radio :label=1>是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item v-if="form.menuType !== 'F'">
              <span slot="label">
                <el-tooltip content="选择停用则路由将不会出现在侧边栏，也不能被访问" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                菜单状态
              </span>
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in statusOptions" :key=parseInt(dict.dictValue) :label=parseInt(dict.dictValue)>{{dict.dictLabel}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :lg="12">
            <el-form-item v-if="form.menuType === 'C'" label="是否缓存">
              <span slot="label">
                <el-tooltip content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致" placement="top">
                  <i class="el-icon-question"></i>
                </el-tooltip>
                是否缓存
              </span>
              <el-radio-group v-model="form.isCache">
                <el-radio :label=0>缓存</el-radio>
                <el-radio :label=1>不缓存</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" v-if="btnSubmitVisible">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listMenu,
  detailMenu,
  updateMenu,
  addMenu,
  changeMenuSort,
  delMenu,
} from '@/api/auth/menu'
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect/index.vue";

export default {
  name: "menu1",
  components: { Treeselect, IconSelect },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 显示搜索条件
      showSearch: true,
      // 菜单表格树数据
      menuList: [],
      // 菜单树选项
      menuOptions: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 是否展开，默认全部折叠
      isExpandAll: false,
      // 重新渲染表格状态
      refreshTable: true,
      // 显示状态数据字典
      visibleOptions: [],
      // 菜单状态数据字典
      statusOptions: [],
      // 查询参数
      queryParams: {
        menuName: undefined,
        visible: undefined,
      },
      // 提交按钮是否显示
      btnSubmitVisible: true,
      // 是否显示编辑排序
      showEditSort: false,
      editIndex: -1,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        menuName: [
          { required: true, message: "菜单名称不能为空", trigger: "blur" },
        ],
        orderNum: [
          { required: true, message: "菜单顺序不能为空", trigger: "blur" },
        ],
        path: [
          { required: true, message: "路由地址不能为空", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getListFromApi();

    const dictParams = [
      { dictType: 'sys_show_hide', columnName: 'visibleOptions' },
      { dictType: 'sys_status', columnName: 'statusOptions' }
    ]
    // 批量获取字典值
    this.getDicts(dictParams).then((response) => {
      response.data.forEach((element) => {
        this[element.columnName] = element.list
      })
    })
  },
  methods: {

    /** 查询菜单列表👌 */
    getListFromApi() {
      this.loading = true;
      listMenu(this.queryParams).then((response) => {
        this.menuList = response.data;
        this.loading = false;
      });
    },

    /** 搜索按钮操作👌 */
    handleQuery() {
      this.getListFromApi();
    },

    /** 重置按钮操作👌 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },

    /** 新增按钮操作 */
    handleAdd(row) {
      this.reset();
      this.getTreeSelect();

      this.form.parentId = row != null && row.id ? row.id : 0;
      this.open = true;
      this.title = "添加菜单";
    },

    /** 展开/折叠操作👌 */
    toggleExpandAll() {
      this.refreshTable = false;
      this.isExpandAll = !this.isExpandAll;
      this.$nextTick(() => {
        this.refreshTable = true;
      });
    },

    /** 修改按钮操作👌 */
    handleUpdate(row) {
      this.reset();
      this.getTreeSelect();
      detailMenu(row.id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改菜单";
      });
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id !== undefined) {
            updateMenu(this.form.id, this.form).then((response) => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getListFromApi();
            });
          } else {
            addMenu(this.form).then((response) => {
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
      this.$confirm(
        '是否确认删除名称为"' + row.menuName + '"的数据项?',
        "警告",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(function () {
          return delMenu(row.id);
        })
        .then(() => {
          this.getListFromApi();
          this.msgSuccess("删除成功");
        });
    },

    /** 保存排序 */
    handleChangeSort(item) {
      this.editIndex = -1;
      changeMenuSort({ orderNum: item.orderNum, menuId: item.menuId }).then(
        (response) => {
          this.msgSuccess("修改成功");
          this.getListFromApi();
        }
      );
    },


    /** 查询菜单下拉树结构 */
    getTreeSelect() {
      listMenu().then((response) => {
        this.menuOptions = [];
        const menu = { id: 0, menuName: "根菜单", children: [] };
        menu.children = response.data;
        this.menuOptions.push(menu);
      });
    },

    /** 显示编辑排序 */
    editCurrRow(rowId, str) {
      this.editIndex = rowId;
      let id = rowId + str;

      setTimeout(() => {
        document.getElementById(id).focus();
      }, 100);
    },

    /** 选择图标 */
    selected(name) {
      this.form.icon = name;
    },

    /** 转换菜单数据结构 */
    normalizer(node) {
      if (node.children && !node.children.length) {
        delete node.children;
      }
      return {
        id: node.id,
        label: node.menuName,
        children: node.children,
      };
    },

    /** 菜单状态字典翻译 */
    statusFormat(row, column) {
      if (row.menuType === "F") {
        return "";
      }
      return this.selectDictLabel(this.statusOptions, row.status);
    },

    /** 取消按钮 */
    cancel() {
      this.open = false;
      this.reset();
    },

    /** 表单重置 */
    reset() {
      this.btnSubmitVisible = true;
      this.form = {
        menuId: undefined,
        parentId: 0,
        menuName: undefined,
        icon: undefined,
        menuType: "M",
        orderNum: 999,
        isFrame: 0,
        isCache: 0,
        visible: "1",
        status: 1,
      };
      this.resetForm("form");
    },

    handleTreeSelect(node, instanceId) {
      //如果是链接隐藏提交按钮
      this.btnSubmitVisible = node.menuType !== "L";
    },



  },
};
</script>
