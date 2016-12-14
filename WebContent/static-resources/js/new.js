//公共对象：刷新类型枚举，1是工作区目录刷新，2是管理目录刷新
var refreshEnum2 = [1,2];
//公共对象：标记枚举
var signArray2 = new Array();
//公共对象：权限枚举
var powerEnum2 = ["0b10","0b01"];
//公共对象：最高权限
var maxPower2 = "0b11";
var dbtype;
var flowId_global;
var pageSize=15;
$(function(){
	//注销登录
	$('.logout').click(function(){
		window.location.href="/TarotIDE/logout";
	})
});

$(function(){
    $('.paramMain:before').click(function () {

    });

    //目录树点击事件
    //TODO
    $('.folder').unbind('click').on('click', 'li div', function (e) {
    	$('.folder li div').removeClass('visitedBg');
        $(this).addClass('visitedBg');
        $('.module-data-right-navigation').show();
        var idName=$(this).attr('id');
        var dataType=$(this).attr('menutype');
        var fileName = $(this).children().last().text();
        if(dataType == 1){//文件夹
        	return;
        }
        if($(e.target).attr('type')=='text'){
			console.log('当前点击：');
			console.log(e.target);
		}else{
			//初始化事件
			tabCheck(idName, dataType, fileName);
		}

    });

    //module-data-right-navigation
    $('.tabsEvent').off('click').on('click','li', function (e) {
        if($(this).hasClass('thistab')){
        	return ;
        }
        var $dataType = $(this).attr('data_type');
        var $idName = $(this).attr('idName');
        $(this).addClass('thistab').siblings().removeClass('thistab');
        $('.root_tree div').removeClass('visitedBg');
        if($('.module-data-all .thistab').attr("class").length>7){
        	//被选中的选项卡的id
            var a=$('.module-data-all .thistab').attr("class").split('-')[1].split(' ',1).toString();
            $('.root_tree div[id='+a+']').addClass('visitedBg');
        }
        //隐藏所有
        $('.module-manager').hide();
        $('.module-flow, .module-bi, .module-datamining, .module-controller,.controllDeployEvent').hide();

        //2.controller, 3.flow, 4.datamining, 5.bi
        showType($idName, $dataType)
    });

    //工作区管理按钮点击事件
    $('.managers').off('click').on('click', function (e) {
        e.stopPropagation();
        $('#manag').show();
        $('.managers').addClass('header_active');
        $('.flows').removeClass('header_active');
    });
    $('html').off('click').on('click', function () {
        $('#manag').hide();
        headerActive();
    });
    function headerActive(){
        if($('.module-manager').css('display')=='none' && $('.dataManager .power-detail').css('display')=='none'
        	&& $('.dataManager .center-table2').css('display')=='none' && $('.dataManager .user').css('display')=='none'
        		&& $('.dataManager .users-manage').css('display')=='none' && $('.dataManager .business_logic').css('display')=='none'){
            $('.managers').removeClass('header_active');
            $('.flows').addClass('header_active');
        }else if($('.module-manager').css('display')=='block' || $('.dataManager .power-detail').css('display')=='block'
        	|| $('.dataManager .center-table2').css('display')=='block' || $('.dataManager .user').css('display')=='block'
        	|| $('.dataManager .users-manage').css('display')=='block' || $('.dataManager .business_logic').css('display')=='block'){
            $('.managers').addClass('header_active');
            $('.flows').removeClass('header_active');
        }
    };
    $('.flows').unbind('click').click(function () {
        $('.managers').removeClass('header_active');
        $('.flows').addClass('header_active');
        $('.root_tree div').removeClass('visitedBg');
        if($('.module-data-all .thistab').attr("class").length>7){
        	//被选中的选项卡的id
            var a=$('.module-data-all .thistab').attr("class").split('-')[1].split(' ',1).toString();
            $('.root_tree div[id='+a+']').addClass('visitedBg');
        }
        $('.module-data,.module-data-navigation,.module-data-all,.content').show();
        $('.module-manager,.dataManager,#manag').hide();
        $('.power-detail, .center-table2, .user, .users-manage, .business_logic').hide();
        $(".root_tree div").eq(0).removeClass('visitedBg');
        // add by tyd
        refreshMenu(refreshEnum[0]);
    });

  //点击确定
    function sureBtn() {
        $('.sureEvent').unbind('click').click(function () {
        	//----------------------- 新增 , @date: 2016-11-29 18:12 ZHANG HAIJUN
        	if(__ftp){
        		var files = [];
        		$('.mainList1').find('.singleChecked').next().each(function(index,item){
        			files.push($(item).attr('data-path'));
        		});
        		var cid = $('.connectionEvent').val();
        		var conName = $('.connectionEvent').find("option:selected").text();
        		closeAdd4();
        		ftpConfig(files,cid,conName);
        		return;
        	}

        	//-----------------------

        	var conText = $('.add4NavEvent').find('.bg').text();
        	//----------------------------数据源、接口验证  --es
        	if(conText=="数据源"){
        	var isource = $('.mainList1').find('.singleChecked').next();
        	if(isource.length == 0){
        		$.dialog("请选择数据源");
        		return;
        	}
        	}else if(conText=="数据接口"){
        		var tableName = $('.partN input').val();
        		var flowId = flowId_global;
        		if(!tableName){
        			$.dialog("请填写接口名称");
            		return;
        		}else if(tableName){
        			nameValidation(tableName,flowId)
        			var namev = nameval;
        			if(namev == "false"){
        				$.dialog("接口名称不能重复");
                		return;
        			}
        		}
        		if(specialSymbols.test(tableName)){
        			$.dialog("接口名称不能包含特殊字符");
            		return;
        		}
        		if(chineseValidation.test(tableName)){
        			$.dialog("接口名称不能包含中文");
        			return ;
        		}
        		var parameter = $('.paramL .paramMain li:gt(0)');
        		if(parameter.length == 0){
        			$.dialog("请添加字段");
            		return;
        		}
        		for(var i = 1;i<parameter.length;i++){
        			if(parameter.find('span').eq(0).html() == parameter.find('span').eq(i).html()){
        				$.dialog("字段名称不能重复");
                		return;
        			}else if(specialSymbols.test(parameter.find('span').eq(0).html()) || specialSymbols.test(parameter.find('span').eq(i).html())){
        				$.dialog("字段名称不能包含特殊字符");
                		return;
        			}
        		}
        	}
        	//-------------------------------------------------


        	var source_datas = new Array();
        	if(conText=="数据源"){
        		var conId = $('.connectionEvent').val();
        		var conName = $('.connectionEvent').find("option:selected").text();
        		$('.mainList1').find('.singleChecked').next().each(function(index,item){
        			var source_data = new Object();
        			source_data.conId = conId;
        			source_data.conName = conName;
        			source_data.flowId = flowId_global;
        			source_data.isInterface = 0;
        			source_data.sourceDataType = 'JDBC';
        			var enumValues = new Array();
        			var enumValue = new Object();
        			var sourcetable = $(item).html();
        			enumValue.enumCode = "sourcetable";
        			enumValue.value = sourcetable;
        			enumValues.push(enumValue);
        			var enumValue2 = new Object();
        			enumValue2.enumCode = "alias";
        			enumValue2.value = sourcetable.substring(sourcetable.indexOf(".")+1);
        			enumValues.push(enumValue2);
        			source_data.fileName = sourcetable;
        			var enumValue3 = new Object();
        			enumValue3.enumCode = "conId";
        			enumValue3.value = conId;
        			enumValues.push(enumValue3);
        			source_data.enumValues = enumValues;
                    source_datas.push(source_data);
                });
        	}else if(conText=="数据接口"){
        		var source_data = new Object();
        		source_data.conId = 0;
        		source_data.flowId = flowId_global;
    			source_data.isInterface = 1;
    			source_data.sourceDataType = 'JDBC';
    			var enumValues = new Array();
    			var enumValue = new Object();
    			var sourcetable = $('.dataContainerB .partN input').val();
    			enumValue.enumCode = "sourcetable";
    			enumValue.value = sourcetable;
    			enumValues.push(enumValue);
    			var enumValue2 = new Object();
    			enumValue2.enumCode = "alias";
    			enumValue2.value = sourcetable.substring(sourcetable.indexOf(".")+1);
    			enumValues.push(enumValue2);
    			source_data.enumValues = enumValues;
    			source_data.fileName = sourcetable;
    			var sourceColumns = new Array();
    			$('.paramL .paramMain li:gt(0)').each(function(index,item){
    				var name = $(this).find('span').html();
    				var type = $(this).find('select').val();
    				var sourceColumn = new Object();
    				sourceColumn.name = name;
    				sourceColumn.type = type;
    				sourceColumns.push(sourceColumn);
    			});
    			source_data.columnList = sourceColumns;
    			source_datas.push(source_data);
        	}
        	$.ajax({
                url:urlId+'/addSourceDataAndAll',
                type:'POST',
                dataType:"json",
                contentType: "application/json; charset=utf-8",
                data:JSON.stringify(source_datas),
    	        success:function(data) {
    	        	appendDataSources(data);
    				closeAdd4();
    	        },
    	        error : function() {
    	            $.dialog("异常！");
    	            closeAdd4();
    	        }
        	})
        })
    }


    //非目录管理权限的单选框
    $('.mainEvent,.add3EventOne,.add3EventTwo').unbind('click').click(function (e) {
        e = e || window.event;
        var tar = e.target || e.srcElement;
        if (tar.tagName.toLowerCase() === 'i' && $(tar).hasClass('single')) {
            if ($(tar).hasClass('singleChecked')) {
                $(tar).removeClass('singleChecked');
            } else {
                $(tar).addClass('singleChecked')
            }
        }
    });

    //目录管理权限的单选框
    $('.table1').unbind('click').click(function (e) {
        e = e || window.event;
        var tar = e.target || e.srcElement;
        var adds = $(tar).parent().parent().children().eq(5).children(); //增加权限
        var deletes = $(tar).parent().parent().children().eq(6).children(); //删除权限
        var updates = $(tar).parent().parent().children().eq(7).children(); //修改权限
        var selects = $(tar).parent().parent().children().eq(8).children(); //查看权限
        var gives = $(tar).parent().parent().children().eq(9).children(); //赋予权限
        if (tar.tagName.toLowerCase() === 'i' && $(tar).hasClass('single')) {
            if ($(tar).hasClass('singleChecked')) {
            	if($(tar).hasClass('read')){
            		if(adds.hasClass('singleChecked')|deletes.hasClass('singleChecked')|updates.hasClass('singleChecked')|gives.hasClass('singleChecked')){
            			$.dialog("你有其他的依赖项，请先删除依赖项！");
            			return;
            		}
            	}
                $(tar).removeClass('singleChecked');
            } else {
            	if(!selects.hasClass('singleChecked')){
            		selects.addClass('singleChecked')
            	}
                $(tar).addClass('singleChecked')
            }
        }
    });

    //数据连接权限管理的单选框
    $('.table3').unbind('click').click(function (e) {
        e = e || window.event;
        var tar = e.target || e.srcElement;
        var uses = $(tar).parent().parent().children().eq(5).children(); //使用权限
        var gives = $(tar).parent().parent().children().eq(6).children(); //赋予权限
        if (tar.tagName.toLowerCase() === 'i' && $(tar).hasClass('single')) {
            if ($(tar).hasClass('singleChecked')) {
            	if($(tar).hasClass('use')){
            		if(gives.hasClass('singleChecked')){
            			$.dialog("你有其他的依赖项，请先删除依赖项！");
            			return;
            		}
            	}
                $(tar).removeClass('singleChecked');
            } else {
            	if(!uses.hasClass('singleChecked')){
            		uses.addClass('singleChecked')
            	}
                $(tar).addClass('singleChecked')
            }
        }
    });

    $('.mapList p span').click(function () {
        console.log($(this));
        if ($(this).hasClass('.clicked')) {
            $(this).removeClass('.clicked')
        } else {
            $(this).addClass('.clicked')
        }
    });

    $('.fa-trash2').unbind('click').click(function () {
        $('.add2-f').hide();
        $('.add-user').hide();
        $('.edit-user').hide();
        $('.look-detail').hide();
        $('.look-input tr td').empty();
        $('.lookTable tr td').empty();
        $('.edit-conn').hide();
        $('.look-detail .h4 span').html('查看');
        $('.mask').hide();
    });

    $('.add4').off('click').click(function () {
    	$('.mask').show();
    	//切换选项卡
        $('.add4Event').show().find('.add4NavEvent li').click(function () {
            $(this).addClass('bg').siblings('li').removeClass('bg');
            $('.add4Event').children('div').eq($(this).index()).addClass('showCon').siblings('div').removeClass('showCon');
        });

        var str='';
        $.ajax({
            url:urlId+'/selectDataConnectionAndPowerByUserId'+'?userId='+$.getCookie('userId').id,
            type:'POST',
            dataType:"json",
            contentType: "application/json",
            success:function(data) {
				str+='<option selected>请选择数据连接</option>';
                $(data).each(function(index,item){
                    str+='<option value='+item["ID"]+'>'+item["NAME"]+'</option>';
                });
                $('.connectionEvent').html(str);

                bindSourceDataChangeEvent();
            },
            error : function() {
                $.dialog("异常！");
            }
        });

        //增加参数列表的每一列
        $('.addBtn').off('click').click(function () {
            $('.paramMain').append($('.paramMain li').eq(1).clone(false));
            //参数列表删除
            $('.paramMain .closeL').unbind('click').click(function () {
            	if($('.paramMain li').length>2){
            		 $(this).parent().remove();
            	}
            })
        });
        //点击确定按钮
        sureBtn();
        //关闭和取消
	    $('.add4Event .closeA,.add4Event .cancel').unbind('click').click(function () {
	        closeAdd4();
	    });
    });
    var bindSourceDataChangeEvent  = function(){
    	//input下拉菜单
        $('.connectionEvent').change(function(){
            var detailId = $(this).children('option:selected').val();
            if(detailId){
            	var str='';
                $.ajax({
                    url:urlId+'/selectValueAndTableByConIds'+'?conId='+detailId+'&flowId='+flowId_global,
                    type:'POST',
                    dataType:"json",
                    contentType: "application/json",
                    success:function(data) {
                        //console.log(data)
                    	__ftp = false;
                    	if(data.sourceType == 'ftp' || data.sourceType == 'hdfs'){
                    		//TODO FTP
                    		ftpInit(data, detailId, flowId_global);
                    		return ;
                    	}
                        $(data).each(function(index,item){
                            var tableNames=item.tableName;
                            for(var i=0;i<tableNames.length;i++){
                                str+='<li class="liStyle"><i class="single"></i><span>'+tableNames[i]+'</span></li>';
                            }
                            $('.mainEvent').html(str);
                        });

                    },
                    error : function() {
                        $.dialog("异常！");
                    }
                })
            }else {
            	$('.mainEvent').empty();
            }
        });
    };

    window.tabCheck=function ($idName, $dataType, $fileName){
    	//TODO
    	if($('.flows').hasClass('header_active')){
    		var isExist = false;
    		$('.tabsEvent li').each(function(index, item){
    			var $item = $(item);
                var dataType=$item.attr('data_type');
    			var idName = $item.attr('idName');
    			if($idName == idName&&$dataType==dataType){
    				isExist = true;
    			}
    		});
    		var iconType;
    		//2是controller，3是flow，4是datamining，5是bi,6是controller发布
    		if($dataType==2){
    			iconType='controllerIcon';
    		}else if($dataType==3){
    			iconType='flow';
    		}else if($dataType==4){
    			iconType='DataMicon';
    		}else if($dataType==5){
    			iconType='biIcon';
    		}else if($dataType==6){
    			iconType='controllerIcon';
    		}
    		if( !isExist ){
    			$('.tabsEvent li').removeClass('thistab');
    			$('.tabsEvent').append(
    					'<li class="thistab tabs-'+ $idName +'" data_type="'+$dataType+'" idName="'+$idName+'"><a tab="tab1_1"><span class="'+iconType+'"></span><span class="name_m" title='+$fileName+'>' + $fileName + '</span><span class="close_m"><i class="closeTab"></i></span></a></li>'
    			);
    			//隐藏其他页面
    			$('.module-manager').hide();
    			$('.module-flow, .module-bi, .module-datamining, .module-controller,.controllDeployEvent').hide();
    			//显示当前对象
    			showType($idName, $dataType);

    			$('.close_m').unbind('click').click(function(e){
    				e = e || window.event;
					var $showName=$(this).prev().html();
    				if(e.stopPropagation) { //W3C阻止冒泡方法
    					e.stopPropagation();
    				} else {
    					e.cancelBubble = true; //IE阻止冒泡方法
    				}
    				var $liObj = $(this).parent().parent();
    				$.confirm('要在关闭之前存储对“'+$showName+'”的更改吗？', function(){
    					closeTab($liObj);
    				});
    			});
    		}else{
    			$('.module-manager').hide();
    			$('.module-flow, .module-bi, .module-datamining, .module-controller,.controllDeployEvent').hide();
    			$('.tabsEvent li').removeClass('thistab');
    			$('.tabs-' + $idName).addClass('thistab').show();

    			showType($idName, $dataType);
    		}
    	}
    }

    window.closeTab=function($liObj){
    	var objDataType = $liObj.attr('data_type');
        var objIdName = $liObj.attr('idName');
        if(objDataType==2){
            $('.controller-' + objIdName).hide();
        }else if(objDataType==3){
            $('.flow-' + objIdName).hide();
        }else if(objDataType==4){
            $('.datamining-' + objIdName).hide();
        }else if(objDataType==5){
            $('.bi-' + objIdName).hide();
        }else if(objDataType==6){
            $('.controllDeployEvent-' + objIdName).hide();
        }


        if($liObj.hasClass('thistab')){
        	if($('.tabsEvent li').length > 0){
        		$('.module-manager').hide();
        		$('.module-flow, .module-bi, .module-datamining, .module-controller,.controllDeployEvent').hide();
        		/*var i = 0;
            	while($($('.tabsEvent li')[i]).css('display') == 'none'){
                	i++
            	}*/
        		if($('.tabsEvent .thistab').nextAll().index()!=-1){
        			$($('.tabsEvent .thistab').next()).addClass('thistab');
        		}else{
        			$($('.tabsEvent .thistab').prev()).addClass('thistab');
        		}
        		$liObj.remove();
        		$('.root_tree div').removeClass('visitedBg');
        		var a;
        		if($('.module-data-all .thistab').attr("class").length>7){
        			//被选中的选项卡的id
        			a=$('.module-data-all .thistab').attr("class").split('-')[1].split(' ',1).toString();
        			$('.root_tree div[id='+a+']').addClass('visitedBg');
        		}

        		var needShowObj = $('.tabs-'+a);
        		showType(needShowObj.attr('idName'), needShowObj.attr('data_type'))
        	}
        }else{
        	$liObj.remove();
        }
    }

    //loading related data
    window.showType=function ($idName, $dataType){
        //TODO 2是controller，3是flow，4是datamining，5是bi，6是controllerDeploy
    	if($('.flows').hasClass('header_active')){
        if($dataType == 2){
            //TODO Loading controller data and mask
            setConIdAttr($('li.thistab').attr('idname'));
            initController();
            $('.controller-template').show();
        }else if($dataType == 3){
            //TODO Loading flow data and mask
        	getFlowIdByMenuId($idName);
            $('.flow-template').show();
            //设置属性input宽度
            $('.module-prop .new_table_name input,.module-prop .new_column_name input').css('width',250-$('.module-prop .prop span:first-child').width());
        }else if($dataType == 4){
            //TODO Loading datamining data and mask
        	dataMiningInit($idName);
            $('.datamining-template').show();
        }else if($dataType == 5){
        	$('.showbiData').attr('data-templateid', $idName);
            /*if($.isEmpty(templateContainer)){
            	biInit($idName);
    		}else{
    			$.confirm('确定要离开该报表吗？', function(){
    				biInit($idName);
    			});
    		}*/

            biInit($idName);
            $('.bi-template').show();
        }else if($dataType == 6){
            setConIdAttr($idName);
            getJobPlanIds();
            $('.controllDeployEvent').show();
            var $idNameE = $('#idNameE option');
            if($idNameE.length >1 ){
                initReplica($idNameE.eq(1));
            } else {
                initReplica($idNameE.eq(0));
            }
        }
    	}

    };

    window.appendDataSources = function(data){
    	var sourceDatas = sourceDatasMap.get(flowId_global);
    	var fileName;
		var sourceDataId;
		var is_interface;
		var data_obj;
		var line_color = _jm1.options.view.line_color;
		var liStr="";
		$(data).each(function(index,item){
			var sdList = item.sdList;
			var liStr_min="";
			var liElement = $('#_source_add .menuStyle li[conId="'+item.conId+'"]');
			if(liElement.length>0){
				$.each(sourceDatas,function(i,element){
	        		while(item.conId==element.conId){
	        			element.sdList = element.sdList.concat(item.sdList);
	        			break;
	        		}
	        	});
				$.each(sdList,function(i,element){
					fileName=element.fileName;
					is_interface=element.isInterface;
					if(( element.sourceDataType == 'ftp'  || element.sourceDataType == 'hdfs' ) && fileName){
						fileName = fileName.substr(fileName.lastIndexOf('/')+1);
					}
					sourceDataId=element.id;
					tableColumnsMap.put(sourceDataId,element.columnList);
					liStr_min+="<li textValue = '"+fileName+"' level='2' flowId='"+flowId_global+"' sourceId='"+sourceDataId+"' is_interface='"+is_interface+"' line_color='"+line_color+"' class='draggable'><i class='branchIcon'></i><span>"+fileName+"</span></li>";
				});
				liElement.find('ul').append(liStr_min);
			}else{
				sourceDatas.push(item);
				liStr+="<li conId='"+item.conId+"'><div class='titleT clearFix'><span>"+item.conName+"</span><i class='arrowUp'></i></div><ul class='detail show'>";
				$.each(sdList,function(i,element){
					fileName=element.fileName;
					is_interface=element.isInterface;
					if(( element.sourceDataType == 'ftp'  || element.sourceDataType == 'hdfs' ) && fileName){
						fileName = fileName.substr(fileName.lastIndexOf('/')+1);
					}
					sourceDataId=element.id;
					tableColumnsMap.put(sourceDataId,element.columnList);
					liStr_min+="<li textValue = '"+fileName+"' level='2' flowId='"+flowId_global+"' sourceId='"+sourceDataId+"' is_interface='"+is_interface+"' line_color='"+line_color+"' class='draggable'><i class='branchIcon'></i><span>"+fileName+"</span></li>";
				});
				liStr+=liStr_min+"</ul></li>";
			}
		});
		var $liStr = $(liStr);
		$('#_source_add .menuStyle').append($liStr);
		$.slideStyle($liStr);
		$('#_source_add .draggable').unbind('mousedown').mousedown(function(e, a){
    	    if(e.which == 3 || a == 'right'){
    	        $currentRightDom = $(this);
    	        generateFun(null,"#_source_add .draggable",0);
    	    }
    	});
		initDragable();
    };
    //数据源、数据接口弹出框
    function closeAdd4(){
        $('.add4Event,.mask').hide();
        $('.add4NavEvent li[class="bg"]').removeClass('bg');
        $('.add4NavEvent li:eq(0)').addClass('bg');
        $('.add4Event div.showCon').removeClass('showCon');
        $('.add4NavEvent').next().addClass('showCon');
        $('.partN input,.connectionEvent').val('');
        $('.paramMain li:gt(1)').remove();
        $('.mainEvent').html('');
        $('.partN input').css('border-color','#dedede');
    }

    //目录管理点击事件
    $('.man1').unbind('click').click(function () {
    	$('#itemValue').val('');
        $('.module-data,.dataManager').hide();
        $('.module-data-navigation,.module-manager,.content').show();
        refreshMenu(refreshEnum[1]);
        $('.manager-bodyer,.center-table1').show();
        $('.power-detail, .center-table2, .user, .users-manage, .business_logic, #manag').hide();
        var data = his1.getList();
        $('#searchInfo').empty();
        if(data!=null){
			for(var i =data.length-1;i>=0;i--){
				$('#searchInfo').prepend('<li class="history1">'+data[i].title+'</li>');
			}
        }
    });

  //数据连接管理
	var conId;
	$('.man2').unbind('click').click(function () {
		$('#itemValue2').val('');
		var user = userId;
        goDatasource(user,null);
        var data = his2.getList();
        $('#searchInfo2').empty();
        if(data!=null){
        	for(var i =data.length-1;i>=0;i--){
        		$('#searchInfo2').prepend('<li class="history2">'+data[i].title+'</li>');
        	}
        }
	});

    $('.man3').unbind('click').click(function () {
		$('.module-data-navigation,.module-data-all,.manager-bodyer,.content,.center-table1,.center-table2,.power-detail,.business_logic').hide();
		if(isAdmin==1){
    		$('.dataManager, .users-manage').show();
    		refreshUsersList(null);
    		var data = his4.getList();
            $('#searchInfoUsers').empty();
            if(data!=null){
            	for(var i =data.length-1;i>=0;i--){
            		$('#searchInfoUsers').prepend('<li class="history4">'+data[i].title+'</li>');
            	}
            }
		}else{
			$('.dataManager, .user').show();
			$('.personalInfo').show();
			//$('.btnEvent li span').removeClass('selected');
			//$('.btnEvent li span').first().addClass('selected');
			refreshUser();
		}
	});

	//个人信息详情页

	var personalInfo=function(){
	    //个人信息、更改密码选项卡
	    $('.btnEvent li').click(function(){
	        console.log('selected');
	        $('.btnEvent li span').removeClass('selected');
	        $(this).children().removeClass('selected').addClass('selected');
	    })
	};
	personalInfo();

	$('.message').click( function(){
		$('.showMessage').show();
    	$('.changeP').hide();
    	refreshUser();
    });

	$('.changePassword').click( function(){
		$('.showMessage').hide();
    	$('.changeP').show();
    	$('.changeP .upPwd input').val('');
    });
    window.pwdValidation=function(userName,oldPwd){
		$.ajax({
			type:"POST",
			url:urlId+"/isPwdCorrect",
			dataType:"json",
			data:{
				userName:userName,
				password:oldPwd
			},
			success:function(data){
				console.log(data);
				if(data==false){
					$.dialog('密码输入错误');
					return;
				}
			}
		});
	};

	window.updatePwd=function(userId,newPwd){
		$.ajax({
			type:"POST",
			url:urlId+"/update",
			dataType:"json",
			data:{
				userId:userId,
				password:newPwd
			},
			success:function(data){
				console.log(data);
				$.confirm('修改密码成功,请重新登录', function(){
					window.location.href="/TarotIDE/logout";
				})
			}
		});
	};

    $(".rePwd").unbind('click').click( function(){
    	var oldPwd = $('.upPwd .oldPwd').val();
    	var newPwd = $('.upPwd .newPwd').val();
    	var repeat = $('.upPwd .repeat').val();
    	if(!oldPwd || !newPwd || !repeat){
    		$.dialog("您有内容没有填写，请认真检查！");
    		return null;
    	}
    	var bok=true;
    	$.ajax({
			type:"POST",
			url:urlId+"/isPwdCorrect",
			async:false,
			dataType:"json",
			data:{
				userName:userName,
				password:oldPwd
			},
			success:function(data){
				console.log(data);
				if(data==false){
					$.dialog('密码输入错误');
					bok=false;
				}
			}
		});
    	if(bok){
    		if(repeat != newPwd){
        		$.dialog("您两次输入的密码不相同！");
        		return null;
        	}
    		if(oldPwd == newPwd){
        		$.dialog("您输入的密码与原密码相同，请重新输入！");
        		return null;
        	}
        	updatePwd(userId,newPwd);
    	}

	});

	$('.updateMessage').unbind('click').click(function(){
		$('.updateMessage').hide();
		$('.editUserBtn').show();
		var name1 = $(".userLook .name").text();
		$('.userLook .name').html("<input type='text' value='"+name1+"' />");
		var gender = $(".userLook .gender").text();
		if(gender=="男"){
			var genderVal=0;
		}else{
			var genderVal=1;
		}
		$('.userLook .gender').html("<input type='radio' name='gender' value=0 />男"
				+"<input type='radio' name='gender' value=1 />女");
		$(".userLook input[type='radio']").removeAttr('checked');
		$('.userLook input[name="gender"]:radio[value='+genderVal+']').attr('checked','true');
		var date1 = $(".userLook .birth").text();
		$('.userLook .birth').html("<input type='date' value='"+date1+"' />");
		var phone1 = $(".userLook .phone").text();
		$('.userLook .phone').html("<input type='text' value='"+phone1+"' />");
		var email1 = $(".userLook .email").text();
		$('.userLook .email').html("<input type='text' value='"+email1+"' />");

	});

	$(".saveUser").unbind('click').click(function(){
		var jsonObj = new Object();
		jsonObj.name =$('.userLook .name input').val();
		jsonObj.loginId =$('.userLook .loginId').text();
		jsonObj.gender =$('.userLook input[name="gender"]:checked').val();
		jsonObj.birth =$('.userLook .birth input').val();
		jsonObj.phone =$('.userLook .phone input').val();
		jsonObj.eMail =$('.userLook .email input').val();
		var isAdmin=$('.userLook .isAdmin').text();
		if(isAdmin=="普通用户"){
			isAdmin=0;
		}else{
			isAdmin=1;
		}
		jsonObj.isSystemuser =isAdmin;

		console.log(jsonObj);
		$.ajax({
			type:"POST",
			url:urlId+"/updateUserMessage",
			dataType:"json",
			contentType: "application/json",
			data:JSON.stringify(jsonObj),
			success:function(data){
				$.dialog('修改用户信息成功');
				console.log(data);
				refreshUser();
			}
		});
	});

	$(".cancelUser").unbind('click').click(function(){
		refreshUser();
	});

	$('.man4').unbind('click').click( function(){
		$('.module-data-navigation,.module-data-all,.manager-bodyer,.content,.center-table1,.center-table2,.power-detail,.user,.users-manage').hide();
		$('.dataManager,.business_logic').show();
	});

	//添加用户
	$('.addUser').unbind('click').click(function (e) {

		$('.mask').show();
		$('.userAdd input[type="text"]').val('');
		$('.userAdd input[type="password"]').val('');
		$(".userAdd input[name='gender']").removeAttr('checked');
		$(".userAdd input[name='isAdmin']").removeAttr('checked');
		$(".userAdd input[name='gender']:eq(0)").attr("checked",'checked');
		$(".userAdd input[name='isAdmin']:eq(0)").attr("checked",'checked');
		$('.add-user #birth').val("2000-01-01");
		$('.add-user').show();
	});

    window.addUser=function(){
    	var jsonObj = new Object();
		jsonObj.name =$('.userAdd .name').val();
		jsonObj.loginId =$('.userAdd .loginId').val();
		jsonObj.password =$('.userAdd .pwd').val();
		jsonObj.gender =$(".userAdd input[name='gender']:checked").val();
		jsonObj.birth =$('.userAdd #birth').val();
		jsonObj.phone =$('.userAdd .phone').val();
		jsonObj.eMail =$('.userAdd .email').val();
		jsonObj.isSystemuser =$(".userAdd input[name='isAdmin']:checked").val();
		console.log(jsonObj);
		$.ajax({
			type:"POST",
			url:urlId+"/register",
			dataType:"json",
			contentType: "application/json",
			data:JSON.stringify(jsonObj),
			success:function(data){
				$('.add-user').css("display","none");
				$('.mask').css("display","none");
				$('.addUser-table').css("display","block");
				$.dialog('新增用户成功');
				console.log(data);
				refreshUsersList(null);
			}
		});

    };

	//数据源管理页面---添加按钮
	$('.add2').unbind('click').click(function(){
		$('.add2-f').show();
		$('.mask').show();
		$('.add2-input').html('');
		$('.conAdd').html('');
		$.ajax({
			type:"POST",
			url:urlId+"/selectBusinessTypeAll",
			dataType:"json",
			success:function(data){
				$('#result').html('');
				var optionStr='';
				for(var i=0;i<data.length;i++){
					optionStr+='<option value="'+data[i].code+'">'+data[i].name+'</option>';
				}
				$('.add2-input').append('<tr><th>数据类型</th><td><select name = "sel" class="add2-sel" id="selectType" '
						+'onchange="show_detail(this);"><option  selected=""  value="0">- - - - - - Type</option>'+ optionStr +'</select></td></tr>');

			}
		});
	});
});

