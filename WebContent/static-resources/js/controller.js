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
    Array.prototype.indexOf = function(val) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == val) return i;
        }
        return -1;
    };
    Array.prototype.remove = function(val) {
        var index = this.indexOf(val);
        if (index > -1) {
            this.splice(index, 1);
        }
    };

    /**
     * 对时间戳进行格式化
     * @param strTime
     * @returns {string}
     * @constructor
     */
    function timeStamp2String(time){
        var datetime = new Date();
        datetime.setTime(time);
        var year = datetime.getFullYear();
        var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
        var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
        var hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();
        var minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
        var second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
        return year + "-" + month + "-" + date+" "+hour+":"+minute+":"+second;
    }


//******************************** controller start here ********************************************
    var bOk=true;
    var controllerTimer;
    var controllerSave = [];

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
        if (tar.tagName.toLowerCase() === 'li' && $(tar).parent().hasClass('nodeItems')) {
            //设置点击的下拉框的内容
            var prev = $(tar).parent().prev();
            prev.html($(tar).html());
            //设置标签id
            prev.attr('logicnodeid', $(tar).attr('logicnodeid'));
        }
        if (tar.tagName.toLowerCase() === 'li' && $(tar).parent().hasClass('nodeColums')) {
            //设置点击的下拉框的内容
            var prev = $(tar).parent().prev();
            prev.html($(tar).html());
            //设置标签id
            prev.attr('columnid', $(tar).attr('columnid'));
        }
        //测试controller点击事件
        if (tar.tagName.toLowerCase() === 'p' && $(tar).hasClass('streamTest')) {
            runJob(conId);
            console.log('run controller test');
        }
    });
    //执行任务
    function runJob(conId) {
        $.ajax({
            url: urlId + '/controller/testFlows',
            type:'POST',
            dataType:"json",
            data:{conId: conId},
            success:function(data) {
                var uuid = data.uuid;
                controllerTimer = window.setInterval(function(){
                    printLog(uuid);
                },1000);
                $.dialog("发送成功！");
            },
            error : function() {
                $.dialog("异常！");
            }
        });
    }


    //打印引擎运行后的日志信息
    function printLog(uuid) {
        $.ajax({
            url: urlId + '/getLogByUuid',
            type:'POST',
            dataType:"json",
            data:{uuid:uuid},
            success:function(data) {
                if(data.length>0){
                    var itemStr="";
                    $.each(data,function(index,item){
                        itemStr+='<li>'+item+'</li>';
                    });
                    $('.content2 ul.diary').html('');
                    $('.content2 ul.diary').append(itemStr);
                    var lastJson = JSON.parse(data[length-1]);
                    if(lastJson.result_code==999){
                        window.clearInterval(log_timer);
                    }
                }else{
                    window.clearInterval(controllerTimer);
                }
            },
            error : function() {
                window.clearInterval(controllerTimer);
                $.dialog("异常！");
            }
        })
    }


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
    window.initController=function (node) {
        //如果node没有数值的话,默认选中第一项
        if(node==undefined || node.length==0) {
            node = $('.partStream li').eq(0);
        }
        //挖掘组件信息在树的信息得到后,从树迭代中获取
        flowTree();

        controllerSave = getControllerData();

        //选中一个挖掘组件
        flowComponentClick(node);
    }


    //获取初始化的信息, 用于用户修改后, 提示用户保存
    var controllerInfo = {};
    function bundingData(isCompare) {
        var nativeInfo={};
        //初始化的依赖信息
        var depends = [];
        var $dependList = $('.dependList li');
        for(var i=0; i<$dependList.length; i++) {
            depends.push($dependList.eq(i).attr('fid'));
        }
        nativeInfo.depends = depends;

        //初始化的接口绑定信息
        var iNodes = [];
        var $iNodeList = $('.iNodeList li');
        for(var i=0; i<$iNodeList.length; i++) {
            var nodeRef = {};
            nodeRef.sourcedata = $iNodeList.eq(i).attr('sourcedata');
            nodeRef.logicnodeid = $iNodeList.find('span.nameR').attr('logicnodeid');
            iNodes.push(nodeRef);
        }
        nativeInfo.iNodes = iNodes;

        //初始化的节点列绑定信息
        var colums = [];
        var $colums = $('.columList li');
        for(var i=0; i<$colums.length; i++) {
            var columRef = {};
            columRef.sourcecolumnid = $colums.eq(i).attr('sourcecolumnid');
            columRef.columnid = $colums.find('span.nameR').attr('columnid');
            colums.push(columRef);
        }
        nativeInfo.colums = colums;
        if(isCompare == undefined) {
            controllerInfo = nativeInfo;
        }
        return nativeInfo;
    }

    //检查Controller中相关数据是否发生了改变
    window.isChange = function () {
        var changeData = bundingData(true);
        if(JSON.stringify(controllerInfo) == JSON.stringify(changeData)) {
            return false;
        }
        return true;
    }

    //点击流事件
    window.flowComponentClick=function (flowNode) {
        //若有选中的流组件标签加入到要保存的项
        pushControllerInfo();

        //先移除,再添加
        $('.dependList').children().remove();
        $('.alertDependList').children().remove();
        $('.iNodeList').children().remove();
        $('.columList').children().remove();

        //选中依赖项一个标签
        var flowId=flowNode.id;
        if(flowId==undefined) {
            flowId=flowNode.attr('id');
        }
        visitedTag($(flowNode));
        if(flowId!=undefined) {
            //选中第一个依赖组件
            initDependency(flowId);
            dependencyList();
            interfaceQuery(flowId);
            var $dependList = $('.dependList li:eq(0)');
            if($dependList.length>0) {
                visitedTag($dependList);
                queryLogicNodes($dependList.attr('fid'));
            }
        }
        bundingData();
    }

    //初始化依赖的Flow信息, flowId表示查的是哪个flow的依赖, flowIds流组件中的flowIds
    function initDependency(flowId) {
        //流组件所有的ID
        var flowIds = getFlowIds();
        var htmlStr = '';
        //获取flow的依赖信息
        var data = getFlowData(flowId);
        var depList;
        if(data!=undefined && (depList=data.dependenedInfoList)!=undefined && depList.length>0) {
            for(var i=0; i<depList.length; i++) {
                var array = depList[i];
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
        }
    }
    function getFlowIds() {
        //流组件所有的ID
        var $partStream = $('.partStream li');
        var flowIds = [];
        for(var i=0; i<$partStream.length; i++) {
            flowIds.push($partStream.eq(i).attr('id'));
        }
        return flowIds;
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
        $('.dependList .closeL').unbind('click').click(function (e) {
            e = e || window.event;
            e.stopPropagation?e.stopPropagation(): e.cancelBubble = true;

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
        });
    }
    //当依赖组件改变(增加/删除)时,依赖信息也要做相应的改变
    function updateDependency() {
        var flowIds = getFlowIds();
        for(var i=0; i<flowIds.length; i++) {
            var flowId = flowIds[i];
            $.ajax({
                url: urlId + '/controller/queryFlowDependency',
                type: 'POST',
                async: false,
                dataType: "json",
                data: {conId: conId, flowId: flowId, flowIds: flowIds.toString()},
                success: function (data){
                    for(var i=0; i<controllerSave.length; i++) {
                        var tempSave = controllerSave[i];
                        if(tempSave.flowId == flowId) {
                            tempSave.dependenedInfoList=data;
                            break;
                        }
                    }
                }
            })
        }
    }

    //依赖取消事件
    $('.add3EventTwo .closeA,.add3EventTwo .cancel').unbind('click').click(function () {
        $('.add3EventTwo,.mask').hide();
    });
    //依赖确定事件
    $('.add3EventTwo .sure').unbind('click').click(function () {
        console.log("add3EventTwo sure");
        var flowId = $('.partStream li.conVisitedBg').attr('id')

        //++++++++++ 保存依赖关系 ++++++++++++
        var dependenedInfoList=[];
        var $dependList = $('.alertDependList li');
        for(var i=0; i<$dependList.length; i++) {
            var tempDepend = {};
            tempDepend.flowId=$dependList.eq(i).attr('fid');
            if($dependList.eq(i).find('i').hasClass('singleChecked')) {
                tempDepend.isSelect=1;
            } else {
                tempDepend.isSelect=0;
            }
            dependenedInfoList.push(tempDepend);
        }

        //保存依赖
        $.ajax({
            url: urlId + '/controller/insertDependency',
            type: 'POST',
            async: false,
            dataType: "json",
            data: {conId: conId, flowId: flowId, dependenedInfoList: JSON.stringify(dependenedInfoList)},
            success: function (data) {
                console.log('insertDependency');
            },
            error: function () {
                alert("insertDependency异常！");
            }
        })

        dependencyList();
        //选中第一个依赖组件
        var $dependList = $('.dependList li:eq(0)');
        if($dependList.length>0) {
            visitedTag($dependList);
            queryLogicNodes($dependList.attr('fid'));
        }
        $('.add3EventTwo,.mask').hide();
    });
    //获取refid(根据依赖组件的信息,获取值)
    function getFlowRefId(fId) {
        return $('.partStream li[id='+fId+']').attr('refid');
    }

    window.interfaceQuery=function (flowId) {
        var flowData = getFlowData(flowId);
        if(flowData != undefined) {
            var parse = flowData.interfaceInfoList;
            var interfaceHtml='';
            var sourceColumHtml='';

            for(var i=0; i< parse.length; i++) {
                var interfaceItem = parse[i];
                interfaceHtml+='<li sourceData='+interfaceItem.sourceDataId+'><span class="nameL">'+interfaceItem.sourceDataName+'</span><span logicNodeId='+interfaceItem.logicNodeId+' fid='+interfaceItem.flowId+' class="nameR">';
                if(interfaceItem.logicNodeName=='') {
                    interfaceHtml+='---bunding nodes---';
                } else {
                    var text = $('.dependList li[fid='+interfaceItem.flowId+']').text();
                    var split = text.split('/');
                    interfaceHtml+=split[split.length-1]+'.'+interfaceItem.logicNodeName;
                }
                interfaceHtml+='</span><ul class="nodeList nodeListEvent nodeItems" style="display: none;"></ul><i class="iconDown iconDownEvent"></i></li>';

                var exportInterfaceColumnList = interfaceItem.exportInterfaceColumnList;
                if(exportInterfaceColumnList!=undefined) {
                    for(var k=0; k<exportInterfaceColumnList.length; k++) {
                        var columnItem = exportInterfaceColumnList[k];
                        sourceColumHtml+='<li sourceColumnId='+columnItem.sourceColumnId+'><span class="nameL iColum">'+columnItem.sourceColumnName+'</span><span columnId='+columnItem.columnId+' class="nameR">';
                        if(columnItem.columnName=='') {
                            sourceColumHtml+='---node colums---'
                        } else {
                            sourceColumHtml+=interfaceItem.logicNodeName+'.'+columnItem.columnName;
                        }
                        sourceColumHtml+='</span><ul class="nodeList nodeListEvent nodeColums" style="display: none;"></ul><i class="iconDown iconDownEvent"></i></li></li>';
                    }
                }
            }

            $('.iNodeList').append(interfaceHtml);
            $('.columList').append(sourceColumHtml);//选中是flowId的标签
        }
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

        //删除数据挖掘组件事件绑定
        $('.partStream .closeL').unbind('click').click(function (e) {
            e = e || window.event;
            e.stopPropagation?e.stopPropagation(): e.cancelBubble = true;

            //从列表中移除
            var parent = $(this).parent();
            var previous = parent.prev();
            var next = parent.next();
            var seleEle;
            if(previous.length==0 && next.length!=0) {
                seleEle = next;
            } else if(previous.length!=0 && next.length==0){
                seleEle = previous;
            }
            var refid = parent.attr('refid');
            var id = parent.attr('id');
            parent.remove();
            //将勾选项取消
            var $addRoot01Lis = $('.addRoot01 li');
            for(var i=0; i<$addRoot01Lis.length; i++) {
                var node = $addRoot01Lis.eq(i);
                if(id == node.attr('id')) {
                    node.find('i').removeClass('singleChecked');
                    break;
                }
            }
            //从要保存的全局信息中移除
            for(var i=0; i<controllerSave.length; i++) {
                var tempSave = controllerSave[i];
                if(tempSave.flowId == id) {
                    controllerSave.splice(i, 1)
                    break;
                }
            }
            //更新依赖信息
            updateDependency();
            //设置全局变量:被选中的项
            selectedFlows = getSelected('.addRoot01>div');
            //如果没有元素设置内容为空
            if(seleEle==undefined) {
                $('.iNodeList').html('');
                $('.columList').html('');
            } else {
                //选中邻近一个选项
                flowComponentClick(seleEle);
            }
            //从数据库中删除
            $.ajax({
                url: urlId + '/controller/deleteFlowControllerRef',
                type: 'POST',
                async: false,
                dataType: "json",
                data: {refId: refid, conId: conId, flows: selectedFlows.toString()},
                success: function (data){
                    console.log('delete dependency!');
                }
            })

        });
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
            //删除以前已经被选中的项
            for(var i=0; i<newSelectedFlows.length; i++) {
                var tempFlow = newSelectedFlows[i];
                for(var j=0; j<selectedFlows.length; j++) {
                    if(selectedFlows[j]==tempFlow) {
                        newSelectedFlows.splice(i,1);
                        i--;
                        break;
                    }
                }
            }

            $.ajax({
                url: urlId + '/controller/insertFlowControllerRef',
                type: 'POST',
                async: false,
                dataType: "json",
                data: {conId: conId, logIds: newSelectedFlows.toString()},
                success: function () {
                    console.log('insert');
                    //只有插入数据库成功重新进行展示
                    //先删除子元素的节点
                    $('.partStream').children().remove();
                    //再重新进行添加
                    flowTree()
                    //controllerSave重新赋值
                    controllerSave = getControllerData();
                },
                error: function () {
                    alert("insertFlowControllerRef异常");
                }
            })
            //更新依赖信息
            updateDependency();
        }

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
            var data = getFlowData(flowId);

            var nodeList = data.logicNodeInfoList;
            if(nodeList!=undefined) {
                var nodeStr='';
                for(var i=0; i<nodeList.length; i++) {
                    //得到是哪个flow的名字
                    var text = $('.dependList li[fid='+flowId+']').text();
                    var split = text.split('/');
                    nodeStr+='<li class="nodeClick" logicnodeid='+nodeList[i].id+'>'+split[split.length-1]+'.'+nodeList[i].alias+'</li>';
                }
                var $iNodeList = $('.iNodeList>li');
                for(var i=0; i<$iNodeList.length; i++) {
                    var nodeName = $iNodeList.eq(i).children('span:eq(1)');
                    var ulChild = $iNodeList.eq(i).children('ul');
                    var lis = ulChild.children('li');
                    if(lis.length>0) {
                        lis.remove();
                    }
                    ulChild.append(nodeStr);
                }
            }

            nodeClick(flowId);
        }
    }
    window.nodeClick = function (flowId) {
        //node列表,重新绑定事件
        $('.nodeClick').on('click', function () {
            var sourceDataId = $(this).parent().parent().attr('sourcedata');
            $(this).parent().prev().attr('fid', flowId);
            //查找node的colums, 将node的列和接口的列进行绑定
            visitedTag($(this).parent().parent())
            queryNodeFields(flowId, $(this));
            console.log('nodeClick');
        });
    }

    //获取第一个选中的依赖,并展示节点和列的相关信息
    function queryNodeFields(flowId, node) {
        var nodeId = node.attr('logicnodeid');
        var text = node.text();
        text = text.split('.')[1];

        var data = getNodeData(flowId, nodeId);
        //拼接colum的html
        var columStr='';
        for(var i=0; i<data.length; i++) {
            if(text == '---bunding nodes---') {
                text = 'null';
            }
            columStr+='<li columnid='+data[i].id+'>'+text+'.'+data[i].name+'</li>';
        }
        var nodeColumsChildren = $('.nodeColums').children();
        if(nodeColumsChildren.length>0) {
            nodeColumsChildren.remove();
        }
        $('.nodeColums').append(columStr);
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

    //保存按钮
    $('.saveEvent').unbind().click(function(){
        pushControllerInfo();
        //refid: refid, interfaceId: interfaceId, exportColumnId: exportColumnId, colums: colums
        //数据存储
        $.ajax({
            url: urlId + '/controller/insertControllerInfo',
            type: 'POST',
            dataType: "json",
            data: {conId: conId, controllerInfo: JSON.stringify(controllerSave)},
            success: function (data) {
                if(data == true) {
                    $.dialog('保存成功!');
                    console.log('insertExportRef');
                    controllerSave = [];
                }
            },
            error: function () {
                alert("insertControllerInfo 异常！");
            }
        });
    });
    //从页面上获取controller相关的信息
    window.getControllerInfo = function (flowId) {
        console.log('save controller');
        var saveResult = {};
        saveResult.flowId=flowId;

        //++++++++++ 保存依赖关系 ++++++++++++
        var dependenedInfoList=[];
        var $dependList = $('.alertDependList li');
        for(var i=0; i<$dependList.length; i++) {
            var tempDepend = {};
            tempDepend.flowId=$dependList.eq(i).attr('fid');
            if($dependList.eq(i).find('i').hasClass('singleChecked')) {
                tempDepend.isSelect=1;
            } else {
                tempDepend.isSelect=0;
            }
            dependenedInfoList.push(tempDepend);
        }
        saveResult.dependenedInfoList=dependenedInfoList;

        //************* 保存依赖关联关系 **************
        var interfaceInfoList = [];
        var findINodeList = $('.iNodeList>li');
        for(var i=0; i<findINodeList.length; i++) {
            var tempInterfaceInfo = {};
            var findINodeItem = findINodeList.eq(i);
            var sourceDataId = findINodeItem.attr('sourcedata');
            tempInterfaceInfo.sourceDataId = sourceDataId;
            var sourceDataName = findINodeItem.find('span.nameL').text();

            tempInterfaceInfo.sourceDataName=sourceDataName;
            var iNodeItem = findINodeItem.find('span.nameR');
            var logicNodeId = iNodeItem.attr('logicnodeid');
            tempInterfaceInfo.logicNodeId = logicNodeId;
            var logicNodeName = iNodeItem.text().split('.')[1];
            tempInterfaceInfo.logicNodeName=logicNodeName;
            tempInterfaceInfo.flowId=iNodeItem.attr('fid');

            var columItems = $('.columList').children('li');
            var exportInterfaceColumnList = [];
            for(var i=0; i<columItems.length; i++) {
                var tempObj = {};
                var columItem = columItems.eq(i);
                var sourceColumnId = columItem.attr('sourcecolumnid');
                tempObj.sourceColumnId=sourceColumnId;
                var sourceColumnName = columItem.find('.nameL').text();
                tempObj.sourceColumnName = sourceColumnName;
                var tempItem = columItem.find('.nameR');
                var columnId = tempItem.attr('columnid');
                tempObj.columnId=columnId;
                var columnName = tempItem.text().split('.')[1];
                tempObj.columnName=columnName;
                exportInterfaceColumnList.push(tempObj);
            }
            tempInterfaceInfo.exportInterfaceColumnList = exportInterfaceColumnList;
            interfaceInfoList.push(tempInterfaceInfo);
        }
        saveResult.interfaceInfoList = interfaceInfoList;
        return saveResult;
    }
    //当前选中Flow信息,加入到要保存的项
    function pushControllerInfo() {
        var $partStream = $('.partStream .conVisitedBg');
        if($partStream.length>0) {
            var flowId = $partStream.attr('id');
            var saveInfo = getControllerInfo(flowId);
            var isExit=false;
            if(saveInfo != undefined) {
                for(var i=0; i<controllerSave.length; i++) {
                    var tempSave = controllerSave[i];
                    if(tempSave.flowId == saveInfo.flowId) {
                        var logicNodeInfoList = tempSave.logicNodeInfoList;
                        if(logicNodeInfoList!=undefined && logicNodeInfoList.length > 0) {
                            saveInfo.logicNodeInfoList = logicNodeInfoList;
                        }
                        controllerSave.splice(i, 1);
                        controllerSave.push(saveInfo);
                        isExit = true;
                        break;
                    }
                }
                if(!isExit) {
                    controllerSave.push(saveInfo);
                }
            }
        }
    }

    //获取controller所需要的数据
    window.getControllerData=function () {
        //流组件所有的ID
        var flowIds = getFlowIds();
        var returnData;
        if(flowIds.length>0) {
            $.ajax({
                url: urlId + '/controller/getControllerData',
                type: 'POST',
                async: false,
                dataType: "json",
                data: {conId: conId, flowIds: flowIds.toString()},
                success: function (data) {
                    returnData = JSON.parse(data);
                    console.log('getControllerData');
                },
                error: function () {
                    alert("getControllerData 异常！");
                }
            });
        }
        return returnData;
    }

    //获取某一个flow的信息
    function getFlowData(flowId) {
        if(controllerSave.length>0) {
            for(var i=0; i<controllerSave.length; i++) {
                var save = controllerSave[i];
                if(save.flowId == flowId) {
                    return save;
                }
            }
        }
    }

    //获取某一个flow, 某node的column信息
    function getNodeData(flowId, nodeId) {
        if(controllerSave.length>0) {
            for(var i=0; i<controllerSave.length; i++) {
                var save = controllerSave[i];
                if(save.flowId == flowId) {
                    var logicNodeInfoList = save.logicNodeInfoList;
                    for(var j=0; j<logicNodeInfoList.length; j++) {
                        var nodeInfo = logicNodeInfoList[j];
                        if(nodeInfo.id == nodeId) {
                            return nodeInfo.columnList;
                        }
                    }
                }
            }
        }
    }


//************************ controller release start here ******************************

    window.getJobPlanIds=function () {
        conId = $('li.thistab:eq(0)').attr('conId');
        $.ajax({
            url: urlId + '/release/queryReplica',
            type: 'POST',
            async: false,
            dataType: "json",
            data: {conId: conId},
            success: function (data) {
                optionHtml = '<option value="none">None</option>';
                for(var i=0; i<data.length; i++) {
                    var jobPlan = data[i].jobPlan;
                    var controller = data[i].controller;
                    if(jobPlan != null) {
                        optionHtml += '<option value='+jobPlan.id+' imagerId='+controller.id+'>'+controller.id+'_'+controller.name+'</option>';
                    }
                }
                $('.jobPlan>li:eq(0)>select').html(optionHtml);
                changDeployType();
            },
            error: function () {
                alert("queryReplica 异常！");
            }
        });
    }

    //Controller发布初始化. 含发布信息查询和通知信息查询
    window.initReplica=function (selected) {
        conId = $('li.thistab').attr('conId');
        var imagerId = $('#idNameE option:selected').attr('imagerid');

        var jobPlanId;
        var tagName = $(selected).get(0).tagName.toLowerCase();
        if(tagName == 'select') {
            jobPlanId = selected.options[selected.selectedIndex].value;
        } else if(tagName == 'option'){
            //非鼠标点击事件,值信息的获取
            jobPlanId = selected.attr('value');
            imagerId = selected.attr('imagerid');
        }

        //信息展示前,将发布的所有信息和通知的信息置null (含选中的标签是none的情况)
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
        //发布类型
        $('.jobPlan>li:eq(2)>select option[value=dispatch]').attr("selected","selected");
        changDeployType();

        //黑白名单起始和终止IP添加
        var blackHtml = '<li class="ipTitle"><span>起始IP</span><span>终止IP</span></li>';
        var whiteHtml = '<li class="ipTitle"><span>起始IP</span><span>终止IP</span></li>';
        $('.whiteContainer ul').html(whiteHtml);
        $('.blockContainer ul').html(blackHtml);

        //设置通知事件
        $.ajax({
            url: urlId + '/release/queryNoticeEvent',
            type: 'POST',
            dataType: "json",
            data: {},
            success: function (types) {
                var eventHtml='';
                for(var i=0; i<types.length; i++) {
                    var noticeContentType = types[i];
                    eventHtml+='<li code='+noticeContentType.code+' typeId='+noticeContentType.id+'><i class="single"></i><span>'+noticeContentType.name+'</span></li>';
                }
                $('.noticeEvent').html(eventHtml);
            }
        });

        if(jobPlanId != 'none'){
            //这里的参数conId是副本代表的id
            $.ajax({
                url: urlId + '/release/queryReplicaInfo',
                type: 'POST',
                dataType: "json",
                data: {imagerId: imagerId, jobPlanId: jobPlanId},
                success: function (data) {
                    data = JSON.parse(data);
                    var jobPlan = data.jobPlan;
                    //选中镜像ID
                    $('.jobPlan>li:eq(0)>select option[value='+jobPlan.id+']').attr("selected","selected");

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
                        //回调URL
                        $part.eq(1).find('input').val(jobPlan.url);

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
                                    blackHtml += '<li id='+blackItem.id+'><span contenteditable="true">'+blackItem.beginIp+'</span>' +
                                        '<span contenteditable="true">'+blackItem.endIp+'</span><i class="closeL"></i></li>'
                                } else {
                                    whiteHtml += '<li id='+blackItem.id+'><span contenteditable="true">'+blackItem.beginIp+'</span>' +
                                        '<span contenteditable="true">'+blackItem.endIp+'</span><i class="closeL"></i></li>'
                                }
                            }
                        }
                        $('.whiteContainer ul').children().remove();
                        $('.whiteContainer ul').html(whiteHtml);
                        $('.blockContainer ul').children().remove();
                        $('.blockContainer ul').html(blackHtml);

                        ipBlur(true);
                        ipBlur(false);

                    } else {
                        //发布类型
                        $('.jobPlan>li:eq(2)>select option[value=dispatch]').attr("selected","selected");
                        changDeployType();

                        $part = $('.dispatchPart>li');
                        //时间控件
                        $('#cron').html(jobPlan.cron);
                    }

                    //是否允许多线程
                    if(jobPlan.isRepeat) {
                        $part.parent().find('.isRepeat i').addClass('singleChecked');
                    }
                    //当前状态
                    if(jobPlan.isRun==1) {
                        var deployStatus = getDeployStatus();
                        $part.parent().find('.deployState i').html(deployStatus);
                    }

                    //通知人内容信息设置
                    var noticePerson = data.notice.noticePerson;
                    if(noticePerson != undefined) {
                        var $notice = $('.noticePerson li');
                        $notice.eq(0).find('select option[value=email]').attr("selected","selected");
                        $notice.eq(1).find('input').val(noticePerson.email);
                        if(noticePerson.isDefaultSendEMail) {
                            $notice.eq(2).find('i').addClass('singleChecked');
                            //将默认邮件地址隐藏
                            $('.hidePart').hide();
                        }
                        $notice.eq(3).find('input').val(noticePerson.sendEMail);
                        $notice.eq(4).find('input').val(noticePerson.sendEMailPassword);
                        $notice.eq(5).find('input').val(noticePerson.sendEMailImapServerIp);
                        $notice.eq(6).find('input').val(noticePerson.sendEMailPort);
                    }

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
        dict.controllerId=conId;
        //imagerId
        var imagerId = $('.jobPlan>li:eq(0)>select option:selected').val();
        if(imagerId != 'none') {
            dict.imagerId=imagerId;
        }

        var $part;
        if($('.jobPlan>li:eq(2)>select option:selected').val()=='webservice') {
            dict.isWebservice=1;

            $part = $('.webservicePart>li');
            //接口代码
            dict.webServiceCode=$part.eq(0).find('input').val();
            //回调url
            dict.url=$part.eq(1).find('input').val();

            //白名单
            var blackList=[];
            var $ipContainerA = $('.ipContainerA li');
            blackList.push(getBlackList($ipContainerA, 0));

            //黑名单
            var $ipContainerB = $('.ipContainerB li');
            blackList.push(getBlackList($ipContainerB, 1));

            dict.blackList=blackList;
        } else {
            $part = $('.dispatchPart>li');
            //发布类型
            dict.isWebservice=0;
            //时间控件
            dict.cron=$('#cron').val();
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
                var text = conId+'_'+$('.thistab span.name_m').text();
                //在选项中添加此副本项, 并设置为默认选中项
                $('.jobPlan>li:eq(0)>select').append('<option value="'+data+'" selected="selected">'+text+'</option>');
                alert("创建成功");
            },
            error: function () {
                alert("insertReplica 异常！");
            }
        });
    }
    //获取黑白名单的BlackList信息
    function getBlackList(node, isBlack) {
        var tempBlack = {};
        tempBlack.isBlack=isBlack;
        if(node.length > 1) {
            var blackItems=[];
            for (var i=1; i<node.length; i++) {
                var findSpan = node.eq(i).find('span');
                var tempIp={};
                tempIp.beginIp=findSpan.eq(0).text();
                tempIp.endIp=findSpan.eq(1).text();
                if(tempIp.beginIp!='' && tempIp.endIp!='') {
                    blackItems.push(tempIp);
                }
            }
            tempBlack.blackItems=blackItems;
        }
        return tempBlack;
    }
    //创建副本信息
    $('.createReplica').unbind().click(function(){
        insertReplicaInfo();
    });

    //黑白名单失去焦点触发验证
    function ipBlur(isBlack) {
        var tag;
        if(isBlack) {
            tag = '.ipContainerB li span';
        } else {
            tag = '.ipContainerA li span';
        }
        $(tag).blur(function(){
            var $this=$(this);
            var blackItem = {};
            var prev = $(this).prev();
            if(prev.length != 0) {
                blackItem.endIp=$this.html().trim();
                blackItem.beginIp=$this.prev().html().trim();
                checkBlackList(blackItem,$this);
            }
        })
    }
    //黑名单校验
    function checkBlackList(blackItem,$this) {
        //白名单
        var blackList=[];
        var $ipContainerA = $('.ipContainerA li');
        var blackList1 = getBlackList($ipContainerA, 0);
        //黑名单
        var $ipContainerB = $('.ipContainerB li');
        var blackList2 = getBlackList($ipContainerB, 1);

        if($('.ipListed').hasClass('whiteIp')){
            var blackItems = blackList1.blackItems;
            for(var i=0; i<blackItems.length; i++) {
                var tempItem = blackItems[i];
                if(tempItem.beginIp==blackItem.beginIp && tempItem.endIp==blackItem.endIp) {
                    blackItems.splice(i, 1);
                }
            }
        } else if($('.ipListed').hasClass('blackIp')){
            var blackItems = blackList2.blackItems;
            for(var i=0; i<blackItems.length; i++) {
                var tempItem = blackItems[i];
                if(tempItem.beginIp==blackItem.beginIp && tempItem.endIp==blackItem.endIp) {
                    blackItems.remove(tempItem);
                }
            }
        }
        blackList.push(blackList1);
        blackList.push(blackList2);

        $.ajax({
            url: urlId + '/release/checkBlackList',
            type: 'POST',
            dataType: "json",
            data: {blackItemStr: JSON.stringify(blackItem), blackListStr: JSON.stringify(blackList)},
            success: function (data) {
            console.log("checkBlackList");
                if(data.length == 0) {
                    alert('正确');
                } else {
                    //alert(data.toString());
                    $this.attr('data-tipso',data.toString()).tipso({
                        position: 'bottom',
                        background: '#d9f4fe',
                        color:'#202020',
                        useTitle: false
                    }).css('color','red');
                }
                //TODO
                //前台提示信息展示
            }
        })
    }
    

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
                    jobHtml+='<td></td>';
                    jobHtml+='<td>'+job.status+'</td>';
                    jobHtml+='<td></td>';
                    jobHtml+='<td>'+timeStamp2String(job.startTime)+'</td>';
                    jobHtml+='<td>'+timeStamp2String(job.endTime)+'</td>';
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
        })
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
                ipBlur(false);
            });
            $('.blockContainer .plusBtn').unbind('click').click(function () {
                var new_obj = $("<li><span contenteditable='true'></span> <span contenteditable='true'></span><i class='closeL'></i></li></li>");
                $('.ipContainerB').append(new_obj);
                //参数列表的列
                delList();
                ipBlur(true);
            });

        }
        delList();
        //删除参数列表的每一列
        function delList() {
            $('.whiteContainer .closeL').unbind('click').click(function () {
                var parent = $(this).parent();
                delIpItem(parent.attr('id'))
                parent.remove();
            });
            $('.blockContainer .closeL').unbind('click').click(function () {
                var parent = $(this).parent();
                delIpItem(parent.attr('id'))
                parent.remove();
            })
        }
        function delIpItem(id){
            $.ajax({
                url: urlId + '/release/deleteBlackItem',
                type: 'POST',
                async: false,
                dataType: "json",
                data: {id: id},
                success: function (data) {
                    console.info('blackItem 删除成功!');
                },
                error: function () {
                    alert("blackItem 异常！");
                }
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

        //delete jobPlan信息
        if(tar.tagName.toLowerCase() === 'p' && $(tar).hasClass('deleteReplica')) {
            deleteJobPlanInfo();
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
                    $.dialog('保存成功!');
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
        }else if(p1=='dispatch'){
            $('.webservicePart').hide();
            $('.dispatchPart').show();
        }
    }

    //任务布署
    function deployReplica() {
        var jobParams={};
        jobParams.controllerId=conId;
        jobParams.imagerSourceId=$('#idNameE option:selected').attr('imagerid');;
        jobParams.planId=$('#idNameE option:selected').attr('value');
        $.ajax({
            url: urlId + '/release/deployJob',
            type: 'POST',
            dataType: "json",
            data: {jobStr: JSON.stringify(jobParams)},
            success: function (data) {
                console.log("deploy job.");
                $.dialog('发布成功!')
            },
            error: function () {
                alert("deploy job 异常！");
            }
        })
    }

    //获取布署的状态信息
    function getDeployStatus() {
        var planId = $('.deploy').attr('jobplanid');
        $.ajax({
            url: urlId + '/release/getDeployStatus',
            type: 'POST',
            dataType: "json",
            data: {jobPlanId: planId},
            success: function (data) {
                console.log("deploy job.");
            },
            error: function () {
                alert("deploy status 异常！");
            }
        })
    }

    //controller发布, 删除
    function deleteJobPlanInfo() {
        var jobPlanId = $('#idNameE option:selected').attr('value');

        $.ajax({
            url: urlId + '/release/deleteJobPlanInfo',
            type: 'POST',
            dataType: "json",
            data: {jobPlanId: jobPlanId},
            success: function (data) {
                $('#idNameE option:selected').remove();
                //重新显示发布页
                initReplica($('#idNameE option:selected'));
                console.info('执行计划删除成功!');
            },
            error: function () {
                alert("执行计划删除异常！");
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
        htmlStr += "</ul>"
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
