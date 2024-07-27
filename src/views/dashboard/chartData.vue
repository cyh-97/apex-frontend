<template>
  <div>
    <el-row :gutter="32" style="margin-bottom:12px;" >
      <el-col :xs="24" :sm="24" >
        <div class="chart-wrapper">
          <query-panel :title="title" @handelClick="handelClick" />
          <div :class="className" :style="{height:chartHeight,width:chartWidth}" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" >
        <table-data
          :tableData="tableData"
          :title="columns"
          :gg="false"
          :loading="loading"
          :total="total"
          :pageNum = "queryParams.pageNum"
          :pageSize = "queryParams.pageSize"
          :showSummary = false
          @getListFromApi = "getListFromApi"
          :height="600"
          :lineOptions="lineOptions"
          :colSpanCount="0"
        />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import QueryPanel from "@/views/tool/build/QueryPanel.vue";
import TableData from "@/views/dashboard/tableData.vue";
import {getDate} from "@/utils/common";
import * as echarts from "echarts";
const defaultData = { startDate: getDate(0),endDate: getDate(0) }
export default {
  components: {TableData, QueryPanel },
  props: {
    title:String,
    columns: {
      type: Array,
      default: [],
    },
    tableData: {
      type: Array,
      default: [],
    },
    gg: Boolean,
    loading:Boolean,
    total:Number,
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
    lineOptions:{
      type: Array,
      default(){},
    },
    showPagination:{
      type:Boolean,
      default:true
    },
    chartWidth: {
      type: String,
      default: '100%'
    },
    chartHeight: {
      type: String,
      default: '400px'
    },
    className: {
      type: String,
      default: 'chart'
    },
    chartOptions:{
      type:Object,
      default(){
        return {}
      }
    }
  },
  data() {
    return {
      chartData: defaultData
    }
  },
  watch:{
    chartData:{
      handler(val) {
        this.setOptionData()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  methods: {
    handelClick(type){
      switch (type) {
        case 1:
          this.chartData = { startDate: getDate(-1),endDate: getDate(-1) }
          break;
        case 2:
          this.chartData = { startDate: getDate(0),endDate: getDate(0) }
          break;
        case 3:
          this.chartData = { startDate: getDate(-7),endDate: getDate(0) }
          break;
        default:
          this.chartData = { startDate: type[0],endDate: type[1] }
          break;
      }
      this.$emit('handelClick', this.chartData)
    },
    getListFromApi(){
      this.$emit('getListFromApi',this.queryParams)
    },
    initChart() {
      this.chart = echarts.init(this.$el)

      this.setOptionData();
    },
    setOptionData(){
      this.chart.setOption(this.chartOptions)
    }
  },
}
</script>
