/**
 * Created by gjc on 16-11-2.
 */

$(function () {
    //**************************js 工具封装***************************
    /**
     * 包含方法定义
     * @param arr   数组对象
     * @param obj   要判断的对象
     * @returns {boolean}
     */
    function contains(arr, obj) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === obj) {
                return true;
            }
        }
        return false;
    }

    /**
     * 给数组对象定义原型属性
     * @param obj
     * @returns {boolean}
     */
    Array.prototype.contains = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    }


//******************************** controller start here ********************************************
    var bOk=true;
    $('.contentEvent').unbind().click(function(e){
        e = e || window.event;
        var tar = e.target || e.srcElement;

        if (tar.tagName.toLowerCase() === 'i' && $(tar).hasClass('iconDownEvent')) {
            if(bOk){
                $('.nodeListEvent').hide();
                $(tar).prev().show();
                bOk=false;
            }else {
                $('.nodeListEvent').hide();
                $(tar).prev().hide();
                bOk=true;
            }
        }else {
            $('.nodeListEvent').hide()
        }
        if (tar.tagName.toLowerCase() === 'li' && $(tar).parent().hasClass('nodeListEvent')) {
            //设置点击的下拉框的内容
            var prev = $(tar).parent().prev();
            prev.html($(tar).html());
            //设置标签id
            prev.attr('id', $(tar).attr('id'));
            //触发node点击事件
            nodeClick();
        }
    });

    $('.titleTip').on('click',function(e){
        if ($(this).hasClass('downIcon')) {
            $(this).removeClass('downIcon').addClass('rightIcon');
            $(this).parent().next().hide()
        } else {
            $(this).removeClass('rightIcon').addClass('downIcon');
            $(this).parent().next().show()
        }
    });

    //选中项颜色改变
    function visitedTag($tag){
        $tag.parent().children('li').removeClass('conVisitedBg');
        $tag.addClass('conVisitedBg')
    }


    var conId;
    var selectedFlows = [];
    var selectedDeps = [];

    //controller界面打开时数据初始化
    window.initController=function () {
        //挖掘组件信息在树的信息得到后,从树迭代中获取
        flowTree();
        //选中第一个挖掘组件
        flowComponentClick($('.partStream li').eq(0));
        //选中第一个依赖组件
        visitedTag($('.dependList li:eq(0)'));
        queryLogicNodes($('.dependList li:eq(0)').attr('fid'));
    }

    //点击流事件
    window.flowComponentClick=function (flowNode) {
        //选中依赖项一个标签
        var flowId=flowNode.id;
        if(flowId==undefined) {
            flowId=flowNode.attr('id');
        }
        //选中依赖项一个标签
        initDependency(flowId);
        dependencyList();
        interfaceQuery(conId, flowId);
    }

    //删除数据挖掘组件
    $('.partStream .closeL').unbind('click').click(function () {
        //从列表中移除
        var parent = $(this).parent();
        var refid = parent.attr('refid');
        var id = parent.attr('id');
        parent.remove();
        //将勾选项取消
        var $addRoot01Selected = $('.addRoot01 i:selected');
        for(var i=0; i<$addRoot01Selected.length; i++) {
            var iParent = $addRoot01Selected.get(i).parent();
            if(id == iParent.attr('id')) {
                $addRoot01Selected.get(i).removeClass('singleChecked');
                break;
            }
        }
        //从数据库中删除
        $.ajax({
            url: urlId + '/controller/deleteFlowControllerRef',
            type: 'POST',
            dataType: "json",
            data: {refId: refid},
            success: function (data){
                console.log('delete dependency!');
            },
            error: function () {
                alert("delete controller flow!");
            }
        });
    });

    //初始化依赖的Flow信息, flowId表示查的是哪个flow的依赖, flowIds流组件中的flowIds
    function initDependency(flowId) {
        //流组件所有的ID
        var $partStream = $('.partStream li');
        var flowIds = [];
        for(var i=0; i<$partStream.length; i++) {
            flowIds.push($partStream.eq(i).attr('id'));
        }

        var htmlStr = '';
        $.ajax({
            url: urlId + '/controller/queryFlowDependency',
            type: 'POST',
            async: false,
            dataType: "json",
            data: {conId: conId, flowId: flowId, flowIds: flowIds.toString()},
            success: function (data){
                var jsonArray = JSON.parse(data);
                for(var i=0; i<jsonArray.length; i++) {
                    var array = jsonArray[i];
                    var fId = array.flowId;
                    var selected = array.isSelect;
                    htmlStr += '<li fId='+fId+' refid='+getFlowRefId(fId)+'><i class="single';
                    if(selected) {
                        htmlStr += ' singleChecked';
                    }
                    htmlStr += '"></i><span>'+getStreamText(fId)+'</span></li>';
                }
                $('.alertDependList').html(htmlStr);
                $('.alertDependList').attr('fId', flowId);
            },
            error: function () {
                alert("Dependency异常！");
            }
        });
    }
    //根据flowId获取Flow的目录层级
    function getStreamText(id) {
        var lis = $('.partStream').find('li');
        for(var i=0; i<lis.length; i++) {
            if(id==lis.eq(i).attr('id')) {
                return lis.eq(i).text();
            }
        }
    }
    //依赖列表展示
    function dependencyList() {
        var htmlStr='';
        var fId = $('.alertDependList').attr('fId');
        var children = $('.alertDependList').children();
        for(var i=0; i<children.length; i++) {
            var liNode = children.eq(i);
            var hasClass = liNode.children('i').hasClass('singleChecked');
            if(hasClass) {
                var child = liNode.children('span:eq(0)');
                var tempFid = liNode.attr('fId');
                htmlStr+='<li fId='+tempFid+' refid='+getFlowRefId(tempFid)+' class=dependClick refId='+getFlowControllerRefId(conId, fId)+'><span>'+child.text()+'</span><i class="closeL"></i></li>';
            }
        }

        $('.dependList').html(htmlStr);

        //重新绑定: Node事件
        $('.dependClick').on('click', function () {
            visitedTag($(this));
            queryLogicNodes($('.dependList .conVisitedBg').attr('fid'))
        });

        //重新绑定: 删除依赖项事件
        $('.dependList .closeL').unbind('click').click(function () {
            var theid = $('.partStream li.conVisitedBg').attr('refid');
            //从列表中移除
            var parent = $(this).parent();
            var depid = parent.attr('refid');
            var id = parent.attr('fid');
            parent.remove();
            //将勾选项取消
            var $alertDependList = $('.alertDependList li');
            for(var i=0; i<$alertDependList.length; i++) {
                var node = $alertDependList.eq(i);
                if(id == node.attr('fid')) {
                    node.removeClass('singleChecked');
                    break;
                }
            }
            //从数据库中删除
            $.ajax({
                url: urlId + '/controller/deleteFlowDependency',
                type: 'POST',
                async: false,
                dataType: "json",
                data: {theId: theid, depId: depid},
                success: function (data){
                    console.log('delete dependency! ');
                },
                error: function () {
                    alert("delete dependency 异常");
                }
            });
            //选中依赖项第一项
            //选中第一个依赖组件
            visitedTag($('.dependList li:eq(0)'));
            queryLogicNodes($('.dependList li:eq(0)').attr('fid'));
        });
    }

    //依赖取消事件
    $('.add3EventTwo .closeA,.add3EventTwo .cancel').unbind('click').click(function () {
        $('.add3EventTwo,.mask').hide();
    });
    //依赖确定事件
    $('.add3EventTwo .sure').unbind('click').click(function () {
        console.log("add3EventTwo sure");
        dependencyList();

        var fid=$('.alertDependList').attr('fid');
        var $alertDependList = $('.alertDependList li');
        var depIds=[];
        for(var i=0; i<$alertDependList.length; i++) {
            if($alertDependList.eq(i).find('i').hasClass('singleChecked')) {
                var refid = $alertDependList.eq(i).attr('refid');
                depIds.push(refid);
            }
        }

        var theId = getFlowRefId(fid);
        //向数据库中插入数据
        $.ajax({
            url: urlId + '/controller/addFlowDependency',
            type: 'POST',
            dataType: "json",
            data: {theId: theId, depIds: depIds.toString()},
            success: function (data) {
                console.log('addFlowDependency');
            },
            error: function () {
                alert("addFlowDependency异常！");
            }
        });

        $('.add3EventTwo,.mask').hide();
    });
    //获取refid(根据依赖组件的信息,获取值)
    function getFlowRefId(fId) {
        return $('.partStream li[id='+fId+']').attr('refid');
    }


    window.interfaceQuery=function (conId, flowId) {
        $.ajax({
            url: urlId + '/controller/queryInterface',
            type: 'POST',
            async: false,
            dataType: "json",
            data: {conId: conId, flowId: flowId},
            success: function (data) {
                var interfaceHtml='';
                var sourceColumHtml='';

                for(var i=0; i<data.length; i++) {
                    var tempData = data[i];
                    var enumValues = tempData.enumValues;
                    for(var i=0; i<enumValues.length; i++) {
                        var interfaceName = enumValues[i].value;
                        interfaceHtml+='<li id='+tempData.id+' sourceData='+tempData.id+'><span class="nameL">'+interfaceName+'</span><span class="nameR">---bunding nodes---</span>' +
                            '<ul class="nodeList nodeListEvent" style="display: none;"></ul><i class="iconDown iconDownEvent"></i></li>';
                    }

                    var columnList = tempData.columnList;
                    for(var i=0; i<columnList.length; i++) {
                        var columName = columnList[i].name;
                        sourceColumHtml+='<li id='+columnList[i].id+' sourceData='+tempData.id+'><span class="nameL iColum">'+columName+'</span><span class="nameR">---node colums---</span>' +
                            '<ul class="nodeList nodeListEvent nodeColums" style="display: none;"></ul><i class="iconDown iconDownEvent"></i></li></li>';
                    }
                }

                //先移除,再添加
                var iNodeListChildren = $('.iNodeList').children();
                if(iNodeListChildren.length>0) {
                    iNodeListChildren.remove();
                }
                $('.iNodeList').append(interfaceHtml);

                var columListChildren = $('.columList').children();
                if(columListChildren.length>0) {
                    columListChildren.remove();
                }
                $('.columList').append(sourceColumHtml);//选中是flowId的标签
                console.log('interface');
            },
            error: function () {
                alert("interface异常！");
            }
        });
    }

    //获取refId用于依赖项的插入
    function getFlowControllerRefId(conId, flowId) {
        var refId;
        $.ajax({
            url: urlId + '/controller/getFlowControllerRefId',
            type: 'POST',
            async: false,
            dataType: "json",
            data: {conId: conId, flowId: flowId},
            success: function (data) {
                refId = data;
            },
            error: function () {
                alert("flowControllerRefId异常！");
            }
        })
        return refId;
    }


    //生成Flow的树结构
    function flowTree() {
        console.log("controller ok");
        // 生成新的组件信息是要先将老的信息删除掉)
        $('.partStream').children().remove();
        conId = $('li.thistab').attr('conId');
        $.ajax({
            url: urlId + '/controller/queryLogicFlow',
            type: 'POST',
            async: false,
            dataType: "json",
            data: {userId: userId, conId: conId},
            success: function (data) {
                var htmlstr = "<p><i class=\"downIcon titleTip\"></i><span>Home</span></p><div>";
                if(data!=null && data.length>0) {
                    for (var i = 0; i < data.length; i++) {
                        var dirLevel = "home";
                        htmlstr = flowLoop(dirLevel, htmlstr, data[i]);
                    }
                    htmlstr += "</div>";
                }
                $(".addRoot01").html(htmlstr);

                //重新绑定事件
                $('.titleTip').on('click',function(e){
                    if ($(this).hasClass('downIcon')) {
                        $(this).removeClass('downIcon').addClass('rightIcon');
                        $(this).parent().next().hide()
                    } else {
                        $(this).removeClass('rightIcon').addClass('downIcon');
                        $(this).parent().next().show()
                    }
                });
            },
            error: function () {
                alert("异常！");
            }
        });

        selectedFlows = getSelected('.addRoot01>div');
        visitedTag($('.partStream li:eq(0)'));
    }
    //根据menuId获取,并设置conId的相关信息
    window.setConIdAttr=function (menuId) {
        $.ajax({
            url: urlId + '/controller/queryConIdByMenuId',
            type: 'POST',
            async: false,
            dataType: "json",
            data: {menuId: menuId},
            success: function (data){
                $('li.thistab').attr('conId', data);
                conId = data;
            },
            error: function () {
                alert("异常！");
            }
        })
    }
    //根据不同的节点,拼接html.  tempData是目录节点或者flow节点
    function flowLoop(dirLevel, htmlstr, tempData) {
        var type = tempData.type;
        var iname = tempData.name;

        //当前结点是目录的操作
        if(type == 1) {
            //更新目录层级
            dirLevel+="/"+iname;

            if(tempData.pid!=0) {
                htmlstr += "<li id='"+tempData.id+"' type="+tempData.type+">";
            }
            htmlstr += "<div class=\"menu1\" name=\""+iname+"\"><p><i class=\"downIcon titleTip\"></i><span>" + iname + "</span></p><ul class=\"menu1List\">\n";
            var childrens = tempData.childrens;
            if(childrens!=null && childrens.length>0) {
                for (var i = 0; i < childrens.length; i++) {
                    htmlstr = flowLoop(dirLevel, htmlstr, childrens[i]);
                }
            }
            htmlstr += "</ul></div>"
            if(tempData.pid!=0) {
                htmlstr += "</li>";
            }

            //当前结点不是目录的操作
        } else {
            htmlstr += "<li menuId='"+tempData.id+"' id="+tempData.flowId+" type="+tempData.type+" name="+tempData.name+"><i class=\"single";
            if(tempData.isSelected!=null && tempData.isSelected==1) {
                htmlstr += " singleChecked";

                //更新目录层级
                dirLevel = dirLevel+"/"+tempData.name

                //添加挖掘组件节点(含flowId和目录层级信息)
                $('.partStream').append('<li id='+tempData.flowId+' refId='+getFlowControllerRefId(conId, tempData.flowId)+' onclick=flowComponentClick(this)><span>'+dirLevel+'</span><i class="closeL"></i></li>');
            }
            htmlstr += "\"></i><span>" + iname + "</span></li>"
        }
        return htmlstr;
    }
    //点击加号显示Flow树结构
    $('.component').off('click').on('click', function () {
        $('.add3EventOne,.mask').show();
    });
    $('.add3EventOne .closeA,.add3EventOne .cancel').unbind('click').click(function () {
        $('.add3EventOne,.mask').hide();
    });
    $('.add3EventOne .sure').unbind('click').click(function () {
        console.log("sure");
        var newSelectedFlows = getSelected('.addRoot01>div');
        //如果选项用户有修改,就进行更新
        if(newSelectedFlows.length!=0 && selectedFlows.toString()!=newSelectedFlows.toString()) {
            $.ajax({
                url: urlId + '/controller/insertFlowControllerRef',
                type: 'POST',
                dataType: "json",
                data: {conId: conId, logIds: newSelectedFlows.toString()},
                success: function () {
                    console.log('insert');
                },
                error: function () {
                    alert("异常！");
                }
            })
        }

        //先删除子元素的节点
        $('.partStream').children().remove();
        //再重新进行添加
        flowTree()
        $('.add3EventOne,.mask').hide();
    });

    //获取已经被选中的flow的信息,并以Array的形式返回
    function getSelected(flag) {
        var oldLogIds = [];
        var children = $(flag).find(".singleChecked");
        for (var i=0; i<children.length; i++) {
            var id = children.eq(i).parent().attr('id');
            oldLogIds.push(id);
        }
        return oldLogIds;
    }

    //获取第一个选中的依赖,并展示节点和列的相关信息
    function queryLogicNodes(flowId) {
        if(!(flowId==null)) {
            $.ajax({
                url: urlId + '/controller/queryLogicNodes',
                type: 'POST',
                async: false,
                dataType: "json",
                data: {flowId: flowId},
                success: function (data) {
                    //拼接node的html
                    var nodeStr='';
                    for(var i=0; i<data.length; i++) {
                        nodeStr+='<li class="nodeClick" id='+data[i].id+'>'+data[i].alias+'</li>';
                    }
                    var $iNodeList = $('.iNodeList>li');
                    for(var i=0; i<$iNodeList.length; i++) {
                        var nodeName = $iNodeList.eq(i).children('span:eq(1)');
                        if(nodeName.text() == '---bunding nodes---') {
                            var ulChild = $iNodeList.eq(i).children('ul');
                            var lis = ulChild.children('li');
                            if(lis.length>0) {
                                lis.remove();
                            }
                            ulChild.append(nodeStr);
                        }
                    }
                    console.log('queryNodes');
                },
                error: function () {
                    alert("queryNodes 异常！");
                }
            })
            nodeClick();
        }
    }
    window.nodeClick = function () {
        //node列表,重新绑定事件
        $('.nodeClick').on('click', function () {
            var sourceDataId = $(this).parent().parent().attr('sourcedata');
            //查找node的colums, 将node的列和接口的列进行绑定
            visitedTag($(this).parent().parent())
            queryNodeFields(sourceDataId);
            console.log('nodeClick');
        });
    }


    //获取第一个选中的依赖,并展示节点和列的相关信息
    function queryNodeFields(sourceDataId) {
        $.ajax({
            url: urlId + '/controller/queryNodeFields',
            type: 'POST',
            async: false,
            dataType: "json",
            data: {sourceDataId: sourceDataId},
            success: function (data) {
                //拼接colum的html
                var columStr='';
                for(var i=0; i<data.length; i++) {
                    columStr+='<li id='+data[i].id+'>'+data[i].name+'</li>';
                }
                var nodeColumsChildren = $('.nodeColums').children();
                if(nodeColumsChildren.length>0) {
                    nodeColumsChildren.remove();
                }
                $('.nodeColums').append(columStr);
                console.log('queryNodeFields');
            },
            error: function () {
                alert("queryNodes 异常！");
            }
        })
    }


     $('.add3Stream').unbind('click').click(function () {
         console.log('add3');
         $('.add3EventOne,.mask').show();
     });
     $('.add3Provide').unbind('click').click(function () {
         console.log('add3');
         $('.add3EventTwo,.mask').show();

     //TODO
     });

    //test测试按钮
    $('.streamTest').unbind().click(function(){
        console.log('test....');
        //TODO
    });

    //保存按钮
    $('.saveEvent').unbind().click(function(){
        console.log('save controller ref');
        var result = {};

        var dependSelect = $('.dependList').find('li.conVisitedBg');
        var refid = dependSelect.attr('refid');
        result.refid = refid;

        var iNodedependSelect = $('.iNodeList').find('li.conVisitedBg');
        var interfaceId = iNodedependSelect.attr('sourcedata');
        result.interfaceId = interfaceId;
        var exportColumnId = iNodedependSelect.find('span.nameR').attr('id');
        result.exportId = exportId;

        var columItems = $('.columList').children('li');
        var colums = [];
        for(var i=0; i<columItems.length; i++) {
            var tempObj = {};
            var columItem = columItems.eq(0);
            var interfaceColumnId = columItem.attr('id');
            tempObj.interfaceColumnId=interfaceColumnId
            var exportId =columItem.find('.nameR').attr('id');
            tempObj.exportColumnId=exportColumnId;
            colums.push(tempObj);
        }
        result.columns = colums;

        //refid: refid, interfaceId: interfaceId, exportColumnId: exportColumnId, colums: colums
        //数据存储
        $.ajax({
            url: urlId + '/controller/insertExportRef',
            type: 'POST',
            dataType: "json",
            data: {exportRefInfo: JSON.stringify(result)},
            success: function (data) {
                console.log('insertExportRef');
            },
            error: function () {
                alert("insertExportRef 异常！");
            }
        });
    });



