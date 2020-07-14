const app = getApp();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		sample_list: []
		// role: 0,

		// mask_title: '',
		// btn_text: '确定'

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		console.log(app.user_data.role);
		// this.setData({
		// 	role: app.user_data.role
		// });
		// if (role === 2) {
		// 	this.setData({
		// 		mask_title: '只有认证为文旅机构才可以浏览此页面，您已认证为工厂'
		// 	})
		// }
		this.get_sample_list()
	},

	get_sample_list(complete) {
		app.ajax('sample/sampleList', {}, res => {
			app.format_img(res, 'poster');
			console.log(res);
			this.setData({
				sample_list: res
			});
		}, null, () => {
			if (complete) {
				complete();
			}
		});
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})