//save target



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

    //发布类型change事件
    $('#deployType').change(function(){
        var p1=$(this).children('option:selected').val();
        if(p1=='webservice'){
            $('.webservicePart').show();
            $('.dispatchPart').hide();
            //TODO
        }else if(p1=='dispatch'){
            $('.webservicePart').hide();
            $('.dispatchPart').show();
            //TODO
        }
    });

    //副本IDchange事件
    $('#idNameE').change(function(){
        var $valName=$(this).children('option:selected').val();
        if($valName=='None'){
            $('.settings').show();
            $('.saving').hide();
            //TODO
        }else if($valName!='None'){
            $('.settings').hide();
            $('.saving').show();
            //TODO
        }
    });


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

        //TODO
    }


    addList();
    //增加参数列表的每一列
    function addList() {
        $('.whiteContainer .plusBtn').unbind('click').click(function () {
            var new_obj = $("<li><span contenteditable='true'>0.0.0.1</span> <span contenteditable='true'>0.0.0.2</span><i class='closeL'></i></li></li>");
            $('.ipContainerA').append(new_obj);
            //参数列表的列
            delList();
        });
        $('.blockContainer .plusBtn').unbind('click').click(function () {
            var new_obj = $("<li><span contenteditable='true'>0.0.0.1</span> <span contenteditable='true'>0.0.0.2</span><i class='closeL'></i></li></li>");
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
    if (tar.tagName.toLowerCase() === 'p' && $(tar).hasClass('jobBtn')) {
        console.log('jobBtn~~~~');
        $('.jobList,.mask').show();
    }

    //deployRight 保存
    if (tar.tagName.toLowerCase() === 'span' && $(tar).hasClass('sureBtnEvent')) {
        console.log('sureBtnEvent~~~~');

        //TODO
    }
    //warningBtn controller resource has changed
    if (tar.tagName.toLowerCase() === 'i' && $(tar).hasClass('warningBtn')) {
        console.log('warningBtn~~~');
        $('.warningPart,.mask').show();
        //TODO
        warningBox();
    }

    //warningBox
    function warningBox(){
        $('.warningPart').unbind('click').click(function (e) {
            e = e || window.event;
            var tar = e.target || e.srcElement;
            var $checkedEle='';
            if (tar.tagName.toLowerCase() === 'i' && $(tar).hasClass('ovalIcon')) {
                $('.ovalIcon').removeClass('ovalIconed');
                $(tar).addClass('ovalIconed');
            }
            $checkedEle=$('.warningContent').find('.ovalIconed').parent().attr('class');
            if (tar.tagName.toLowerCase() === 'span' && $(tar).hasClass('cancel')) {
                $('.warningPart,.mask').hide();
            }
            if (tar.tagName.toLowerCase() === 'span' && $(tar).hasClass('sure')) {
                //TODO
                //console.log($(checkedEle).className);
                if($checkedEle=='newController'){
                    console.log('newController');
                    $('.newControllerPart,.mask').show();
                    newControllE();
                    $('.warningPart').hide();
                    $('.mask').show();
                }else {
                    $('.warningPart,.mask').hide();
                }
            }
        });
        //创建controller页面事件
        function newControllE(){
            $('.newControllerPart .single').unbind('click').click(function () {
                $('.single').removeClass('singleChecked');
                $(this).addClass('singleChecked');
            });
            $('.newControllerPart .closeA').unbind('click').click(function () {
                $('.newControllerPart,.mask').hide();
            });
            $('.newControllerPart .cancel').unbind('click').click(function () {
                $('.newControllerPart,.mask').hide();
            });
            $('.newControllerPart .sure').unbind('click').click(function () {
                $('.newControllerPart,.mask').hide();
                //TODO
            });
        }
    }

});

//Job List
$('.jobList .closeA').unbind().click(function(){
    $('.jobList,.mask').hide();
});
//确定按钮
$('.jobList .sureC').unbind().click(function(){
    //TODO
    $('.jobList,.mask').hide();
});
//取消按钮
$('.jobList .closeC').unbind().click(function(){
    //TODO
    $('.jobList,.mask').hide();
});
$('.jobList .killBtn').unbind().click(function(){
    console.log('kill~~~~~');
    //TODO
});

//controllDeployEvent end

//下拉框变化显示不同table
function show_detail(obj){
	var opt = obj.options[obj.selectedIndex];
	dbtype=opt.value;
	$.ajax({
		type:"POST",
		url:urlId+"/selectBusinessEnumByBusinessType",
		data:{
			businessType: opt.value
		},
		success:function(data){
			$('.conAdd').html('');
			if(data){
				data = JSON.parse(data);
				if(data.length == 0){
					return ;
				}
				var conAddStr='<tr><th><input type="hidden" value="数据连接名">数据连接名</th><td><input type="text" id="conName"></td></tr>';
				for(var i=0;i<data.length;i++){
					var str = data[i].code;
					if(str.indexOf("pwd")>=0){
						conAddStr+='<tr><th><input type="hidden" value="'+data[i].code+'">'+ data[i].name+'</th><td><input type="password"/></td>';
					}else{
						conAddStr+='<tr><th><input type="hidden" value="'+data[i].code+'">'+ data[i].name+'</th><td><input type="text"/></td>';
					}
				}
				$('.conAdd').append(conAddStr);
			}
		}
	});
}

//添加数据源----保存按钮
function addConnection(){
	var powerArray = new Array();
	var tableAdd=$('.conAdd').find(':text');
	var password=$('.conAdd').find(':password');
	var thAdd=$('.conAdd').find(':hidden');
	for(var i=1;i<tableAdd.length+1;i++){
		var Obj = new Object();
		var str = $('.add2-f .conAdd').find(':hidden')[i];
		if(dbtype!='hdfs'){
			if($(str).val().indexOf("pwd")>=0){
				Obj.name = thAdd.eq(i).val();
				Obj.value = password.val();
			}else{
				Obj.name = thAdd.eq(i).val();
				Obj.value = tableAdd.eq(i).val();
			}
		}else{
			Obj.name = thAdd.eq(i).val();
			Obj.value = tableAdd.eq(i).val();
		}
		powerArray.push(Obj);
		console.log(powerArray);
	}
	var jsonObj = new Object();
	jsonObj.connectionName =$('#conName').val();
	jsonObj.uid =userId ;
	jsonObj.powerArray=powerArray;
	jsonObj.dbtype = dbtype;
	console.log(jsonObj);
	var flag =addConValidation();
	if(!flag){
		$.hideLoading();
		return;
	}
	$.ajax({
		type:"POST",
		url:urlId+"/addDataconnection",
		dataType:"json",
		contentType: "application/json",
		data:JSON.stringify(jsonObj),
		success:function(data){
			$('.add2-f').css("display","none");
			$('.mask').css("display","none");
			$('#table2').css("display","block");
			$.dialog('新增成功！');
			goDatasource(userId,null);
		}
	})
}
//添加数据源----测试按钮
function testConnection(){
	$.showLoading();
	var testArray = new Array();
	var tableTest=$('.add2-f .conAdd').find(':text');
	var password=$('.conAdd').find(':password');
	var thTest=$('.add2-f .conAdd').find('input:hidden');
	if(dbtype!='hdfs' && dbtype!='hbase'){
		for(var i=1;i<tableTest.length+1;i++){
			var Obj = new Object();
			var str = $('.add2-f .conAdd').find(':hidden')[i];
			if($(str).val().indexOf("pwd")>=0){
				Obj.name = thTest.eq(i).val();
				Obj.value = password.val();
			}else{
				Obj.name = thTest.eq(i).val();
				Obj.value = tableTest.eq(i).val();
			}
			testArray.push(Obj);
		}
	}else{
		for(var i=1;i<tableTest.length;i++){
			var Obj = new Object();
			var str = $('.add2-f .conAdd').find(':hidden')[i];
			Obj.name = thTest.eq(i).val();
			Obj.value = tableTest.eq(i).val();
			testArray.push(Obj);
		}
	}
	var jsonObj = new Object();
	jsonObj.powerArray=testArray;
	jsonObj.dbtype = dbtype;
	jsonObj.isAdd = 1;
	console.log(jsonObj);
	var flag =addConValidation();
	if(!flag){
		$.hideLoading();
		return;
	}
	$.ajax({
		type:"POST",
		url:urlId+"/testConnection",
		dataType:"json",
		contentType: "application/json",
		data:JSON.stringify(jsonObj),
		success:function(data){
			$('#result').html('');
			if(data==true){
				$('#result').append("连接成功");
			}else{
				$('#result').append("连接失败");
			}
			$.hideLoading();
		},
		error:function(){
			$('#result').html('');
			$.dialog("连接异常");
			$.hideLoading();
		}
	})
}
function addConValidation(){
	var conTy = $('.add2-sel').val();
	if(conTy != 'hdfs' && conTy!=0){
		var ipVal = $($('.conAdd input:text')[1]).val();
		var str = ipVal.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/g);
		var portVal = $($('.conAdd input:text')[2]).val();
		var regPort = /^(\d)+$/g;
	}

	if(conTy==0){
		$.dialog("请选择数据连接类型");
		return null;
	}else if(conTy != 'hdfs' && (ipVal!= '' && str==null) || RegExp.$1>255 || RegExp.$2>255 || RegExp.$3>255 || RegExp.$4>255){
		$.dialog("IP格式不正确！");
		return null;
	}else if(conTy != 'hdfs' && !regPort.test(portVal) || parseInt(portVal)>65535 || parseInt(portVal)<0){
		$.dialog("端口号格式不正确！");
		return null;
	}else if($('.conAdd input:password').val()==''){
		$.dialog("您有内容没有填写，请认真检查！");
		return null;
	}
	for(var i=0;i<$('.conAdd input:text').length;i++){
		if($($('.conAdd input:text').get(i)).val()==''){
			$.dialog("您有内容没有填写，请认真检查！");
			return null;
		}
	}
	return true;
}
//数据连接回车搜索--完成BUG-34
$('#itemValue2').keydown(function(e){
	if(e.keyCode==13){
		searchItem2(); //处理事件
	}
	});