//************************ controller release start here ******************************

    window.getJobPlanIds=function (conId) {
        $.ajax({
            url: urlId + '/release/queryReplica',
            type: 'POST',
            async: false,
            dataType: "json",
            data: {conId: 108},//conId
            success: function (data) {
                optionHtml = '<option value="none">None</option>';
                for(var i=0; i<data.length; i++) {
                    var jobPlan = data[i];
                    optionHtml += '<option value="'+jobPlan.id+'">'+jobPlan.id+'</option>';
                }
                $('.jobPlan>li:eq(0)>select').html(optionHtml);
            },
            error: function () {
                alert("queryReplica 异常！");
            }
        });
    }

    //Controller发布初始化. 含发布信息查询和通知信息查询
    window.initReplica=function (selected) {
        // conId = $('li.thistab').attr('conId');

        var imagerId = selected.options[selected.selectedIndex].value;
        //如果选中的标签是none, 将发布的所有信息和通知的信息置null
        if(imagerId == 'none') {
            var classArr=['.jobPlan', '.dispatchPart', '.webservicePart', '.noticePerson', '.noticeEvent'];
            for(var i=0; i<classArr.length; i++) {
                var iClass = classArr[i];
                var $liItem = $(iClass+ ' li');
                if($liItem.find('input').length>0){
                    $liItem.find('input').val('');
                }
                if($liItem.find('i.singleChecked').length>0) {
                    $liItem.find('i').removeClass('singleChecked');
                }
            }
            $('.whiteContainer ul').children().remove();
            $('.blockContainer ul').children().remove();

        } else {
            $.ajax({
                url: urlId + '/release/queryReplicaInfo',
                type: 'POST',
                dataType: "json",
                data: {conId: 108, imagerId: imagerId},//{conId: conId, imagerId: imagerId}
                success: function (data) {
                    data = JSON.parse(data);
                    var jobPlan = data.jobPlan;
                    //选中镜像ID
                    $('.jobPlan>li:eq(0)>select option[value='+jobPlan.imagerId+']').attr("selected","selected");
                    //jobPlan的ID号
                    $('.deploy').attr('jobPlanId', jobPlan.id);
                    //镜像的名称
                    var controller = data.controller;
                    var $jobPlanLi = $('.jobPlan>li:eq(1)>input').val(controller.name);

                    var $part;
                    if(jobPlan.isWebservice) {
                        //发布类型
                        $('.jobPlan>li:eq(2)>select option[value=webservice]').attr("selected","selected");
                        changDeployType();

                        $part = $('.webservicePart>li');
                        //接口代码
                        $part.eq(0).find('input').val(jobPlan.webServiceCode);
                        //Token
                        $part.eq(1).find('input').val(jobPlan.token);

                        //黑白名单信息设置
                        var blackLists = data.blackLists;
                        var blackHtml = '<li class="ipTitle"><span>起始IP</span><span>终止IP</span></li>';
                        var whiteHtml = '<li class="ipTitle"><span>起始IP</span><span>终止IP</span></li>';
                        for(var i=0; i<blackLists.length; i++) {
                            var blackItems = blackLists[i].blackItems;
                            var isBlack = blackLists[i].isBlack;
                            for(var j=0; j<blackItems.length; j++) {
                                var blackItem = blackItems[j];
                                if(isBlack) {
                                    blackHtml += '<li><span contenteditable="true">'+blackItem.beginIp+'</span>' +
                                        '<span contenteditable="true">'+blackItem.endIp+'</span><i class="closeL"></i></li>'
                                } else {
                                    whiteHtml += '<li><span contenteditable="true">'+blackItem.beginIp+'</span>' +
                                        '<span contenteditable="true">'+blackItem.endIp+'</span><i class="closeL"></i></li>'
                                }
                            }
                        }
                        $('.whiteContainer ul').children().remove();
                        $('.whiteContainer ul').html(whiteHtml);
                        $('.blockContainer ul').children().remove();
                        $('.blockContainer ul').html(blackHtml);

                    } else {
                        //发布类型
                        $('.jobPlan>li:eq(2)>select option[value=dispatch]').attr("selected","selected");
                        changDeployType();

                        $part = $('.dispatchPart>li');
                    }
                    //时间控件

                    //是否允许多线程
                    if(jobPlan.isRepeat) {
                        $part.parent().find('.isRepeat i').addClass('singleChecked');
                    }
                    //当前状态
                    if(jobPlan.isRun==1) {
                        $part.parent().find('.deployState i').html('发布');
                    }

                    //通知人内容信息设置
                    var noticePerson = data.notice.noticePerson;
                    var $notice = $('.noticePerson li');
                    $notice.eq(0).find('select option[value=email]').attr("selected","selected");
                    $notice.eq(1).find('input').val(noticePerson.email);
                    if(noticePerson.isDefaultSendEMail) {
                        $notice.eq(2).find('i').addClass('singleChecked');
                    }
                    $notice.eq(3).find('input').val(noticePerson.sendEMail);
                    $notice.eq(4).find('input').val(noticePerson.sendEMailPassword);
                    $notice.eq(5).find('input').val(noticePerson.sendEMailImapServerIp);
                    $notice.eq(6).find('input').val(noticePerson.sendEMailPort);

                    //通知事件消息内容信息设置
                    var noticeEvent = data.notice;
                    var $notice = $('.noticeEvent li');
                    var eventHtml='';
                    var types = noticeEvent.noticeContentTypes;
                    for(var i=0; i<types.length; i++) {
                        var noticeContentType = types[i];
                        eventHtml+='<li code='+noticeContentType.code+' typeId='+noticeContentType.id+'><i class="single';
                        if(noticeEvent.selectedCodes.contains(noticeContentType.code)){
                            eventHtml+=' singleChecked';
                        }
                        eventHtml+='"></i><span>'+noticeContentType.name+'</span></li>';
                    }
                    $('.noticeEvent').html(eventHtml);
                },
                error: function () {
                    alert("dispatchPart 异常！");
                }
            });
        }
    }

    //插入副本相关的信息     注意:"runUser":"gjc" 暂时没有设置
    function insertReplicaInfo() {
        var dict = {};

        //镜像的名称
        var replicaName = $('.jobPlan>li:eq(1)>input').val();

        //controllerId
        // dict.controllerId=conId;
        //imagerId

        var $part;
        if($('.jobPlan>li:eq(2)>select option:selected').val()=='webservice') {
            dict.isWebservice=1;

            $part = $('.webservicePart>li');
            //接口代码
            dict.webServiceCode=$part.eq(0).find('input').val();
            //Token
            dict.token=$part.eq(1).find('input').val();

            //白名单
            var blackList=[];
            var $ipContainerA = $('.ipContainerA li');
            for (var i=0; i<$ipContainerA.length; i++) {
                var tempBlack = new Dictionary;
                tempBlack.put('isBlack', 1);
                var blackItems=[];
                var tempIp = new Dictionary();
                var findSpan = $ipContainerA.eq(i).find('span');
                tempIp.put('beginIp', findSpan.eq(0).text());
                tempIp.put('endIp', findSpan.eq(1).text());
                blackItems.push(tempIp);
                blackList.push(blackItems);
            }
            //黑名单
            var $ipContainerB = $('.ipContainerB li');
            for (var i=0; i<$ipContainerB.length; i++) {
                var tempBlack = {};
                tempBlack.isBlack=1;
                var blackItems=[];
                var tempIp = {};
                var findSpan = $ipContainerA.eq(i).find('span');
                tempIp.beginIp=findSpan.eq(0).text();
                tempIp.endIp=findSpan.eq(1).text();
                blackItems.push(tempIp);
            }
            blackList.push(blackItems);

        } else {
            $part = $('.dispatchPart>li');
            //发布类型
            dict.isWebservice=0;
            //时间控件
            dictcron='***********';
        }

        //是否允许多线程
        if($part.parent().find('.isRepeat i').hasClass('singleChecked')) {
            dict.isRepeat=1;
        } else {
            dict.isRepeat=0;
        }
        //当前状态
        dict.isRun=0;

        $.ajax({
            url: urlId + '/release/insertReplica',
            type: 'POST',
            async: false,
            dataType: "json",
            data: {jsonStr: JSON.stringify(dict)},
            success: function (data) {
                //设置jobPlan的ID号
                $('.deploy').attr('jobPlanId', data);
                //在选项中添加此副本项, 并设置为默认选中项
                $('.jobPlan>li:eq(0)>select option:eq(0)').append('<option value="'+jobPlan.id+'" selected="selected">'+jobPlan.id+'</option>');
            },
            error: function () {
                alert("queryReplica 异常！");
            }
        });
    }
    //创建副本信息
    $('.createReplica').unbind().click(function(){
        insertReplicaInfo();
    });

    //获取job任务执行相关信息
    window.getJobInfo=function () {
        var jobPlanId=$('.deploy').attr('jobPlanId');
        var imagerId = $('.jobPlan>li:eq(0)>select').children('option:selected').val();
        $.ajax({
            url: urlId + '/release/queryJob',
            type: 'POST',
            dataType: "json",
            data: {jobPlanId: jobPlanId, imagerId: imagerId},
            success: function (data) {
                var jobHtml='<tr class="contentTitle"><th>Job ID</th><th>统计情况</th><th>状态</th><th>日志</th><th>开始时间</th><th>结束时间</th><th>操作</th></tr>';
                for(var i=0; i< data.length; i++) {
                    var job = data[i];
                    jobHtml+='<tr><td>'+job.id+'</td>';
                    jobHtml+='<td>xxxxx</td>';
                    jobHtml+='<td>'+job.status+'</td>';
                    jobHtml+='<td>xxxxx</td>';
                    jobHtml+='<td>'+job.startTime+'</td>';
                    jobHtml+='<td>'+job.endTime+'</td>';
                    jobHtml+='<td><span class="killBtn">Kill</span></td></tr>';
                }
                $('.jobTable').html(jobHtml);

                //重新绑定事件杀死job任务
                $('.jobList .killBtn').unbind().click(function(){
                    console.log('kill~~~~~');
                    var planId=jobPlanId;
                    var id=$(this).parent().parent().children('td:eq(0)').text()
                    $.ajax({
                        url: urlId + '/release/killJob',
                        type: 'POST',
                        dataType: "json",
                        data: {planId: planId, id: id},
                        success: function (data) {
                            console.log("kill job.");
                        },
                        error: function () {
                            alert("queryReplica 异常！");
                        }
                    })
                });
            },
            error: function () {
                alert("queryReplica 异常！");
            }
        });
    }

    //Job List 取消按钮, 关闭按钮
    $('.jobList .closeA, .jobList .closeC').unbind().click(function(){
        $('.jobList,.mask').hide();
    });


    //controllDeployEvent start
    $('.controllDeployEvent').unbind('click').click(function (e) {
        e = e || window.event;
        var tar = e.target || e.srcElement;
        //单选框
        if (tar.tagName.toLowerCase() === 'i' && $(tar).hasClass('single')) {
            if ($(tar).hasClass('singleChecked')) {
                $(tar).removeClass('singleChecked');
                if (tar.tagName.toLowerCase() === 'i' && $(tar).parent().hasClass('defaultMail')) {
                    $('.hidePart').show();
                }
            } else {
                $(tar).addClass('singleChecked');
                if (tar.tagName.toLowerCase() === 'i' && $(tar).parent().hasClass('defaultMail')) {
                    $('.hidePart').hide();
                }
            }
        }

        //发布类型改变是触发的事件
        $('#deployType').change(function() {
            changDeployType();
        });



        //warningBtn controller resource has changed
        if (tar.tagName.toLowerCase() === 'i' && $(tar).hasClass('warningBtn')) {
            console.log('warningBtn~~~~');
            $('.warningPart,.mask').show();
        }

        //white list  black list
        if (tar.tagName.toLowerCase() === 'p' && $(tar).hasClass('ipList')) {
            $(tar).siblings().removeClass('ipListed');
            $(tar).addClass('ipListed');
            if($(tar).attr('class').indexOf('whiteIp')>0){
                $('.blockContainer').hide();
                $('.whiteContainer').show();
            }else if($(tar).attr('class').indexOf('blackIp')>0){
                $('.blockContainer').show();
                $('.whiteContainer').hide();
            }
        }


        addList();
        //增加参数列表的每一列
        function addList() {
            $('.whiteContainer .plusBtn').unbind('click').click(function () {
                var new_obj = $("<li><span contenteditable='true'></span> <span contenteditable='true'></span><i class='closeL'></i></li></li>");
                $('.ipContainerA').append(new_obj);
                //参数列表的列
                delList();
            });
            $('.blockContainer .plusBtn').unbind('click').click(function () {
                var new_obj = $("<li><span contenteditable='true'></span> <span contenteditable='true'></span><i class='closeL'></i></li></li>");
                $('.ipContainerB').append(new_obj);
                //参数列表的列
                delList();
            });
        }
        delList();
        //删除参数列表的每一列
        function delList() {
            $('.whiteContainer .closeL').unbind('click').click(function () {
                $(this).parent().remove();
            });
            $('.blockContainer .closeL').unbind('click').click(function () {
                $(this).parent().remove();
            })
        }

        //JoB List
        if (tar.tagName.toLowerCase() === 'p' && $(tar).hasClass('jobReplica')) {
            console.log('jobBtn~~~~');
            getJobInfo();
            $('.jobList,.mask').show();
        }

        //deploy job
        if (tar.tagName.toLowerCase() === 'p' && $(tar).hasClass('deployReplica')) {
            console.log('jobBtn~~~~');
            deployReplica();
        }

        //deployRight 通知人,通知事件相关信息保存
        if (tar.tagName.toLowerCase() === 'span' && $(tar).hasClass('sureBtnEvent')) {
            console.log('sureBtnEvent');
            var noticeInfo={};
            var jobPlanId = $('.deploy').attr('jobPlanId');
            noticeInfo.jobPlanId=jobPlanId;

            var $notice = $('.noticePerson li');
            var notice={};
            notice.jobPlanId=jobPlanId
            // 邮件
            var isEmail = $notice.eq(0).find('select option:selected').val();
            if(isEmail == 'email') {
                notice.transmitMode = 1;
            } else {
                notice.transmitMode = 2;
            }
            //收件人
            notice.email=$notice.eq(1).find('input').val()
            //默认邮箱
            if($notice.eq(2).children('i').hasClass('singleChecked')) {
                notice.isDefaultSendEMail=1;
                //查询系统默认邮箱地址
                $.ajax({
                    url: urlId + '/release/querySystemEmail',
                    type: 'POST',
                    async: false,
                    dataType: "json",
                    data: {},
                    success: function (data) {
                        console.info('querySystemEmail.');
                        //发件地址
                        notice.sendEMail=data.sendEMail;
                        //密码
                        notice.sendEMailPassword=data.sendEMailPassword;
                        //发件服务器
                        notice.sendEMailImapServerIp=data.sendEMailImapServerIp;
                        //发件端口号
                        notice.sendEMailPort=data.sendEMailPort;
                        noticeInfo.notice=notice;
                    },
                    error: function () {
                        alert("querySystemEmail 异常！");
                    }
                });
            } else {
                notice.isDefaultSendEMail=0;
                //发件地址
                notice.sendEMail=$notice.eq(3).find('input').val()
                //密码
                notice.sendEMailPassword=$notice.eq(4).find('input').val()
                //发件服务器
                notice.sendEMailImapServerIp=$notice.eq(5).find('input').val()
                //发件端口号
                notice.sendEMailPort=$notice.eq(6).find('input').val()
                noticeInfo.notice=notice;
            }

            //通知事件
            var $noticeEvent = $('.noticeEvent li');
            var noticeContent = [];
            for (var i=0; i<$noticeEvent.length; i++) {
                var eventItem={};
                if($noticeEvent.eq(i).find('i').hasClass('singleChecked')) {
                    eventItem.jobPlanId=jobPlanId;
                    eventItem.code=$noticeEvent.eq(i).attr('code');
                    eventItem.noticeContentType=$noticeEvent.eq(i).attr('typeid');
                    noticeContent.push(eventItem);
                }
            }
            noticeInfo.noticeContent=noticeContent;

            //{"jobPlanId":29,"notice":{"id":1,"jobPlanId":1,"transmitMode":1,"phone":15001175999,"email":"674581874@qq.com;guojichang111@163.com","isDefaultSendEMail":1,"sendEMail":"349463119@qq.com","sendEMailPort":465,"sendEMailPassword":674581874,"sendEMailImapServerIp":"smtp.qq.com"},"noticeContent":[{"code":"2","jobPlanId":29,"noticeContentType":2},{"code":"3","jobPlanId":29,"noticeContentType":3}]}

            $.ajax({
                url: urlId + '/release/insertNoticeInfo',
                type: 'POST',
                async: false,
                dataType: "json",
                data: {noticeInfo: JSON.stringify(noticeInfo)},
                success: function () {
                    console.info('insertNotice.');
                },
                error: function () {
                    alert("insertNotice 异常！");
                }
            });
        }


    });

    //发布类型 change事件
    function changDeployType() {
        var p1=$('#deployType').children('option:selected').val();
        if(p1=='webservice'){
            $('.webservicePart').show();
            $('.dispatchPart').hide();
            //TODO
        }else if(p1=='dispatch'){
            $('.webservicePart').hide();
            $('.dispatchPart').show();
            //TODO
        }
    }

    //任务布署
    function deployReplica() {
        var jobParams={};
        jobParams.controllerId=conId;
        jobParams.imagerSourceId='';
        jobParams.planId='';
        $.ajax({
            url: urlId + '/release/deployJob',
            type: 'POST',
            dataType: "json",
            data: {jobStr: JSON.stringify(jobParams)},
            success: function (data) {
                console.log("deploy job.");



            },
            error: function () {
                alert("queryReplica 异常！");
            }
        })
    }

    //controll DeployEvent end



