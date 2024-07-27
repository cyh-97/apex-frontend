<template>
  <el-container>
    <el-header>
      <div class="card-panel-icon-wrapper icon-area">
        <svg-icon icon-class="ranking" class-name="card-panel-icon" />
        班组产值排名（当月）
      </div>
      <el-divider></el-divider>
    </el-header>
    <el-main>
      <div class="rank-body">
        <div class="item" v-for="item in listData" >
          <div class="num">{{ item.sortID }}</div>
          <dl class="author">
            <dt class="avatar">
            </dt>
            <dd>{{ item.lineName }}</dd>
          </dl>
          <div class="rank-ability">{{ item.value }}</div>
        </div>

      </div>
    </el-main>
  </el-container>


</template>
<script>

export default {
  props: {
  },
  data() {
    return {
      listData:[]
    }
  },
  watch: { },
  mounted() {
    this.$nextTick(() => {
      this.load()
    })
  },
  methods: {
    load(){
      this.listData = []
    }
  }
}
</script>
<style lang="scss" scoped>
.card-panel-icon-wrapper{
  font-size: 18px;
  margin: 10px auto;
}

/* 内容主体 */
.rank-body {
  padding:20px 30px 10px;
  margin-top: -30px;
  height: 320px;
  overflow:auto;
  /* 每项样式 */
  .item {
    display: flex;
    align-items: center;
    height: 32px;
    margin-bottom: 20px;
    .num {
      width: 30px;
      height: 30px;
      border-radius: 30px;
      line-height: 30px;
      text-align: center;
      font-size: 20px;
      margin-right: 20px;
      background-color: #bfbfbf;
    }
    .author {
      display: flex;
      align-items: center;
      flex: 1;
    }
    .rank-ability {
      color: #999;
    }
  }
}

.item:nth-child(1) .num {
  background-color: #de5149;
  color: #fff;
}

.item:nth-child(2) .num {
  color: #fff;
  background-color: #ef8634;
}

.item:nth-child(3) .num {
  color: #fff;
  background-color: #f6cb46;
}
</style>
