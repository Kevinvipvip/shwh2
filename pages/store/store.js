var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    role: 0,  // 1.博物馆 2.设计师 3.工厂

    // full-loading
    full_loading: true,

    // textarea
    is_ios: false,

    // 列表相关
    page: 1,
    list: [],
    nomore: true,
    nodata: false,
    loading: false,

    // 验证码相关
    code: '',
    code_text: '发送验证码',
    count_down: 60,
    code_disabled: false,
    code_flag: 0,

    sex: -1,
    sex_list: [
      { name: '男', value: 1 },
      { name: '女', value: 2 }
    ],

    bind_tel_show: false  // 绑定手机号弹窗
  },
  onLoad() {
    this.data.role = app.user_data.role;

    // full-loading
    this.setData({ full_loading: false });

    // textarea
    this.setData({ is_ios: app.is_ios });

    let rich_text = '<p>啊啊啊</p>';
    rich_text = rich_text.replace(/\/ueditor\/php\/upload\//g, app.my_config.base_url + '/ueditor/php/upload/');
    WxParse.wxParse('rich_text', 'html', rich_text, this);

    // 跳转
    wx.switchTab({ url: '/pages/index/index' });
    wx.navigateTo({ url: '/pages/in-mp2/in-mp2?order_sn=' + res.order_sn });
    wx.redirectTo({ url: '/pages/in-mp2/in-mp2' });
    wx.navigateBack({ delta: 2 });

    // 设置标题
    wx.setNavigationBarTitle({ title: '这个是标题' });

    // 页面初始化
    this.init(() => {
      this.setData({ full_loading: false });
    });
  },
  init(complete) {
    // 轮播
    let promise1 = new Promise(resolve => {
      this.slideList(() => {
        resolve();
      });
    });

    // 视频精选
    let promise2 = new Promise(resolve => {
      this.videoList(() => {
        resolve();
      });
    });

    Promise.all([
      promise1, promise2
    ]).then(() => {
      if (complete) {
        complete();
      }
    });
  },
  // 获取列表
  get_list(complete) {
    let post = {
      page: this.data.page
    };

    app.ajax('get_list', post, res => {
      if (res.length === 0) {
        if (this.data.page === 1) {
          this.setData({
            list: [],
            nodata: true,
            nomore: false
          })
        } else {
          this.setData({
            nodata: false,
            nomore: true
          })
        }
      } else {
        this.setData({ list: this.data.list.concat(res) });
      }
      this.data.page++;
    }, null, () => {
      if (complete) {
        complete()
      }
    });
  },
  // 重置
  reset() {
    this.data.page = 1;
    this.data.work_list = [];
    this.setData({
      nomore: false,
      nodata: false
    });
  },
  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.loading) {
      this.data.loading = true;

      wx.showNavigationBarLoading();

      this.init(() => {
        this.data.loading = false;
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      });
    }
  },
  // 上拉加载
  onReachBottom() {
    if (!this.data.nomore && !this.data.nodata) {
      if (!this.data.loading) {
        this.data.loading = true;
        wx.showNavigationBarLoading();
        this.get_list(() => {
          wx.hideNavigationBarLoading();
          this.data.loading = false;
        });
      }
    }
  },
  // 分享
  onShareAppMessage() {
    wx.showShareMenu();
    return { path: app.share_path() };
  },
  bind_input(e) {
    app.bind_input(e, this);
  },
  // 收集formid
  col_formid(e) {
    app.collectFormid(e.detail.formId);
  },
  // 跳页
  to_page() {
    app.page_open(() => {
      wx.navigateTo({ url: '/pages/person-page/person-page?uid=' + this.data.req.uid });
    });
  },
  // 发送验证码
  sendSms() {
    if (!this.data.code_disabled) {
      if (!this.data.tel.trim()) {
        app.toast('请填写手机号');
      } else if (!app.my_config.reg.tel.test(this.data.tel)) {
        app.toast('手机号格式不正确');
      } else {
        this.setData({ code_disabled: true });

        app.ajax('api/joinAcSendSms', { tel: this.data.tel }, () => {
          app.toast('已发送');
          this.setData({ code_text: this.data.count_down + 's' });
          this.data.code_flag = setInterval(() => {
            this.data.count_down--;
            if (this.data.count_down === 0) {
              this.data.count_down = 60;
              this.setData({
                code_text: '发送验证码',
                code_disabled: false
              });
              clearInterval(this.data.code_flag);
            } else {
              this.setData({ code_text: this.data.count_down + 's' });
            }
          }, 1000)
        }, (err) => {
          app.toast(err.message);
          this.setData({ code_disabled: false });
        });
      }
    }
  },
  // radio
  radio_handle(e) {
    console.log(e.detail.value);
  },
  // 表单提交
  form_submit(e) {
    let data = this.data;

    if (!data.title.trim()) {
      app.toast('请填写笔记标题');
    } else if (!data.content.trim()) {
      app.toast('请填写笔记内容');
    } else if (data.pics.length === 0) {
      app.toast('请至少上传一张图片');
    } else {
      app.collectFormid(e.detail.formId);

      let post = {
        title: data.title,
        content: data.content,
        token: app.user_data.token,
        pics: this.get_img_arr(),
        width: data.pics[0].width,
        height: data.pics[0].height
      };

      let cmd;
      if (data.id !== 0) {
        post.id = this.data.id;
        cmd = 'my/noteMod';
      } else {
        cmd = 'note/noteRelease';
      }

      wx.showLoading({
        title: '加载中',
        mask: true
      });
      app.ajax(cmd, post, () => {
        if (data.id !== 0) {
          app.modal('修改成功', () => {
            let notes = app.get_page('pages/my-notes/my-notes');
            if (notes) {
              notes.refresh();
              wx.navigateBack({ delta: 1 });
            } else {
              wx.redirectTo({ url: '/pages/my-notes/my-notes' });
            }
          });
        } else {
          app.modal('发布成功，将进入审核，请耐心等待', () => {
            let notes = app.get_page('pages/my-notes/my-notes');
            if (notes) {
              notes.refresh();
              wx.navigateBack({ delta: 1 });
            } else {
              wx.redirectTo({ url: '/pages/my-notes/my-notes' });
            }
          });
        }
      }, err => {
        app.modal(err.message);
      }, () => {
        wx.hideLoading();
      });
    }
  },
  // picker选择器
  sex_choose(e) {
    this.setData({ sex: parseInt(e.detail.value) });
  },
  // 轮播跳页
  jump(e) {
    if (e.currentTarget.dataset.url) {
      app.jump(e);
    }
  },
  // 绑定手机号弹窗
  chou_start() {
    if (!app.user_data.uid) {
      this.setData({bind_tel_show: true});
    } else {
      wx.navigateTo({url: '/chou-package/pages/chou-start/chou-start'});
    }
  }
});