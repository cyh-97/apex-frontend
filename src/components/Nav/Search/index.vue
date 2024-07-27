<template>
  <el-form method="get" target="_blank" :action="scData.url" id="search-component">
    <el-form-item>
      <el-input :placeholder="scData.desc" :name="scData.key" v-model="scText" clearable>
        <el-dropdown
          trigger="click"
          slot="prepend"
          placement="bottom"
          @command="changeData">
            <span class="el-dropdown-link">
                <img :src="scData.icon" :alt="scData.title" />
                <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="each_type in scTypeList"
              :key="each_type"
              :command="each_type">
              <img :src="searchList[each_type].icon" :alt="each_type" />
              {{ searchList[each_type].title }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button slot="append" icon="el-icon-search" native-type="submit"></el-button>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    return {

      searchList: {
        baidu: {
          title: '百度',
          url: 'https://www.baidu.com/s',
          key: 'wd',
          icon: require('../../../assets/search_icon/icon_baidu.png'),
          desc: '百度一下'
        },
        bing: {
          title: '必应',
          url: 'https://cn.bing.com/search',
          key: 'q',
          icon: require('../../../assets/search_icon/icon_bing.png'),
          desc: '微软Bing搜索'
        },
        google: {
          title: 'Google',
          url: 'https://www.google.com/search',
          key: 'q',
          icon: require("../../../assets/search_icon/icon_google.png"),
          desc: 'Google搜索'
        },
        baidu_dev:{
          title: '百度开发者',
          url: 'https://kaifa.baidu.com/searchPage',
          key: 'wd',
          icon: require("../../../assets/search_icon/icon_baidu_dev.png"),
          desc: '百度开发者搜索,无任何广告'
        }
      },

      // 从store里面读取数据并使用
      scType: "",
      scData: {},
      scTypeList: [],
      scText: ""
    };
  },
  created() {
    // 设置默认值
    this.scTypeList = Object.keys(this.searchList)
    let last_type = sessionStorage.getItem("last_type");
    let default_type = last_type
      ? last_type
      : this.scTypeList[0];
    this.scType = default_type;
    this.scData = this.searchList[default_type];
  },
  methods: {
    // 选择表单变化的时候同步数据，同时添加到session
    changeData: function(command) {
      this.scType = command;
      sessionStorage.setItem("last_type", command);
      this.scData = this.searchList[command];
    }
  }
};
</script>

<style>

#search-component .el-input {
  border-radius: 24px;
  box-shadow: 0px 1px 6px 0px rgba(115, 115, 129, 0.28);
}

#search-component .el-input-group__prepend {
  background-color: white;
  padding: 0 5px 0 20px;
  border-radius: 24px 0 0 24px;
  cursor: pointer;
}

#search-component .el-input__inner {
  border-left: 0;
  border-right: 0;
  padding: 0 15px 0 10px;
  line-height: 1rem;
}

#search-component .el-input__inner:focus {
  border-color: #dcdfe6;
}

#search-component .el-input__inner:hover {
  border-color: #dcdfe6;
}

#search-component .el-input-group__append {
  background-color: white;
  border-radius: 0 24px 24px 0;
}

#search-component .el-icon--right {
  margin-left: 0;
}

img {
  width: 1.2rem;
  margin: 0 0.2rem -0.2rem 0;
}
</style>
