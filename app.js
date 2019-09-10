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
  },
  my_config: {
    // base_url: 'https://www.caves.vip',  // 正式（原）
    // api: 'https://www.caves.vip/api/',  // 正式（原）
    base_url: 'https://caves.wcip.net',  // 正式
    api: 'https://caves.wcip.net/api/',  // 正式
    qiniu_base: 'http://qiniu.wcip.net/',
    // qiniu_base: 'http://pwu6oxfmm.bkt.clouddn.com/',
    default_img: '/images/default.png',
    reg: {
      tel: /^1\d{10}$/,
      phone: /\d{3,4}-\d{7,8}/,
      email: /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/,
      natural: /^([1-9]\d*|0)$/
    },
    statusBarHeight: 0,
    topBarHeight: 0
  },
  user_data: {
    token: '',
    uid: 0,
    role: 0,
    user_auth: 0  // 0.用户未授权 1.用户已授权
  },
  mp_update() {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      console.log(res.hasUpdate);  // 是否有更新
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
    })
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
              case -5:  // token未传
                let current_pages = getCurrentPages();
                let current_page = current_pages[current_pages.length - 1];
                wx.redirectTo({ url: '/pages/login/login?route=' + encodeURIComponent(current_page.route + this.obj2query(current_page.options)) });
                break;
              case 49:
                this.toast(res.data.data);
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
      wx.switchTab({ url: '/pages/index/index' });
    } else {
      switch (route) {
        case 'pages/index/index':
        case 'pages/shop/shop':
        case 'pages/notes/notes':
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
          obj[i][field] = '';
        } else {
          obj[i][field] = obj[i][field].indexOf('https') === 0 ? obj[i][field] : this.my_config.qiniu_base + '/' + obj[i][field];
        }
      }
    } else {
      if (!obj[field]) {
        obj[field] = '';
      } else {
        obj[field] = obj[field].indexOf('https') === 0 ? obj[field] : this.my_config.qiniu_base + '/' + obj[field];
        // [field]
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
      return  obj ? obj.replace(this.my_config.qiniu_base + '/', '') : '';
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
    page.setData({ [e.currentTarget.dataset['name']]: e.detail.value || '' })
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
    let page = e.currentTarget.dataset.page;
    if (page) {
      switch (page) {
        case 'index':
        case 'shop':
        case 'notes':
        case 'my':
          wx.switchTab({ url: `/pages/${page}/${page}` });
          break;
        default:
          page = page.split('?');
          if (page[1]) {
            wx.navigateTo({ url: `/pages/${page[0]}/${page[0]}` });
          } else {
            wx.navigateTo({ url: `/pages/${page[0]}/${page[0]}?${page[1]}` });
          }
          break;
      }
    }
  },
  // 将秒数转变成几小时前、几天前的格式，超过30天显示日期
  ago_format(s) {
    // todo
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
        domain: 'qiniu.wcip.net',
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
      },
      {
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
            this.toast('选择的图片不能大于' + over_text);
            return callback(false);
          }

          res.tempFiles[i].ext = res.tempFiles[i].path.substr(res.tempFiles[i].path.lastIndexOf('.') + 1);
          if (ext.indexOf(res.tempFiles[i].ext) === -1) {
            this.toast('请上传合法的文件格式');
            return callback(false);
          }
        }

        callback(res.tempFiles);
      }
    })
  }
});