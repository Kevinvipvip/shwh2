import drawQrcode from '../../utils/weapp.qrcode.min.js';
const app = getApp();

Page({
  data: {
    wuliu: ['已接收', '抵达深圳', '抵达广州'],
  },
  onLoad() {
    app.modal(document.referrer);
  },
  img_load(e) {
    // app.modal(JSON.stringify(e.detail));
  },
  errImg(e) {
    // app.modal(JSON.stringify(e));
  }
});