<template>
  <div>
    <el-select v-model="selectValue"
               placeholder="请选择"
               size="medium"
               filterable
               remote
               :remote-method="remoteMethod"
               clearable
               :loading="loading"
               @change="handleStyleNoChange">
      <el-option
        v-for="item in styleList"
        :key="item.value"
        :label="item.lable"
        :value="item.lable"
        :width="400"
      >
        <span style="float: left;margin-right: 20px">{{ item.lable }}</span>
        <span style="float: right;color: #8492a6; ">{{ item.value }}</span>
      </el-option>
    </el-select>

  </div>
</template>

<script>

export default {
  name: "styleNo",
  watch: {
    selectValue: {
      handler(newVal, oldVal) {
        if(newVal === ''){
          this.styleList = []
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      styleList:[],
      selectValue:undefined,
      loading:false
    };
  },
  created() {

  },
  mounted() {},
  methods: {
    remoteMethod(query) {
      if (query !== '' && query.length > 3) {
        this.loading = true;

      } else {
        this.styleList = [];
      }
    },
    handleStyleNoChange(value){
      this.$emit('handleStyleNoChange',value)
    }

  },
};
</script>
