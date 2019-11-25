import drawQrcode from "../../utils/weapp.qrcode.min";

const app = getApp();

Page({
  data: {
    full_loading: true,

    avatar: '',
    nickname: '',
    poster: '',
    show_set_btn: false
  },
  onLoad() {
    this.mydetail(() => {
      this.create_poster();
    });
  },
  mydetail(complete) {
    app.ajax('my/mydetail', null, res => {
      app.avatar_format(res, 'avatar');

      this.setData({
        nickname: res.nickname || '',
        avatar: res.avatar
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  create_poster() {
    // 下载头像
    let promise1 = new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: this.data.avatar,
        success: res => {
          resolve(res.path);
        },
        fail: () => {
          app.toast('生成失败，请重试');
        }
      })
    });

    // 生成海报二维码
    let promise2 = new Promise((resolve, reject) => {
      drawQrcode({
        width: 100,
        height: 100,
        correctLevel: 1,
        canvasId: 'qrcode',
        text: 'http://caves.wcip.net/online-activity',
        callback() {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            destWidth: 100,
            destHeight: 100,
            canvasId: 'qrcode',
            success: res => {
              resolve(res.tempFilePath);
            },
            fail: () => {
              // 生成失败
              app.toast('生成失败，请重试');
            }
          });
        }
      });
    });

    // 海报背景
    let promise3 = new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: 'https://caves.wcip.net/static/share.jpg',
        success: res => {
          resolve(res.path);
        },
        fail: () => {
          app.toast('生成失败，请重试');
        }
      })
    });

    Promise.all([
      promise1, promise2, promise3
    ]).then(p_res => {
      this.setData({full_loading: false});
      
      let avatar = p_res[0];
      let qrcode = p_res[1];
      let poster_bg = p_res[2];
      
      var canvas = wx.createCanvasContext('poster-canvas');

      // 绘制背景图片
      canvas.drawImage(poster_bg, 0, 0, 654, 979);
      canvas.draw();

      // 绘制头像
      canvas.save();
      canvas.beginPath();
      canvas.arc(60, 60, 40, 0, 2 * Math.PI);
      canvas.clip();
      canvas.drawImage(avatar, 20, 20, 80, 80);
      canvas.restore();
      canvas.draw(true);

      // 绘制昵称
      canvas.setFontSize(30);
      canvas.setFillStyle("#333333");
      canvas.fillText(this.data.nickname, 115, 72);
      canvas.draw(true);

      // 绘制二维码
      canvas.drawImage(qrcode, 524, 849, 100, 100);
      canvas.draw(true);

      setTimeout(() => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 654,
          height: 979,
          destWidth: 654,
          destHeight: 979,
          canvasId: 'poster-canvas',
          success: res => {
            this.setData({ poster: res.tempFilePath });
          },
          fail: err => {
            console.log(err, '生成失败');
            // 生成失败
          }
        })
      }, 500);
    });
  },
  // 保存海报
  save_poster() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          wx.saveImageToPhotosAlbum({
            filePath: this.data.poster,
            success: () => {
              app.modal('图片成功保存到相册了，快去分享朋友圈吧');
            },
            fail: err => {
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
            success: () => {
              this.save_poster();
            },
            fail: () => {
              this.setData({
                show_set_btn: true
              });
            }
          });
        }
      }
    });
  },
  hide_set_btn() {
    this.setData({ show_set_btn: false })
  }
});