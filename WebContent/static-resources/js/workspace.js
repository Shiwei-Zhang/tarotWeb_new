$(function(){
	var removeSocketSession = function(){
		$('.module-prop .save').removeAttr('disabled');
		$('.new_table_name input').removeAttr('disabled');
		$('.new_column_name input').removeAttr('disabled');
		_jm1.enable_edit();
		_jm2.enable_edit();
		$('.debug,.runing').removeClass('selected');
		var flowInfo = flowInfosMap.get(flowId_global);
		flowInfo.editable = true;
		window.clearInterval(flowInfo.log_timer);
    	window.clearInterval(flowInfo.checkaccept_timer);
    	var uuid = flowInfo.uuid;
		$.ajax({
			url: urlId + '/release/removeSocketSession',
            type:'POST',
            dataType:"json",
            data:{uuid:uuid},
            success:function(data) {
            },
            error : function() {
                $.dialog("移除SocketSession出现异常！");
            }
		});
	};
	window.checkaccept_timer = function(flowInfo,uuid){
		flowInfo.checkaccept_timer = window.setInterval(function(){
    		$.ajax({
                url: urlId + '/release/checkacceptaction',
                type:'POST',
                dataType:"json",
                async:false,
                data:{uuid:uuid},
                success:function(data) {
                	if(data){
                		$('.stop,.wait,.next').removeClass('selected');
                	}
                },
                error : function() {
                	removeSocketSession();
                    $.dialog("校验是否可以发生指令出现异常！");
                }
            })
    	},1000);
	};
	window.log_timer = function(flowInfo,uuid){
		flowInfo.log_timer = window.setInterval(function(){
    		$.ajax({
                url: urlId + '/release/deployLogs',
                type:'POST',
                dataType:"json",
                data:{jobId:uuid},
                success:function(data) {
                	var length = data.length;
                	if(length>0){
                		var itemStr="";
                    	$.each(data,function(index,item){
                    		itemStr+=item+'<br>';
                    	});
                    	$('#tabbox2 .tab_con2').eq(1).append(itemStr);
                    	var lastJson = JSON.parse(data[length-1]);
                    	if(lastJson.result_code==999||lastJson.result_code==998){
                    		removeSocketSession();
                    		if(lastJson.result_code==998){
                    			$.dialog("连接超时！");
                    		}
                    	}
                	}
                },
                error : function() {
                	removeSocketSession();
                    $.dialog("日志获取异常！");
                }
            })
    	},1000);
	};
	var firetestdebugflow = function(runType){
		$('#tabbox2 .tab_con2').eq(1).html('');
		$('#tabbox2 ul').eq(0).find('li').eq(1).click();
		$.ajax({
            url: urlId + '/release/firetestdebugflow',
            type:'POST',
            dataType:"json",
            data:{flowId:flowId_global,type:runType},
            success:function(data) {
            	var dataJson = JSON.parse(data);
            	var uuid = dataJson.uuid;
            	var result_code = dataJson.result_code;
            	if(result_code==201){
            		$('.module-prop .save').attr('disabled','disabled');
            		$('.new_table_name input').attr('disabled','disabled');
            		$('.new_column_name input').attr('disabled','disabled');
            		$('.debug,.runing').addClass('selected');
            		_jm1.disable_edit();
            		_jm2.disable_edit();
                	var flowInfo = new Object();
                	flowInfo.uuid = uuid;
                	flowInfo.editable = false;
                	flowInfo.runType = runType;
                	flowInfosMap.put(flowId_global,flowInfo);
            		if(runType==3){
            			checkaccept_timer(flowInfo,uuid);
            		}else{
            			$('.stop').removeClass('selected');
            		}
            		log_timer(flowInfo,uuid);
            	}else{
            		$.dialog("引擎任务忙，请稍后！");
            	}
            	$('#tabbox2 .tab_con2').eq(1).append(data+'<br>');
            },
            error : function() {
                $.dialog("发送任务异常！");
            }
        });
	};
	var sendAction = function(actionType){
		var uuid = flowInfosMap.get(flowId_global).uuid;
		$.ajax({
            url: urlId + '/release/sendactions',
            type:'POST',
            dataType:"json",
            data:{uuid:uuid,action:actionType,tableName:null,lines:20},
            success:function(data) {
            	var dataJson = JSON.parse(data);
            	var result_code = dataJson.result_code;
            	if(result_code==101){
            		$('.stop,.wait,.next').addClass('selected');
            	}else{
            		$.dialog("引擎任务忙，请稍后！");
            	}
            	$('#tabbox2 .tab_con2').eq(1).append(data+'<br>');
            },
            error : function() {
            	removeSocketSession();
                $.dialog("发送指令异常！");
            }
        })
	};
	
	window.checkData = function(){
		var uuid = flowInfosMap.get(flowId_global).uuid;
		var tableName="t1_"+flowId_global;
		$.ajax({
            url: urlId + '/release/checkdata',
            type:'POST',
            dataType:"json",
            data:{uuid:uuid,tableName:tableName},
            success:function(data) {
            	console.log(data);
            },
            error : function() {
                $.dialog("查看数据异常！");
            }
        })
	};
	  //改变状态按钮
    $('.change_Btn').unbind('click').click(function(){
        $('.thistab a').append('<em class="changeTip">*</em>');
        $('.thistab .changeTip').css({
            position: 'absolute',
            top: 0,
            left: 24,
            color: '#48000'
        });
    });
    $('.save_Btn').unbind('click').click(function(){
        $('.changeTip').css('display','none');
    });

    $('.debug').on('click', function(event){
    	if(!$('.debug').hasClass('selected')){
    		save_jsmind('debug');
        	firetestdebugflow(3);
        }
    });
    
    
    $('.runing').on('click', function(event){
    	if(!$('.running').hasClass('selected')){
    		save_jsmind('runing');
        	firetestdebugflow(2);
    	}
    });
    
    $('.next').on('click', function(event){
    	if(!$('.next').hasClass('selected')){
    		sendAction('next');
    	}
    });
    
    $('.stop').on('click', function(event){
    	if(!$('.stop').hasClass('selected')){
    		sendAction('end');
    	}
    });
    
    $('.wait').on('click', function(event){
    	if(!$('.wait').hasClass('selected')){
    		sendAction('finish');
    	}
    });
    
    $('.flow').on('click', function(event){
        console.log('flow...');
    });

    $('.manager').on('click', function(event){
        console.log('manager...');
    });
   	    
    //查看源字段
    var SourceField=function(){
        //TODO
        /*$.ajax({
            url: urlId + '',
            type:'POST',
            dataType:"json",
            data:'',
            success:function(data) {

            },
            error : function() {
                $.dialog("异常！");
            }
        });*/
        $('.one-btn input').unbind('click').click(function () {
        	var content = $('.sourceFieldEvent .tableContainer tr');
        	if(content.length <= 1){
        		$.dialog('请先选择一个logic node.');
        		return;
        	}
            $('.sourceFieldEvent,.mask').show();
        });
        $('.sourceFieldEvent .closeA').unbind('click').click(function () {
            $('.sourceFieldEvent,.mask').hide();
        });
        //确定按钮
        $('.sourceFieldEvent .sureC').unbind('click').click(function () {
            $('.sourceFieldEvent,.mask').hide();
            //TODO
        });
        //取消按钮
        $('.sourceFieldEvent .closeC').unbind('click').click(function () {
            $('.sourceFieldEvent,.mask').hide();
        })
    };
    SourceField();
    $('.btns input').on('click', function(event){
        $('input').removeClass('selected');
        $(this).addClass('selected');
        if($(this).attr('class').indexOf('chart')>-1){
            $('.module-coreEvent').show();
            $('.codePartEvent').hide();
        }else if($(this).attr('class').indexOf('code')>-1){
        	var nodes = _jm1.mind.nodes;
        	var node = null;
        	var sqlStr = "";
        	for(var nodeid in nodes){
        		node = nodes[nodeid];
        		if(!node.isroot){
        			var obj = loop_node(node);
        			sqlStr+=node.topic+" : "+obj.sql+"<br>";
        		}
        	}
        	$('.codePartEvent').html(sqlStr);
            $('.module-coreEvent').hide();
            $('.codePartEvent').show();
        }
    });

    //folder change
    $('.folder_title').on('click', function(event){
        if($(this).hasClass('fa-folder-close_')){
            $(this).removeClass('fa-folder-close_').addClass('fa-folder-open_');
            $(this).parent().next().show();
        }else{
            $(this).removeClass('fa-folder-open_').addClass('fa-folder-close_');
            $(this).parent().next().hide();
        }
    });

    window.resetFolder = function(){
        var parentDom = $('.folder input');
        if(parentDom && parentDom.length > 0){
            var name = parentDom.val();
            var pid = parentDom.parent().parent().parent().prev().attr("id");
            var menuId= parentDom.parent().attr("id");
            var type=parentDom.parent().attr("menuType");
            nameIsExist(name,menuId,pid,userId,type);
            if(specialSymbols.test(name)){
                $.dialog("不能包含特殊字符！");
                return;
            }else if(name == ""){
                $.dialog("不能为空！");
                return;
            }else if(flag){
            	$.dialog("该目录下已包含"+name+"的文件（夹）！");
            	return;
            }
            
            updateMenu(menuId,name,type);
            parentDom.parent().append($('<span>' + name + '</span>'));
            parentDom.remove();
        }
    };
    //
    /*******add by tyd*******/
    $('.new_table_name input').bind('input propertychange', function() {
    		$('#jsmind_container').find('.selected').text($(this).val());
    		var selected_node = _jm1.get_selected_node();
    		selected_node.topic = $(this).val();
    		_jm1.view.update_node(selected_node);
    		_jm1.layout.layout();
    		_jm1.view.show(false);
    });
    $('.new_column_name input').bind('input propertychange', function() {
		$('#jsmind_container2').find('.selected').text($(this).val());
		var selected_node = _jm2.get_selected_node();
		selected_node.topic = $(this).val();
		_jm2.view.update_node(selected_node);
		_jm2.layout.layout();
		_jm2.view.show(false);
    });
    /*******add by tyd end*******/
    //property change
    window.$restClass = function(){
        $('.panel').hide();
        $('.fa-caret-down').removeClass('fa-caret-down').addClass('fa-caret-right');
    }
    $('.join_').on('click', function(){
        if($(this).children().hasClass('fa-caret-down')){
            $restClass();
        }else{
            $restClass();
            $(this).children().removeClass('fa-caret-right').addClass('fa-caret-down');
            $('.join_panel').show();
        }
    });
    $('.filter_').on('click', function(){
        if($(this).children().hasClass('fa-caret-down')){
            $restClass();
        }else{
            $restClass();
            $(this).children().removeClass('fa-caret-right').addClass('fa-caret-down filter_');
            $('.filter_panel').show();
        }
    });
    $('.group_').on('click', function(){
        if($(this).children().hasClass('fa-caret-down')){
            $restClass();
        }else{
            $restClass();
            $(this).children().removeClass('fa-caret-right').addClass('fa-caret-down group_');
            $('.group_panel').show();
        }
    });
    $('.order_').on('click', function(){
        if($(this).children().hasClass('fa-caret-down')){
            $restClass();
        }else{
            $restClass();
            $(this).children().removeClass('fa-caret-right').addClass('fa-caret-down order_');
            $('.order_panel').show();
        }
    });
    $('.target_').on('click', function(){
        if($(this).children().hasClass('fa-caret-down')){
            $restClass();
        }else{
            $restClass();
            $(this).children().removeClass('fa-caret-right').addClass('fa-caret-down target_');
            $('.target_panel').show();
        }
    });

    $('.filter_plus').on('click', function(event){
        if($(this).parent().prev().children().hasClass('fa-caret-right')){

            $restClass();
            $('.filter_').children().removeClass('fa-caret-right').addClass('fa-caret-down target_');
            $('.filter_panel').show();
        }
        addFilterRecord();
    });
    $('.group_plus').on('click', function(event){
        if($(this).parent().prev().children().hasClass('fa-caret-right')){

            $restClass();
            $('.group_').children().removeClass('fa-caret-right').addClass('fa-caret-down target_');
            $('.group_panel').show();
        }
        addGroupRecord();
    });
    $('.order_plus').on('click', function(event){
        if($(this).parent().prev().children().hasClass('fa-caret-right')){

            $restClass();
            $('.order_').children().removeClass('fa-caret-right').addClass('fa-caret-down target_');
            $('.order_panel').show();
        }
        addOrderRecord();
    });
    $('.target_plus').on('click', function(event){
        if($(this).parent().prev().children().hasClass('fa-caret-right')){
            $restClass();
            $('.target_').children().removeClass('fa-caret-right').addClass('fa-caret-down target_');
            $('.target_panel').show();
        }
        $('.target_layer').show();
        $('.mask').show();
    });





    //target layer --start
    $('.table_name').on("keyup", function(){
        $('.name_list ul li.selected').children().text($(this).val());
    });

    //columnSet 列设置
    $('.setting_col').on('click',function(){
        $('.columnSetEvent,.mask').show();
        $('.columnSetEvent .single').unbind('click').click(function (e) {
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


        $('.columnSetEvent .closeA,.columnSetEvent .closeC').on('click',function(){
            $('.columnSetEvent').hide();
        });
        $('.columnSetEvent .sureC').on('click',function(){
        	$('.columnSetEvent').hide();
        })
    });

    $('.tl_header .close, .btn_group input:eq(0)').on('click', function(event){
        $('.target_layer').hide();
        $('.mask').hide();
    });
    $('.btn_group input:eq(1)').on('click', function(event){
    		if($('#sjlj').val()==""){
    			$.dialog("请选择数据连接");
    			return;
    		}
    		if($('#tableName').val()==""){
    			$.dialog("请输入表名");
    			return;
    		}
    		if($('#ms').val()==""){
    			$.dialog("请选择模式");
    			return;
    		}
		$('.target_layer').hide();
        $('.mask').hide();
        var node = _jm1.get_selected_node();
        addTargetRecord(node);
    });
    //target layer --end
    //property end.

    $('.save').on('click', function(){
    	save_jsmind();
        console.log('saving...');
    });

    window.addTargetRecord = function(node){
    	if(node){
    		var pk = node.data.pk;
        	var targetId = jsMind.util.uuid.newid();
        	var conId = $('#sjlj').val();
        	var tableName = $('.table_name').val();
        	var model = $('#ms').val();
        	var target = new Object();
        	//主键
        	target.num = targetId;
        	//连接id
        	target.conId = conId;
        	//sourceType
        	target.sourceType = "JDBC";
        	var enumList = new Array();
        	var SaveTargetParam = new Object();
        	SaveTargetParam.enumCode = "savetable";
        	SaveTargetParam.value = tableName;
        	enumList.push(SaveTargetParam);
        	var SaveTargetParam2 = new Object();
        	SaveTargetParam2.enumCode = "model";
        	SaveTargetParam2.value = model;
        	enumList.push(SaveTargetParam2);
        	//参数枚举
        	target.saveTargetParams = enumList;
        	targetsMap.get(pk).push(target);
        	node.data.isSave = 1;
        	//追加.targets页面元素
        	var dom = $('<div class="target" data-id="'+targetId+'"><label>'+tableName+'</label><span class="trash2"><i class="fa fa-trash2"></i></span></div>');
    		$('.targets').append(dom);
    	}
    	$('.targets .edit').unbind('click').on('click', function(){
    	    $('#sjlj').val(conId);
    	    $('.table_name').val(tableName);
    	    $('#ms').val(model);
    	    $('.target_layer').show();
    	    $('.mask').show();
    	});
    	$('.targets .fa-trash2').unbind('click').on('click', function(e){
            try{
            	var num = $(e.target.parentElement.parentElement).attr('data-id');
                $(e.target.parentElement.parentElement).slideUp('slow',function(){
                    e.target.parentElement.parentElement.remove();
                    var dataArray = targetsMap.get(pk);
                    var newArray = $.grep( dataArray, function(n,i){
 	    			   	return n.num!=num;
                    });
                    if(newArray.length==0){
                    	node.data.isSave = 0;
                    }
                    targetsMap.put(pk,newArray);
                });
            }catch(e){
                console.log(e)
            }
        });
    };
    window.addFilterRecord = function(){
        var dom = $('<div class="filter">' +  $('.filter')[0].innerHTML + '</div>');
        $('.filters').append(dom);
        $('.filter .operations').show();
        $('.filter .operations').last().hide();

        $('.filters .fa-trash2').unbind('click').on('click', function(e){
            try{
                e.target.parentElement.parentElement.remove();
                $('.filter .operations').last().hide();
            }catch(e){
                console.log(e)
            }
        });
    };

    window.addGroupRecord = function(){
        var dom = $('<div class="group">' +  $('.group')[0].innerHTML + '</div>');
        $('.groups').append(dom);

        $('.groups .fa-trash2').unbind('click').on('click', function(e){
            try{
                e.target.parentElement.parentElement.remove();
            }catch(e){
                console.log(e)
            }
        });
    };

    window.addOrderRecord = function(){
        var dom = $('<div class="order">' +  $('.order')[0].innerHTML + '</div>');
        $('.orders').append(dom);

        $('.orders .fa-trash2').unbind('click').on('click', function(e){
            try{
                e.target.parentElement.parentElement.remove();
            }catch(e){
                console.log(e)
            }
        });
    };

    // global variable
    var targetObjs = [];
    window.addjointyd = function(table1){
        $('.join_').trigger('click');

        var id = $('.related_table').length;
        var dom =
            $(
                '<div class="related_table t_' + id + '"> <div class="tables">' +
                '<span><select class="tableA"><option>'+table1.tableA+'</option></option></select></span>' +
                '<span><select class="joinType"><option>left join</option> <option>right join</option><option>full join</option><option>inner join</option></select></span>' +
                '<span><select class="tableB"><option>'+table1.tableB+'</option></option></select></span>' +
                '<span class="join_plus"><i class="fa plus_icon"></i></span>' +
                '</div></div>');
        $('.joins').append(dom);

        $('.join_plus').unbind('click').click(function(event){
            var currentTable = $(this).parent().parent();

            var className = currentTable.attr('class').split(' ')[1];

            if($('.' + className + ' .join').length < 1){
                var dom = $('<div class="join">' +  $('.template_join')[0].innerHTML + '</div>');
                currentTable.append(dom);
            }else{
                var dom = $('<div class="operations">' +  $('.template_operations')[0].innerHTML + '</div>');
                currentTable.append(dom);
                var dom2 =  $('<div class="join">' +  $('.template_join')[0].innerHTML + '</div>');
                currentTable.append(dom2);
            }

            $('.fa-trash2').unbind('click').on('click', function(e){
                try{
                    if($(this).parent().parent().prev().prev().hasClass('join')){
                        $(this).parent().parent().prev().remove();
                    }else{
                        $(this).parent().parent().next().remove();
                    }
                    $(this).parent().parent().remove();
                }catch(e){
                    console.log(e)
                }
            });
        });
    };

    window.addJoinRecord_mini = function(currentTable){
    	currentTable.find('.operations').show();
        var dom2 =  $('<div class="join">' +  currentTable.find('.template_join_r')[0].innerHTML + '</div>');
        currentTable.append(dom2);
        var dom = $('<div class="operations">' +  currentTable.find('.template_operations_r')[0].innerHTML + '</div>');
        currentTable.append(dom);
        currentTable.find('.operations').last().hide();
        $('.joins .fa-trash2').unbind('click').on('click', function(e){
            try{
                if($(this).parent().parent().prev().prev().hasClass('join')){
                    $(this).parent().parent().prev().remove();
                }else{
                    $(this).parent().parent().next().remove();
                }
                $(this).parent().parent().remove();
            }catch(e){
                console.log(e)
            }
        });
        return currentTable;
    };
    window.addJoinRecord = function(tableOptions,firstcolumndoms,tableMap){
        var id = $('.related_table').length;
        var dom =
            $(
                '<div class="related_table t_' + id + '"> <div class="tables">' +
                '<span><select class="tableA">'+tableOptions+'</select></span>' +
                '<span><select class="joinType"><option>left join</option> <option>right join</option><option>full join</option><option>inner join</option></select></span>' +
                '<span><select class="tableB">'+tableOptions+'</select></span>' +
                '<span class="join_plus"><i class="fa plus_icon"></i></span>' +
                '</div></div>');
        
        var dom2 =  $('<div class="template_join_r" style="display: none;">' +  $('.template_join')[0].innerHTML + '</div>');
        dom.append(dom2);
        var dom3 = $('<div class="template_operations_r" style="display: none;">' +  $('.template_operations')[0].innerHTML + '</div>');
        dom.append(dom3);
        dom.find('.template_join_r .condition1').html(firstcolumndoms);
        dom.find('.template_join_r .condition3').html(firstcolumndoms);
        $('.joins').append(dom);
        $('.join_plus').unbind('click').click(function(event){
            var currentTable = $(this).parent().parent();
            addJoinRecord_mini(currentTable);
        });
        $('.related_table .tableA').unbind('onchange').change(function(event){
        	var currentTable = $(this).parent().parent().parent();
        	var tablekey = $(this).val();
        	var columndoms = tableMap.get(tablekey);
        	currentTable.find('.condition1').html($(columndoms));
        });
        $('.related_table .tableB').unbind('onchange').change(function(event){
        	var currentTable = $(this).parent().parent().parent();
        	var tablekey = $(this).val();
        	var columndoms = tableMap.get(tablekey);
        	currentTable.find('.condition3').html($(columndoms));
        });
        return dom;
    };

    //*****center
    $('.category_name').on('click', function(){
        $('.category_name').addClass('category_disable');
        $('.category_name').children().children('i').hide();
        $(this).removeClass('category_disable').addClass('category_active');
        $(this).children().children('i').show();
    });

    $('.module-bi .line_fun').on('click', function(){
        if( $(this).css("left") =='0px'){
            var obj = $(this).prev();
            obj.show();
            obj.animate({"width":"129px"}, 300, function(){
                obj.children().fadeIn();
            });
            $(this).animate({"left":"129px"}, 300).removeClass('line_disabled').addClass('line_active');
        }else{
            var obj = $(this).prev();
            $(this).prev().children().hide();
            $(this).prev().animate({"width":"0px"}, 300, function(){
                obj.fadeOut();
            });
            $(this).animate({"left":"0px"}, 300).removeClass('line_active').addClass('line_disabled');
        }
    });

    //change tab
    //start--
    jQuery.jqtab = function(tabtit,tabcon) {
        $(tabcon).hide();
        $(tabtit+" li:first").addClass("thistab").show();
        $(tabcon+":first").show();

        $(tabtit+" li").click(function() {
            if( $(this).hasClass("thistab")){
                return;
            }

            //
            if($(this).hasClass("nochangetab")){
                return ;
            }

            $(tabtit+" li").removeClass("thistab");
            $(this).addClass("thistab");
            $(tabcon).hide();
            var activeTab = $(this).find("a").attr("tab");
            //数据监控需要重新初始化
            if(activeTab=='tab2_4'){
            	var nodes = _jm1.mind.nodes;
            	var node = null;
            	var num = 1;
            	var liStr = "";
            	for(var nodeid in nodes){
            		node = nodes[nodeid];
            		if(node.data.isCheck==1){
            			liStr += "<li pk='"+node.data.pk+"' class='navBar_"+num+"'><span>"+node.topic+"</span></li>";
            			num++;
            		}
            	}
            	$('.tab2_4 .navBar').html(liStr);
            	$('.navBar li').unbind('click').click(function () {
                    $(this).addClass('bg').siblings('li').removeClass('bg');
                    $('.tableStyle').html('');
                    var flowInfo = flowInfosMap.get(flowId_global);
                    if(flowInfo&&!flowInfo.editable){
                    	var uuid = flowInfo.uuid;
                		var tableName=$(this).text()+"_"+flowId_global;
                		$.ajax({
                            url: urlId + '/release/checkdata',
                            type:'POST',
                            dataType:"json",
                            data:{uuid:uuid,tableName:tableName},
                            success:function(data) {
                            	var dataJson = JSON.parse(data);
                            	var result = dataJson.result;
                            	if(result){
                            		var resultJson = JSON.parse(result);
                            		var tableStr = "";
                                	$.each(resultJson,function(index,item){
                                		var array = item.split(",");
                                		if(index==0){
                                			var trStr="<tr class='firTr'>"; 
                                			var length = array.length;
                                			$.each(array,function(i,element){
                                				if(i!=length-1){
                                					trStr+="<th>"+element+"</th>";
                                				}else{
                                					trStr+="<th style='border-right: 1px solid #ddd'>"+element+"</th>";
                                				}
                                			});
                                			trStr+="</tr>";
                                		}else{
                                    		var trStr="<tr"; 
                                			$.each(array,function(i,element){
                            					trStr+="<td>"+element+"</td>";
                                			});
                                			trStr+="</tr>";
                                		}
                                		tableStr+=trStr;
                                	});
                                	$('.tableStyle').html(tableStr);
                            	}
                            },
                            error : function() {
                                $.dialog("查看数据异常！");
                            }
                        })
                    }
                });
            	$('.navBar li').eq(0).click();
            }
            $(" ."+activeTab).fadeIn();
            return false;
        });
    };
    $.jqtab(".tabs1",".tab_con1");
    $.jqtab(".tabs2",".tab_con2");
    $.jqtab(".tabs3",".tab_con3");
    //end--

    $('#tabbox2 .dtt span').click(function(e){
        if($(this).hasClass('active_t')){
            return;
        }
        $('#tabbox2 .dtt span').removeClass('active_t');
        $(this).addClass('active_t');
        var cls =  $(this).data('cls');
        $('#tabbox2 .dt_con>div').hide();
        $('.' + cls).show();
    });
    
});

function edittest(){
	$('.edit').on('click', function(){
		
	    $('.table_name').val(selectedTargetName);
	    $('.target_layer').show();
	    $('.mask').show();
	});
	$('.targets .fa-trash2').on('click', function(e){
        try{
            $(e.target.parentElement.parentElement).slideUp('slow',function(){
                e.target.parentElement.parentElement.remove();
            });
        }catch(e){
            console.log(e)
        }
        var targetid = $(this).parent().parent().data("id");
    });
}