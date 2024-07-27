<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import * as echarts from 'echarts';
import resize from './mixins/resize'
import "@/utils/echarts-tooltip-auto-show";

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      seriesData: {
        xData : [],
        data: [],
        rateData:[]
      }
    }
  },
  watch:{
    chartData:{
      handler(val) {
        this.getLineDataInfo()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getLineDataInfo()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    getLineDataInfo(){

    },
    initChart() {
      this.chart = echarts.init(this.$el)

      this.setOptions()
    },
    setOptions() {
      let option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
            label: {
              show: true
            }
          }
        },
        grid: {
          left: "5%",
          top: "18%",
          right: "5%",
          bottom: "12%"
        },
        legend: {
          data: ["不良率", "不良数"],
          top: "5%",
          textStyle: {
            color: "#1FC3CE",
            fontSize: 14
          }
        },
        xAxis: [{
          type: 'category',
          axisLine: { //坐标轴轴线相关设置。数学上的x轴
            show: true,
            lineStyle: {
              color: '#000'
            },
          },
          axisLabel: { //坐标轴刻度标签的相关设置
            textStyle: {
              color: '#000',
              margin: 15,
            },
          },
          axisTick: {
            show: false,
          },
          data: this.seriesData.xData,
        }],
        yAxis: [{
          type: 'value',
          min: 0,
          // max: 140,
          splitLine: {
            show: true,
            lineStyle: {
              color: '#396A87'
            }
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            margin: 20,
            textStyle: {
              color: '#396A87',
            },
          },
          axisTick: {
            show: true, //隐藏X轴刻度
            alignWithLabel: true
          },
        },

          {
            type: "value",
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: "#396A87",
                width: 2
              }
            },
            axisLabel: {
              show: true,
              formatter: "{value} %", //右侧Y轴文字显示
              textStyle: {
                color: "#396A87",
                fontSize: 14
              }
            }
          }],
        series: [{
          name: '不良数',
          type: 'bar',
          barWidth: 20,
          label: {
            show: true,
            position: 'top',
            formatter: function(data) {
              if(data.value === 0) return ''
            },
            textStyle: {
              color: '#000',
            }
          },
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
// 四个数字分别对应 数组中颜色的开始位置，分别为 右，下，左，上。例如（1,0,0,0 ）代表从右边开始渐
// 变。offset取值为0~1，0代表开始时的颜色，1代表结束时的颜色，柱子表现为这两种颜色的渐变。
                offset: 0,
                color: '#90d7ec'
              }, {
                offset: 1,
                color: '#33a3dc'
              }]),
            }
          },
          data: this.seriesData.data
        },
          {
            name: '不良率',
            type: 'line',
            // smooth: true, //是否平滑曲线显示
            showAllSymbol: true,
            symbol: 'emptyCircle',
            symbolSize: 6,
            yAxisIndex:1,
            lineStyle: {
              normal: {
                color: "#27D38A", // 线条颜色
              },
              borderColor: '#f0f'
            },
            label: {
              show: true,
              position: 'left',
              textStyle: {
                color: '#000',
              }
            },
            itemStyle: {
              normal: {
                color: "#28ffb3",

              }
            },
            data: this.seriesData.rateData
          }]
      };
      this.chart.setOption(option)
    }
  }
}
</script>
