/*
 解决分页截断问题，暂时没解决上下边距问题。
 * 使用说明
 * ele:需要导出pdf的容器元素(dom节点 不是id)
 * pdfFileName: 导出文件的名字 通过调用outPutPdfFn方法也可传参数改变
 * splitClassName: 避免分段截断的类名 当pdf有多页时需要传入此参数 , 避免pdf分页时截断元素  如表格<tr class="itemClass"></tr>,element表格可传 el-table__row
 * scrollWidth是当你要导出的容器内产生了横向滚动的时候，你要将最大宽度传进去，比如我用了element表格，表格内部产生了滚动，  let table__header = pdfDom.getElementsByClassName("el-table__header")[0]; 将 table__header.offsetWidth传进去才能导出横向滚动的部分。
 * 调用方式 先 let pdf = new PdfLoader(ele, 'pdf' ,'itemClass'，scrollWidth);
 * 若想改变pdf名称 pdf.outPutPdfFn(fileName);  outPutPdfFn方法返回一个promise 可以使用then方法处理pdf生成后的逻辑
 * */
// 导出页面为PDF格式
import html2Canvas from "html2canvas";
import JsPDF from "jspdf";
import watermark from "@/utils/watermark";
class PdfLoader {
  constructor(ele, pdfFileName, splitClassName, scrollWidth) {
    this.ele = ele;
    this.pdfFileName = pdfFileName;
    this.splitClassName = splitClassName;
    this.A4_WIDTH = 595; // a4纸的尺寸[595,842],单位像素
    this.A4_HEIGHT = 842;
    this.scrollWidth = scrollWidth || ele.scrollWidth; // 大多时候不需要传width,但是出现容器内容出现横向滚动的情况，就要传入最大宽度，不然横向会导出不全

  }

  // 生成pdf
  async getPDF(resolve, reject, cloneDom) {
    let ele = cloneDom;
    let pdfFileName = this.pdfFileName;

    html2Canvas(cloneDom, {
      useCORS: true, //允许canvas画布内可以跨域请求外部链接图片, 允许跨域请求。
      width: this.scrollWidth || ele.scrollWidth,
      dpi: 300,
      scale: 1.5,
      background: "#FFF"
    }).then(async canvas => {
      try {
        let contentWidth = canvas.width;
        let contentHeight = canvas.height;
        //一页pdf显示html页面生成的canvas高度;
        let pageHeight = (contentWidth / this.A4_WIDTH) * this.A4_HEIGHT; // 这样写的目的在于保持宽高比例一致 pageHeight/canvas.width = a4纸高度/a4纸宽度// 宽度和canvas.width保持一致
        //未生成pdf的html页面高度
        let leftHeight = contentHeight;
        //页面偏移
        let position = 0;
        //a4纸的尺寸[595,842],单位像素，html页面生成的canvas在pdf中图片的宽高
        let imgWidth = this.A4_WIDTH - 20; //-20为了页面有右边距
        let imgHeight = (this.A4_WIDTH / contentWidth) * contentHeight;
        let pageData = canvas.toDataURL("image/jpeg", 1.0);
        let pdf = JsPDF("", "pt", "a4");
        //有两个高度需要区分，一个是html页面的实际高度，和生成pdf的页面高度(841.89)
        //当内容未超过pdf一页显示的范围，无需分页
        if (leftHeight < pageHeight) {
          //在pdf.addImage(pageData, 'JPEG', 左，上，宽度，高度)设置在pdf中显示
          pdf.addImage(pageData, "JPEG", 10, 0, imgWidth, imgHeight);
        } else {
          // 分页
          while (leftHeight > 0) {
            // 10是因为我上面减掉了20
            pdf.addImage(pageData, "JPEG", 10, position, imgWidth, imgHeight);
            leftHeight -= pageHeight;
            position -= this.A4_HEIGHT;
            //避免添加空白页
            if (leftHeight > 0) {
              pdf.addPage();
            }
          }
        }
        // 返回promise
        pdf.save(pdfFileName + ".pdf", { returnPromise: true }).then(() => {
          // 移除克隆节点
          cloneDom.parentNode.removeChild(cloneDom);
          //去除添加的空div 防止页面混乱（使用了克隆节点就不需要这里移除了）
          // let doms = document.querySelectorAll(".emptyDiv");
          // for (let i = 0; i < doms.length; i++) {
          //   doms[i].remove();
          // }
        });
        // this.ele.style.height = "";
        resolve();
      } catch (error) {
        reject();
      }
    });
  }

