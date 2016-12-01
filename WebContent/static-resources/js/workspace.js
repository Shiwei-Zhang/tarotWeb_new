/**
 * Created by zhanghaijun on 2016/9/12.
 */
$(function(){
    //改变状态按钮
    $('.change_Btn').unbind('click').click(function(){
        $('.thistab a').append('<em class="changeTip">*</em>');
        $('.thistab .changeTip').css({
            position: 'absolute',
            top: 0,
            left: 24,
            color: '#48000'
        });
        console.log('changeBtn~~~')
    });
    $('.save_Btn').unbind('click').click(function(){
        $('.changeTip').css('display','none');
        console.log('saveBtn~~~')
    });



    $('.debug').on('click', function(event){
        if(!$('.debug').hasClass('selected')){
            $('.debug,.runing').addClass('selected')
        }
        console.log('debug...');
    });

    $('.stop').on('click', function(event){
        $('.debug,.runing').removeClass('selected');

        console.log('stop...');
    });

    /*$('.run').on('click', function(event){
        console.log('run...');
    });*/
    $('.runing').on('click', function(event){
    	$.ajax({
            url: urlId + '/sendEngineByTest',
            type:'POST',
            dataType:"json",
            data:{flowId:flowId_global,type:2},
            success:function(data) {
            	var uuid = data.uuid;
            	var hlookup_timer_y_x = window.setInterval(function(){
            		$.ajax({
                        url: urlId + '/getLogByUuid',
                        type:'POST',
                        dataType:"json",
                        data:{uuid:uuid},
                        success:function(data) {
                        	if(data.length>0){
                        		var itemStr="";
                            	$.each(data,function(index,item){
                            		itemStr+=item+'<br>';
                            	});
                            	$('#tabbox2 .tab_con2').eq(1).html(itemStr);
                        	}else{
                        		window.clearInterval(hlookup_timer_y_x);
                        	}
                        },
                        error : function() {
                        	window.clearInterval(hlookup_timer_y_x);
                            $.dialog("异常！");
                        }
                    })
            	},1000);
                $.dialog("发送成功！");
            },
            error : function() {
                $.dialog("异常！");
            }
        });
        console.log('run...');
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
            $('.sourceFieldEvent,.mask').show();
        });
        $('.sourceFieldEvent .single').unbind('click').click(function () {
            if ($(this).hasClass('singleChecked')) {
                $(this).removeClass('singleChecked');
            } else {
                $(this).addClass('singleChecked')
            }
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
            var text = $('.folder input').val();
            if(/['"#$%&\^*]/.test(text)){
                $.dialog("不能包含特殊字符！");
                return;
            }else if(text == ""){
                $.dialog("不能为空！");
                return;
            }
            var id=parentDom.parent().attr("id");
            var name=parentDom.val();
            var type=parentDom.parent().attr("menuType");
            updateMenu(id,name,type);
            parentDom.parent().append($('<span>' + text + '</span>'));
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
            /*var columnList = new Array();
            $('.columnSetEvent tr').each(function(index,item){
                //console.log($(this).hasClass('contentTitle'))
               if($(this).hasClass('contentTitle')) {
                   return true;
               }

                var columnIssave,
                    columnPk,
                    columnName,
                    columnType,
                    columnLength,
                    columnPrecision,
                    columnScale,
                    description,
                    nullAble,
                    columnNullAble;
                $(this).find('.single').each(function(index,item){
                    if($(item).hasClass('columnOne')){
                        columnName=$(this).parent().next().html();
                        $(this).hasClass('singleChecked')?columnIssave=1:columnIssave=0;
                    }else if($(item).hasClass('columnTwo')){
                        $(this).hasClass('singleChecked')?columnPk=1:columnPk=0;
                        columnType=$(this).parent().next().children().val();
                        columnLength=$(this).parent().next().next().html();
                        columnPrecision=$(this).parent().next().next().next().html();
                        columnScale=$(this).parent().next().next().next().next().html();
                    }else if($(item).hasClass('columnThree')){
                        $(this).hasClass('singleChecked')?nullAble=1:nullAble=0;
                        description=$(this).parent().next().html();
                    }
                });

                var columnObj = new Object();
                columnObj.isSave=columnIssave;
                columnObj.name =columnName;
                columnObj.pk=columnPk;
                columnObj.type=columnType;
                columnObj.lenght=columnLength;
                columnObj.precision=columnPrecision;
                columnObj.scale=columnScale;
                columnObj.nullable=nullAble;
                columnObj.description=description;
                columnList.push(columnObj);

            });
            var bigObj = new Object();
            bigObj.nodeId=columnList;*/
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
        	//var dom = $('<div class="target" data-id="'+targetId+'"><label>'+tableName+'</label><span class="edit"><i class="fa fa-pencil-square-o"></i></span> <span class="trash2"><i class="fa fa-trash2"></i></span></div>');
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
    }
    window.addFilterRecord = function(){
        console.log('filter...');

        //$('.filter').show();
        //$('.filter:eq(0)').hide();
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
        console.log('group...');
        //$('.group').show();
        //$('.group:eq(0)').hide();
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
        console.log('order...');
        //$('.order').show();
        //$('.order:eq(0)').hide();
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

    $('.line_fun').on('click', function(){
        if( $(this).css("left") =='0px'){
            var obj = $(this).prev();
            obj.show();
            obj.animate({"width":"128px"}, 300, function(){
                obj.children().fadeIn();
            });
            $(this).animate({"left":"128px"}, 300).removeClass('line_disabled').addClass('line_active');
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
        var dataCls=$(this).attr('data-cls');
        if(dataCls=="col_con"){
            $('#words').show();
            $('#Scontainer,#showVal').hide();
        }else if(dataCls=="syb_con"){
            $('#words').hide();
            $('#Scontainer,#showVal').show();
        }

        var cls =  $(this).data('cls');
        $('#tabbox2 .dt_con div').hide();
        $('.' + cls).show();
    });

    $('.navBar li').unbind('click').click(function () {
        $(this).addClass('bg').siblings('li').removeClass('bg');
        $('.nav_conbox').children('li').eq($(this).index()).show().siblings('li').hide();
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