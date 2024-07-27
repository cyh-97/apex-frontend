<template>
  <div>
    <!-- 中部列表表格 -->
    <el-table
      :data="tableData"
      border
      :span-method="objectSpanMethod"
      stripe
      :max-height="maxHeight"
      v-loading="loading"
      element-loading-text="拼命加载中..."
      element-loading-spinner="el-icon-loading"
      :show-summary="showSummary"
      :summary-method="getSummaries"
      ref="queryForm"
      @filter-change="filterChange"
    >
      <el-table-column
        type="index"
        width="50"
        :fixed="true"
        v-if="showIndex"
        :index="calcIndex"
      >
      </el-table-column>
      <el-table-column
        type="selection"
        width="50"
        align="center"
        v-if="gg"
      ></el-table-column>

      <el-table-column
        align="center"
        v-for="(item, index) in title"
        :key="index"
        v-if="!item.operate"
        :sortable="item.sort"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
        :min-width="item.minWidth"
        :fixed="item.fixed"
        :show-overflow-tooltip="item.showTips"
      >
        <template slot-scope="scope">
          <div class="table-item-group">
            <!-- 配置启用禁用的颜色 -->
            <i
              v-if="item.isType === 'status'"
              :class="[
                scope.row[item.prop] === 1
                  ? 'status-dot-green'
                  : 'status-dot-red',
              ]"
              class="el-icon-message-solid"
            ></i>
            <!-- 表格中具体的某一项点击事件 -->
            <span
              class="btn-type"
              v-if="item.eventType"
              @click="operateType(item.eventType, scope.row, scope.$index)"
            >{{ checkType(item.isType, scope.row[item.prop]) }}</span>

            <span class="normal-text" v-else-if="item.check === true " :class="scope.row[item.prop] === '' ? 'span-normal' : 'span-abnormal'">
              {{ scope.row[item.prop] }}
            </span>

            <el-switch v-else-if="item.isSwitch" v-model="scope.row[item.prop]" disabled></el-switch>

            <el-checkbox v-else-if="item.isCheckBox" v-model="scope.row[item.prop]" disabled></el-checkbox>

            <span class="normal-text" v-else-if="item.label.includes('日期') || item.label === '交期' ">
              {{ scope.row[item.prop].substring(0, 10) }}
            </span>

            <!-- 正常表格渲染数据 -->
            <span class="normal-text" v-else>
              {{ checkType(item.isType, scope.row[item.prop]) }}
            </span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-else-if="item.filter"
        :label="item.label"
        :width="item.width"
        :prop="item.prop"
        align="center"
        :filters="filtersData"
        filter-multiple
      >
        <template slot-scope="scope">
          <div class="table-item-group">
            <dict-tag v-if="item.label === '班组'" :options="lineOptions" :value="scope.row.lineCode" />
            <!-- 正常表格渲染数据 -->
            <span class="normal-text" v-else>{{
                checkType(item.isType, scope.row[item.prop])
              }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-else
        :label="item.label"
        :width="item.width"
        :prop="item.prop"
        :fixed="item.fixed"
        align="center"
      >
        <template slot-scope="scope">
          <slot
            :name="item.prop"
            :$index="scope.$index"
            :row="scope.row"
          ></slot>
          <!-- 对应slot name -->
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0 && showPagination" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
                @pagination="getListFromApi"/>
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: Array,
      default: [],
    },
    tableData: {
      type: Array,
      default: [],
    },
    gg: Boolean,
    showIndex: {
      type:Boolean,
      default:false
    },
    loading:Boolean,
    total:Number,
    height: {
      type:Number,
      default:360
    },
    queryParams: {
      type:Object,
      default(){
        return {
          pageNum: 1,
          pageSize: 10
        }
      }
    },
    showSummary:{
      type:Boolean,
      default:true
    },
    showPagination:{
      type:Boolean,
      default:true
    },
    colSpanCount:{
      type:Number,
      default:0
    },
    filtersData:{
      type:Array,
      default(){}
    }
  },
  data(){
    return{
      maxHeight:650
    }
  },
  methods: {
    operateType(type, value, index) {
      this.$emit('operate', { type: type, value: value, index: index })
    },
    objectCellMethod(styleNo){
      this.$emit('objectCellMethod', styleNo)
    },
    getListFromApi(){
      this.$emit('getListFromApi',this.queryParams)
    },
    checkType(type, value) {
      let label = ''
      switch (type) {
        case 'teskType': //测试任务类型
          if (value === 1) {
            label = '功能测试'
          } else if (value === 2) {
            label = '性能测试'
          } else if (value === 3) {
            label = '稳定性测试'
          }
          break
        default:
          label = value
      }
      return label
    },
    /** 合并单元格 */
    objectSpanMethod({ row, column, rowIndex, columnIndex }){
      //columnIndex 表示需要合并的列，多列时用 || 隔开
      if (columnIndex < this.colSpanCount) {
        const _row = this.filterData(this.tableData, columnIndex).one[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: 1,
        }
      }
    },
    filterData(arr, colIndex) {
      let spanOneArr = [];
      let concatOne = 0;
      arr.forEach((item, index) => {
        if (index === 0) {
          spanOneArr.push(1);
        } else {
          //class 和classify 分别表示表格数据第一列和第二列对应的参数字段，根据实际参数修改
          if (item[this.title[colIndex].prop] === arr[index - 1][this.title[colIndex].prop]) {
            spanOneArr[concatOne] += 1;
            spanOneArr.push(0);
          } else {
            spanOneArr.push(1);
            concatOne = index;
          }
        }
      });
      return {
        one: spanOneArr,
      };
    },

    /** 合计行*/
    getSummaries(param) {
      const { columns,data = this.tableData } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计';
          return;
        }
        const hasRate = column.label.includes("人均") ||  column.label.includes("率") ||  column.label.includes("单价") ||  column.label.includes("占比")
        const hasPercent = column.label.includes("率");
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value)) && column.label !== "转款天数" && column.label !== "订单号") {
          sums[index] = values.reduce((prev, curr) => {
            const value =  Number(curr);
            if (!isNaN(value)) {
              const num = prev + curr
              return Number(num.toFixed(2))
            } else {
              return Number(prev.toFixed(2));
            }
          }, 0);

          sums[index] = hasRate ? Number((sums[index]/data.length).toFixed(2)) : sums[index]
          sums[index] = hasPercent ?  sums[index]+"%" : sums[index]
        } else {
          sums[index] = '';
        }
      });

      return sums;
    },
    /** 修改表格高度*/
    getHeight() {
      this.$nextTick(() => {
        // window.innerHeight 浏览器窗口的可见高度，下面的 220 是除了table最大高度的剩余空间。
        let height = window.innerHeight - this.height;
        this.maxHeight = height;
      })
    },
    /**筛选条件变化*/
    filterChange(filters){
      let lis = Object.values(filters)[0]
      this.$emit('filterChange', lis)
    },
    /** 表格翻页index跟着变化 */
    calcIndex(index){
      return (this.queryParams.pageNum - 1) * this.queryParams.pageSize + index + 1
    }
  },

  mounted() {
    this.$nextTick(() => {
      // window.innerHeight 浏览器窗口的可见高度，下面的 220 是除了table最大高度的剩余空间。
      let height = window.innerHeight - this.height;
      this.maxHeight = height;
    })
  },
  created() {
    let height = window.innerHeight - this.height;
    this.maxHeight = height;
    window.addEventListener('resize', this.getHeight)
  },
}
</script>

<style scoped lang="scss">
.span-abnormal{
  color: red;
}
.btn-type{
  color: #46a6ff;
}
</style>