function searchItem2(){
	var str = $('#itemValue2').val().replace(/\s+/g, "");
	var user = userId;
	his2.add(str,str,str);
	$('#searchInfo2').empty();
	var data = his2.getList();
	if(data!=null){
		for(var i =data.length-1;i>=0;i--){
			$('#searchInfo2').prepend('<li class="history2">'+data[i].title+'</li>');
		}
	}
	goDatasource(user,str);

}

$('#itemValueUsers').keydown(function(e){
	if(e.keyCode==13){
		searchItemUsers(); //处理事件
	}
});
function searchItemUsers(){
	var str = $('#itemValueUsers').val().replace(/\s+/g, "");
	his4.add(str,str,str);
	var data = his4.getList();
	$('#searchInfoUsers').empty();
	if(data!=null){
		for(var i =data.length-1;i>=0;i--){
			$('#searchInfoUsers').prepend('<li class="history4">'+data[i].title+'</li>');
		}
	}
	refreshUsersList(str);
}

function goDatasource(userId,content){
	$('.module-data-navigation,.module-data-all,.manager-bodyer,.content,.center-table1,.power-detail,.user,.users-manage,.business_logic').hide();
    $('.dataManager,.center-table2').show();
    $('.task,#manag').hide();

	$('#table2').html('');
	if(content!=null){
		url=urlId+"/selectByUserIdLikeName";
		data={userId: userId,content:content}
	}else{
		url=urlId+"/selectDataConnection";
		data={userId: userId}
	}
	$.ajax({
		type:"POST",
		url:url,
		dataType:"json",
		data:data,
		success:function(data){
			$('#table2').append('<tr class="firTr"><th>数据库类型</th><th>数据连接名称</th><th>主机地址</th><th>创建时间</th><th>修改时间</th><th class="w100" style="padding-left: 31px;">更多操作</th></tr>');
			for(var i=0 ;i<data.length ; i++){
				var createTime = formatDateTime(new Date(data[i].CREATE_TIME));
				if(data[i].UPDATE_TIME!=null){
					var updateTime = formatDateTime(new Date(data[i].UPDATE_TIME));
				}else{
					var updateTime = '';
				}

				if(powerConjunction(data[i].POWER,powerEnum2[0])&&powerConjunction(data[i].POWER,powerEnum2[1])){
				$('#table2').append('<tr name="powerData" class="borderRight"><td>'+data[i].SOURCE_TYPE+'</td><td value="'+data[i].NAME+'">'+data[i].NAME+'</td><td>'
						+data[i].IP+'</td><td>'+createTime+'</td><td>'+updateTime+'</td>'
						+'<td class="w100" style="width:130px;">'
						+'<span style="margin-left:13px;" class="look" title="查看" data-id=' + data[i].ID +' data-name='+data[i].NAME+ '>'
						+'</span>'
						+'<span class="power" title="权限管理" data-id=' + data[i].ID + '>'
						+'</span>'
						+'<span class="delete" title="删除" data-id=' + data[i].ID + '>'
						+'</span></td></tr>');
				}
			}
            goPage(1,pageSize,'table2','barcon2');
            $($('.table2 th')).each(function(index,item){$(item).css('width',($('.table2').width()-$('.table2').width()*0.08)/5)});
             $($('.table2 td')).each(function(index,item){$(item).css('width',($('.table2').width()-$('.table2').width()*0.08)/5)});
             $('.table2 .w100').each(function(index,item){$(item).css('width',$('.table2').width()*0.08)});
			//查看按钮
			$('.look').unbind('click').click(function(){
				$('.look-input').html('');
				$('.lookTable').html('');
				$('.look-button').show();
				$('#result1').empty();
				$('.edit-button').hide();
				var conId = $(this).data('id');
				var conName = $(this).data('name');
				$('.look-detail').show();
				$('.task').hide();
				$('.mask').show();

				$.ajax({
					type:"POST",
					url:urlId+"/selectValueById",
					dataType:"json",
					data:{
						id: conId
					},
					success:function(shuju){
						console.log(shuju);
						var length=shuju.businessEnum.length;
						$('.look-input').append('<tr><th>数据库类型</th><td data-code="'+shuju.businessType.code+'">'+ shuju.businessType.name+'</td></tr>');
						$('.lookTable').append('<tr><th><input type="hidden" value="数据连接名">数据连接名</th><td>'+ conName+'</td></tr>');
						for(var i=0;i<length;i++){
							var str = shuju.businessEnum[i].code;
							if(str.indexOf("pwd")>=0){
								$('.lookTable').append('<tr class="pwdShow"><th><input type="hidden" value="'+shuju.businessEnum[i].code+'">'+shuju.businessEnum[i].name+'</th><td>'+ shuju.dataConnectEnumValue[i].value+'</td></tr>');
								$('.pwdShow').hide();
							}else{
								$('.lookTable').append('<tr><th><input type="hidden" value="'+shuju.businessEnum[i].code+'">'+shuju.businessEnum[i].name+'</th><td>'+ shuju.dataConnectEnumValue[i].value+'</td></tr>');
							}
						}
						//查看页面测试按钮
						$('.test2').unbind().click(function(){
							$.showLoading();
							var powerArray = new Array();
							var conType = $('.look-input td').data('code');
							var tableLook=$('.lookTable').find('td');
							var thEdit=$('.lookTable').find(':hidden');
							for(var i=1;i<tableLook.length;i++){
								var Obj = new Object();
								if(i== tableLook.length-1){
									Obj.name = $(thEdit[i]).find('input:hidden').val();
									Obj.value = tableLook.eq(i).text();
								}else{
									Obj.name = thEdit.eq(i).val();
									Obj.value = tableLook.eq(i).text();
								}


								powerArray.push(Obj);
							}
							var jsonObj = new Object();
							jsonObj.powerArray=powerArray;
							jsonObj.dbtype = conType;
							jsonObj.isAdd = 0;
							console.log(jsonObj);
							$.ajax({
								type:"POST",
								url:urlId+"/testConnection",
								contentType: "application/json",
								data:JSON.stringify(jsonObj),
								success:function(data){
									console.log(data);
									$('#result1').html('');
									if(data=='true'){
										$('#result1').append("连接成功");
									}else{
										$('#result1').append("连接失败");
									}
									$.hideLoading();
								},
								error:function(){
									$('#result1').html('');
									$.dialog("连接异常");
									$.hideLoading();
								}
							})
						});
						//查看页面编辑按钮
						$('.edit2').unbind('click').click(function(){
							$('.pwdShow').show();
							$('.mask').show();
							$('#result2').empty();
							$('.edit-button').show();
							$('.look-button').hide();
							$('.lookTable tr td').empty();
							$('.look-detail .h4 span').html('编辑');
							$($('.lookTable tr td')[0]).append($('<input  value='+ conName+' />'));
							for(var i=1;i<$('.lookTable tr td').length;i++){
								var str = $('.lookTable').find(':hidden')[i];
								if($(str).val().indexOf("pwd")>=0){
									$($('.lookTable tr td')[i]).append($('<input type="password" class="password" value='+ shuju.dataConnectEnumValue[i-1].value+' />'));
								}else{
									$($('.lookTable tr td')[i]).append($('<input type="text" value='+ shuju.dataConnectEnumValue[i-1].value+' />'));
								}
							}
							$(".add2-table2 input:text").unbind('click').click(function(){
							    $(this).select();
							});
							//编辑页面保存按钮
							$('.edit-save').unbind('click').click(function(){
								var powerArray = new Array();
								var conType = $('.look-input td').data('code');
								var tableEdit=$('.lookTable').find(':text');
								var password=$('.lookTable').find('input.password');
								var thEdit=$('.lookTable').find(':hidden');
								for(var i=1;i<tableEdit.length+1;i++){
									var Obj = new Object();
									var str = $('.lookTable').find(':hidden')[i];
									if($(str).val().indexOf("pwd")>=0){
										Obj.name = thEdit.eq(i).val();
										Obj.value = password.val();
									}else{
										Obj.name = thEdit.eq(i).val();
										Obj.value = tableEdit.eq(i).val();
									}
									powerArray.push(Obj);
								}
								var jsonObj = new Object();
								jsonObj.conType=conType;
								jsonObj.connectionName =$($(".lookTable tr td input")[0]).val();
								jsonObj.id =conId ;
								jsonObj.enumArray=powerArray;
								var oldPwd = $('.lookTable input[type="password"]').attr("value");
								var newPwd = $('.lookTable input[type="password"]').val();
								if(oldPwd == newPwd){
									jsonObj.isUpdate = 0;
								}else{
									jsonObj.isUpdate = 1;
								}
								$.ajax({
									type:"POST",
									url:urlId+"/upDateDataConnection",
									dataType:"json",
									contentType: "application/json",
									data:JSON.stringify(jsonObj),
									success:function(data){
										//修改之后刷新--完成BUG-64
										goDatasource(userId,null);
										var currentPage=$('.center-table2 .numPage.active').text();
										goPage(currentPage,pageSize,'table2','barcon2');

										$('.look-detail').hide();
										$('.mask').hide();
										$.dialog('修改成功！');
									}
								});
							});
							//编辑页面测试按钮
							$('.edit-test').unbind('click').click(function(){
								$.showLoading();
								var powerArray = new Array();
								var conType = $('.look-input td').data('code');
								var tableEdit=$('.lookTable').find(':text');
								var password=$('.lookTable').find('input.password');
								var thEdit=$('.lookTable').find(':hidden');
								for(var i=1;i<tableEdit.length+1;i++){
									var Obj = new Object();
									var str = $('.lookTable').find(':hidden')[i];
									if($(str).val().indexOf("pwd")>=0){
										Obj.name = thEdit.eq(i).val();
										Obj.value = password.val();
									}else{
										Obj.name = thEdit.eq(i).val();
										Obj.value = tableEdit.eq(i).val();
									}

									powerArray.push(Obj);
								}
								var jsonObj = new Object();
								jsonObj.powerArray=powerArray;
								jsonObj.dbtype = conType;

								var oldPwd = $('.lookTable input[type="password"]').attr("value");
								var newPwd = $('.lookTable input[type="password"]').val();
								if(oldPwd == newPwd){
									jsonObj.isAdd = 0;
								}else{
									jsonObj.isAdd = 1;
								}
								console.log(jsonObj);
								$.ajax({
									type:"POST",
									url:urlId+"/testConnection",
									contentType: "application/json",
									data:JSON.stringify(jsonObj),
									success:function(data){
										console.log(data);
										$('#result2').html('');
										if(data=='true'){
											$('#result2').append("连接成功");
										}else{
											$('#result2').append("连接失败");
										}
										$.hideLoading();
									},
									error:function(){
										$('#result2').html('');
										$.dialog("连接异常");
										$.hideLoading();
									}
								})
							})
						});
					}
				});
			});

			//点击删除
			$('.delete').unbind('click').click(function(){
				var $this = $(this);
				var cid = $(this).data('id');
				var uid = userId;
				$.confirm('确认删除该数据连接吗？', function(){
					$.ajax({
						type:"POST",
						url:urlId+"/deleteDataConnection",
						dataType:"json",
						data:{
							cid:cid,
							uid:uid
						},
						success:function(data){
							$this.parent().parent().remove();
							//re-layer
							var currentPage=$('.center-table2 .numPage.active').text()
							//重新进行分页以达到刷新的目的--完成BUG-40
							goPage(currentPage,pageSize,'table2','barcon2');
						}
					});
				})
			});
			//权限管理
			$('.power').unbind('click').click(function(){
				$('#itemValue3').val('');
				conId = $(this).data('id');
				powerList(conId,null);
				var data = his3.getList();
				$('#searchInfo3').empty();
				if(data!=null){
				 for(var i =data.length-1;i>=0;i--){
					$('#searchInfo3').prepend('<li class="history3">'+data[i].title+'</li>');
				}
				}
			});

			//权限管理页面保存按钮
			window.savePower2 = function(){
				var powerArray = new Array();
				var username= userName;
				console.log('长度'+signArray2.length);
				for(var i=0;i<signArray2.length;i++){
					var id = signArray2[i];
					var powerStr = "0b";
					$("#cuserPower"+id).find("i[name='checkbox']").each(
							function(){
								 if($(this).hasClass('singleChecked')){
									powerStr+="1";
								}else{
									powerStr+="0";
								}
							}
					);
					var isAdd = $("#cuserPower"+id).attr("isadd");
					//console.log(powerStr);
					var Obj = new Object();
					Obj.conId=conId;
					Obj.username=username;
					Obj.userId=id;
					Obj.power=powerStr;
					Obj.isadd=isAdd;
					powerArray.push(Obj);
				}
				var jsonObj = new Object();
				jsonObj.powerArray=powerArray;
				console.log(JSON.stringify(jsonObj));
				$.ajax({
					url:urlId+'/updateConnectionPower',
					type:'POST',
					dataType:"json",
					contentType: "application/json",
					data:JSON.stringify(jsonObj),
					success:function(data) {
						for(var i=0;i<signArray2.length;i++){
							var id = signArray2[i];
							if(data[i]!='3'){
								if(data[i]=='2'){
									$("#cuserPower"+id).attr("isadd","1");
								}else{
									$("#cuserPower"+id).attr("isadd","0");
								}
							}
						}
						//及时修改当前用户该菜单的权限
						var currentUserPowerStr = "0b";
						var currentUserId = userId;
						$("#cuserPower"+currentUserId).find("i[name='checkbox']").each(
								function(){
									 if($(this).hasClass('singleChecked')){
										currentUserPowerStr+="1";
									}else{
										currentUserPowerStr+="0";
									}
								}
						);
						//清空signArray
						signArray2 = [];
						$.dialog("修改成功！");
					},
					error : function() {
						//清空signArray
						signArray2 = [];
						$.dialog("异常！");
					}
				})

			};
			//工具类方法：标记被选中过的条目id，该id也恰好是userId
			window.signClick = function(id){
				if(signArray2.indexOf(id)==-1){
					signArray2.push(id);
				}
			};
			//工具类方法：校验菜单权限
			window.powerConjunction = function(power,powerTarget){
				var result = power&powerTarget;
				if(result==powerTarget){
					return true;
				}else{
					return false;
				}
			};

		}
	});
}

