<template>
  <div class="chart-top">
    {{ title }}
    <div class="query-group">
      <el-button-group style="margin-right: 10px;margin-bottom: 20px">
        <el-button type="primary" :class="yesterday?'active-item':'inactive-item'" @click="handelClick(1)">{{ btnText1 }}</el-button>
        <el-button type="primary" :class="today?'active-item':'inactive-item'" @click="handelClick(2)">{{ btnText2 }}</el-button>
        <el-button type="primary" :class="sevenDays?'active-item':'inactive-item'" @click="handelClick(3)">{{ btnText3 }}</el-button>
      </el-button-group>

      <el-date-picker
        v-model="queryValue"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="yyyy-MM-dd"
        value-format="yyyy-MM-dd"
        @change="handleDateChange">
      </el-date-picker>
    </div>
  </div>
</template>
<script>
export default {
  inheritAttrs: false,
  props:{
    title: {
      type: String,
      default: ''
    },
    btnText1: {
      type: String,
      default: '昨日'
    }    ,
    btnText2: {
      type: String,
      default: '今日'
    }    ,
    btnText3: {
      type: String,
      default: '最近七日'
    }
  },
  data() {
    return {
      queryValue:'',
      yesterday: null,
      today: true,
      sevenDays:null
    }
  },
  watch: { },
  methods: {
    handelClick(type) {
      this.yesterday = type === 1
      this.today = type === 2
      this.sevenDays = type === 3
      this.queryValue = ''
      this.$emit("handelClick", type);
    },
    handleDateChange(){
      this.yesterday = false
      this.today = this.queryValue === null
      this.sevenDays = false
      this.$emit("handelClick", this.queryValue === null ? 2 : this.queryValue);
    }
  }
}
</script>
<style lang="scss" scoped>
.query-group{
  display: flex;
  float: right;
}
.active-item{

}
.inactive-item{
  background-color: #ffffff;
  border-color: #99a9bf !important;
  color: #000;
}
</style>
