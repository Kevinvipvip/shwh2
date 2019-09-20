const app = getApp();

Page({
  data: {
    type: 4,
    req_list: [
      {
        "id": 4,
        "title": "“海河锦鲤”形象设计及文创产品设计征集大赛",
        "works_num": 11,
        "idea_num": 13,
        "cover": "upload/req/156801541570165800603.jpg",
        "org": "山海职场艺术馆",
        "start_time": 1566403200,
        "end_time": 1574870399
      },
      {
        "id": 1,
        "title": "陶瓷院形象设计及文创产品设计征集",
        "works_num": 1,
        "idea_num": 60,
        "cover": "upload/req/156801751104147000911.jpg",
        "org": "山海职场艺术馆",
        "start_time": 1568044800,
        "end_time": 1574179199
      },
      {
        "id": 6,
        "title": "开封铁塔公园形象设计及文创产品设计征集",
        "works_num": 2,
        "idea_num": 3,
        "cover": "upload/req/156801716769100700932.jpg",
        "org": "山海职场艺术馆",
        "start_time": 1568044800,
        "end_time": 1575561599
      },
      {
        "id": 5,
        "title": "博小虎和大眼蝠衍生文创产品设计征集",
        "works_num": 1,
        "idea_num": 1,
        "cover": "upload/req/156801571414826900731.jpg",
        "org": "山海职场艺术馆",
        "start_time": 1568476800,
        "end_time": 1573833599
      }
    ],

    nomore: false,
    nodata: true
  },
  onLoad(options) {
    wx.setNavigationBarTitle({ title: '环形山的主页' });
  },
  // 切换tab
  tab_change(e) {
    this.setData({ active_tab: e.currentTarget.dataset.tab });
  }
});