//数据连接权限管理回车搜索--完成BUG-43
$('#itemValue3').keydown(function(e){
	if(e.keyCode==13){
		searchItem3(); //处理事件
	}
	});

function searchItem3(){
	var str = $('#itemValue3').val().replace(/\s+/g, "");
	powerList(conId,str);
	his3.add(str,str,str);
	var data = his3.getList();
	$('#searchInfo3').empty();
	if(data!=null){
	 for(var i =data.length-1;i>=0;i--){

		$('#searchInfo3').prepend('<li class="history3">'+data[i].title+'</li>');
	}
	}
}
function powerList(conId,content){
	$('.power-detail').show();
	$('.center-table2').hide();
	if(content!=null){
		url=urlId+"/selectByConIdLike";
		data={conId: conId,content:content,userId:userId}
	}else{
		url=urlId+"/selectUserPowerByConId";
		data={conId: conId,userId: userId}
	}
	$.ajax({
		type:"POST",
		url:url,
		dataType:"json",
		data:data,
		success:function(data){
			var tablestr="";
			for(var i=0 ;i<data.length ; i++){
				var power = data[i].POWER;
				var checkboxStr = "";
				for(var j=0;j<powerEnum2.length;j++){
					if(j==0){
						if(powerConjunction(power,powerEnum2[0])){
							checkboxStr+='<td class="w50" ><i name=checkbox class="use single singleChecked"></i>';
						}else{
							checkboxStr+='<td class="w50"><i name=checkbox class="use single"></i>';
						}
					}else{
					if(powerConjunction(power,powerEnum2[j])){
						checkboxStr+='<td class="w50" ><i name=checkbox class="single singleChecked"></i>';
					}else{
						checkboxStr+='<td class="w50"><i name=checkbox class="single"></i>';
					}
					}
				}
				var createTime = formatDateTime(new Date(data[i].CREATE_DATA));
				if(data[i].UPDATE_DATA!=null){
					var updateTime = formatDateTime(new Date(data[i].UPDATE_DATA));
				}else{
					var updateTime = '';
				}
				//1是add，0是update
				var isAdd = 0;
				if(!power){
					isAdd = 1;
				}
				tablestr+='<tr class="borderRight" id = "cuserPower'+data[i].ID+'" isadd="'+isAdd+'" name="powerData" style="display: block;" onclick="signClick('+data[i].ID+');">'
				+'<td value="'+data[i].NAME+'">'+data[i].NAME+'</td>'
				+'<td  value="'+data[i].LOGIN_ID+'">'+data[i].LOGIN_ID+'</td>'
				+'<td>'+data[i].E_MAIL+'</td><td>'
				+createTime+'</td><td>'+updateTime+'</td>'
				+checkboxStr+'</tr>';
			}
			$("#table3 tr[name='powerData']").remove();
			$('#table3').append($(tablestr));
            $($('#table3 td')).each(function(index,item){$(item).css('width',$('.table3').width()/5)-$('.table3').width()*0.16});
            $($('#table3 th')).each(function(index,item){$(item).css('width',$('.table3').width()/5)-$('.table3').width()*0.16});
            $('#table3 .w50').each(function(index,item){$(item).css('width',$('.table3').width()*0.08)});
			goPage(1,pageSize,'table3','barcon3');
		},
		error : function() {
			$.dialog("异常！");
		}
	});
}

