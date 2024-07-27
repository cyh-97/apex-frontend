// 通用js方法封装处理

const baseURL = process.env.VUE_APP_BASE_API;

/**
 * 种子数据-公司(最高级部门)ID
 * @type {number}
 */
const CompanyId = 10_000;

/**
 * 种子数据-主管理员用户ID
 * @type {number}
 */
const AdminUserId = 11_000;

/**
 * 种子数据-主管理员角色ID
 * @type {number}
 */
const AdminRoleId = 12_000;

/**
 * 种子数据-公司(最高级部门)ID
 * @returns {number}
 */
export function getCompanyId() {
  return CompanyId;
}

/**
 * 种子数据-主管理员用户ID
 * @returns {number}
 */
export function getAdminUserId() {
  return AdminUserId;
}

/**
 * 种子数据-主管理员角色ID
 * @returns {number}
 */
export function getAdminRoleId() {
  return AdminRoleId;
}

/**
 * 日期格式化
 * @param time
 * @param pattern
 * @returns {string|null}
 */
export function parseTime(time, pattern) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    } else if (typeof time === "string") {
      time = time.replace(new RegExp(/-/gm), "/");
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    if (result.length > 0 && value < 10) {
      value = "0" + value;
    }
    return value || 0;
  });
  return time_str;
}

/**
 * 表单重置
 * @param refName
 */
export function resetForm(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields();
  }
}

/**
 * 添加日期范围
 * @param { beginTime: '', endTime: '', page: 1} params
 * @param {*} dateRange 日期范围数组
 * @param {*} propName C#属性名首字母大写
 * @returns
 */
export function addDateRange(params, dateRange, propName) {
  let search = params;
  search =
    typeof search === "object" && search !== null && !Array.isArray(search)
      ? search
      : {};
  dateRange = Array.isArray(dateRange) ? dateRange : [];
  if (typeof propName === "undefined") {
    search["beginTime"] = dateRange[0];
    search["endTime"] = dateRange[1];
  } else {
    search["begin" + propName] = dateRange[0];
    search["end" + propName] = dateRange[1];
  }
  return search;
}

/**
 * 添加日期范围
 * @param dateRange
 * @param index
 * @returns {undefined}
 */
export function addDateRange2(dateRange, index) {
  var time = undefined;
  if (null != dateRange && "" != dateRange) {
    if (dateRange.length <= 2) {
      time = dateRange[index];
    }
  }
  return time;
}

/**
 * 获取系统时间
 */
export function getDate(i)
{
  let date = new Date();
  date.setDate(date.getDate()+i)
  let year = date.getFullYear() // 年
  let month = date.getMonth() + 1; // 月
  let day = date.getDate(); // 日
  // 给一位数的数据前面加 “0”
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (day >= 0 && day <= 9) {
    day = "0" + day;
  }
  return  year + "-" + month + "-" + day;
}

/**
 * 获取周日期
 * @param type
 * @param dates
 * @returns {string}
 */
export function getMonday(type, dates) {
  let now = new Date();
  let nowTime = now.getTime();
  let day = now.getDay();
  let longTime = 24 * 60 * 60 * 1000;
  let n = longTime * 7 * (dates || 0);
  let dd;
  if (type === "s") {
    dd = nowTime - (day - 1) * longTime + n;
  }
  if (type === "e") {
    dd = nowTime + (7 - day) * longTime + n;
  }
  dd = new Date(dd);
  let y = dd.getFullYear();
  let m = dd.getMonth() + 1;
  let d = dd.getDate();
  m = m < 10 ? "0" + m: m;
  d = d < 10 ? "0" + d: d;
  return y + "-" + m + "-" + d;
}

/**
 * 获取月日期
 * @param type
 * @param months
 * @returns {string}
 */
export function getMonth(type, months) {
  let d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth() + 1;
  if (Math.abs(months) > 12) {
    months = months % 12;
  }
  if (months !== 0) {
    if (month + months > 12) {
      year++;
      month = (month + months) % 12;
    } else if (month + months < 1) {
      year--;
      month = 12 + month + months;
    } else {
      month = month + months;
    }
  }
  month = month < 10 ? "0" + month: month;
  let date = d.getDate();
  let firstday = year + "-" + month + "-" + "01";
  let lastday = "";
  if (month === "01" || month === "03" || month === "05" || month === "07" || month === "08" || month === "10" || month === "12") {
    lastday = year + "-" + month + "-" + 31;
  } else if (month === "02") {
    if ((year % 4 === 0 && year % 100 !== 0) || (year % 100 === 0 && year % 400 === 0)) {
      lastday = year + "-" + month + "-" + 29;
    } else {
      lastday = year + "-" + month + "-" + 28;
    }
  } else {
    lastday = year + "-" + month + "-" + 30;
  }
  var day = "";
  if (type === "s") {
    day = firstday;
  } else {
    day = lastday;
  }
  return day;
}
/**
 * 回显数据字典
 * @param datas
 * @param value
 * @returns {string}
 */
export function selectDictLabel(datas, value) {
  if (value === undefined) {
    return "";
  }
  var actions = [];
  Object.keys(datas).some((key) => {
    if (datas[key].dictValue === "" + value) {
      actions.push(datas[key].dictLabel);
      return true;
    }
  });
  if (actions.length === 0) {
    actions.push(value);
  }
  return actions.join("");
}

/**
 * 传入名字,根据名字生成颜色,这样颜色就固定下来了
 * @param name
 * @returns {string}
 */
