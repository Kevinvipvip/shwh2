import drawQrcode from '../../utils/weapp.qrcode.min.js';

const app = getApp();

Page({
  data: {
    textarea_padding: '15rpx',
    full_loading: true,
    loading: false,

    wen_pic: '/images/wen.jpg',
    role: 0,  // 普通用户
    lucky_draw_times: 0,
    card_list: [],

    // 卡牌动画用
    scrollTop: 0,  // 页面滚动距离，小程序的boundingClientRect获得是元素相对于屏幕左上角的位置，所以需要加上scrollTop确定其在文档中的位置
    card_class: '',
    card_width: 0,  // 抽卡牌宽
    card_left: 0,
    card_top: 0,
    card_height: 0,  // 抽卡牌高
    img_width: 0,  // 下方卡牌宽
    img_height: 0,  // 下方卡牌高
    ani_src: '',
    ani_show: false,
    ani_width: 0,
    ani_height: 0,
    ani_left: 0,
    ani_top: 0,

    // 送给好友
    gift_show: false,
    choose_index: -1,

    // 卡片码二维码
    cardqr_show: false,
    qrcode_img: '',
    show_set_btn: false,

    // 输入卡片码
    code_modal_show: false,
    card_code: '',

    // 获得文创礼品
    get_cul_gift_show: false,
    get_gift: 0,  // 0.未获得礼物 1.获得文创礼品  2.获得奖金

    // 核销框
    verify_show: false,
    uid: 0,  // 核销用户id
    remark: ''
  },
  onLoad() {
    let phone = wx.getSystemInfoSync();
    if (phone.platform === 'ios') {
      this.setData({ textarea_padding: '0rpx 5rpx' })
    }

    this.getCardList(() => {
      this.setData({ full_loading: false });
    });
  },
  onReady() {
    // 如果没有延迟，似乎无法取得正确的top
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query.select('.card').boundingClientRect((res) => {
        this.data.card_width = res.width;
        this.data.card_height = res.height;
        this.data.card_left = res.left;
        this.data.card_top = res.top + this.data.scrollTop;
        this.setData({
          ani_width: res.width,
          ani_height: res.height,
          ani_left: res.left,
          ani_top: res.top + this.data.scrollTop
        });
      }).exec();
      query.select('.img-box').boundingClientRect((res) => {
        this.data.img_width = res.width;
        this.data.img_height = res.height;
      }).exec();
    }, 500);
  },
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;
      this.data.card_list = [];

      wx.showNavigationBarLoading();
      this.getCardList(() => {
        this.data.loading = false;
        this.setData({
          gift_show: false,
          code_modal_show: false,
          get_cul_gift_show: false
        });

        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 获取卡片列表
  getCardList(complete) {
    let post = {
      token: app.user_data.token
    };

    app.ajax('Activity/getCardList', post, (res) => {
      app.format_img_arr(res.list, 'pic');
      app.format_img_arr(res.list, 'pic_back');

      this.setData({
        role: res.role,
        lucky_draw_times: res.lucky_draw_times,
        card_list: res.list
      });
    }, null, () => {
      if (complete) {
        complete();
      }
    });
  },
  // 抽卡
  getCard() {
    if (!this.data.loading) {
      if (this.data.lucky_draw_times > 0) {
        this.data.loading = true;

        this.setData({ card_class: 'zhuan' }, () => {
          setTimeout(() => {
            let post = {
              token: app.user_data.token
            };
            app.ajax('Activity/getCard', post, (card_res) => {
              this.setData({
                card_class: '',
                ani_src: this.data.card_list[card_res.card_id - 1].pic,
                ani_show: true
              }, () => {
                const query = wx.createSelectorQuery();
                query.select('#num' + card_res.card_id).boundingClientRect((res) => {
                  this.setData({
                    ani_left: res.left,
                    ani_top: res.top + this.data.scrollTop,
                    ani_width: this.data.img_width,
                    ani_height: this.data.img_height
                  }, () => {
                    setTimeout(() => {
                      this.setData({
                        ani_show: false,
                        ani_left: this.data.card_left,
                        ani_top: this.data.card_top,
                        lucky_draw_times: this.data.lucky_draw_times - 1,
                        ['card_list[' + (card_res.card_id - 1) + '].card_amount']: this.data.card_list[card_res.card_id - 1].card_amount + 1
                      });

                      if (card_res.get_gift !== 0) {
                        // 获得文创礼品
                        this.setData({
                          get_cul_gift_show: true,
                          get_gift: card_res.get_gift
                        });
                      }

                      this.data.loading = false;
                    }, 500);
                  });
                }).exec();
              })
            }, () => {
              this.data.loading = false;
            }, () => {
              this.setData({ card_class: '' });
            });
          }, 1000)
        });
      } else {
        app.modal('您尚无抽卡机会，赶快去发布笔记获得吧！');
      }
    }
  },
  onPageScroll(e) {
    this.data.scrollTop = e.scrollTop;
  },
  // 计算是否至少拥有一张卡片
  has_card() {
    let card_list = this.data.card_list;
    for (let i = 0; i < card_list.length; i++) {
      if (card_list[i].card_amount > 1) {
        return true;
      }
    }
    return false;
  },
  // 点击送给好友，显示分享框
  show_gif() {
    if (!this.has_card()) {
      app.modal('拥有特定卡片一张以上才可以分享哦');
    } else {
      this.setData({
        choose_index: -1,
        gift_show: true
      });
    }
  },
  // 选择卡片
  choose_card(e) {
    let index = e.currentTarget.dataset.index;
    let card = this.data.card_list[index];
    if (card.card_amount > 1) {
      this.setData({ choose_index: index });
    }
  },
  // 隐藏赠送框
  hide_gift() {
    this.setData({ gift_show: false });
  },
  // 生成分享码
  createCardCode() {
    if (this.data.choose_index === -1) {
      app.modal('请选择要分享的卡片');
    } else {
      wx.showLoading({
        title: '生成分享二维码',
        mask: true
      });

      let post = {
        token: app.user_data.token,
        cid: this.data.choose_index + 1
      };

      let that = this;
      app.ajax('Activity/createCardCode', post, (res) => {
        drawQrcode({
          width: 150,
          height: 150,
          correctLevel: 1,
          canvasId: 'card-qrcode',
          text: res
        });
        let canvas = wx.createCanvasContext('card-qrcode');
        setTimeout(function () {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 150,
            height: 150,
            destWidth: 150,
            destHeight: 150,
            canvasId: 'card-qrcode',
            success(res) {
              that.setData({
                gift_show: false,
                choose_index: -1,
                cardqr_show: true,
                qrcode_img: res.tempFilePath
              });
              wx.hideLoading();
            },
            fail() {
              // 生成失败
              wx.hideLoading();
            }
          })
        }, 500)
      }, () => {
        wx.hideLoading();
      });
    }
  },
  // 将二维码分享给朋友
  save_album() {
    let that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.writePhotosAlbum']) {
          wx.saveImageToPhotosAlbum({
            filePath: that.data.qrcode_img,
            success() {
              app.modal('图片成功保存到相册了，快去分享给朋友吧', () => {
                that.setData({ cardqr_show: false });
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
  // 点击输入卡片码，显示卡片码框
  show_code_modal() {
    this.setData({ code_modal_show: true });
  },
  // 获得赠送卡片
  getGiftCard(e) {
    let that = this;
    wx.scanCode({
      success(res) {
        let post = {};
        post.card_code = res.result;

        if (!String(post.card_code).trim()) {
          app.toast('卡片码不能为空');
        } else {
          post.token = app.user_data.token;

          app.ajax('Activity/getGiftCard', post, (card_res) => {
            that.setData({
              ['card_list[' + (card_res.card_id - 1) + '].card_amount']: that.data.card_list[card_res.card_id - 1].card_amount + 1
            });

            app.modal('您获得一张' + card_res.card_id + '号卡');

            if (card_res.get_gift !== 0) {
              // 获得文创礼品
              that.setData({
                get_cul_gift_show: true,
                get_gift: card_res.get_gift,
              });
            }
          });
        }
      }
    });
  },
  // 隐藏卡片码框
  hide_code_modal() {
    this.setData({ code_modal_show: false });
  },
  // 扫描（博物馆身份用户）
  scan() {
    let that = this;
    wx.scanCode({
      success(res) {
        that.data.uid = res.result;
        that.setData({ verify_show: true });
      }
    });
  },
  // 隐藏获得文创礼品框
  hide_cul_gift_modal() {
    this.setData({ get_cul_gift_show: false });
  },
  // 隐藏核销框
  hide_verify_modal() {
    this.setData({ verify_show: false });
  },
  // 核销
  culVerify(e) {
    if (!this.data.loading) {
      this.data.loading = true;

      let post = e.detail.value;
      post.remark = String(post.remark);  // 排除为null的情况啊
      post.uid = this.data.uid;
      post.token = app.user_data.token;

      app.ajax('Activity/culVerify', post, () => {
        this.setData({
          verify_show: false,
          remark: '',
          uid: 0
        });
        app.modal('文创礼品已核销');
      }, null, () => {
        this.data.loading = false;
      });
    }
  },
  // 隐藏卡片码二维码框
  hide_cardqr_modal() {
    this.setData({cardqr_show: false});
  }
})