function selectSaveTargetBynodeId(nodeId){
	nodesaveId = nodeId;
	$.ajax({
		type:"POST",
		url:urlId+'/selectNodeSaveTargetAndValue',
		dataType:"json",
		data:{nodeId:nodeId},
		success:function(data){
			$('.targets').empty();
			$(data).each(function (index, item) {
				var saverel = new Object();
				saverel.conId = item.conId;
				saverel.savetable = item.savetable;
				saverel.mode = item.mode;
				saverel.nstrId = item.nstrId;
				var targetId=item.nstrId;
				saveTargetMap[targetId]=saverel;
				var dom = $('<div class="target" data-id="'+item.nstrId+'"><label>'+item.savetable+'</label><span class="edit"><i class="fa fa-pencil-square-o"></i></span> <span class="trash2"><i class="fa fa-trash2"></i></span></div>');
				$('.targets').append(dom);
			});
			edittest();
		}
	});
}

var fileName = '';
var flag = false;
function generateFun(power, domCls,menutype){
	var id = '123456';
	$('#dropdown-' + id).remove();
	var addAuth = powerConjunction(power,powerEnum[0]);
	var deleteAuth = powerConjunction(power,powerEnum[1]);
	var modifyAuth = powerConjunction(power,powerEnum[2]);
	var readAuth = powerConjunction(power,powerEnum[3]);
	var grentAuth = powerConjunction(power,powerEnum[4]);
	var release = false;
	if(menutype==0){
		var sourceLook = true;
		var sourceDel = true;
	}

	if(menutype==2){
		release = true;
	}else{
		if(power=="0b00010"||power=="0b00011"){
			return;
		}
	}

	context.init({preventDoubleContext: false});
	context.attach(domCls, [
	    {text: '发布', auth: release, action:function(e){
	    	e.preventDefault();
	    	console.log('发布controller');
            if($('.flows').hasClass('header_active')){
                $('.module-data-right-navigation').show();
            }
            var dataType=6;
            var idName=$currentRightDom.attr('id');
            var fileName = ($currentRightDom.children('span').html()+'发布');
            tabCheck(idName, dataType, fileName);
            var controllerId = $('li.thistab').attr('conId');
	    }},
        {text: '添加', auth: addAuth, subMenu:[
            {text:'添加文件夹',auth: addAuth, action:function(e){
                e.preventDefault();
                console.log('添加文件夹');
                var folderName = '新建文件夹';
                returnFileName(folderName,$currentRightDom.attr("id"),userId);
                folderName = fileName;
                addMenu($currentRightDom.attr("id"),menuTypeEnum[0],folderName);
            }},
            {text:'添加逻辑流',auth: addAuth, action:function(e){
                e.preventDefault();
                console.log('添加逻辑流');
                var folderName = '新建逻辑流';
                returnFileName(folderName,$currentRightDom.attr("id"),userId);
                folderName = fileName;
                addMenu($currentRightDom.attr("id"),menuTypeEnum[2],folderName);
            }},
            {text:'添加报表',auth: addAuth, action:function(e){
                e.preventDefault();
                console.log('添加BI');
                var folderName = '新建报表';
                returnFileName(folderName,$currentRightDom.attr("id"),userId);
                folderName = fileName;
                addMenu($currentRightDom.attr("id"),menuTypeEnum[4],folderName);
            }},
            {text:'添加挖掘模型',auth: addAuth, action:function(e){
                e.preventDefault();
                console.log('添加DataMining');
                var folderName = '新建挖掘模型';
                returnFileName(folderName,$currentRightDom.attr("id"),userId);
                folderName = fileName;
                addMenu($currentRightDom.attr("id"),menuTypeEnum[3],folderName);
            }},
            {text:'添加控制器',auth: addAuth, action:function(e){
                e.preventDefault();
                console.log('添加Controller');
                var folderName = '新建控制器';
                returnFileName(folderName,$currentRightDom.attr("id"),userId);
                folderName = fileName;
                addMenu($currentRightDom.attr("id"),menuTypeEnum[1],folderName);
            }}
        ]},
        {text: '删除', auth: deleteAuth, action:function(e){
            e.preventDefault();
            console.log('删除当前文件（夹）');
            //modified by tyd
            var menuId = $currentRightDom.attr("id");
            var menuType = $currentRightDom.attr("menuType");
            deleteMenu(menuId,menuType);
        }},
        {text: '重命名', auth: modifyAuth, action:function(e){
            e.preventDefault();
            console.log('重命名当前文件（夹）');
            //modified by tyd
            if($currentRightDom){
                var text = $currentRightDom.children().last().text();
                $currentRightDom.children().last().remove();
                $currentRightDom.append($('<input type="text" value="'+ text + '" />'));
                $('.folder input').select();

                $('.folder input').unbind('keydown').keydown(function(e){
                    if (e.keyCode == "13") {//keyCode=13是回车键
                    	resetFolder();
                    }
                });
            }
        }},
        {text: '查看源数据',auth:sourceLook, action:function(e){
             e.preventDefault();
             var sourceId = $currentRightDom.attr("sourceid");
             var is_interface = $currentRightDom.attr("is_interface");
             lookSouceData(sourceId,is_interface)
         }},
         {text: '删除',auth:sourceDel, action:function(e){
              e.preventDefault();
              var sourceId = $currentRightDom.attr("sourceid");
              deleteSourceData(sourceId);
         }}
    ], id);
	context.attach('.module-data-navigation', [
	     {header: '请选中文件，文件夹或者home'}
	]);
}

