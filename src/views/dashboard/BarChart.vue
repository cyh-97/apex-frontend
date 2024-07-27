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
        planData: [],
        data: [],
        rateData:[],
        avgData:[]
      }
    }
  },
  watch:{
    chartData:{
      handler(val) {
        this.getDataInfo()
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getDataInfo()
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
    getDataInfo(){

    },
    initChart() {
      this.chart = echarts.init(this.$el)

      this.setOptions()
    },
    setOptions(first) {
      let that = this
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
          data: ["目标数", "完成数", "生产效率","平均效率"],
          top: "5%",
          textStyle: {
            color: "#1FC3CE",
            fontSize: 14
          }
        },
        xAxis: {
          data: this.seriesData.xData,
          axisLine: {
            show: true, //隐藏X轴轴线
            lineStyle: {
              color: "#3d5269",
              width: 1
            }
          },
          axisTick: {
            show: true, //隐藏X轴刻度
            alignWithLabel: true
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: "#000", //X轴文字颜色
              fontSize: 14,
              fontWeight : 1
            },
            interval: 0,
          }
        },
        yAxis: [{
          type: "value",
          name: "",

          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
              color: "#3d5269"
            }
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          axisLabel: {
            show: true,
            textStyle: {
              color: "#396A87",
              fontSize: 14
            }
          }
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
          }
        ],
        series: [{
          name: "目标数",
          type: "bar",
          barWidth: 18,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: "#65c294"
              },
                {
                  offset: 1,
                  color: "#45b97c"
                }
              ])
            }
          },
          data: this.seriesData.planData
        },
          {
            name: "完成数",
            type: "bar",
            barWidth: 18,
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                  offset: 0,
                  color: "#f26522"
                },
                  {
                    offset: 1,
                    color: "#f36c21"
                  }
                ])
              }
            },
            data:this.seriesData.data
          },
          {
            name: "生产效率",
            yAxisIndex: 1, //使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用
            smooth: true,
            type: 'line',
            animationDuration: 2800,
            animationEasing: 'cubicInOut',
            itemStyle: {
              normal: {
                color: '#3888fa',
                lineStyle: {
                  color: '#3888fa',
                  width: 2
                }
              }
            },
            data: this.seriesData.rateData
          },
          {
            name: "平均效率",
            yAxisIndex: 1, //使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用
            smooth: true,
            type: 'line',
            animationDuration: 2800,
            animationEasing: 'cubicInOut',
            label: {
              show: true,
              position: [30, -5],
              formatter: function(data) {
                if(data.value === 0 || data.dataIndex < that.seriesData.avgData.length - 1 ) return ''
                else return data.value + '%'
              },
              textStyle: {
                color: '#f15a22',
                paddingLeft:15,
                fontSize:18
              }
            },
            itemStyle: {
              normal: {
                color: '#f15a22',
                lineStyle: {
                  color: '#f15a22',
                  width: 2
                }
              }
            },
            data: this.seriesData.avgData
          }
        ]
      }
      this.chart.setOption(option)
      if(first === true){
        tools.loopShowTooltip(this.chart, option, {loopSeries: false });//自动轮播主要看这段话
      }
    }
  }
}
</script>
