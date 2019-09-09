const app = getApp();

Page({
  data: {
    user: {},
    cont1: '即刻加入山洞文创生态平台，成为文创',
    cont2: '代言人，探寻山洞中的无限可能与惊喜',
    qrcode: '',

    download_bg: '',
    download_header: '',
    download_codeurl: '',
    show_set_btn: false,

    share_image: "",  // 合成的图
    share_show: false,
  },
  onLoad() {
    this.setData({download_bg: app.my_config.base_url + '/' + 'static/uploads/cave/active-bg.jpg'})
    this.download(this.data.download_bg, 'download_bg');

    this.mydetail(() => {
      this.download(this.data.user.avatar, 'download_header');
    });

    this.getQrcode(() => {
      this.download(this.data.qrcode, 'download_codeurl');
    });
  },
  // 下载文件，存入指定的data
  download(url, field) {
    let that = this;
    wx.downloadFile({
      url: url,
      success(res) {
        that.setData({
          [field]: res.tempFilePath
        })
      },
      fail (err) {
        console.log(err, field);
        // 下载失败
      }
    });
  },
  mydetail(succ) {
    let post = {
      token: app.user_data.token
    };

    app.ajax('my/mydetail', post, (res) => {
      res.avatar = res.avatar.indexOf('https') === 0 ? res.avatar : app.my_config.base_url + '/' + res.avatar;
      this.setData({ user: res }, () => {
        if (succ) {
          succ();
        }
      });
    });
  },
  getQrcode(succ) {
    let post = {
      token: app.user_data.token
    };

    app.ajax('activity/getQrcode', post, (res) => {
      res = app.my_config.base_url + '/' + res;
      this.setData({ qrcode: res }, () => {
        if (succ) {
          succ();
        }
      });
    });
  },
  save_image() {
    wx.showLoading({
      title: '分享图片生成中...',
      icon: 'loading',
      mask: true
    });

    // 获取背景图片信息
    var that = this;
    let promise1 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: that.data.download_bg,
        success: function (res) {
          resolve(res);
        },
        fail() {
          wx.hideLoading();
          app.toast('生成失败，请重试');
        }
      })
    });
    //获取头像信息
    let promise2 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: that.data.download_header,
        success: function (res) {
          resolve(res);
        },
        fail() {
          wx.hideLoading();
          app.toast('生成失败，请重试');
        }
      })
    });
    //获取二维码
    let promise3 = new Promise(function (resolve, reject) {
      wx.getImageInfo({
        src: that.data.download_codeurl,
        success: function (res) {
          resolve(res);
        },
        fail() {
          wx.hideLoading();
          app.toast('生成失败，请重试');
        }
      })
    });

    Promise.all([
      promise1, promise2, promise3
    ]).then(res => {


      /* 图片获取成功才执行后续代码 */
      var canvas = wx.createCanvasContext('share-canvas');

      // 绘制背景图
      canvas.drawImage(res[0].path, 0, 0, 750, 1150);

      // 绘制头像
      canvas.save();
      canvas.beginPath();
      canvas.arc(375, 274, 100, 0, 2 * Math.PI);
      canvas.clip();
      canvas.drawImage(res[1].path, 275, 174, 200, 200);
      canvas.restore();


      // 绘制微信昵称
      canvas.setFontSize(40);
      canvas.setFillStyle("#000");
      canvas.setStrokeStyle("#000");
      canvas.setTextAlign('center');
      canvas.fillText(this.data.user.nickname, 375, 433, 500);

      // 绘制描述文字
      canvas.setFontSize(30);
      canvas.setFillStyle("#aaa");
      canvas.setStrokeStyle("#aaa");
      canvas.setTextAlign('center');
      canvas.fillText(that.data.cont1, 375, 517, 500);
      canvas.fillText(that.data.cont2, 375, 562, 500);

      // 绘制小程序二维码
      canvas.drawImage(res[2].path, 225, 621, 300, 300);

      // 绘制打卡昵称
      canvas.setFontSize(35);
      canvas.setFillStyle("#666");
      canvas.setStrokeStyle("#666");
      canvas.setTextAlign('center');
      canvas.fillText('扫码进入小程序', 375, 1000, 300);

      canvas.draw();

      setTimeout(function () {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 750,
          height: 1150,
          destWidth: 750,
          destHeight: 1150,
          canvasId: 'share-canvas',
          success: function (res) {
            that.setData({
              share_image: res.tempFilePath,
              share_show: true
            });
            wx.hideLoading()
          },
          fail(res) {
            // 生成失败
          }
        })
      }, 500)
    })
  },
  save_album() {
    let that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.writePhotosAlbum']) {
          wx.saveImageToPhotosAlbum({
            filePath: that.data.share_image,
            success() {
              app.modal('图片成功保存到相册了，快去分享朋友圈吧', () => {
                that.setData({ share_show: false });
              });
            },
            fail(err) {
              if (err.errMsg.indexOf('cancel') !== -1) {
                app.toast('保存已取消');
              } else {
                app.toast('保存失败');
              }
            }
          })
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              that.save_album();
            },
            fail() {
              that.setData({
                show_set_btn: true
              });
            }
          });
        }
      }
    });
  },
  hide_set_btn: function () {
    this.setData({
      show_set_btn: false
    })
  }
})