function returnFileName(name,id,userid){
	$.ajax({
		type:"POST",
		url:urlId+"/returnFileName",
		dataType:"json",
		async:false,
		data:{
			name:name,
			pid:id,
			userid:userid
			},
		success:function(data){
			fileName = data;
			return fileName;
		},
		error : function() {
			$.dialog("异常！");
			return null;
		}
	})
}
function nameIsExist(name,mid,id,userid,type){
	$.ajax({
		type:"POST",
		url:urlId+"/nameIsExist",
		dataType:"json",
		async:false,
		data:{
			name:name,
			mid:mid,
			pid:id,
			userid:userid,
			menuType:type
			},
		success:function(data){
			flag = data;
			return flag;
		},
		error : function() {
			$.dialog("异常！");
			return null;
		}
	})
}

function deleteSourceData(sourceId){
	var nodes = _jm1.mind.nodes;
	var node = null;
	var nodes_array = new Array();
	for(var nodeid in nodes){
		node = nodes[nodeid];
		if(node.data.sourceid==sourceId){
			nodes_array.push(node);
		}
	}
	if(nodes_array.length>0){
		$.confirm('数据源已被引用，确定要继续删除吗？', function(){
			deleteSourceData_(sourceId,nodes_array);
		});
	}else{
		deleteSourceData_(sourceId);
	}
}

