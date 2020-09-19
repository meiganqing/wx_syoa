
var SysConfig = require("../../utils/util.js")
Page({
  data: {
    mUserId: "",
  
  },
  detailUrl: function (e) {
    wx.navigateTo({
        url: '../wts_sqxq/wts_sqxq?id=' + e.currentTarget.dataset.id
    })
  },

   //撤回
   recall_btn: function (e) {
    console.log(e)
    SysConfig.WorkflowManage.isCheHui(e.currentTarget.dataset.onlynum, e.currentTarget.dataset.xmlcid,this)
  },
    //修改
    edit_btn: function (e) {
      wx.navigateTo({
        url: '../wts_add/wts_add?id=' + e.currentTarget.dataset.id
      })
    },

   //删除
   del_btn: function (e) {
    SysConfig.SubSystemData._deldata({
      XKLX:"SYBGGL",
      XAction:"GetDataInterface",
      data: {
        "XDLMCID": "4000",
        "XDLMSID": "DYBH20200911165239523944574",
        "XDLMROWID": e.currentTarget.dataset.id
      }
    },this)
  },

  onLoad: function () {
  
  },
  onShow:function(){
    SysConfig.UserInfo.GetUserID().then((res) => {
      this.setData({
        mUserId: res.data
      })
      SysConfig.SubSystemData.request({
        istoken: true,
        method: "GET",
        XKLX: "SYBGGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "1001",
          "XDLMSID": "DYBH20200911165239523924571",
          "XDLMA": this.data.mUserId
        }
      }).then((res) => {
        this.setData({
          res: res.rows
        })
      })
    })
  }
})