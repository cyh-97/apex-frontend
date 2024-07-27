<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import * as echarts from 'echarts';
import resize from './mixins/resize'
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
      default: '200px'
    }
  },
  data() {
    return {
      chart: null,
      chartData: {
        colors: ['#27D38A','#ff7500','#216994'],
        values:[],
        qty:[],
        names:[],
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getInspectionInfo()
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
    getInspectionInfo(){

    },
    initChart() {
      this.chart = echarts.init(this.$el)

      let data = this.chartData

      let seriesData = []
      let titleData = []
      let legendData = []
      data.values.forEach(function(item, index) {
        titleData.push({
          text: data.names[index],
          left: 21+(30*(index))+'%',
          top: '54%',

          textAlign: 'center',
          textStyle: {
            fontSize: '18',
            color: '#687284',
            fontWeight: 'bold',
          },
        })
        legendData.push({
            name:data.names[index],
            show: true,
            left: 12+(32*(index))+'%',
            top: '58%',
            data: [
              { name:data.names[index]+'良品数',itemStyle: { color: "#2a5caa" }, },
              { name:data.names[index]+'不良品数',itemStyle: { color: "#d93a49" },}],
            width:80,
            padding: [20, -10],
            icon: 'circle',
            itemHeight: 14,
            itemGap: 0,
            formatter: function(name) {
              if(name.indexOf('不良品') > -1){
                return "{title|不良数}{value|：" + data.qty[index].defect +"} "
              }else{
                return "{title|检验数}{value|：" + data.qty[index].total +"} "
              }

            },
            textStyle: {
              lineHeight: 30,
              rich: {
                title: {
                  fontSize: 12,
                  lineHeight: 14,
                  color: data.colors[index]
                },
                value: {
                  fontSize: 12,
                  lineHeight: 14,
                  color: data.colors[index]
                }
              }

          },
        })
        seriesData.push({
          name:data.names[index],
          type: 'pie',
          radius: ['40', '44'],
          center: [22+(30*(index))+'%', '29%'],
          hoverAnimation: false,
          label: {
            normal: {
              position: 'center'
            },
          },
          data: [{
            value: item,
            name: data.names[index]+'不良品数',
            itemStyle: {
              normal: {
                color: data.colors[index],
              }
            },
            label: {
              normal: {
                show: false,
              }
            }
          },
            {
              value: 100 - item,
              name: data.names[index]+'良品数',
              tooltip: {
                show: false
              },
              itemStyle: {
                normal: {
                  color: '#edf1f4',
                }
              },
              label: {
                normal: {
                  formatter: item + '',
                  textStyle: {
                    fontSize: 22,
                    color: data.colors[index]
                  }
                },

              }
            }
          ]
        })
      })

      let option = option = {
        title:titleData,
        legend:legendData,
        series: seriesData
      }

      this.chart.setOption(option)
    }
  }
}
</script>