function deleteSourceData_(sourceId,nodes_array){
	$.ajax({
		type:"POST",
		url:urlId+"/deleteSourceData",
		dataType:"json",
		data:{sourceId:sourceId},
		success:function(data){
			tableColumnsMap.remove(sourceId);
			var element = $('#_source_add li[sourceid="'+sourceId+'"]');
			var pconId = element.parent().parent().attr('conId');
			var sourceDatas = sourceDatasMap.get(flowId_global);
			if(element.parent().children().length==1){
				element.parent().parent().remove();
				var dataArray = $.grep( sourceDatas, function(n,i){
					   return n.conId!=pconId;
				});
				sourceDatasMap.put(flowId_global,dataArray);
			}else{
				element.remove();
				$.each(sourceDatas,function(index,item){
					while(item.conId==pconId){
						var sub_array = item.sdList;
						var dataArray = $.grep( sub_array, function(n,i){
							   return n.id!=sourceId;
						});
						item.sdList = dataArray;
						break;
					}
				});
			}
			$.each(nodes_array,function(index,item){
				_jm1.remove_node(item);
			});
		},
		error : function() { 
			$.dialog("删除数据源异常！"); 
		}  
	});
}

function lookSouceData(sourceId,is_interface){
	var column = new Array();
	var datainfo = new Array();
	$('.columnSd').show();
	$('.mask').show();
	$('.columnSd .closeA,.columnSd .closeC').unbind('click').on('click',function(){
        $('.columnSd').hide();
        $('.mask').hide();
    });
	$.showLoading();
	$.ajax({
		type:"POST",
		url:urlId+"/selectSourceDataBySourceId",
		dataType:"json",
		data:{sourceId:sourceId,isInterface:is_interface},
		success:function(data){
			$.hideLoading();
			$('.tableSd').empty();
			column = data.columnName;
			datainfo = data.info;
			$('.tableSd').append("<tr class='contentTitle'>");
			for(var i=0;i<column.length;i++){
				$('.tableSd .contentTitle').append('<th>'+column[i].name+'</th>');
			}
			$('.tableSd .contentTitle').append("</tr>");
			for(var j=0; j<datainfo.length; j++){
				$('.tableSd').append("<tr class='sdTd"+j+"'>");
				for(var i=0;i<datainfo[j].length;i++){
					var newData = '';
					if(datainfo[j][i]!=null){
						if(column[i].type.toLowerCase()=="DATETIME".toLowerCase()){
							newData = formatDateTime(new Date(datainfo[j][i]));
						}else if(column[i].type.toLowerCase()=="DATE".toLowerCase()){
							newData = new Date(datainfo[j][i]).toLocaleDateString();
						}else{
							newData = datainfo[j][i];
						}
					}else{
						newData = '';
					}
					$(".tableSd .sdTd"+j+"").append('<td>'+newData+'</td>');
				}
				$('.tableSd .sdTd').append('</tr>');
			}
		},
		error : function() {
			$('.tableSd').empty();
			$.dialog("读取数据异常！");
			$.hideLoading();
		}
	})
}



//搜索框
$('body').unbind('click').click(function (e) {
    e = e || window.event;
    var tar = e.target || e.srcElement;
    //目录管理搜索框
    if(tar.id == 'itemValue'){
    	$('#searchInfo').show();
    }
    if (tar.tagName.toLowerCase() === 'li' && $(tar).hasClass('history1')) { 
    	$('#itemValue').val($(tar).text());
    	$('#searchInfo').hide();
    	var str = $('#itemValue').val();
    	UserPowerList(selectedMenuId,mType,str);
    }
    //数据连接管理搜索框
    if(tar.id == 'itemValue2'){
    	$('#searchInfo2').show();
    } 
    if (tar.tagName.toLowerCase() === 'li' && $(tar).hasClass('history2')) {
    	$('#itemValue2').val($(tar).text());
    	$('#searchInfo2').hide();
    	var str = $('#itemValue2').val();
    	goDatasource(userId,str);
    }
    //数据连接权限管理搜索框
    if(tar.id == 'itemValue3'){
    	$('#searchInfo3').show();
    } 
    if (tar.tagName.toLowerCase() === 'li' && $(tar).hasClass('history3')) {
    	$('#itemValue3').val($(tar).text());
    	$('#searchInfo3').hide();
    	var str = $('#itemValue3').val();
    	powerList(conId,str);
    }
    //用户管理搜索框
    if(tar.id == 'itemValueUsers'){
    	$('#searchInfoUsers').show();
    } 
    if (tar.tagName.toLowerCase() === 'li' && $(tar).hasClass('history4')) {
    	$('#itemValueUsers').val($(tar).text());
    	$('#searchInfoUsers').hide();
    	var str = $('#itemValueUsers').val();
    	refreshUsersList(str);
    }
    if(tar.id != 'itemValue' && tar.tagName.toLowerCase() != 'li'){
    	$('#searchInfo').hide();
    }
    if(tar.id != 'itemValue2' && tar.tagName.toLowerCase() != 'li'){
    	$('#searchInfo2').hide();
    }
    if(tar.id != 'itemValue3' && tar.tagName.toLowerCase() != 'li'){
    	$('#searchInfo3').hide();
    }
    if(tar.id != 'itemValueUsers' && tar.tagName.toLowerCase() != 'li'){
    	$('#searchInfoUsers').hide();
    }
});



/**
 * History
 * @author yulipu
 */
 function History(key) {
    this.limit = 10;  // 最多10条记录
    this.key = key || 'y_his';  // 键值
    this.jsonData = null;  // 数据缓存
    this.cacheTime = 24;  // 24 小时
    this.path = '/';  // cookie path
 }
 History.prototype = {
    constructor : History
    ,setCookie: function(name, value, expiresHours, options) {
        options = options || {};
        var cookieString = name + '=' + encodeURIComponent(value);
        //判断是否设置过期时间
        if(undefined != expiresHours){
            var date = new Date();
            date.setTime(date.getTime() + expiresHours * 3600 * 1000);
            cookieString = cookieString + '; expires=' + date.toUTCString();
        }
        
        var other = [
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join('');
        
        document.cookie = cookieString + other; 
    }
    ,getCookie: function(name) {
        // cookie 的格式是个个用分号空格分隔
        var arrCookie = document.cookie ? document.cookie.split('; ') : [],
            val = '',
            tmpArr = '';
            
        for(var i=0; i<arrCookie.length; i++) {
            tmpArr = arrCookie[i].split('=');
            tmpArr[0] = tmpArr[0].replace(' ', '');  // 去掉空格
            if(tmpArr[0] == name) {
                val = decodeURIComponent(tmpArr[1]);
                break;
            }
        }
        return val.toString();
    }
    ,deleteCookie: function(name) {
        this.setCookie(name, '', -1, {"path" : this.path});
    }
    ,initRow : function(title, link, other) {
        return '{"title":"'+title+'", "link":"'+link+'", "other":"'+other+'"}';
    }
    ,parse2Json : function(jsonStr) {
        var json = [];
        try {
            json = JSON.parse(jsonStr);
        } catch(e) {
            json = eval(jsonStr);
        }
        
        return json;
    }
    
    // 添加记录
    ,add : function(title, link, other) {
    	var jsonStr = this.getCookie(this.key);
        //TODO
    	console.log(link);
    	title = title.replace(/\s+/g, "");
        link = link.replace(/\s+/g, "");
        other = other.replace(/\s+/g, "");
        console.log(link);
        if(title==""){
        	return null;
        }
        if("" != jsonStr) {
            this.jsonData = this.parse2Json(jsonStr);
            
            // 排重
            for(var x=0; x<this.jsonData.length; x++) {
                if(link == this.jsonData[x]['link']) {
                    return false;
                }
            }
            // 重新赋值 组装 json 字符串
            jsonStr = '[' + this.initRow(title, link, other) + ',';
            for(var i=0; i<this.limit-1; i++) {
                if(undefined != this.jsonData[i]) {
                    jsonStr += this.initRow(this.jsonData[i]['title'], this.jsonData[i]['link'], this.jsonData[i]['other']) + ',';
                } else {
                    break;
                }
            }
            jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf(','));
            jsonStr += ']';
            
        } else {
            jsonStr = '['+ this.initRow(title, link, other) +']';
        }

        this.jsonData = this.parse2Json(jsonStr);
        this.setCookie(this.key, jsonStr, this.cacheTime, {"path" : this.path});
    }
    // 得到记录
    ,getList : function() {
        // 有缓存直接返回
        if(null != this.jsonData) {
            return this.jsonData;  // Array
        } 
        // 没有缓存从 cookie 取
        var jsonStr = this.getCookie(this.key);
        if("" != jsonStr) {
            this.jsonData = this.parse2Json(jsonStr);
        }
        
        return this.jsonData;
    }
    // 清空历史
    ,clearHistory : function() {
        this.deleteCookie(this.key);
        this.jsonData = null;
    }
 };
 
 var formatDateTime = function (date) {  
	    var y = date.getFullYear();  
	    var m = date.getMonth() + 1; 
	    m = m < 10 ? ('0' + m) : m;  
	    var d = date.getDate();  
	    d = d < 10 ? ('0' + d) : d; 
	    var h = date.getHours(); 
	    var minute = date.getMinutes(); 
	    minute = minute < 10 ? ('0' + minute) : minute; 
	    return y + '-' + m + '-' + d+' '+h+':'+minute;  
	};  

