// 导出页面为PDF格式
import html2canvas from "html2canvas"
import JSPDF from "jspdf"
var a4w = 190; var a4h = 270 // A4大小，210mm x 297mm，四边各保留20mm的边距，显示区域170x257
var imgw = 40; var imgh = 40
function addWaterMark(doc) {

  var totalPages = doc.internal.getNumberOfPages();

  for (var i = 1; i <= totalPages; i++) {

    doc.setPage(i);

    // doc.addImage("/prod-api/file/download/50ff2b9c-76ab-4625-93e3-54aac3ac990b", 'PNG', 0 , 0 , 210, 297);
    //doc.addImage(require("../assets/logo/logo.jpg"), 'JPG', 0 , 0 , 210, 297);

    // doc.setTextColor(150);

    // doc.text(50, doc.internal.pageSize.height - 30, 'Watermark');

  }

  return doc;

}
export default {
  install (Vue, options) {
    Vue.prototype.ExportSavePdf = function (htmlTitle, currentTime) { //注意：这里建立了方法名字（ExportSavePdf）,Vue.prototype 代表着通过 vue 来加载应用这个方法。下面的全局注册这个文件意思就是说可以将这个方法在 vue项目的全局中应用
      var element = document.getElementById("pdfContent") //特别注意：这个id很重要，需要在页面应用到这个id。
      html2canvas(element, {
        logging: false,
        dpi: 120, // 图片清晰度问题
        useCORS:true, // 支持跨域打印图片
      }).then(function (canvas) {
        var pdf = new JSPDF("p", "mm", "a4") // A4纸，纵向
        var ctx = canvas.getContext("2d")
        var imgHeight = Math.floor(a4h * canvas.width / a4w) // 按A4显示比例换算一页图像的像素高度
        var renderedHeight = 0

        while (renderedHeight < canvas.height) {
          var page = document.createElement("canvas")
          page.width = canvas.width
          page.height = Math.min(imgHeight, canvas.height - renderedHeight)// 可能内容不足一页


          // 用getImageData剪裁指定区域，并画到前面创建的canvas对象中
          page.getContext("2d").putImageData(ctx.getImageData(0, renderedHeight, canvas.width, Math.min(imgHeight, canvas.height - renderedHeight)), 0, 0)
          pdf.addImage(page.toDataURL("image/jpeg", 1.0), "JPEG", 10, 10, a4w, Math.min(a4h, a4w * page.height / page.width)) // 添加图像到页面，保留10mm边距

          renderedHeight += imgHeight
          if (renderedHeight < canvas.height) { pdf.addPage() }// 如果后面还有内容，添加一个空页
          // delete page;
        }
        pdf = addWaterMark(pdf);
        pdf.save(htmlTitle + currentTime)
      })
    }
  }
}
