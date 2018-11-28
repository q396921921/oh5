// 这个模块是用来封装与订单有关的东西
// 包括，商品，类型，流程，状态
let fs = require("fs");
let url = require("url");
let qs = require("querystring");
let queryOrder = require("./../db_mysql/queryOrder");
let otherOrder = require("./../db_mysql/otherOrder");
let queryEmp = require("./../db_mysql/queryEmp");
let otherEmp = require("./../db_mysql/otherEmp");
let async = require("async");
let momoent = require("moment");
let xlsx = require("node-xlsx");
let path = require("path");
let timer = require("./timer");
var debug = require("debug")("app:server");
let public = require("./../public/public");
const uploadFile = public.uploadFolde; // 后台修改上传图片文件的文件夹名字
const excelFile = public.excelFile;
const symbol = public.symbol;

module.exports = {
  // 前端
  /**
   * 传入商品id，获得他的类型
   */
  getProductTypeByProduct_id: function (body, cb) {
    let product_id = body.product_id;
    queryOrder.getProduct(
      { product_id: product_id },
      [product_id],
      (err, ret) => {
        if (err) {
          debug("通过商品id获得商品错误");
          cb("error");
        } else {
          let product_type_id = ret[0].product_type_id;
          queryOrder.getProductType(
            { product_type_id: type },
            [type],
            (err, rst) => {
              if (err) {
                debug("获得商品类型错误");
                cb("error");
              } else {
                cb(JSON.stringify({ data: rst }));
              }
            }
          );
        }
      }
    );
  },
  /**
   * 传入商品id，返回这个订单的流程与状态
   */
  getFlowStateByPro_Id: function (body, cb) {
    let product_id = body.product_id;
    let order_id = body.order_id;
    queryOrder.getProduct(
      { product_id: product_id },
      [product_id],
      (err, ret) => {
        if (err) {
          debug("通过商品id获得商品错误");
          cb("error");
        } else {
          let flow_id = ret[0].flow_id;
          this.getSortFlowState({ flow_id: flow_id, order_id: order_id }, cb);
        }
      }
    );
  },

  /**
   * 通过商品id，删除对应的内勤
   */
  deleteOffPro: function (body, cb) {
    let product_id = body.product_id;
    otherOrder.deleteOffProduct([product_id], (err, ret) => {
      if (err) {
        debug("删除此商品分配的内勤时错误");
        cb("error");
      } else {
        cb("success");
      }
    });
  },
  /**
   * 通过商品id，查询与此商品相关联的内勤
   */
  getOffByProduct_id: function (body, cb) {
    let product_id = body.product_id;
    queryOrder.getOffByProduct_id(
      { product_id: product_id },
      [product_id],
      (err, ret) => {
        if (err) {
          debug("查询商品对应的内勤错误");
          cb("error");
        } else {
          cb(JSON.stringify({ data: ret }));
        }
      }
    );
  },
  /**
   * 通过商品id，内勤id，部门id，查询此内勤负责的业务
   */
  getProEmp: function (body, cb) {
    let product_id = body.product_id;
    let off_id = body.off_id;
    let dep_id = body.dep_id;
    queryOrder.getOffByProduct_id(
      { product_id: product_id, off_id: off_id, dep_id: dep_id },
      [product_id, off_id, dep_id],
      (err, ret) => {
        if (err) {
          debug("在通过商品id，内勤id，部门id查询内勤负责此部门的业务时错误");
          cb("error");
        } else {
          cb(JSON.stringify({ data: ret }));
        }
      }
    );
  },
  /**
   * 传入商品id，部门id，内勤id，为内勤分配产品
   */
  allotProduct: function (body, cb) {
    let product_id = body.product_id;
    let dep_id = body.dep_id;
    let off_id = body.off_id;
    let emp_id_arr = body.emp_id_arr;

    // 查询之前与此商品相关联的内勤,然后删掉
    otherOrder.deleteOffBus([product_id, dep_id, off_id], (err, ret) => {
      if (err) {
        debug("删除内勤商品对应业务错误");
        cb("error");
      } else {
        async.each(
          emp_id_arr,
          function (dep_emp_id, cb2) {
            otherOrder.insertOffProduct(
              [product_id, dep_id, off_id, dep_emp_id],
              (err, ret3) => {
                if (err) {
                  debug("为内勤分配产品时，出现错误");
                  cb("error");
                } else {
                  cb2();
                }
              }
            );
          },
          function (err) {
            cb("success");
          }
        );
      }
    });
  },
  /**
   * 传入商品id以及订单id，创建这个商品的所有状态
   */
  createOrderFlow: function (body, cb) {
    let product_id = body.product_id;
    let order_id = parseInt(body.order_id);
    queryOrder.getProduct(
      { product_id: product_id },
      [product_id],
      (err, ret1) => {
        if (err) {
          debug("创建申请订单时，查询商品对应的流程出现错误");
          cb("error");
        } else {
          let flow_id = ret1[0].flow_id;
          queryOrder.getSortFlows([flow_id], (err, ret2) => {
            if (err) {
              debug("创建申请订单时，查询流程对应的具体流程错误");
              cb("error");
            } else {
              async.eachSeries(
                ret2,
                function (rt2, cb2) {
                  let flow_detail_id = rt2.flow_detail_id;
                  queryOrder.getSortStates([flow_detail_id], (err, ret3) => {
                    if (err) {
                      debug("创建申请订单时，查询具体流程对应的具体状态错误");
                      cb("error");
                    } else {
                      async.eachSeries(
                        ret3,
                        function (rt3, cb3) {
                          let state_detail_id = rt3.state_detail_id;
                          otherOrder.getBigRealtionOrder_id((err, ret4) => {
                            if (err) {
                              debug("查询订单中间表主键最大值错误");
                              cb("error");
                            } else {
                              let keys = Object.keys(ret4[0]);
                              let relation_state_id = ret4[0][keys[0]];
                              otherOrder.isnertOrderState(
                                [
                                  ++relation_state_id,
                                  order_id,
                                  state_detail_id
                                ],
                                (err, ret5) => {
                                  if (err) {
                                    debug("新增订单中间表数据时出现错误");
                                    cb("error");
                                  } else {
                                    cb3();
                                  }
                                }
                              );
                            }
                          });
                        },
                        function (err) {
                          cb2();
                        }
                      );
                    }
                  });
                },
                function (err) {
                  cb("success");
                }
              );
            }
          });
        }
      }
    );
  },
  /**
   * 传入订单id，修改订单信息
   */
  updateOrder: function (body, cb) {
    let order_id = body.or_id;
    let product_id = body.product_id;
    let channel_id = body.channel_id;
    let type = body.type;
    if (typeof type != "string" && type) {
      type = type.toString();
    }
    let inmoney = body.inmoney;
    let orderFile = body.orderFile;
    let clientName = body.clientName;
    let userComment = body.userComment; // 用户备注
    queryEmp.getEmp({ emp_id: channel_id }, [channel_id], (err, ret1) => {
      if (err) {
        debug("创建完空订单时，查询这个用户的推荐码错误");
        cb("error");
      } else {
        async.auto({
          a: function (cbr) {
            otherEmp.updateSumbitTime([new Date().toLocaleString(), channel_id], (err, retr) => {
              cbr();
            })
          },
          b: function (cbr) {
            let iiuv = ret1[0].iiuv;
            if (iiuv) {
              queryEmp.getEmpId([iiuv], (err, ret2) => {
                if (err) {
                  debug("创建完空订单时，查询这个订的业务时错误");
                } else {
                  let dep_emp_id
                  if (ret2.length != 0) {
                    dep_emp_id = ret2[0].emp_id;
                  }
                  queryOrder.getOffByProduct_id(
                    { "product_id": product_id, "dep_emp_id": dep_emp_id },
                    [product_id, dep_emp_id],
                    (err, ret3) => {
                      if (err) {
                        debug("用户申请订单上传查询内勤id错误");
                        cb("error");
                      } else {
                        let office_id;
                        if (ret3.length != 0) {
                          office_id = ret3[0].off_id;
                        }
                        otherOrder.updateOrder(
                          {
                            type: type, business_id: dep_emp_id, office_id: office_id, product_id: product_id,
                            channel_id: channel_id, clientName: clientName, inmoney: inmoney, orderFile: orderFile,
                            userComment: userComment
                          },
                          [
                            type, dep_emp_id, office_id, product_id, channel_id,
                            clientName, inmoney, orderFile, userComment, order_id
                          ],
                          (err, ret) => {
                            if (err) {
                              debug("用户申请订单上传信息时出现错误");
                              cb("error");
                            } else {
                              cbr();
                            }
                          }
                        );
                      }
                    }
                  );
                }
              });
            } else {
              otherOrder.updateOrder(
                {
                  type: type, product_id: product_id, channel_id: channel_id, clientName: clientName,
                  inmoney: inmoney, orderFile: orderFile, userComment: userComment
                },
                [
                  type, product_id, channel_id, clientName, inmoney,
                  orderFile, userComment, order_id
                ],
                (err, ret) => {
                  if (err) {
                    debug("用户申请订单上传信息时出现错误");
                    cb("error");
                  } else {
                    cbr();
                  }
                }
              );
            }
          }
        }, function (err) {
          cb("success");
        })
      }
    });
  },
  /**
   * 后台通过订单id直接删除订单功能
   */
  deleteOrder: function (body, cb) {
    let order_id = body.order_id;
    otherOrder.deleteOrderById([order_id], (err, ret2) => {
      if (err) {
        debug("删除订单时出现错误");
        cb("error");
      } else {
        cb('success');
      }
    });
  },
  // 此删除也无需完善，中间代码是用来验证是否需要删除的
  /**
   * 传入订单id删除此订单
   */
  deleteOrderById: function (body, cb) {
    let order_arr = body.order_arr;
    order_arr = JSON.parse(order_arr);
    let count = 0; // 删除了几个订单
    async.each(
      order_arr,
      function (order, cb2) {
        let order_id = order.order_id;
        let order_type = order.order_type;
        queryOrder.getOrder({ order_id: order_id }, [order_id], (err, ret) => {
          if (err) {
            debug("通过id查询订单错误");
            cb("error");
          } else {
            if (ret.length != 0) {
              let product_id = ret[0].product_id;
              let channel_id = ret[0].channel_id;
              let type = ret[0].type;
              let inmoney = ret[0].inmoney;
              let orderFile = ret[0].orderFile;
              let clientName = ret[0].clientName;
              if (order_type == "1") {
                // 订单
                if (
                  product_id &&
                  channel_id &&
                  type &&
                  inmoney &&
                  orderFile &&
                  clientName
                ) {
                  cb2();
                } else {
                  otherOrder.deleteOrderById([order_id], (err, ret2) => {
                    if (err) {
                      debug("删除空订单时出现错误");
                      cb("error");
                    } else {
                      count++;
                      cb2();
                    }
                  });
                }
              } else if (order_type == "2") {
                // 询值
                if (product_id && channel_id && type && orderFile) {
                  cb2();
                } else {
                  otherOrder.deleteOrderById([order_id], (err, ret2) => {
                    if (err) {
                      debug("删除空订单时出现错误");
                      cb("error");
                    } else {
                      count++;
                      cb2();
                    }
                  });
                }
              } else if (order_type == "3") {
                // 推荐
                if (channel_id && clientName && type && orderFile) {
                  cb2();
                } else {
                  otherOrder.deleteOrderById([order_id], (err, ret2) => {
                    if (err) {
                      debug("删除空订单时出现错误");
                      cb("error");
                    } else {
                      count++;
                      cb2();
                    }
                  });
                }
              }
            }
          }
        });
      },
      function (err) {
        cb(count.toString());
      }
    );
  },
  /**
   * 传入该角色id，部门id，以及内勤id来获得他权限下的所有未处理订单
   */
  getNoHandleOrders: function (body, cb) {
    let otjs = {};
    let order_type = body.order_type
    let role_type = body.role_type;
    let userdep_id = body.userdep_id;
    let busoff_id = body.busoff_id;
    queryOrder.getNoHandleOrders({ "role_type": role_type, "userdep_id": userdep_id, "busoff_id": busoff_id },
      { "order_state": 1, "order_type": order_type }, [1, order_type], (err, ret) => {
        if (err) {
          console.log(err);
          debug('获得所有未处理订单错误');
        } else {
          cb(ret.length + "");
        }
      })

  },
  /**
   * 传入材料id与具体材料id数组，指定中间表
   */
  updateFileType: function (body, cb) {
    let file_type_id = body.file_type_id;
    let detail_file_type_id_arr = body.detail_file_type_id;
    if (typeof (detail_file_type_id_arr) != "object") {
      detail_file_type_id_arr = [detail_file_type_id_arr];
    }
    otherOrder.deleteRelationFileType([file_type_id], (err, rt) => {
      if (err) {
        debug("删除材料中间表与此材料id对应的数据时出现错误");
        cb("error");
      } else {
        async.eachSeries(
          detail_file_type_id_arr,
          function (detail_file_type_id, cb2) {
            otherOrder.insertRelationType(
              [file_type_id, detail_file_type_id],
              (err, ret) => {
                if (err) {
                  debug("添加申请材料中间表时出现错误");
                  cb("error");
                } else {
                  cb2();
                }
              }
            );
          },
          function (err) {
            cb("success");
          }
        );
      }
    });
  },
  /**
   * 传入具体材料id，删除一个具体材料
   */
  deleteDetailFileType: function (body, cb) {
    let detail_file_type_id = body.detail_file_type_id;
    queryOrder.getRelationFile_types([detail_file_type_id], (err, ret) => {
      if (err) {
        debug("删除具体材料时，查询中间表看是否有关联错误");
        cb("error");
      } else {
        if (ret.length != 0) {
          cb("fileFail");
        } else {
          otherOrder.deleteDetailFileType(
            [detail_file_type_id],
            (err, ret2) => {
              if (err) {
                debug("删除具体材料时错误");
                cb("error");
              } else {
                cb("success");
              }
            }
          );
        }
      }
    });
  },
  // 优化完毕
  /**
   * 传入材料表id，删除一个材料
   */
  deleteFileType: function (body, cb) {
    let file_type_id = body.file_type_id;
    queryOrder.getProduct(
      { file_type_id: file_type_id },
      [file_type_id],
      (err, ret) => {
        if (err) {
          debug("删除材料表时，通过材料id查询商品出现错误");
          cb("error");
        } else {
          if (ret.length != 0) {
            cb("productFail");
          } else {
            otherOrder.deleteFileType([file_type_id], (err, rt1) => {
              if (err) {
                debug("删除材料表时出现错误");
                cb("error");
              } else {
                cb("success");
              }
            });
          }
        }
      }
    );
  },
  /**
   * 创建申请材料
   */
  insertFileType: function (body, cb) {
    let bus_name = body.bus_name;
    otherOrder.insertType([bus_name], (err, ret) => {
      if (err) {
        debug("创建申请材料类型时出现错误");
        cb("error");
      } else {
        cb("success");
      }
    });
  },
  /**
   * 创建具体的申请材料
   */
  insertDetailFileType: function (body, cb) {
    let name_arr = body.name;
    let text_arr = body.text;
    if (typeof name_arr != "object") {
      name_arr = [name_arr];
    }
    if (typeof text_arr != "object") {
      text_arr = [text_arr];
    }
    let count = 0;
    async.each(
      name_arr,
      function (name, cb2) {
        otherOrder.insertDetailType([name, text_arr[count++]], (err, ret2) => {
          if (err) {
            debug("添加申请材料具体类型时出现错误");
            cb("error");
          } else {
            cb2();
          }
        });
      },
      function (err) {
        cb("success");
      }
    );
  },
  // 创建一个商品
  insertProduct: function (req, cb) {
    let body = req.body;
    let name = body.name;
    let product_type_id = parseInt(body.product_type_id);
    otherOrder.insertProduct([name, product_type_id], (err, ret) => {
      if (err) {
        debug("创建一个新的商品时出现错误");
        cb("error");
      } else {
        let product_id = ret.insertId;
        req.body.product_id = product_id;
        this.updateProductInfo(req, cb);
      }
    });
  },
  // 创建一个商品
  insertProductType: function (req, cb) {
    let body = req.body;
    let product_type_name = body.product_type_name;
    otherOrder.insertProductType([product_type_name], (err, ret) => {
      if (err) {
        debug("创建一个新的商品类型时出现错误");
        cb("error");
      } else {
        cb("success");
      }
    });
  },
  updateProductInfo: function (req, cb) {
    let body = req.body;
    let product_intro = body.product_intro;
    let product_id = body.product_id;
    let name = body.name;
    let threeText = body.threeText;
    let isNum = body.isNum;
    let isBourse = body.isBourse;
    let putaway = body.putaway;
    let exist_arr = body.exist;

    let product_detail = body.product_detail;
    product_detail = product_detail.replace(/\n/g, "&br");
    let imgPath = req.files.length;
    let flow_id = body.flow_id;
    let file_type_id = body.file_type_id;

    let imgPathDetail = "";
    let imgPathDetail2 = "";
    let imgPathSmall = "";
    let count = 0;
    let count2 = 0;
    async.eachSeries(
      exist_arr,
      function (exist, cb2) {
        if (exist == 0) {
          count++;
          cb2();
        } else if (exist == 1) {
          queryOrder.getProduct(
            { product_id: product_id },
            [product_id],
            (err, ret) => {
              if (err) {
                debug("修改商品信息查询商品文件路径时出现错误");
                cb("error");
              } else {
                imgPath = req.files[count2].path;
                count2++;
                let imgAgoPath = "";
                if (count == 0) {
                  imgAgoPath = ret[0].imgPathSmall;
                  imgPathSmall = imgPath.split(uploadFile + symbol)[1]; // 实际传入数据库的图片路径
                } else if (count == 1) {
                  imgAgoPath = ret[0].imgPath;
                  imgPathDetail = imgPath.split(uploadFile + symbol)[1]; // 实际传入数据库的图片路径
                } else if (count == 2) {
                  imgAgoPath = ret[0].imgPath2;
                  imgPathDetail2 = imgPath.split(uploadFile + symbol)[1]; // 实际传入数据库的图片路径
                }
                count++;
                cb2();
              }
            }
          );
        }
      },
      function (err) {
        let jsObj = {
          name: name,
          isNum: isNum,
          isBourse: isBourse,
          putaway: putaway,
          threeText: threeText,
          product_detail: product_detail,
          imgPath: imgPathDetail,
          imgPath2: imgPathDetail2,
          imgPathSmall: imgPathSmall,
          flow_id: flow_id,
          file_type_id: file_type_id,
          product_intro: product_intro
        };
        let arr = [
          name,
          isNum,
          isBourse,
          putaway,
          threeText,
          product_detail,
          imgPathDetail,
          imgPathDetail2,
          imgPathSmall,
          flow_id,
          file_type_id,
          product_intro,
          product_id
        ];
        otherOrder.updateProductInfo(jsObj, arr, (err, ret) => {
          if (err) {
            debug("修改包括图片的商品信息出现错误");
            cb("error");
          } else {
            cb("success");
          }
        });
      }
    );
  },
  /**
   * 获得file_type表的id与name
   */
  getFile_typeNameId: function (body, cb) {
    queryOrder.getFile_typeNameId({}, [], (err, ret) => {
      if (err) {
        debug("获得file_type表中的名字与id错误");
        cb("error");
      } else {
        cb(JSON.stringify({ data: ret }));
      }
    });
  },
  /**
   * 无须传入数据，获得flow表的id与name
   */
  getFlowNameId: function (body, cb) {
    queryOrder.getFlowNameId({}, [], (err, ret) => {
      if (err) {
        debug("获得flow表中的名字与id错误");
        cb("error");
      } else {
        cb(JSON.stringify({ data: ret }));
      }
    });
  },
  /**
   * 多表查询
   * 传入具体的文件类型数表id，查询出对应的数据条数，以及名字，id
   */
  getDetailFile_types: function (body, cb) {
    let file_type_id = body.file_type_id;
    queryOrder.getDetailFile_types([file_type_id], (err, ret) => {
      if (err) {
        debug("通过文件类型表id获取具体的类型错误");
        cb("error");
      } else {
        cb(JSON.stringify({ data: ret }));
      }
    });
  },
  /**
   * 查询所有的文件类型
   */
  getDetailFileType: function (body, cb) {
    queryOrder.getDetailFileType((err, ret) => {
      if (err) {
        debug("查找具体文件类型表所有出现错误");
        cb("error");
      } else {
        cb(JSON.stringify({ data: ret }));
      }
    });
  },
  /**
   * 传入流程id
   * 得到具体的各个流程与各个状态
   */
  getSortFlowState: function (body, cb) {
    let flow_id = body.flow_id;
    queryOrder.getSortFlows([flow_id], (err, ret) => {
      if (err) {
        debug("通过流程id查询具体流程时出现错误");
        cb("error");
      } else {
        let arr2 = [];
        async.eachSeries(
          ret,
          function (rt, cb2) {
            let flow_detail_id = rt.flow_detail_id;
            queryOrder.getdetailStates([flow_detail_id], (err, ret2) => {
              if (err) {
                debug("通过具体流程id，flow_detail_id查询多个状态错误");
                cb("error");
              } else {
                arr2.push(ret2);
                cb2();
              }
            });
          },
          function (err) {
            cb(JSON.stringify({ data: [ret, arr2] }));
          }
        );
      }
    });
  },
  getFlowByFlow_detail_id: function (body, cb) {
    let flow_detail_id = body.flow_detail_id;
    queryOrder.getFlow(
      { flow_detail_id: flow_detail_id },
      [flow_detail_id],
      (err, ret) => {
        if (err) {
          debug("通过具体流程id查询具体流程出现错误");
          cb("error");
        } else {
          cb(JSON.stringify({ data: ret }));
        }
      }
    );
  },
  /**
   * 获得符合条件的订单信息
   * 传入不同订单信息,返回筛选后的订单，
   * 返回json字符串格式{ "result": result }
   */
  getOrders: function (body, cb) {
    let order_id = body.order_id;
    let appli_id = body.appli_id;
    let type = body.type;
    let channel_id = body.channel_id;
    let business_id = body.business_id;
    let office_id = body.office_id;
    let order_type = body.order_type;

    let limit = body.limit;
    let role_type = body.role_type;
    let userdep_id = body.userdep_id;
    let busoff_id = body.busoff_id;
    let client = body.client;

    let jsonObj = {
      order_id: order_id,
      appli_id: appli_id,
      type: type,
      channel_id: channel_id,
      business_id: business_id,
      office_id: office_id,
      order_type: order_type
    };
    let arr = [
      order_id,
      appli_id,
      type,
      channel_id,
      business_id,
      office_id,
      order_type
    ];
    let otjs = {
      limit: limit,
      role_type: role_type,
      userdep_id: userdep_id,
      busoff_id: busoff_id,
      client: client
    };
    queryOrder.getOrderSplitPage(otjs, jsonObj, arr, (err, ret) => {
      cb(JSON.stringify({ result: ret }));
    });
  },
  /**
   * 传入商品id
   * 获得此id所对应的产品
   */
  getProductById: function (body, cb) {
    let product_id = body.product_id;
    let product_type_id = body.product_type_id;
    let putaway = body.putaway;
    let isNum = body.isNum;
    queryOrder.getProduct(
      { product_id: product_id, isNum: isNum, product_type_id: product_type_id },
      [product_id, isNum, product_type_id],
      (err, ret) => {
        if (err) {
          debug("通过商品id获得商品错误");
          cb("error");
        } else {
          cb(JSON.stringify({ data: ret }));
        }
      }
    );
  },
  /**
   * 获得是否询值的产品，以及什么类型（房贷or车贷）的以及房贷或评估所产品
   */
  getProductByOther: function (body, cb) {
    let isNum = body.isNum;
    let isBourse = body.isBourse;
    let putaway = body.putaway;
    let product_type_id = body.product_type_id;
    queryOrder.getProduct(
      {
        isNum: isNum,
        isBourse: isBourse,
        putaway: putaway,
        product_type_id: product_type_id
      },
      [isNum, isBourse, putaway, product_type_id],
      (err, ret) => {
        if (err) {
          debug("通过商品id获得商品错误");
          cb("error");
        } else {
          cb(JSON.stringify({ data: ret }));
        }
      }
    );
  },
  /**
   * 传入商品类别id
   * 获得同类别的所有商品
   */
  getProductsByTypeId: function (body, cb) {
    let product_type_id = body.product_type_id;
    let limit = body.limit;
    let isNum = body.isNum;
    queryOrder.getProduct(
      { product_type_id: product_type_id, isNum: isNum },
      [product_type_id, isNum],
      (err, ret) => {
        if (err) {
          debug("通过类型获取商品错误");
          cb();
        } else {
          cb(JSON.stringify({ data: ret }));
        }
      },
      limit
    );
  },
  /**
   * 获得不是申请订单的订单
   */
  getNotAppliOrders: function (body, cb) {
    let appli_id = body.appli_id;
    if (appli_id) {
      otherOrder.getNotAppliOrdersById([appli_id], (err, ret) => {
        if (err) {
          debug("通过id获取单个非申请订单错误");
          cb("error");
        } else {
          cb(JSON.stringify({ result: ret }));
        }
      });
    } else {
      otherOrder.getNotAppliOrders([], (err, ret) => {
        if (err) {
          debug("获取所有非申请订单错误");
          cb("error");
        } else {
          cb(JSON.stringify({ result: ret }));
        }
      });
    }
  },
  /**
   * 获得所有的产品类型
   * 返回用json.stringy()转换后的json字符串格式 result
   */
  getProductTypes: function (body, cb) {
    queryOrder.getProductType({}, [], (err, result) => {
      cb(JSON.stringify(result));
    });
  },
  /**
   * 传入订单id,order_id，返回所有对应状态
   */
  getOrderStateByOrder_id: function (body, cb) {
    let order_id = body.order_id;
    queryOrder.getOrderState({ order_id: order_id }, [order_id], (err, ret) => {
      if (err) {
        debug("通过订单id查询状态中间表时错误");
        cb("error");
      } else {
        cb(JSON.stringify({ data: ret }));
      }
    });
  },
  /**
   * 获得这张订单的所有信息
   */
  getAllOrderInfo: function (body, cb) {
    let arr = [];
    let t = this;
    async.parallel(
      [
        function (cb2) {
          t.getFlowStateByPro_Id(body, ret => {
            let data = JSON.parse(ret).data;
            arr.push({ allFlowState: data });
            cb2();
          });
        },
        function (cb2) {
          t.getOrderStateByOrder_id(body, ret => {
            let data = JSON.parse(ret).data;
            getTime2(data, rt => {
              arr.push({ allState: rt });
              cb2();
            });
          });
        },
        function (cb2) {
          t.getFlow(body, ret => {
            let data = JSON.parse(ret).result[3];
            getTime2(data, rt => {
              arr.push({ flowTime: rt });
              cb2();
            });
          });
        }
      ],
      function (err) {
        cb(JSON.stringify({ data: arr }));
      }
    );
  },

  /**
   * 传入订单与状态中间表的id，
   * 返回具体的流程的字符串值
   */
  getStates: function (body, cb) {
    let relation_state_id = body.state_id;
    queryOrder.getOrderState(
      { relation_state_id: relation_state_id },
      [relation_state_id],
      (err, result) => {
        let state_detail_id = result[0].state_detail_id;
        queryOrder.getStateDetail(
          { state_detail_id: state_detail_id },
          [state_detail_id],
          (err, rst) => {
            let state_name = rst[0].state_name;
            cb(state_name);
          }
        );
      }
    );
  },
  /**
   * 传入订单编号，
   * 返回流程id，大流程对应各小流程的时间，订单id, 返回json字符串格式{ "result": [flow_id,[t1,t2,t3...],order_id] }
   */
  getFlow: function (body, cb) {
    let order_id = body.order_id;
    queryOrder.getOrder({ order_id: order_id }, [order_id], (err, result) => {
      let product_id = result[0].product_id;
      let flowState = result[0].flowState;
      queryOrder.getProduct(
        { product_id: product_id },
        [product_id],
        (err, rst) => {
          let flow_id = rst[0].flow_id;
          queryOrder.getSortFlows([flow_id], (err, rslt) => {
            let arr = [];
            let arr2 = []; // 得到的是，一个大流程各个小流程下对应的其中一个状态，主要需要的是流程对应的时间
            let count = 0;
            let count2 = null;
            async.eachSeries(
              rslt,
              function (rt, callback) {
                let flow_detail_id = rt.flow_detail_id;
                if (flowState == flow_detail_id) {
                  count2 = count;
                } else {
                  count++;
                }
                queryOrder.getStateFlow(
                  { flow_detail_id: flow_detail_id },
                  [flow_detail_id],
                  (err, rt2) => {
                    let state_detail_id;
                    if (rt2[0]) {
                      state_detail_id = rt2[0].state_detail_id;
                    }
                    queryOrder.getOrderState(
                      { order_id: order_id, state_detail_id: state_detail_id },
                      [order_id, state_detail_id],
                      (err, rt3) => {
                        arr2.push(rt3[0]);
                        callback();
                      }
                    );
                  }
                );
              },
              function (err, rt0) {
                // 加入流程id
                arr.push(flow_id);
                arr.push(order_id);
                arr.push(rslt);
                arr.push(arr2);
                arr.push(count2);
                cb(JSON.stringify({ result: arr }));
              }
            );
          });
        }
      );
    });
  },
  /**
   * 传入订单id，以及当前订单对应的流程ID
   * 返回这个订单，当前流程的id值，以及流程按leavl级别升序排序的所有数据
   */
  getState: function (body, cb) {
    let order_id = body.order_id;
    queryOrder.getOrder({ order_id: order_id }, [order_id], (err, ret) => {
      // let relation_state_id = ret[0].relation_state_id;
      if (err) {
        debug("通过订单id查询对应的流程ID错误");
        cb("error");
      } else {
        if (ret[0].flowState) {
          cb(ret[0].flowState);
        } else {
          cb("");
        }
      }
      // queryOrder.getOrderState({ "relation_state_id": relation_state_id }, [relation_state_id], (err, rslt) => {
      //     let state_detail_id = rslt[0].state_detail_id;
      //     queryOrder.getStateFlow({ "state_detail_id": state_detail_id }, [state_detail_id], (err, rst) => {
      //         cb(rst[0].flow_detail_id);
      //     })
      // })
    });
  },
  /**
   * 传入具体流程，flow_detail_id
   * 返回栏值所对应的流程的字符串值以及各个状态，json字符串格式{ "result": [[object,object...],string] }
   */
  getStatess: function (body, cb) {
    let order_id = body.order_id;
    let flow_detail_id = body.flow_id;
    queryOrder.getFlow(
      { flow_detail_id: flow_detail_id },
      [flow_detail_id],
      (err, rt) => {
        let flow_name = rt[0].flow_name;
        queryOrder.getSortStates([flow_detail_id], (err, result) => {
          let arr1 = [];
          let arr2 = [];
          async.eachSeries(
            result,
            function (rst, cb2) {
              let state_detail_id = rst.state_detail_id;
              async.parallel(
                [
                  function (cb3) {
                    queryOrder.getOrderState(
                      { state_detail_id: state_detail_id, order_id: order_id },
                      [state_detail_id, order_id],
                      (err, rst) => {
                        arr1.push(rst[0]);
                        cb3();
                      }
                    );
                  },
                  function (cb3) {
                    queryOrder.getStateDetail(
                      { state_detail_id: state_detail_id },
                      [state_detail_id],
                      (err, rst2) => {
                        arr2.push(rst2[0]);
                        cb3();
                      }
                    );
                  }
                ],
                function (err) {
                  cb2();
                }
              );
            },
            function (err) {
              cb(JSON.stringify({ result: [arr1, arr2, flow_name] }));
            }
          );
        });
      }
    );
  },
  /**
   * 无须传入数据
   * 获得总利润的值以及count订单尾号的值
   */
  getProfit: function (cb) {
    queryOrder.getProfit((err, ret) => {
      if (err) {
        debug("获取总利润或者订单尾号失败");
        cb("error");
      } else {
        cb(JSON.stringify({ data: ret }));
      }
    });
  },
  /**
   * 无须传入东西，创建一个空订单，返回订单id,json格式
   */
  createOrder: function (body, cb) {
    let order_type = body.order_type;
    if (typeof order_type != "string" && order_type) {
      order_type = order_type.toString();
    }
    let appli_id = body.appli_id;
    appli_id = addZero(appli_id);
    let appliTime = new Date();
    // otherOrder.getBigOrder_id((err, ret1) => {
    //   if (err) {
    //     debug("获取订单最大id出现错误");
    //     cb("error");
    //   } else {
    //     let keys = Object.keys(ret1[0]);
    //     let order_id = ret1[0][keys[0]];
    otherOrder.createEmptyOrder(
      [appli_id, appliTime, order_type],
      (err, ret2) => {
        if (err) {
          debug("创建一个空订单出现错误");
          cb("error");
        } else {
          console.log(ret2.insertId);
          cb(JSON.stringify({ data: ret2.insertId }));
        }
      }
    );
    //   }
    // });
  },
  /**
   * 传入创建流程所需要的数据
   * 创建一个完整的流程
   */
  createFlow: function (body, cb) {
    let flow_name = body.flow_name;
    let detail_flow_name = body.detail_flow_name;
    let flow_leavl = body.flow_leavl;
    let detail_state_name = body.detail_state_name;
    let state_leavl = body.state_leavl;
    if (typeof detail_flow_name != "object") {
      detail_flow_name = [detail_flow_name];
    }
    if (typeof flow_leavl != "object") {
      flow_leavl = [flow_leavl];
    }
    if (typeof detail_state_name != "object") {
      detail_state_name = [detail_state_name];
    }
    if (typeof state_leavl != "object") {
      state_leavl = [state_leavl];
    }
    // 这个for循环是用来将对应的具体流程的等级，拼接在一起.拼接格式为 [[detail_flow_name, leavl], [detail_flow_name, leavl], ......]
    let flow_arr = [];
    for (let i = 0; i < flow_leavl.length; i++) {
      let arr = [];
      arr.push(detail_flow_name[i]);
      arr.push(parseInt(flow_leavl[i]));
      flow_arr.push(arr);
    }
    // 这个for循环是用来将对应的具体状态的等级，拼接在一起.拼接格式为 [[detail_state_name, leavl], [detail_state_name, leavl], ......]
    let state_arr = [];
    for (let i = 0; i < state_leavl.length; i++) {
      let arr = [];
      arr.push(detail_state_name[i]);
      arr.push(parseInt(state_leavl[i]));
      state_arr.push(arr);
    }
    let flow_id;
    let detail_flow_id_arr = [];
    let detail_state_id_arr = [];
    async.parallel(
      [
        function (cb2) {
          otherOrder.insertFlow([flow_name], (err, ret) => {
            if (err) {
              debug("通过流程名创建流程出现错误");
              cb("error");
            } else {
              flow_id = ret.insertId;
              cb2(null, 1);
            }
          });
        },
        function (cb2) {
          async.eachSeries(
            flow_arr,
            function (arr, cb3) {
              otherOrder.insertDetailFlow(arr, (err, ret) => {
                if (err) {
                  debug("通过具体流程名与等级创建具体流程出现错误");
                  cb("error");
                } else {
                  let detail_flow_id = ret.insertId;
                  detail_flow_id_arr.push(detail_flow_id);
                  cb3();
                }
              });
            },
            function (err) {
              cb2(null, 2);
            }
          );
        },
        function (cb2) {
          async.eachSeries(
            state_arr,
            function (arr, cb3) {
              otherOrder.insertDetailState(arr, (err, ret) => {
                if (err) {
                  debug("通过具体状态名与等级创建具体状态出现错误");
                  cb("error");
                } else {
                  let detail_state_id = ret.insertId;
                  detail_state_id_arr.push(detail_state_id);
                  cb3();
                }
              });
            },
            function (err) {
              cb2(null, 3);
            }
          );
        }
      ],
      function (err) {
        let arr = [];
        let arr2 = [];
        for (let i = 0; i < state_leavl.length; i++) {
          let num = parseInt(detail_state_id_arr[i]);
          if (state_leavl[i] != "1") {
            arr2.push(num);
          } else {
            arr2 = [];
            arr2.push(num);
            arr.push(arr2);
          }
        }
        let count = 0;
        async.eachSeries(
          detail_flow_id_arr,
          function (detail_flow_id, cb2) {
            otherOrder.insertRelationFlow(
              [flow_id, detail_flow_id],
              (err, ret) => {
                if (err) {
                  debug("为流程中间表赋值时出现错误");
                  cb("error");
                } else {
                  async.eachSeries(
                    arr[count],
                    function (detail_state_id, cb3) {
                      // if (isNaN(detail_state_id)) {
                      //     cb3();
                      // } else {
                      otherOrder.insertRelationState(
                        [detail_flow_id, detail_state_id],
                        (err, ret2) => {
                          if (err) {
                            debug("为状态中间表赋值时出现错误");
                            cb("error");
                          } else {
                            cb3();
                          }
                        }
                      );
                      // }
                    },
                    function (err) {
                      count++;
                      cb2();
                    }
                  );
                }
              }
            );
          },
          function (err) {
            cb("success");
          }
        );
      }
    );
  },

  // 搞定！！！！！！即数据库用了触发器
  /**
   * 传入流程id，flow_id，查看流程中间表，是否有与此对应的值
   * 数据库出现错误返回error，存在关联不能删除返回fail，可以删除就返回success
   */
  deleteFlow: function (body, cb) {
    let flow_id = body.flow_id;
    let flow_arr;
    let state_arr;
    queryOrder.getProduct({ flow_id: flow_id }, [flow_id], (err, relt) => {
      if (err) {
        debug("在删除流程时，查询商品表，出现错误");
        cb("error");
      } else {
        if (relt.length != 0) {
          cb("productFail");
        } else {
          queryOrder.getSortFlows([flow_id], (err, ret1) => {
            if (err) {
              debug("在删除流程时，多表查询流程中间表，出现错误");
              cb("error");
            } else {
              flow_arr = ret1;
              async.each(
                ret1,
                function (rt1, cb2) {
                  let flow_detail_id = rt1.flow_detail_id;
                  queryOrder.getSortStates([flow_detail_id], (err, ret2) => {
                    if (err) {
                      debug("在删除流程时，多表查询状态中间表，出现错误");
                      cb("error");
                    } else {
                      state_arr = ret2;
                      async.each(
                        ret2,
                        function (rt2, cb3) {
                          let state_detail_id = rt2.state_detail_id;
                          queryOrder.getOrderState(
                            { state_detail_id: state_detail_id },
                            [state_detail_id],
                            (err, ret3) => {
                              if (err) {
                                debug(
                                  "在删除流程时，查询订单状态中间表，出现错误"
                                );
                                cb("error");
                              } else {
                                if (ret3.length != 0) {
                                  cb("orderFail");
                                } else {
                                  cb3();
                                }
                              }
                            }
                          );
                        },
                        function (err) {
                          cb2();
                        }
                      );
                    }
                  });
                },
                function (err) {
                  otherOrder.deleteFlow([flow_id], (err, ret5) => {
                    if (err) {
                      debug("删除流程时出现错误");
                      cb("error");
                    } else {
                      cb("success");
                    }
                  });
                }
              );
            }
          });
        }
      }
    });
  },
  // 此删除无须更改。
  /**
   * 根据传入的商品id，删除此商品
   */
  deleteProduct: function (body, cb) {
    let product_id = body.product_id;
    queryOrder.getOrder(
      { product_id: product_id },
      [product_id],
      (err, ret) => {
        if (err) {
          debug("删除商品时，查询订单表出现错误");
          cb("error");
        } else {
          if (ret.length != 0) {
            cb("orderFail");
          } else {
            queryOrder.getProduct(
              { product_id: product_id },
              [product_id],
              (err, ret3) => {
                if (err) {
                  debug("删除商品时，查询商品图片出现错误");
                  cb("error");
                } else {
                  let agoImgPath = ret3[0].imgPath;
                  deleteFile(agoImgPath);
                  agoImgPath = ret3[0].imgPathSmall;
                  deleteFile(agoImgPath);
                  otherOrder.deleteProduct([product_id], (err, ret2) => {
                    if (err) {
                      debug("删除商品时，出现错误");
                      cb("error");
                    } else {
                      cb("success");
                    }
                  });
                }
              }
            );
          }
        }
      }
    );
  },
  /**
   * 传入大状态与订单id，修改他的大状态
   */
  setOrder_state: function (body, cb) {
    let order_state = body.order_state;
    let order_id = body.order_id;
    otherOrder.setOrder_state([order_state, order_id], (err, ret) => {
      if (err) {
        debug("修改订单五大状态时候出现错误");
        cb("error");
      } else {
        cb("success");
      }
    });
  },
  /**
   * 传入还款状态1和2，修改还款状态
   */
  setRefund_state: function (body, cb) {
    let refund = body.refund;
    let order_id = body.order_id;
    otherOrder.setRefund_state([refund, order_id], (err, ret) => {
      if (err) {
        debug("修改还款状态时候出现错误");
        cb("error");
      } else {
        cb("success");
      }
    });
  },

  /**
   * 传入order_id以及状态id，state_detail_id和失败原因failReason将
   * 修改订单与状态中间表的失败原因
   */
  setFailReason: function (body, cb) {
    let order_id = body.order_id;
    let failReason = body.failReason;
    if (failReason == "") {
      failReason = null;
    }
    otherOrder.setFailReason([failReason, order_id], (err, ret) => {
      if (err) {
        debug("设置失败原因错误");
        cb();
      } else {
        if (failReason && failReason != "") {
          this.setOrder_state({ order_state: 4, order_id: order_id }, cb);
        } else {
          this.setOrder_state({ order_state: 2, order_id: order_id }, cb);
        }
      }
    });
  },

  /**
   * 传入要修改的总利润的值
   * 修改总利润的值
   */
  updateProfit: function (body, cb) {
    let profit = body.profit;
    otherOrder.updateProfit([profit], (err, ret) => {
      if (err) {
        debug("设置总利润失败");
        cb();
      } else {
        cb("success");
      }
    });
  },
  /**
   * 传入状态表id，state_detail_id与订单id,order_id,和时间time
   * 返回success或error
   */
  setState: function (body, cb) {
    let state_detail_id = body.state_detail_id;
    let order_id = body.order_id;
    let time = body.time;
    otherOrder.setStateTime([time, order_id, state_detail_id], (err, rslt) => {
      queryOrder.getOrderState(
        { state_detail_id: state_detail_id, order_id: order_id },
        [state_detail_id, order_id],
        (err, rslt2) => {
          let relation_state_id = rslt2[0].relation_state_id;
          otherOrder.setState([relation_state_id, order_id], (err, result) => {
            if (err) {
              debug("为订单设置具体状态失败");
              cb("error");
            } else {
              cb("success");
            }
          });
        }
      );
    });
  },
  /**
   * 设置此订单流程对应的时间
   * 传入流程id，flow_id,与订单id，order_id与栏值，以及中间表流程对应的事件，flow_time
   * 把对应的订单的申请流程id修改为当前流程
   * 返回success或error
   */
  setFlowTime: function (body, cb) {
    let flow_detail_id = body.flow_detail_id;
    let order_id = body.order_id;
    let flow_time = body.flow_time;
    otherOrder.updateOrder(
      { flowState: flow_detail_id },
      [flow_detail_id, order_id],
      (err, ret) => {
        queryOrder.getStateFlow(
          { flow_detail_id: flow_detail_id },
          [flow_detail_id],
          (err, rslt) => {
            async.eachSeries(
              rslt,
              function (rt, cb2) {
                let state_detail_id = rt.state_detail_id;
                otherOrder.setFlowTime(
                  [flow_time, order_id, state_detail_id],
                  (err, rst2) => {
                    if (err) {
                      cb2("为订单设置具体流程时间失败");
                    } else {
                      cb2();
                    }
                  }
                );
              },
              function (err) {
                if (err) {
                  cb("error");
                } else {
                  cb("success");
                }
              }
            );
          }
        );
      }
    );
  },
  /**
   * 传入订单id，以及字段名，以及要修改的内容
   */
  updateOneOrder: function (body, cb) {
    let name = body.name[0];
    let val = body.name[1];
    let order_id = body.order_id;
    otherOrder.updateOneOrder(name, [val, order_id], (err, rslt) => {
      if (err) {
        cb("error");
      } else {
        cb("success");
      }
    });
  },

  screenOrder: function (body, cb2) {
    let userdep_id = body.userdep_id;
    let role_type = body.role_type;
    let emp_id = body.emp_id;
    async.parallel(
      {
        type: function (cb) {
          // 获取筛选的所有类型
          queryOrder.getProductType({}, [], (err, result) => {
            cb(null, result);
          });
        },
        channel: function (cb) {
          let arr = [];
          if (role_type == 3) {
            if (userdep_id) {
              queryEmp.getEmpIdAndName({ type: "5", dep_id: userdep_id }, [5, userdep_id], (err, ret) => {
                if (err) {
                  debug(err);
                  cb(null, []);
                } else {
                  async.each(ret, function (rt, cb3) {
                    let iiuv = rt.iiuv;
                    queryEmp.getDepUsers([iiuv, 6], (err, ret2) => {
                      if (ret2.length != 0) {
                        arr = arr.concat(ret2)
                      }
                      cb3();
                    })
                  }, function (err) {
                    cb(null, arr);
                  })
                }
              });
            } else {
              cb(null, [])
            }
          } else if (role_type == 4) {
            let arr = [];
            queryEmp.getOffBusName([emp_id], (err, ret) => {
              if (err) {
                debug('查询筛选条件的业务出现错误');
                cb(null, [])
              } else {
                async.each(ret, function (rt, cb3) {
                  let iiuv = rt.iiuv;
                  queryEmp.getDepUsers([iiuv, 6], (err, ret2) => {
                    if (ret2.length != 0) {
                      arr = arr.concat(ret2)
                    }
                    cb3();
                  })
                }, function (err) {
                  cb(null, arr);
                })
              }
            })
          } else if (role_type == 5) {
            queryEmp.getEmp({ emp_id: emp_id }, [emp_id], (err, ret) => {
              let iiuv = ret[0].iiuv;
              queryEmp.getDepUsers([iiuv, 6], (err, ret) => {
                cb(null, ret)
              })
            })
          } else {
            // 获取筛选的所有渠道
            queryEmp.getEmpIdAndName({ type: "6" }, [6], (err, result) => {
              cb(null, result);
            });
          }
        },
        business: function (cb) {
          if (role_type == 3) {
            // 获取筛选的所有业务
            if (userdep_id) {
              queryEmp.getEmpIdAndName({ type: "5", dep_id: userdep_id }, [5, userdep_id], (err, ret) => {
                cb(null, ret);
              })
            } else {
              cb(null, [])
            };
          } else if (role_type == 4) {
            queryEmp.getOffBusName([emp_id], (err, ret) => {
              if (err) {
                debug('查询筛选条件的业务出现错误');
                cb(null, [])
              } else {
                cb(null, ret)
              }
            })
          } else if (role_type == 5) {
            queryEmp.getEmpIdAndName({ type: "5", "emp_id": emp_id }, [5, emp_id], (err, ret) => {
              if (err) {
                debug('查询筛选条件的业务出现错误');
                cb(null, [])
              } else {
                cb(null, ret)
              }
            })
          } else {
            queryEmp.getEmpIdAndName({ type: "5" }, [5], (err, ret) => {
              cb(null, ret);
            });
          }
        },
        office: function (cb) {
          if (role_type == 3) {
            if (userdep_id) {
              let arr = [];
              queryEmp.getEmpIdAndName({ type: "5", dep_id: userdep_id }, [5, userdep_id], (err, rets) => {
                if (err) {
                  debug(err);
                  cb(null, []);
                } else {
                  let arr2 = [];
                  async.each(rets, function (rts, callback) {
                    let dep_emp_id = rts.emp_id;
                    queryEmp.getBusNameId([dep_emp_id], (err, ret) => {
                      if (ret.length != 0) {
                        arr = arr.concat(ret);
                      }
                      callback();
                    })
                  }, function (err) {
                    let flag = true;
                    for (let i = 0; i < arr.length; i++) {
                      let emp_id1 = arr[i].emp_id;
                      if (arr2.length == 0) {
                        arr2.push(arr[i])
                      } else {
                        // 默认没有和其一样的值
                        let flag = false;
                        for (let j = 0; j < arr2.length; j++) {
                          let emp_id2 = arr2[j].emp_id;
                          if (emp_id2 == emp_id1) {
                            // 相等，那么就有不需要加入
                            flag = true;
                            break;
                          }
                        }
                        if (!flag) {
                          arr2.push(arr[i])
                        } else {
                          continue;
                        }
                      }
                    }
                    cb(null, arr2)
                  })
                }
              })
            } else {
              cb(null, []);
            }
          } else if (role_type == 4) {
            queryEmp.getEmpIdAndName({ type: "4", "emp_id": emp_id }, [4, emp_id], (err, ret) => {
              cb(null, ret);
            });
          } else if (role_type == 5) {
            queryEmp.getBusNameId([emp_id], (err, ret) => {
              let arr2 = [];
              for (let i = 0; i < ret.length; i++) {
                let emp_id1 = ret[i].emp_id;
                if (arr2.length == 0) {
                  arr2.push(ret[i])
                } else {
                  // 默认没有和其一样的值
                  let flag = false;
                  for (let j = 0; j < arr2.length; j++) {
                    let emp_id2 = arr2[j].emp_id;
                    if (emp_id2 == emp_id1) {
                      // 相等，那么就有不需要加入
                      flag = true;
                      break;
                    }
                  }
                  if (!flag) {
                    arr2.push(ret[i])
                  } else {
                    continue;
                  }
                }
              }
              cb(null, arr2);
            })
          } else {
            // 获取筛选的所有内勤
            queryEmp.getEmpIdAndName({ type: "4" }, [4], (err, result) => {
              cb(null, result);
            });
          }
        },
        dep: function (cb) {
          // 获取筛选的所有部门
          queryEmp.getDep("", [], (err, result) => {
            cb(null, result);
          });
        }
      },
      function (err, result) {
        cb2(JSON.stringify(result));
      }
    );
  },
  /**
   * 筛选订单
   * 可选：传入部门id(dep_id),订单类型(order_type),商品类型(type),渠道id(channel_id),业务id(business_id),内勤id(office_id)
   * 以及起始时间(time1)，截止时间(time2)[格式:'xxxx-xx-xx xx:xx']
   * 返回json字符串格式，{"result":result[Arrar]}
   */
  screen: function (body, cb) {
    let dep_id = body.dep_id; // 部门id
    let order_type = body.order_type; // 订单类型
    let type = body.type; // 商品类型
    let channel_id = body.channel_id; // 渠道id（用户id）
    let business_id = body.business_id; // 业务id
    let office_id = body.office_id; // 内勤id
    let order_state = body.order_state; // 内勤id
    let time1 = body.time1; // 起始时间
    let timeType = body.timeType; // 申请时间还是放款时间

    let limit = body.limit; // 分页
    let role_type = body.role_type;
    let userdep_id = body.userdep_id;
    let busoff_id = body.busoff_id;

    if (time1) {
      time1 = time1.toString();
    }
    let time2 = body.time2; // 结束时间
    if (time2) {
      time2 = time2.toString();
    }
    let otjs = {
      limit: limit,
      dep_id: dep_id,
      timeType: timeType,
      role_type: role_type,
      userdep_id: userdep_id,
      busoff_id: busoff_id
    };
    if (dep_id) {
      let jsBody = {
        order_type: order_type,
        type: type,
        channel_id: channel_id,
        business_id: "",
        office_id: office_id,
        order_state: order_state,
        time1: time1,
        time2: time2
      };
      let arr = [
        order_type,
        type,
        channel_id,
        business_id,
        office_id,
        order_state,
        time1,
        time2
      ];
      if (role_type != 3) {
        arr.push(dep_id);
      }
      queryOrder.getScreenOrderSplitPage(otjs, jsBody, arr, (err, result) => {
        if (err) {
          debug("----筛选过程中出现错误----");
          cb("error");
        } else {
          cb(JSON.stringify({ result: result }));
        }
      });
    } else {
      let jsBody = {
        order_type: order_type,
        type: type,
        channel_id: channel_id,
        business_id: business_id,
        office_id: office_id,
        order_state: order_state,
        time1: time1,
        time2: time2
      };
      queryOrder.getScreenOrderSplitPage(
        otjs,
        jsBody,
        [
          order_type,
          type,
          channel_id,
          business_id,
          office_id,
          order_state,
          time1,
          time2
        ],
        (err, result) => {
          if (err) {
            debug("----筛选过程中出现错误----");
          } else {
            let arr = [];
            async.each(
              result,
              function (rt, cb3) {
                let business_id = rt.business_id;
                queryEmp.getEmp(
                  { emp_id: business_id },
                  [business_id],
                  (err, ret) => {
                    if (err) {
                      debug("在没有部门筛选条件时，为dep_id赋值错误");
                      cb("error");
                    } else {
                      if (ret.length != 0) {
                        rt.dep_id = ret[0].dep_id;
                      }
                      arr.push(rt);
                      cb3();
                    }
                  }
                );
              },
              function (err) {
                cb(JSON.stringify({ result: arr }));
              }
            );
          }
        },
        timeType
      );
    }
  },
  //写入excel表格
  /**
   * @param {Object} results  results[json对象，json对象]
   * @param {any} callback    callback("true或者false") true写入成功，false写入失败
   */
  writeExcel: function (results, callback) {
    let arrStr = public.outputTitleArrOrder;
    let data = [arrStr];
    // fs.writeFileSync('b.xlsx', buffer, 'binary');
    async.eachSeries(
      results,
      function (result, cb) {
        let keys = Object.keys(result);
        let arr = [];
        async.eachSeries(
          keys,
          function (k, cb2) {
            let time;
            switch (k) {
              case "emp_id":
                cb2();
                break;
              case "relation_state_id":
                getState(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "flowState":
                getFlow(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "product_id":
                getProduct(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "order_state":
                getOrderState(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "seeTime":
                time = Date.parse(new Date(result[k]));
                getTime(time, rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "loanTime":
                time = Date.parse(new Date(result[k]));
                getTime(time, rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "type":
                getType(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "failReason":
                set_br_n(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "empComment":
                set_br_n(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "userComment":
                set_br_n(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "appliTime":
                time = Date.parse(new Date(result[k]));
                getTime(time, rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "order_type":
                cb2();
                break;
              case "channel_id":
                getEmpName(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "office_id":
                getEmpName(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "business_id":
                getEmpName(result[k], rt => {
                  arr.push(rt);
                  cb2();
                });
                break;
              case "card_name":
                arr.push(result[k]);
                cb2("over");
                break;
              // case 'orderFile':
              //     let val = result[k].toString().split(';');
              //     splitOrderFile(val, (rt) => {
              //         arr.push(rt);
              //         cb2();
              //     })
              //     break;
              default:
                arr.push(result[k]);
                cb2();
            }
          },
          function (err) {
            data.push(arr);
            cb();
          }
        );
      },
      function (err, rst) {
        let buffer = xlsx.build([{ name: "sheet1", data: data }]);
        let timeStr = new Date().getTime();
        let pathStr = path.join(
          __dirname,
          "../public/" + excelFile + "/" + timeStr + ".xlsx"
        );
        fs.writeFile(pathStr, buffer, "binary", function (err) {
          if (err) {
            callback("false", null);
          } else {
            timer.deleteExcel(pathStr);
            callback("true", pathStr);
          }
        });
      }
    );
  },
  /**
   * 为total_profit表中的count赋值，也就是订单编号尾数
   */
  setCount: function (body, cb) {
    let count = body.count;
    otherOrder.updateCount([count], (err, ret) => {
      if (err) {
        debug("在给公共变量count赋值时错误");
        cb(null, "error");
      } else {
        cb(null, "success");
      }
    });
  }
};

function set_br_n(text, cb) {
  let str = "";
  if (text) {
    let arr = text.split("&br");
    for (let i = 0; i < arr.length; i++) {
      str += arr[i];
    }
    cb(str);
  } else {
    cb("暂无");
  }
}
function splitOrderFile(fileStr, cb) {
  let ax = "";
  async.each(
    fileStr,
    function (file, cb2) {
      ax += public.path + public.httpport + "/" + file + ";";
      cb2();
    },
    function (err) {
      cb(ax);
    }
  );
}

// 处理订单输出excel的方法
// 获得员工的名字
function getEmpName(emp_id, cb) {
  if (emp_id && emp_id != "") {
    queryEmp.getEmp({ emp_id: emp_id }, [emp_id], (err, rst) => {
      if (rst[0].name) {
        cb(rst[0].name);
      } else {
        cb("暂无");
      }
    });
  } else {
    cb("暂无");
  }
}
// 获得订单的流程
function getFlow(flow_detail_id, cb) {
  if (flow_detail_id) {
    queryOrder.getFlow(
      { flow_detail_id: flow_detail_id },
      [flow_detail_id],
      (err, ret) => {
        if (err) {
          debug("通过具体流程id查询具体流程出现错误");
          cb("error");
        } else {
          let flow = ret[0].flow_name;
          cb(flow);
        }
      }
    );
  } else {
    cb("暂无");
  }
}
// 获得订单的状态
function getState(relation_state_id, cb) {
  if (relation_state_id) {
    queryOrder.getOrderState(
      { relation_state_id: relation_state_id },
      [relation_state_id],
      (err, result) => {
        let state_state_id = result[0].state_state_id;
        queryOrder.getStateDetail(
          { state_state_id: state_state_id },
          [state_state_id],
          (err, rst) => {
            let state = rst[0].state_name;
            if (state) {
              cb(state);
            } else {
              cb("暂无");
            }
          }
        );
      }
    );
  } else {
    cb("暂无");
  }
}
// 获得商品的名字
function getProduct(product_id, cb) {
  if (product_id && product_id != "") {
    queryOrder.getProduct(
      { product_id: product_id },
      [product_id],
      (err, rst) => {
        if (rst[0].name) {
          cb(rst[0].name);
        } else {
          cb("暂无");
        }
      }
    );
  } else {
    cb("暂无");
  }
}
// 获得商品的类别名字
function getType(type, cb) {
  queryOrder.getProductType({ product_type_id: type }, [type], (err, rst) => {
    if (rst[0].name) {
      cb(rst[0].name);
    } else {
      cb("暂无");
    }
  });
}

// 订单的流程的时间
function getTime2(ret, cb) {
  async.eachSeries(
    ret,
    function (rt, cb) {
      let state_time = rt.state_time;
      let flow_time = rt.flow_time;
      if (state_time) {
        rt.state_time = timestampToTime2(state_time);
      }
      if (flow_time) {
        rt.flow_time = timestampToTime2(flow_time);
      }
      cb();
    },
    function (err) {
      cb(ret);
    }
  );
}
function timestampToTime2(timestamp, cb) {
  let text = null;
  let date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  Y = date.getFullYear() + "-";
  M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "-";
  D = date.getDate();
  if (D < 10) {
    D = "0" + D + " ";
  } else {
    D = D + " ";
  }
  h = date.getHours();
  if (h < 10) {
    h = "0" + h + ":";
  } else {
    h = h + ":";
  }
  m = date.getMinutes();
  if (m < 10) {
    m = "0" + m;
  }
  text = Y + M + D + h + m;
  return text;
}
function getTime(timestamp, cb) {
  let date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  Y = date.getFullYear() + "-";
  M =
    (date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1) + "-";
  D = date.getDate();
  if (D < 10) {
    D = "0" + D + " ";
  } else {
    D = D + " ";
  }
  h = date.getHours();
  if (h < 10) {
    h = "0" + h + ":";
  } else {
    h = h + ":";
  }
  m = date.getMinutes();
  if (m < 10) {
    m = "0" + m;
  }
  if (Y + M + D + h + m) {
    cb(Y + M + D + h + m);
  } else {
    cb("暂无");
  }
}
// 得到实际订单状态，那5个成功失败的
function getOrderState(num, cb) {
  let text = "";
  if (num == 1) {
    text = "申请中";
  } else if (num == 2) {
    text = "审核中";
  } else if (num == 3) {
    text = "通过";
  } else if (num == 4) {
    text = "失败";
  } else if (num == 5) {
    text = "撤销";
  }
  cb(text);
}
// 判断文件路径是否存在，如果存在将这个路径删除掉
function deleteFile(imgAgoPath) {
  if (imgAgoPath) {
    let pathStr = path.join(
      __dirname,
      "../public/" + uploadFile + "/" + imgAgoPath
    );
    if (fs.existsSync(pathStr)) {
      fs.unlinkSync(pathStr);
    }
  }
}
// 数位不够加0,生成订单编号
function addZero(num) {
  let tm = Date.now();
  tm = momoent(tm).format("YYYYMMDD");
  let length = num.toString().length;
  let n = 0;
  if (length <= 4) {
    n = 4 - parseInt(length);
  }
  for (let i = 0; i < n; i++) {
    tm += "0";
  }
  tm += num;
  return tm;
}