function refreshUsersList(str){
	var thisUrl;
	if(str==null){
		thisUrl=urlId+"/getAllUsers"
	}else{
		thisUrl=urlId+"/getUsersByLike"
	}
	$.ajax({
		type:"POST",
		url:thisUrl,
		dataType:"json",
		data:{content:str},
		success:function(data){
			var tablestr="";
			for(var i=0 ;i<data.length ; i++){
				var birth = new Date(data[i].birth).toLocaleDateString();
				var createTime = formatDateTime(new Date(data[i].createData));
				if(data[i].updateData!=null){
					var updateTime = formatDateTime(new Date(data[i].updateData));
				}else{
					var updateTime = '';
				}
				if(data[i].gender==0){
					var gender="男"
				}else{
					var gender="女"
				}
				if(data[i].isSystemuser==0){
					var isSystemuser="否"
				}else{
					var isSystemuser="是"
				}
				if(data[i].isActivation==0){
					var isActivation="锁定"
				}else{
					var isActivation="可用"
				}
				tablestr+='<tr name="userData">'
				+'<td style="width:96px;">'+data[i].name+'</td>'
				+'<td style="width:96px;">'+data[i].loginId+'</td>'
				+'<td style="width:55px;">'+gender+'</td>'
				+'<td style="width:130px;">'+birth+'</td>'
				+'<td style="width:156px;">'+data[i].phone+'</td>'
				+'<td class="widthLong">'+data[i].eMail+'</td>'
				+'<td style="width:96px;">'+data[i].createUser+'</td>'
				+'<td class="widthLong">'+createTime+'</td>'
				+'<td class="widthLong">'+updateTime+'</td>'
				+'<td style="width:96px;" class="status">'+isActivation+'</td>'
				+'<td style="width:96px;">'+isSystemuser+'</td>'
				+'<td class="w100" style="width:115px;">'
				+'<span class="stop" title="停用" data-index="'+i+'" data-id='+data[i].id+' data-status='+data[i].isActivation+'>'
				+'</span>' 
				+'<span class="editUser" title="编辑" data-id='+data[i].id+'>'
				+'</span>' 
				+'<span class="resetPwd" title="重置密码" data-id='+data[i].id+'>'
				+'</span>'
				+'<span class="deleteUser" title="删除" data-index="'+i+'" data-id='+data[i].id+'>'
				+'</span></td></tr>';
			}
			$("#users_T tr[name='userData']").remove();
			$('#users_T').append($(tablestr));
			goPage(1,pageSize,'users_T','barconUsers');
			$('.widthLong').css("width",($('#users_T').width()-936)/3);
			$('.stop').unbind('click').click(function (e) {
				var uId = $(this).attr('data-id');
				var isAct = $(this).attr('data-status');
				var index = $(this).attr('data-index');
				$.confirm('确认' + (isAct == 1?'锁定':'启用')+ '该用户吗？', function(){
					stop(uId, isAct == 1?0:1, index);
				})
			});
			$('.editUser').unbind('click').click(function (e) {
				$('.edit-user').show();
				$('.mask').show();
				var uId = $(this).attr('data-id');
				$(".userEdit input[type='text']").val('');
				$(".userEdit input[type='date']").val('');
				$(".userEdit input[type='radio']").removeAttr('checked');
				$.ajax({
					type:"POST",
					url:urlId+"/getUserByUid",
					data:{uid:uId},
					dataType:"json",
					success:function(data){
						$('.edit-user .name').val(data.name);
						$('.edit-user .loginId').text(data.loginId);
						var birth = formatDateTime(new Date(data.birth)).split(' ')[0];
						$('.edit-user .birth').val(birth);
						$('.edit-user .phone').val(data.phone);
						$('.edit-user .email').val(data.eMail);
						$('.edit-user input[name="gender"]:radio[value='+data.gender+']').attr('checked','true');
						$('.edit-user input[name="isAdmin"]:radio[value='+data.isSystemuser+']').attr('checked','true');
					}
				})
			});
			$('.resetPwd').unbind('click').click(function (e) {
				var uId = $(this).attr('data-id');
				$.confirm('确认重置该用户的密码？', function(){
					resetPwd(uId);
				})
			});
			$('.deleteUser').unbind('click').click(function (e) {
				var uId = $(this).attr('data-id');
				var index = $(this).attr('data-index');
				var tr = $('#users_T tr[name="userData"]:eq(' + index +')');
				$.confirm('确认删除该用户吗？', function(){
					deleteUser(uId);
				})
			})
		},  
		error : function() {   
			$.dialog("异常！");  
		} 
	})
}
	
function stop(uId,isActivation, index){
	$.ajax({
		type:"POST",
		url:urlId+"/modifyActivation",
		data:{
			uId: uId,
			isActivation:isActivation
		},
		dataType:"json",
		success:function(data){
			if(data){
				$.dialog('修改状态成功');
				var tr = $('#users_T tr[name="userData"]:eq(' + index +')');
				$(tr.children()[9]).text(data.isActivation?'可用':'锁定');
				$(tr.children()[11]).children().first().attr('data-status', data.isActivation);
			}
		}
	})
}

function EditOkUser(){
	var jsonObj = new Object();
	jsonObj.name =$('.userEdit .name').val();
	jsonObj.loginId =$('.userEdit .loginId').text();
	jsonObj.gender =$('.userEdit input[name="gender"]:checked').val();
	jsonObj.birth =$('.userEdit .birth').val();
	jsonObj.phone =$('.userEdit .phone').val();
	jsonObj.eMail =$('.userEdit .email').val();
	jsonObj.isSystemuser =$('.userEdit input[name="isAdmin"]:checked').val();
	$.ajax({
		type:"POST",
		url:urlId+"/updateUserMessage",
		dataType:"json",
		contentType: "application/json",
		data:JSON.stringify(jsonObj),
		success:function(data){
			$('.edit-user').css("display","none");
			$('.mask').css("display","none");
			$('.editUser-table').css("display","block");
			$.dialog('修改用户信息成功');
			console.log(data);
			refreshUsersList(null);
		}
	});	
}

function resetPwd(uId){
	$.ajax({
		type:"POST",
		url:urlId+"/updateForAdmin",
		data:{
			userId: uId
		},
		dataType:"json",
		success:function(data){
			$.dialog('修改密码成功，密码是'+data);
		}
	})
}

function deleteUser(uId){
	$.ajax({
		type:"POST",
		url:urlId+"/deleteForAdmin",
		data:{
			userId: uId
		},
		dataType:"json",
		success:function(data){
			$.dialog(data);
			refreshUsersList(null);
		}
	})
}

function loginIdValidation(loginId){
	$.ajax({
		type:"POST",
		url:urlId+"/loginIdValidation",
		data:{
			loginId: loginId
		},
		dataType:"json",
		success:function(data){
			if(data == 1){
				$.dialog("账号已存在");
				return;
			}
		}
	})
}

function registerValidation(){
	var name = $('.userAdd .name').val();
	var loginId = $('.userAdd .loginId').val();
	var pwd = $('.userAdd .pwd').val();
	var repeatPwd = $('.userAdd .repeatPwd').val();
	var phone = $('.userAdd .phone').val();
	var email = $('.userAdd .email').val();
	if(!name || !loginId || !pwd || !repeatPwd || !phone || !email){
		$.dialog("您有内容没有填写，请认真检查！");
		return null;
	}
	loginIdValidation(loginId);
	if(repeatPwd != pwd){
		$.dialog("您两次输入的密码不相同！");
		return null;
	}
	if(!new RegExp(/^(010\d{8})|(0[2-9]\d{9})|(13\d{9})|(14[57]\d{8})|(15[0-35-9]\d{8})|(18[0-35-9]\d{8})+$/).test(phone)){
		$.dialog("您输入的电话格式不正确！");
		return null;
	}
	if(!new RegExp(/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/).test(email)){
		$.dialog("您输入的邮箱格式不正确！");
		return null;
	}
	addUser();
}

function refreshUser(){
	var uId = userId;
	$.ajax({
		type:"POST",
		url:urlId+"/getUserByUid",
		data:{
			uid: userId
		},
		dataType:"json",
		success:function(data){
			$('.showMessage').show();
			$('.changeP').hide();
			$('.updateMessage').show();
			$('.editUserBtn').hide();
			$('.showMessage .name').text(data.name);
			$('.showMessage .loginId').text(data.loginId);
			if(data.gender==0){
				var gender='男';
			}else{
				var gender='女';
			}
			$('.showMessage .gender').text(gender);
			var createTime = formatDateTime(new Date(data.createData));
			$('.showMessage .createTime').text(createTime);
			var birth = formatDateTime(new Date(data.birth)).split(' ')[0];
			$('.showMessage .birth').text(birth);
			$('.showMessage .phone').text(data.phone);
			$('.showMessage .email').text(data.eMail);
			if(data.isSystemuser==0){
				var isSystemuser='普通用户';
			}else{
				var isSystemuser='管理员';
			}
			$('.showMessage .isAdmin').text(isSystemuser);
		}
	})
}

var nameval;
function nameValidation(tableName,flowId){
	$.ajax({
		type:"POST",
		url:urlId+'/selectTableNameIsOk',
		dataType:"json",
		async:false,
		data:{tableName:tableName,flowId:flowId},
		success:function(data){
			nameval = data;
		},
	});
}