  // 处理数据
  async outPutPdfFn() {
    // 滚动置顶,防止顶部空白
    window.pageYoffset = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    return new Promise((resolve, reject) => {
      let cloneDom = this.ele.cloneNode(true); // 复制一个dom元素插入body,解决横向滚动问题
      cloneDom.style.width = this.scrollWidth + "px";
      document.body.appendChild(cloneDom);
      cloneDom.style.height = "initial";

      let pageHeight = (this.scrollWidth / this.A4_WIDTH) * this.A4_HEIGHT;

      let pageNum = 1; //pdf页数
      let eleBounding = cloneDom.getBoundingClientRect();

      for (let j = 0; j < this.splitClassName.length; j++) {
        // 获取分割dom，此处为class类名为item的dom
        let domList = cloneDom.getElementsByClassName(this.splitClassName[j]);
        // 进行分割操作，当dom内容已超出a4的高度，则将该dom前插入一个空dom，把他挤下去，分割

        for (let i = 0; i < domList.length; i++) {
          let node = domList[i];
          // getBoundingClientRect() 方法返回元素的大小及其相对于视口的位置。
          let bound = node.getBoundingClientRect();
          // 两者相减获得当前元素距离容器顶部距离
          let offset2Ele = bound.top - eleBounding.top;
          let currentPage = Math.ceil(
            (bound.bottom - eleBounding.top) / pageHeight
          ); //当前元素应该在哪一页
          if (pageNum < currentPage) {
            pageNum++;
            let divParent = domList[i].parentNode; // 获取该div的父节点
            let newNode = document.createElement("div");
            newNode.className = "emptyDiv";
            newNode.style.background = "white";
            newNode.style.height =
              pageHeight * (pageNum - 1) - offset2Ele + 10 + "px"; //+30为了在换下一页时有顶部的边距
            newNode.style.width = "100%";
            let next = domList[i].nextSibling; // 获取div的下一个兄弟节点
            // 判断兄弟节点是否存在
            if (next) {
              // 存在则将新节点插入到div的下一个兄弟节点之前，即div之后
              divParent.insertBefore(newNode, node);
            } else {
              // 不存在则直接添加到最后,appendChild默认添加到divParent的最后
              divParent.appendChild(newNode);
            }
          }
        }
      }


      /*
      // 获取分割dom，此处为class类名为item的dom
      let domList = cloneDom.getElementsByClassName(this.splitClassName);
      // 进行分割操作，当dom内容已超出a4的高度，则将该dom前插入一个空dom，把他挤下去，分割
      let pageNum = 1; //pdf页数
      let eleBounding = cloneDom.getBoundingClientRect();
      for (let i = 0; i < domList.length; i++) {
        let node = domList[i];
        // getBoundingClientRect() 方法返回元素的大小及其相对于视口的位置。
        let bound = node.getBoundingClientRect();
        // 两者相减获得当前元素距离容器顶部距离
        let offset2Ele = bound.top - eleBounding.top;
        let currentPage = Math.ceil(
          (bound.bottom - eleBounding.top) / pageHeight
        ); //当前元素应该在哪一页
        if (pageNum < currentPage) {
          pageNum++;
          let divParent = domList[i].parentNode; // 获取该div的父节点
          let newNode = document.createElement("div");
          newNode.className = "emptyDiv";
          newNode.style.background = "white";
          newNode.style.height =
            pageHeight * (pageNum - 1) - offset2Ele + 30 + "px"; //+30为了在换下一页时有顶部的边距
          newNode.style.width = "100%";
          let next = domList[i].nextSibling; // 获取div的下一个兄弟节点
          // 判断兄弟节点是否存在
          if (next) {
            // 存在则将新节点插入到div的下一个兄弟节点之前，即div之后
            divParent.insertBefore(newNode, node);
          } else {
            // 不存在则直接添加到最后,appendChild默认添加到divParent的最后
            divParent.appendChild(newNode);
          }
        }
      }

      */

      // 异步函数，导出成功后处理交互
      this.getPDF(resolve, reject, cloneDom);
    });
  }
}

export default PdfLoader;
