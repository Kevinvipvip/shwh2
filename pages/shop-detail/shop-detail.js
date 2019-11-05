import drawQrcode from "../../utils/weapp.qrcode.min";

const app = getApp();
var WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    id: 0,
    goods: {},
    rich_text: {},
    add_loading: false,  // 加入购物车loading
    attr_show: false,
    attr_active: false,
    attr_index: 0,  // 选中的参数索引，默认为第一个
    buy_type: 1, // 1.购买 2.购物车
    amount: 0,  // 购买数量

    poster_show: false,  // 是否显示海报
    poster: '',  // 海报图片
    show_set_btn: false
  },
  onLoad(options) {
    this.data.id = options.id;

    // 海报二维码
    drawQrcode({
      width: 150,
      height: 150,
      correctLevel: 1,
      canvasId: 'qrcode',
      text: 'http://caves.wcip.net/shop-detail?id=' + options.id
    });

    this.goodsDetail();
  },
  // 商品详情
  goodsDetail() {
    let post = {
      id: this.data.id,
      token: app.user_data.token
    };

    app.ajax('shop/goodsDetail', post, (res) => {
      // for (let i = 0; i < res.pics.length; i++) {
      //   res.pics[i] = app.my_config.base_url + '/' + res.pics[i];
      // }
      app.format_img(res.pics);
      app.avatar_format(res);
      this.setData({ goods: res });
      let rich_text = res.detail;
      rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
      WxParse.wxParse('rich_text', 'html', rich_text, this);
    });
  },
  // 点击购买
  buy() {
    let data = this.data;

    if (data.goods.stock === 0) {
      app.toast('该商品已告罄！');
    } else {
      let amount;
      if (data.goods.use_attr === 1) {
        if (data.amount === 0) {
          amount = data.goods.attr_list[data.attr_index].stock !== 0 ? 1 : 0;
        } else {
          amount = data.amount;
        }
      } else {
        amount = data.amount || 1;
      }

      this.setData({
        attr_show: true,
        buy_type: 1,
        amount: amount
      }, () => {
        this.setData({ attr_active: true });
      });
    }
  },
  // 点击加入购物车
  cartAdd() {
    let data = this.data;

    if (this.data.goods.stock === 0) {
      app.toast('该商品已告罄！');
    } else {
      let amount;
      if (data.goods.use_attr === 1) {
        if (this.data.amount === 0) {
          amount = data.goods.attr_list[data.attr_index].stock !== 0 ? 1 : 0;
        } else {
          amount = data.amount;
        }
      } else {
        amount = data.amount || 1;
      }

      this.setData({
        attr_show: true,
        buy_type: 2,
        amount: amount
      }, () => {
        this.setData({ attr_active: true });
      });
    }
  },
  // 购买或加入购物车，取决于buy_type的值
  buy_btn() {
    if (this.data.buy_type === 1) {
      if (this.data.amount === 0) {
        app.toast('请至少选择一件商品');
      } else {
        let data = this.data;
        let attr_id;
        if (data.goods.use_attr === 1) {
          attr_id = data.goods.attr_list[data.attr_index].id;
        } else {
          attr_id = 1;
        }
        wx.redirectTo({ url: '/pages/order-create/order-create?id=' + data.id + '&num=' + data.amount + '&attr_id=' + attr_id })
      }
    } else {
      if (this.data.amount === 0) {
        app.toast('请至少选择一件商品');
      } else {
        if (!this.data.add_loading) {
          this.data.add_loading = true;

          let data = this.data;
          let post = {
            token: app.user_data.token,
            goods_id: data.id,
            num: data.amount
          };

          if (data.goods.use_attr === 1) {
            post.attr_id = data.goods.attr_list[data.attr_index].id;
          }

          app.ajax('shop/cartAdd', post, () => {
            let set_data = {
              attr_show: false,
              attr_active: false,
              attr_index: 0,
              amount: 0,
              ['goods.stock']: data.goods.stock - data.amount
            };

            if (data.goods.use_attr === 1) {
              set_data['goods.attr_list[' + data.attr_index + '].stock'] = data.goods.attr_list[data.attr_index].stock - data.amount;
            }

            this.setData(set_data);
            app.toast('已加入购物车~');

            let shop_page = app.get_page('pages/shop/shop');
            if (shop_page) {
              shop_page.cartList();
            }
          }, (err) => {
            app.toast(err.message);
          }, () => {
            this.data.add_loading = false;
          });
        }
      }
    }
  },
  // 去我的购物车
  to_shop_car() {
    wx.navigateTo({ url: '/pages/shop-car/shop-car' });
  },
  // 隐藏参数框
  hide() {
    this.setData({
      attr_show: false,
      attr_active: false
    });
  },
  // 增加
  add() {
    let data = this.data;
    if (data.goods.use_attr === 1) {
      if (data.amount === data.goods.limit || data.amount === data.goods.attr_list[data.attr_index].stock) {
        if (data.amount === data.goods.limit) {
          app.toast('该商品最多限购' + data.goods.limit + '件哦');
        } else {
          app.toast('已经没有这么多商品了');
        }
      } else {
        this.setData({ amount: data.amount + 1 });
      }
    } else {
      if (data.amount === data.goods.limit || data.amount === data.goods.stock) {
        if (data.amount === data.goods.limit) {
          app.toast('该商品最多限购' + data.goods.limit + '件哦');
        } else {
          app.toast('已经没有这么多商品了');
        }
      } else {
        this.setData({ amount: data.amount + 1 });
      }
    }
  },
  // 减少
  sub() {
    let data = this.data;
    if (this.data.amount !== 1) {
      this.setData({ amount: data.amount - 1 });
    }
  },
  // 选择参数
  attr_choose(e) {
    let index = e.currentTarget.dataset.index;
    let data = this.data;
    if (data.goods.attr_list[index].stock === 0) {
      app.toast('该商品已告罄！');
    } else if (data.goods.attr_list[index].stock < data.amount) {
      app.toast('“' + data.goods.attr_list[index].value + '”只有' + data.goods.attr_list[index].stock + '件了');
      this.setData({
        amount: data.goods.attr_list[index].stock,
        attr_index: index
      });
    } else {
      this.setData({ attr_index: index });
    }
  },
  // 去他人主页
  to_person() {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + this.data.goods.uid });
    });
  },
  // 生成海报
  create_poster() {
    if (this.data.poster) {
      this.setData({ poster_show: true });
    } else {
      wx.showLoading({
        title: '海报生成中...',
        mask: true
      });

      // 获得商品图片
      let promise1 = new Promise((resolve, reject) => {
        wx.getImageInfo({
          src: this.data.goods.pics[0],
          success: res => {
            resolve(res);
          },
          fail: () => {
            app.toast('生成失败，请重试');
          }
        })
      });

      // 生成二维码图片
      let promise2 = new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: 150,
          height: 150,
          destWidth: 150,
          destHeight: 150,
          canvasId: 'qrcode',
          success: res => {
            resolve(res.tempFilePath);
          },
          fail: () => {
            // 生成失败
            app.toast('生成失败，请重试');
          }
        });
      });

      Promise.all([
        promise1, promise2
      ]).then(p_res => {
        let goods_pic = p_res[0].path;
        let qrcode = p_res[1];

        // 创建canvas
        var canvas = wx.createCanvasContext('poster-canvas');

        // 绘制白色背景
        canvas.setFillStyle('#ffffff');
        canvas.rect(0, 0, 457, 817);
        canvas.fill();
        canvas.draw();

        // 绘制商品图片
        canvas.drawImage(goods_pic, 17, 17, 423, 423);
        canvas.draw(true);

        // 绘制商品名
        canvas.setFontSize(24);
        canvas.setFillStyle("#333333");
        // canvas.setTextAlign('left');

        let str = this.data.goods.name;
        let str_index = 0;
        let step = 18;
        let rest = str.substr(str_index, step);
        let str_count = 0;
        while (rest) {
          canvas.fillText(rest, 17, 481 + str_count * 40, 423);
          str_index += step;
          rest = str.substr(str_index, step);
          str_count++;
        }
        canvas.draw(true);

        // 绘制人民币符号
        canvas.setFontSize(30);
        canvas.setFillStyle("#ff4141");
        canvas.fillText('¥', 17, 680, 20);
        canvas.draw(true);

        // 绘制价格
        canvas.setFontSize(40);
        canvas.setFillStyle("#ff4141");
        canvas.fillText(this.data.goods.price, 40, 680, 200);
        canvas.draw(true);

        // 绘制二维码
        canvas.drawImage(qrcode, 280, 600, 150, 150);
        canvas.draw(true);

        // 二维码描述
        canvas.setFontSize(20);
        canvas.setFillStyle("#999999");
        canvas.setTextAlign('center');
        canvas.fillText('扫描小程序码', 355, 780, 150);
        canvas.draw(true);

        setTimeout(() => {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 457,
            height: 817,
            destWidth: 457,
            destHeight: 817,
            canvasId: 'poster-canvas',
            success: res => {
              this.setData({
                poster: res.tempFilePath,
                poster_show: true
              });
              wx.hideLoading()
            },
            fail: err => {
              console.log(err, 'cuowu');
              // 生成失败
            }
          })
        }, 500);
      });
    }
  },
  // 关闭海报
  hide_poser() {
    this.setData({ poster_show: false });
  },
  // 保存海报
  save_poster() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          wx.saveImageToPhotosAlbum({
            filePath: this.data.poster,
            success: () => {
              app.modal('图片成功保存到相册了，快去分享朋友圈吧', () => {
                this.setData({ poster_show: false });
              });
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
  // 关闭授权菜单按钮
  hide_set_btn() {
    this.setData({ show_set_btn: false })
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  }
});