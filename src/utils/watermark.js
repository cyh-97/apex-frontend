let watermark = {}

let setWatermark = (ele,str,date) => {
  let id = '1.23452384164.123412416'

  if (document.getElementById(id) !== null) {
    document.getElementById(id).remove()
    //document.body.removeChild(child)
  }

  //创建一个画布
  let can = document.createElement('canvas')
  //设置画布的长宽
  can.width = 200
  can.height = 150

  let cans = can.getContext('2d')
  //旋转角度
  cans.rotate(-15 * Math.PI / 180)
  cans.font = '14px Vedana'
  //设置填充绘画的颜色、渐变或者模式
  cans.fillStyle = 'rgba(200, 200, 200, 0.40)'
  //设置文本内容的当前对齐方式
  cans.textAlign = 'left'
  //设置在绘制文本时使用的当前文本基线
  cans.textBaseline = 'Middle'
  //在画布上绘制填色的文本（输出的文本，开始绘制文本的X坐标位置，开始绘制文本的Y坐标位置）
  cans.fillText(str, can.width / 4, can.height / 2)
  cans.fillText(date,can.width / 4, can.height / 3)
  let div = document.createElement('div')
  div.id = id
  div.style.pointerEvents = 'none'
  div.style.top = '30px'
  div.style.left = '0px'
  div.style.position = 'absolute'
  div.style.zIndex = '100000'
  div.style.width = ele === undefined ? '1920px' : ele.scrollWidth  + 'px'
  div.style.height = ele === undefined ? '1080px' : ele.scrollHeight * 3 + 'px'
  div.style.background = 'url(' + can.toDataURL('image/png') + ') left top repeat'
  //   document.body.appendChild(div)
  div.style.opacity = '1' // 水印的透明度
  ele.appendChild(div)
  return id
}

// 该方法只允许调用一次
watermark.set = (ele,str,date) => {
  let id = setWatermark(ele,str,date) // str,date代表的是两行水印。如果需好几个的话再追加。
  setInterval(() => {
    if (document.getElementById(id) === null) {
      id = setWatermark(ele,str,date)
    }
  }, 500);
  window.onresize = () => {
    setWatermark(ele,str,date)
  };
}

export default watermark
