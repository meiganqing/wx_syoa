
var SysConfig = require("../../utils/util.js")
Page({
  /**
   * 页面的初始数据
   */

  data: {
    lzyj_data: [], //流转意见
    useData: { //用户数据
      mUserID: null,
      username:""
    },
    pageParams: {}, //页面参数
    rowidData: {}, //单行数据
    backNode: [], //退回节点数据渲染
    ht_jd: null,//回退节点
    xianyin: true,
    steps: [],//所有步骤
    active: 0,//	当前步骤
    filearray:[],//附件
    items: [{
      name: 'ok',
      value: '同意完成',
      checked: 'true'
    },
    {
      name: 'no',
      value: '不同意'
    }
    ]
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    this.setData({
      pageParams: {
        rowid: options.id,
        m_LConlynum: options.xmlcid,
        m_Onlynum: options.onlynum,
        module: options.module,
        urlid: options.urlid,
      }
    })
    SysConfig.UserInfo.GetUserName().then((res) => {
      this.setData({
        ['useData.username']:res.data
      })
    })
    SysConfig.UserInfo.GetUserID().then((res) => {
      this.setData({
        ['useData.mUserID']:res.data
      })
      return SysConfig.SubSystemData.request({ // 获取主表单行数据
        istoken: true,
        XKLX: "SYBGGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "1001",
          "XDLMSID": "DYBH202009111652395239125572",
          "XDLMA": this.data.pageParams.urlid,
        },
        method: "GET"
      })
    }).then((res) => {
      if (res.rows) {
        SysConfig.WorkflowManage.getXMInfo(res) //流程函数初始化
        this.setData({
          rowidData: {
            creator: res.rows[0].creator,
            title: res.rows[0].title,
            bsqr:res.rows[0].被授权人,
            creatorId: res.rows[0].creator_id,
            idcard: res.rows[0].身份证号,
            sDate: res.rows[0].授权开始日期.split(" ")[0],
            eDate: res.rows[0].授权结束日期.split(" ")[0],
            leaveReason: res.rows[0].事件,
            onlynum:res.rows[0].onlynum
          },
          active: res.rows[0].currentLCxh - 1
        })
        return SysConfig.SubSystemData.request({ // 附件
          istoken: true,
          XKLX: "SYBGGL",
          XAction: "GetDataInterface",
          data: {
            "XDLMCID": "1001",
            "XDLMSID": "DYBH20200218104720472064331",
            "XDLMB": this.data.rowidData.onlynum
          },
          method: "GET"
        })
      }
    }).then((res) => {
      let _fliedata=[];
      if (res.rows && res.rows.length > 0){
        for (let i in res.rows) {
          _fliedata.push({
            name: res.rows[i].文件名,
            path: res.rows[i].文件地址
          })
        }
        this.setData({
          filearray: _fliedata
        })
      } 
      return SysConfig.WorkflowManage.getWorkflowInfoAndList() // 获取流转意见
    }).then((res) => {
     
      this.setData({
        lzyj_data: res
      })
      return SysConfig.WorkflowManage.getWorkflowNodesState()
    }).then((res) => {
      this.setData({
        steps: res
      })
     
    })
  },
  radioJiedian: function (e) {
    this.setData({
      ht_jd: e.detail.value
    })
  },
  radioChange: function (e) {
    if (e.detail.value == 'no') {
      this.setData({
        xianyin: false
      })
      SysConfig.WorkflowManage.getRollbackNodeList().then((res) => {
        console.log(res)
        this.setData({
          backNode: res,
          ht_jd: res[0].Lc_xh
        })
        console.log(this.data.ht_jd)
      })

    } else {
      this.setData({
        xianyin: true
      })
    }
  },
  // 审核通过接口：
  bindFormsubmit: function (e) {
   
    if (this.data.xianyin) {
      SysConfig.WorkflowManage.complete(e.detail.value.wQPYJ).then((completemsg) => {
        if (completemsg.msg) {
          if (completemsg.message == "流程已完成！") {
            return SysConfig.SubSystemData.request({ 
              istoken: true,
              XKLX: "SYBGGL",
              XAction: "GetDataInterface",
              data: {
                "XDLMCID": '6000',
                "XDLMSID": "DYBH202009111652395239106575",
                "XDLMID": this.data.pageParams.urlid,
                "XDLM授权人": this.data.useData.username,
                "XDLM授权时间": SysConfig.ToolBox.CurrentDate(),
              },
              method: "GET"
            })
          } else {
            wx.showToast({
              title: completemsg.message,
              icon: 'success',
              duration: 1000,
              complete: () => {
                wx.navigateBack({
                  delta: 1
                });
              }
            })
          }
        } else {
          wx.showToast({
            title: "流程失败",
            icon: 'none',
            duration: 1000,
            complete: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          })
        }
      }).then((fsxx) => {
        if (fsxx.success) {
          wx.showToast({
            title: "审批完成",
            icon: 'success',
            duration: 1000,
            complete: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          })
        } else {
          wx.showToast({
            title: "流程失败",
            icon: 'none',
            duration: 1000,
            complete: () => {
              wx.navigateBack({
                delta: 1
              });
            }
          })
        }
      })
    } else {
      console.log(e.detail.value.wQPYJ)
      // 发送退回请求
      SysConfig.WorkflowManage.gotoNode(e.detail.value.wQPYJ, this.data.ht_jd).then((res) => {
        console.log(res)
        wx.showToast({
          title: res.message,
          icon: 'success',
          duration: 1000,
          complete: () => {
            wx.navigateBack({
              delta: 1
            });
          }
        })
      })
    }
  },
  showfile(e){
    SysConfig.Upload.downloadFile(e.currentTarget.dataset.id)
  }
})