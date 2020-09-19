
var SysConfig = require("../../utils/util.js")
Page({
  data: {
    mUserId: "",
    res: []
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
        XKLX: "SYRSGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "1001",
          "XDLMSID": "DYBH2020032316230905640185",
          "XDLMA": this.data.mUserId
        }
      }).then((res) => {
        let ls_arr=[]
        for (let i = 0; i < res.rows.length;i++){
          ls_arr.push({
            id: res.rows[i].id,
            xmlcid: res.rows[i].xmlcid,
            onlynum: res.rows[i].onlynum,
            creator : res.rows[i].制表人,
            title  : res.rows[i].统计月份.split("-")[0] + "年" + res.rows[i].统计月份.split("-")[1] + "月差旅费报销单",
            fqsj  : res.rows[i].制表时间,
            book : res.rows[i].shr,
            shzt : res.rows[i].shzt
          })
        }
        this.setData({
          res: ls_arr
        })
      })
    })
  },
  
  //查看
  detailUrl: function (e) {
    wx.navigateTo({
      url: '../jxcl_sqxq/jxcl_sqxq?id=' + e.currentTarget.dataset.id
    })
  },
  //提交
  tj_btn: function (e) {
    let that=this
    wx.showModal({
      title: '提示',
      content: '确定要提交吗？',
      success(res) {
        if (res.confirm) {  
        SysConfig.WorkflowManage.create(e.currentTarget.dataset.onlynum, '绩效差旅审批').then((shlc) => {
          console.log(shlc)
          let icon;
          if (shlc.success) {
            icon = 'success';
          } else {
            icon = 'none';
          }
          wx.showToast({
            title: shlc.message,
            icon: 'success',
            duration: 2000,
            success: () => {
              that.onShow()
            }
          })
        })
        }
      }
    })
  },
  //删除
  del_btn: function (e) {
    SysConfig.SubSystemData._deldata({
      XKLX: "SYRSGL",
      XAction: "GetDataInterface",
      data: {
        "XDLMCID": "9000",
        "XDLMTID": "9202",
        "XDLMSID": "9202019",
        "method": "delete",
        "projectid":e.currentTarget.dataset.onlynum
      }
    }, this)
  }
})