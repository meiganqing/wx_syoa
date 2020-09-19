var SysConfig = require("../../utils/util.js")
Page({
  data: {
    lzyj_data: [], //流转意见
    useData: { //用户数据
      mUserID: null,
      mUserName: ""
    },
    pageParams: {}, //页面参数
    rowidData: {}, //单行数据
    backNode: [], //退回节点数据渲染
    ht_jd: null, //回退节点
    current: 1,
    xianyin: true,
    items: [{
      name: 'ok',
      value: '同意完成',
      checked: 'true'
    }],
    steps: [], //所有步骤
    active: 0, //	当前步骤
    activeNames: [],
    zbcontent: [],
    zbbtcontent: [],
    zbDataIndex: 0,
    details: [], //详情
    zbbtdetails: [], //表头
  },
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

    SysConfig.UserInfo.GetUserID().then((res) => {
      this.setData({
        useData: {
          mUserID: res.data
        }
      })
      return SysConfig.SubSystemData.request({ // 获取主表单行数据
        istoken: true,
        XKLX: "SYRSGL",
        XAction: "GetDataInterface",
        data: {
          "XDLMCID": "1001",
          "XDLMSID": "DYBH202003111014331433210382",
          "XDLMA": this.data.pageParams.urlid,
        },
        method: "GET"
      })
    }).then((res) => {
      if (res.rows) {
        SysConfig.WorkflowManage.getXMInfo(res) //流程函数初始化
        this.setData({
          rowidData: {
            title: res.rows[0].统计月份.split("-")[0] + "年" + res.rows[0].统计月份.split("-")[1] + "月差旅费报销单",
            creator: res.rows[0].制表人,
            time: res.rows[0].制表时间,
            onlynum: res.rows[0].onlynum
          },
          active: res.rows[0].currentLCxh - 1
        })
        return SysConfig.WorkflowManage.getWorkflowInfoAndList() // 获取流转意见
      }
    }).then((res) => {
      this.setData({
        lzyj_data: res
      })
      return SysConfig.WorkflowManage.getWorkflowNodesState()
    }).then((res) => {
      this.setData({
        steps: res
      })
      SysConfig.UserInfo.GetUserName().then((res) => {
        console.log(res.data)
        this.setData({
          useData: {
            mUserName: res.data
          }
        })
        return SysConfig.SubSystemData.request({ // 获取审批人部门
          istoken: true,
          XKLX: "SYYHGL",
          XAction: "GetDataInterface",
          data: {
            "XDLMCID": "1001",
            "XDLMSID": "DYBH20190823102601261218191",
            "XDLMC": this.data.useData.mUserName,
          },
          method: "GET"
        })
      }).then((res) => {
        if (res.rows && res.rows.length > 0) {
          let bumenMing = "";
          res.rows.forEach((item, index, array) => {
            if (index == array.length - 1) {
              bumenMing += item.DepartName
            } else {
              bumenMing += item.DepartName + ","
            }
          });
          return SysConfig.SubSystemData.request({
            istoken: true,
            XKLX: "SYRSGL",
            XAction: "GetDataInterface",
            data: {
              'pageIndex': '1',
              'pageSize': '9999',
              "XDLMCID": "9000",
              "XDLMTID": "9202",
              "XDLMSID": "9202019",
              "method": "details",
              "projectid": this.data.rowidData.onlynum,
              "bumenMing": bumenMing
            },
            method: "GET"
          })
        }
      }).then((res) => {
        let details = res.rows

        SysConfig.SubSystemData.request({
          istoken: true,
          XKLX: "SYRSGL",
          XAction: "GetDataInterface",
          data: {
            "XDLMCID": "9000",
            "XDLMTID": "9202",
            "XDLMSID": "9202019",
            "method": "detailsHead",
            "projectid": this.data.rowidData.onlynum
          },
          method: "GET"
        }).then((res) => {
          console.log(details)
          console.log(res)
          let rowsarr = []
          // let btarr=[]
          res.data.forEach((item, index, array) => {
            if (item.group) {
              let ispush = true
              for (let i = 0; i < rowsarr.length; i++) {
                if (rowsarr[i].group == item.group) {
                  ispush = false
                  rowsarr[i].childer.push({
                    title: item.title,
                    content: details[0][item.field]
                  })
                }
              }
              if (ispush) {
                rowsarr.push({
                  group: item.group,
                  childer: [{
                    title: item.title,
                    content: details[0][item.field]
                  }]
                })
              }
            } else {
              rowsarr.push({
                title: item.title,
                content: details[0][item.field]
              })
            }
          })

          this.setData({
            zbcontent: rowsarr,
            // zbbtcontent:btarr,
            details: details,
            zbbtdetails: res.data
          })
          console.log(rowsarr)
          // console.log(btarr)
        })
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
      // 发送通过请求
      SysConfig.WorkflowManage.complete(e.detail.value.wQPYJ).then((res) => {
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

    } else {
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
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  previous_btn() { //上一个
    let {
      zbDataIndex
    } = this.data
    zbDataIndex--
    this.zbcontentdata(zbDataIndex)
    this.setData({
      zbDataIndex
    })
  },
  next_btn() { //下一个
    let {
      zbDataIndex
    } = this.data
    zbDataIndex++
    this.zbcontentdata(zbDataIndex)
    this.setData({
      zbDataIndex
    })
  },
  zbcontentdata(zbDataIndex) { //制表内容
    let {
      details,
      zbbtdetails
    } = this.data
    let rowsarr = []
    // let btarr=[]
    zbbtdetails.forEach((item, index, array) => {
      if (item.group) {
        let ispush = true
        for (let i = 0; i < rowsarr.length; i++) {
          if (rowsarr[i].group == item.group) {
            ispush = false
            rowsarr[i].childer.push({
              title: item.title,
              content: details[zbDataIndex][item.field]
            })
          }
        }
        if (ispush) {
          rowsarr.push({
            group: item.group,
            childer: [{
              title: item.title,
              content: details[zbDataIndex][item.field]
            }]
          })
        }
      } else {
        rowsarr.push({
          title: item.title,
          content: details[zbDataIndex][item.field]
        })
      }
    })
    this.setData({
      zbcontent: rowsarr,
      // zbbtcontent:btarr
    })
  }
})