//************************ 暂时不用的内容 ***********************************
    //挖掘数据算法目录展示
    function streamOn() {
        var children = $(".addRoot01>div").children();
        var array = [];
        for (var i=0; i<children.length; i++) {
            var dirLevel = "home";
            nodeLoop(array, dirLevel, children.eq(i));
        }

        //获取原来已经被选中的数据信息
        selectedFlows = getSelected('.addRoot01>div');

        //拼接前台代码
        var htmlStr = "<ul class=\"part\">";
        for (var i=0; i<array.length; i++) {
            htmlStr += "<li>"+array[i]+"</li><i class=\"closeL\"></i>";
        }
        htmlStr += "</ul><p class=\"streamTest\">Test</p>"
        $('.stream-con').html(htmlStr);
    }
    //迭代获取目录层级
    function nodeLoop(array, dirLevel, node) {
        //先判断当前结点是否是菜单结点,如果是记录菜单路径,查看子元素信息
        if(node.attr("class") == 'menu1') {
            dirLevel += node.attr("name")+"/";
            var children = node.children("ul").eq(0).children("li");
            for(var i=0; i<children.length; i++) {
                nodeLoop(array, dirLevel, children.eq(i));
            }
            return;
        }

        //如果能到这里说明不是一个目录.
        //判断当前元素是否是li标签, 就拼接name标签,放入array中进行展示
        if(node.get(0).tagName == "LI") {
            //判断类型是否是3或者4
            var type = node.attr("type");
            if(type==3 || type==4) {
                //判断是否是选中状态
                if(new RegExp('singleChecked').test(node.children("i").attr("class"))) {
                    array.push(dirLevel+=node.attr('name'));
                }
            } else if(type==1) {
                nodeLoop(array, dirLevel, node.eq(0).children(0));
            }
        }
    }


});
