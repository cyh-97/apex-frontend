<template>
  <el-form ref="form" :model="user" label-width="80px">
    <el-form-item label="用户名称" prop="nickName">
      <el-input v-model="user.userName" />
    </el-form-item>
    <el-form-item label="手机号码" prop="phone">
      <el-input v-model="user.phone" maxlength="11" />
    </el-form-item>
    <el-form-item label="邮箱" prop="email">
      <el-input v-model="user.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="user.sex">
        <el-radio :label=0>男</el-radio>
        <el-radio :label=1>女</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script>

export default {
  props: {
    user: {
      type: Object,
    },
  },
  data() {
    return { }
  },
  methods: {
    close() {
      this.$store.dispatch("tagsView/delView", this.$route);
      this.$router.push({ path: "/index" });
    },
  },
};
</script>
