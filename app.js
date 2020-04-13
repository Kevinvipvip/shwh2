const utils = require('utils/utils.js');
const qiniuUploader = require("utils/qiniuUploader");

App({
  onLaunch() {
    wx.getSystemInfo({
      success: res => {
        this.my_config.statusBarHeight = res.statusBarHeight;
        if (res.model.indexOf('iPhone') !== -1) {
          this.my_config.topBarHeight = 44;
        } else {
          this.my_config.topBarHeight = 48;
        }
      }
    });

    let phone = wx.getSystemInfoSync();
    this.is_ios = phone.platform === 'ios';

    wx.onMemoryWarning(res => {
      console.log('内存不足', res);
    })
  },
  is_ios: '',
  my_config: {
    base_url: 'https://sd.wcip.net', // 正式
    api: 'https://sd.wcip.net/api/', // 正式
    qiniu_base: 'https://qiniu.sd.wcip.net',
    default_img: '/images/default.png',
    reg: {
      tel: /^1\d{10}$/,
      phone: /\d{3,4}-\d{7,8}/,
      email: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
      natural: /^([1-9]\d*|0)$/,
      positive: /^[1-9]\d*$/,
      price: /^([1-9]\d*|0)(\.\d{1,2})?$/
    },
    statusBarHeight: 0,
    topBarHeight: 0,
  },
  user_data: {
    token: '',
    uid: 0,
    role: 0,
    user_auth: 0, // 0.用户未授权 1.用户已授权
    nickname: '',
    avatar: '',
    vip: 0  // 0.不是vip 1.是vip
  },
  mp_update() {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      console.log(res.hasUpdate); // 是否有更新
    });
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否马上重启小程序？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          }
        }
      })
    });
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
    })
  },
  toast(title, duration, icon = 'none') {
    let dura = duration || 2000;
    wx.showToast({
      title: String(title),
      icon: icon,
      duration: dura
    });
  },
  modal(content, callback) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
      success() {
        if (callback) {
          callback();
        }
      }
    });
  },
  confirm(content, callback) {
    wx.showModal({
      title: '提示',
      content: content,
      success: res => {
        if (res.confirm) {
          callback();
        }
      }
    });
  },
  ajax(path, data, succ, err, complete) {
    data = data || {};
    if (!data.token) {
      data.token = this.user_data.token;
    }

    wx.request({
      url: this.my_config.api + path,
      method: 'POST',
      dataType: 'json',
      data: data,
      success: res => {
        if (res.data.code !== 1) {
          if (err) {
            err(res.data);
          } else {
            switch (res.data.code) {
              case -3:  // token失效
              case -6:  // token为空
                let current_pages = getCurrentPages();
                let current_page = current_pages[current_pages.length - 1];
                wx.redirectTo({
                  url: '/pages/login/login?route=' + encodeURIComponent(current_page.route + this.obj2query(current_page.options))
                });
                break;
              case 49:
                this.toast(res.data.data);
                break;
              case 63:
              case 64:
                this.modal(res.data.message);
                break;
              case 87:  // 活动已删除
              case 88:  // 创意已删除
              case 89:  // 作品已删除
                this.modal(res.data.message, () => {
                  wx.navigateBack({ delta: 1 });
                });
                break;
              default:
                if (res.data.message) {
                  this.toast(res.data.message);
                } else {
                  this.toast('网络异常');
                }
                break;
            }
          }
        } else {
          if (succ) {
            succ(res.data.data);
          }
        }
      },
      fail() {
        // this.toast('网络异常');
      },
      complete() {
        if (complete) {
          complete();
        }
      }
    });
  },
  // 获取打开的页面
  get_page(page_name) {
    let pages = getCurrentPages();
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].route === page_name) {
        return pages[i];
      }
    }
    return false;
  },
  // 获取前一页
  get_prev_page() {
    let pages = getCurrentPages();
    return pages[pages.length - 2];
  },
  // 用户是否授权获取用户信息
  get_auth(callback) {
    wx.getSetting({
      success(res) {
        callback(res.authSetting['scope.userInfo']);
      }
    })
  },
  get_code(callback) {
    wx.login({
      success(login) {
        callback(login.code);
      }
    });
  },
  // 小程序登录获取token
  login(callback) {
    this.get_code((code) => {
      let post = {
        code: code
      };

      this.ajax('login/login', post, (res) => {
        callback(res);
      });
    })
  },
  // 授权获取用户信息
  userAuth(inviter_id, callback) {
    let that = this;
    wx.getUserInfo({
      success(user) {
        let post = {
          token: that.user_data.token,
          iv: user.iv,
          encryptedData: user.encryptedData
        };
        if (inviter_id) {
          post.inviter_id = inviter_id;
        }
        that.ajax('login/userAuth', post, () => {
          callback(true);
        }, () => {
          callback(false);
        });
      }
    });
  },
  // 用户是否授权（后端）
  checkUserAuth(callback) {
    let post = {
      token: this.user_data.token
    };
    this.ajax('login/checkUserAuth', post, (res) => {
      callback(res);
    });
  },
  // 返回处理过的分享路径
  share_path() {
    let current_pages = getCurrentPages();
    let current_page = current_pages[current_pages.length - 1];
    return '/pages/auth/auth?route=' + encodeURIComponent(current_page.route + this.obj2query(current_page.options));
  },
  // 如果不存在route，跳转到首页，否则根据是否是tabbar页进行跳转
  redirect_or_switch_or_index(route) {
    if (!route) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    } else {
      switch (route) {
        case 'pages/index/index':
        case 'pages/cate-list/cate-list':
        case 'pages/notes/notes':
        case 'pages/shop-car/shop-car':
        case 'pages/my/my':
          wx.switchTab({ url: '/' + route });
          break;
        default:
          wx.redirectTo({ url: '/' + route });
          break;
      }
    }
  },
  /* 内部方法 */
  // 对象转query字符串
  obj2query(obj) {
    let query = '';
    for (let key in obj) {
      query += key + '=' + obj[key] + '&';
    }
    if (!query) {
      return '';
    } else {
      return '?' + query.substr(0, query.length - 1);
    }
  },
  // 处理图像路径（详情）
  format_img(obj, img_field = 'pic') {
    if (obj instanceof Array) {
      if (typeof obj[0] === 'string') {
        for (let i = 0; i < obj.length; i++) {
          if (obj[i]) {
            obj[i] = this.my_config.qiniu_base + '/' + obj[i];
          } else {
            obj[i] = this.my_config.default_img;
          }
        }
      } else {
        for (let i = 0; i < obj.length; i++) {
          if (obj[i][img_field]) {
            obj[i][img_field] = this.my_config.qiniu_base + '/' + obj[i][img_field];
          } else {
            obj[i][img_field] = this.my_config.default_img;
          }
        }
      }
    } else if (typeof obj === 'object') {
      if (obj[img_field]) {
        obj[img_field] = this.my_config.qiniu_base + '/' + obj[img_field];
      } else {
        obj[img_field] = this.my_config.default_img;
      }
    } else {
      if (obj) {
        return this.my_config.qiniu_base + '/' + obj;
      } else {
        return this.my_config.default_img;
      }
    }
  },
  // 处理图像路径（列表）
  format_img_arr(list, img_field = 'pic') {
    for (let i = 0; i < list.length; i++) {
      if (list[i][img_field]) {
        list[i][img_field] = this.my_config.qiniu_base + '/' + list[i][img_field];
      } else {
        list[i][img_field] = this.my_config.default_img;
      }
    }
  },
  // 头像处理
  avatar_format(obj, field = 'avatar') {
    if (obj instanceof Array) {
      for (let i = 0; i < obj.length; i++) {
        if (!obj[i][field]) {
          obj[i][field] = this.my_config.default_img;
        } else {
          obj[i][field] = obj[i][field].indexOf('https') === 0 ? obj[i][field] : this.my_config.qiniu_base + '/' + obj[i][field];
        }
      }
    } else {
      if (!obj[field]) {
        obj[field] = this.my_config.default_img;
      } else {
        obj[field] = obj[field].indexOf('https') === 0 ? obj[field] : this.my_config.qiniu_base + '/' + obj[field];
      }
    }
  },
  // 格式化上传图片，将http前缀去掉
  format_up_img(obj) {
    if (obj instanceof Array) {
      for (let i = 0; i < obj.length; i++) {
        obj[i] = obj[i] ? obj[i].replace(this.my_config.qiniu_base + '/', '') : '';
      }
    } else {
      return obj ? obj.replace(this.my_config.qiniu_base + '/', '') : '';
    }
  },
  // 时间格式化
  time_format(obj, field, fmt) {
    if (obj instanceof Array) {
      for (let i = 0; i < obj.length; i++) {
        if (fmt) {
          obj[i][field] = utils.date_format(obj[i][field], fmt);
        } else {
          obj[i][field] = utils.date_format(obj[i][field]);
        }
      }
    } else {
      if (fmt) {
        obj[field] = utils.date_format(obj[field], fmt);
      } else {
        obj[field] = utils.date_format(obj[field]);
      }
    }
  },
  // 千分制转换
  qian_format(obj, field) {
    let num = 0;

    if (obj instanceof Array) {
      for (let i = 0; i < obj.length; i++) {
        num = (Number(obj[i][field]).toFixed(2) + "").replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, "$&,");
        obj[i][field] = obj[i][field] % 1 === 0 ? num.replace('.00', '') : num;
      }
    } else {
      num = (Number(obj[field]).toFixed(2) + "").replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, "$&,");
      obj[field] = obj[field] % 1 === 0 ? num.replace('.00', '') : num;
    }
  },
  // 获取七牛云上传TOKEN
  getUpToken(callback) {
    this.ajax('qiniu/getUpToken', null, res => {
      callback(res);
    });
  },
  bind_input(e, page) {
    page.setData({
      [e.currentTarget.dataset['name']]: e.detail.value || ''
    })
  },
  // 创建指定数量元素的数组（flex填充用）
  null_arr(number, line_number) {
    let num = (line_number - number % line_number) % line_number;

    let arr = [];
    arr[num - 1] = null;
    return arr;
  },
  // 公共跳页方法
  jump(e) {
    let page = e.currentTarget.dataset.url;
    if (page) {
      switch (page) {
        case 'index':
        case 'cate-list':
        case 'notes':
        case 'shop-car':
        case 'my':
          wx.switchTab({
            url: `/pages/${page}/${page}`
          });
          break;
        default:
          let pack = page.split('/');
          if (pack.length === 2) {
            page = pack[1];
            pack = pack[0] + '/';
          } else {
            pack = '';
          }

          page = page.split('?');
          if (page[1]) {
            wx.navigateTo({
              url: `/${pack}pages/${page[0]}/${page[0]}?${page[1]}`
            });
          } else {
            wx.navigateTo({
              url: `/${pack}pages/${page[0]}/${page[0]}`
            });
          }
          break;
      }
    }
  },
  // 生成随机字符
  random_string(len) {
    len = len || 30;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (let i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  },
  // 生成七牛云临时文件名
  qiniu_tname() {
    return 'tmp/' + this.random_string() + '.';
  },
  // 初始化七牛参数
  qiniu_init() {
    this.ajax('qiniu/getUpToken', null, res => {
      var options = {
        region: 'NCN', // 华北区
        uptoken: res.token,
        domain: 'qiniu.sd.wcip.net',
        shouldUseQiniuFileName: false
      };
      qiniuUploader.init(options);
    });
  },
  // 七牛上传
  qiniu_upload(temp_img, img_name, callback, complete, err) {
    qiniuUploader.upload(temp_img, res => {
        callback(true);
      }, error => {
        if (err) {
          err();
        }
        console.error('上传七牛云出错: ' + JSON.stringify(error));
      }, {
        key: img_name,
        region: 'NCN'
      },
      progress => {
        // 上传中
      },
      null,
      null,
      () => {
        if (complete) {
          complete();
        }
      }
    );
  },
  // 选择图片并返回
  choose_img(count, callback, maxsize = 524288, ext = ['jpg', 'jpeg', 'png', 'gif']) {
    wx.chooseImage({
      count: count,
      sourceType: ['album', 'camera'],
      success: res => {
        let over_text;
        if (maxsize < 1024) {
          over_text = maxsize + 'B';
        } else if (maxsize < 1048576) {
          over_text = Math.floor(maxsize / 1024) + 'KB';
        } else {
          over_text = Math.floor(maxsize / 1048576) + 'M';
        }

        for (let i = 0; i < res.tempFiles.length; i++) {
          if (res.tempFiles[i].size > maxsize) {
            this.modal('选择的图片不能大于' + over_text);
            return callback(false);
          }

          res.tempFiles[i].ext = res.tempFiles[i].path.substr(res.tempFiles[i].path.lastIndexOf('.') + 1);

          if (ext.indexOf(res.tempFiles[i].ext) === -1) {
            this.modal('请上传合法的文件格式');
            return callback(false);
          }
        }

        callback(res.tempFiles);
      }
    })
  },
  // 获取默认收货地址
  get_default_address(callback) {
    this.ajax('my/getDefaultAddress', null, res => {
      let address;
      if (res) {
        address = {
          receiver: res.username,
          tel: res.tel,
          address: res.provincename + ' ' + res.cityname + ' ' + res.countyname + ' ' + res.detail
        };
      } else {
        address = null;
      }
      callback(address);
    });
  },
  // 收集formid-collectFormid
  collectFormid(formid) {
    if (formid !== 'the formId is a mock one') {
      this.ajax('api/collectFormid', {
        formid: formid
      }, null, () => {
        // 啥都不干
      });
    }
  },
  // 打开新页面检查，如果已经打开10个页面则提示用户关闭几个页面
  page_open(callback) {
    if (getCurrentPages().length < 10) {
      callback();
    } else {
      this.modal('打开页面过多，请您关闭几个页面');
    }
  },
  // 复制到剪贴板
  copy(data, callback) {
    wx.setClipboardData({
      data: data,
      success: () => {
        if (callback) {
          callback();
        }
      }
    })
  },
  // 设置全局的 user_data
  set_user_data() {
    this.ajax('my/myDetail', null, res => {
      this.avatar_format(res);

      this.user_data.uid = res.uid;
      this.user_data.role = res.role;
      this.user_data.nickname = res.nickname;
      this.user_data.avatar = res.avatar;
      this.user_data.vip = res.vip;
    });
  },
  // 格式化数字，如果没有小数则返回整数，有小数返回小数
  num_zheng(num) {
    return parseInt(num) === parseFloat(num) ? parseInt(num) : parseFloat(num);
  },
  ago_format(obj, time_field) {
    if (obj instanceof  Array) {
      for (let i = 0; i < obj.length; i++) {
        obj[i][time_field] = this.ago_text(obj[i][time_field]);
      }
    } else {
      obj[time_field] = this.ago_text(obj[time_field]);
    }
  },
  // 多久以前的友好式格式化
  ago_text(timestamp) {
    let now_ts = parseInt(new Date().getTime() / 1000);
    let diff = now_ts - timestamp;
    if (diff <= 2592000) {
      // 小于30天
      if (diff < 0) {
        return '刚刚发表';
      } else if (diff < 60) {
        return diff + '秒前';
      } else if (diff < 3600) {
        return parseInt(diff / 60) + '分钟前';
      } else if (diff < 86400) {
        return parseInt(diff / 3600) + '小时前';
      } else {
        return parseInt(diff / 86400) + '天前';
      }
    } else {
      // 大于30天
      if (new Date(timestamp * 1000).getFullYear() === new Date(now_ts * 1000).getFullYear()) {
        // 在今年之内
        return utils.date_format(timestamp, 'MM-dd hh:mm');
      } else {
        // 不在今年之内
        console.log(timestamp);
        return utils.date_format(timestamp, 'yyyy-MM-dd hh:mm');
      }
    }
  },
  // 时间格式化
  format_time(obj, field, fmt) {
    if (obj instanceof Array) {
      for (let i = 0; i < obj.length; i++) {
        if (fmt) {
          obj[i][field] = utils.date_format(obj[i][field], fmt);
        } else {
          obj[i][field] = utils.date_format(obj[i][field]);
        }
      }
    } else {
      if (fmt) {
        obj[field] = utils.date_format(obj[field], fmt);
      } else {
        obj[field] = utils.date_format(obj[field]);
      }
    }
  }
});