export function extractColorByName(name) {
  let temp = [];
  temp.push("#");
  for (let index = 0; index < name.length; index++) {
    temp.push(parseInt(name[index].charCodeAt(0), 10).toString(16));
  }
  return temp.slice(0, 5).join("").slice(0, 4);
}

/**
 * 截取名字后两位
 * @param name
 * @returns {string}
 */
export function extractLastName(name){
  let lastName = name;
  if(name.length > 2){
    lastName = name.substring(name.length-2, name.length);
  }
  return lastName;
}

/**
 * 回显数据字典（字符串数组）
 * @param datas
 * @param value
 * @param separator
 * @returns {string}
 */
export function selectDictLabels(datas, value, separator) {
  if (value === undefined) {
    return "";
  }
  var actions = [];
  var currentSeparator = undefined === separator ? "," : separator;
  var temp = value.split(currentSeparator);
  Object.keys(value.split(currentSeparator)).some((val) => {
    var match = false;
    Object.keys(datas).some((key) => {
      if (datas[key].value === "" + temp[val]) {
        actions.push(datas[key].label + currentSeparator);
        match = true;
      }
    });
    if (!match) {
      actions.push(temp[val] + currentSeparator);
    }
  });
  return actions.join("").substring(0, actions.join("").length - 1);
}

/**
 * table是否显示当前列
 * @param columns
 * @param value
 */
export function showColumn(columns, value) {
  columns.filter((item, index) => {
    // console.log(item);
    return item.key === value;
  });
}

/**
 * 通用下载方法
 * @param url
 * @param fileName
 */
export function download(url, fileName) {
  // window.location.href = baseURL + "/common/download?fileName=" + encodeURI(fileName) + "&delete=" + true;
  // window.open(baseURL + "/common/download?fileName=" + encodeURI(fileName) + "&delete=" + true)
  window.open(baseURL + url);
}

/**
 * 字符串格式化(%s )
 * @param str
 * @returns {*|string}
 */
export function sprintf(str) {
  var args = arguments,
    flag = true,
    i = 1;
  str = str.replace(/%s/g, function () {
    var arg = args[i++];
    if (typeof arg === "undefined") {
      flag = false;
      return "";
    }
    return arg;
  });
  return flag ? str : "";
}

/**
 * 转换字符串，undefined,null等转化为""
 * @param str
 * @returns {string|*}
 */
export function praseStrEmpty(str) {
  if (!str || str === "undefined" || str === "null") {
    return "";
  }
  return str;
}

/**
 * 转换字符串，undefined,null等转化为0
 * @param str
 * @returns {number|*}
 */
export function praseStrZero(str) {
  if (!str || str === "undefined" || str === "null") {
    console.log("zero");
    return 0;
  }
  return str;
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 * @param {*} rootId 根Id 默认 0
 */
export function handleTree(data, id, parentId, children, rootId) {
  id = id || "id";
  parentId = parentId || "parentId";
  children = children || "children";
  rootId =
    rootId ||
    Math.min.apply(
      Math,
      data.map((item) => {
        return item[parentId];
      })
    ) ||
    0;
  //对源数据深度克隆
  const cloneData = JSON.parse(JSON.stringify(data));
  //循环所有项
  const treeData = cloneData.filter((father) => {
    let branchArr = cloneData.filter((child) => {
      //返回每一项的子级数组
      return father[id] === child[parentId];
    });
    branchArr.length > 0 ? (father.children = branchArr) : "";
    //返回第一层
    return father[parentId] === rootId;
  });
  return treeData !== "" ? treeData : data;
}

/**
 * 构造自定义字典数据
 * @param {*} data 数据源
 * @param {*} lableId id字段 默认 'lableId'
 * @param {*} labelName 名称 默认 'labelName'
 */
export function handleDict(data, lableId, labelName) {
  lableId = lableId || "id";
  labelName = labelName || "name";
  //循环所有项
  var dictList = [];
  if (!Array.isArray(data)) {
    return [];
  }
  data.forEach((element) => {
    dictList.push({
      dictLabel: element[labelName],
      dictValue: element[lableId].toString(),
    });
  });
  return dictList;
}

/**
 * 验证是否为blob格式
 * @param data
 * @returns {Promise<boolean>}
 */
export async function blobValidate(data) {
  try {
    const text = await data.text();
    JSON.parse(text);
    return false;
  } catch (error) {
    return true;
  }
}

/**
 * 获取地址栏参数
 * @param name
 * @returns {string|null}
 * @constructor
 */
export function GetUrlQueryString(name) {
  let reg = new RegExp("(^|%3F)" + name + "%3D([^&]*)(&|$)");
  let r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

/**
 * 获取地址栏参数
 * @param name
 * @returns {string}
 * @constructor
 */
export function GetUrlQueryStr (name) {
  debugger;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(name);
}

/**
 * 计算两个日期之间的差值
 * @param {*} date_1
 * @param {*} date_2
 */
export function getDiffDay(date_1, date_2) {
  let totalDays, diffDate
  let myDate_1 = Date.parse(date_1)
  let myDate_2 = Date.parse(date_2)
  // 将两个日期都转换为毫秒格式，然后做差
  diffDate = Math.abs(myDate_1 - myDate_2) // 取相差毫秒数的绝对值
  totalDays = Math.floor(diffDate / (1000 * 3600 * 24)) // 向下取整
  // console.log(totalDays)
  return totalDays // 相差的天数
}
