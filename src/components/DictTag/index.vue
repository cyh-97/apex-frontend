<template>
  <div>
    <template v-for="(item, index) in options">
      <template v-if="values.includes(item.dictValue)">
        <span v-if="item.styleType === 'default' || item.styleType === ''" :key="item.dictValue" :index="index">
          {{ item.dictLabel }} <i v-if="showValue">#{{item.dictValue}}</i></span>
        <el-tag size="mini" v-else :disable-transitions="true" :key="item.dictValue" :index="index"
          :type="item.styleType === 'primary' ? '' : item.styleType" >
          {{ item.dictLabel }}<i v-if="showValue">#{{item.dictValue}}</i>
        </el-tag>
      </template>
    </template>
  </div>
</template>

<script>
export default {
  name: "DictTag",
  props: {
    options: {
      type: Array,
      default: null,
    },
    value: [Number, String, Array, Boolean],
    showValue: false,
  },
  computed: {
    values() {
      if (this.value !== null && typeof this.value !== "undefined") {
        return Array.isArray(this.value) ? this.value : [String(this.value)];
      } else {
        return [];
      }
    },
  },
};
</script>
<style scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
</style>
