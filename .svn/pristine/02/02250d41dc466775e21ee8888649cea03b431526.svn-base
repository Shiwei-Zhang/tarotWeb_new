/**
 * Created by zhanghaijun on 2016/9/12.
 */
$(function(){
    $('.debug').on('click', function(event){
        console.log('debug...');
    });

    $('.run').on('click', function(event){
        console.log('run...');
    });

    $('.flow').on('click', function(event){
        console.log('flow...');
    });

    $('.manager').on('click', function(event){
        console.log('manager...');
    });
    $('.btns input').on('click', function(event){
        $('input').removeClass('selected');
        $(this).addClass('selected');
        if($(this).attr('class').indexOf('chart')>-1){
            $('.module-coreEvent').show();
            $('.codePartEvent').hide();
        }else if($(this).attr('class').indexOf('code')>-1){
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

    /*var contextMenu = function(){
        context.init({preventDoubleContext: false});

        context.attach('.folder .home', [
            {text: '添加', subMenu:[
                {text:'添加文件夹', action:function(e){
                    e.preventDefault();
                    console.log('添加文件夹');
                    //modified by tyd
                    var folderName = '新建文件夹';
                    addMenu("menuId0",menuTypeEnum[0],folderName);
                }},
                {text:'添加逻辑流', action:function(e){
                    e.preventDefault();
                    console.log('添加逻辑流');
                    //modified by tyd
                    var folderName = '新建逻辑流';
                    addMenu("menuId0",menuTypeEnum[2],folderName);
                }},
                {text:'添加报表', action:function(e){
                    e.preventDefault();
                    console.log('添加BI');
                    //modified by tyd
                    var folderName = '新建报表';
                    addMenu("menuId0",menuTypeEnum[3],folderName);
                }},
                {text:'添加挖掘模型', action:function(e){
                    e.preventDefault();
                    console.log('添加DataMining');
                    //modified by tyd
                    var folderName = '新建DataMining';
                    addMenu("menuId0",menuTypeEnum[4],folderName);
                }},
                {text:'添加控制器', action:function(e){
                    e.preventDefault();
                    console.log('添加Controller');
                    //modified by tyd
                    var folderName = '新建控制器';
                    addMenu("menuId0",menuTypeEnum[1],folderName);
                }},
            ]}
        ]);
        context.attach('.folder .folder_self', [
            {text: '添加', subMenu:[
                {text:'添加文件夹', action:function(e){
                    e.preventDefault();
                    console.log('添加文件夹');

                    //modified by tyd
                    var folderName = '新建文件夹';
                    addMenu($currentRightDom.attr("id"),menuTypeEnum[0],folderName);
                }},
                {text:'添加逻辑流', action:function(e){
                    e.preventDefault();
                    console.log('添加');
                    //modified by tyd
                    var folderName = '新建逻辑流';
                    addMenu($currentRightDom.attr("id"),menuTypeEnum[2],folderName);
                }},
                {text:'添加报表', action:function(e){
                    e.preventDefault();
                    console.log('添加BI');
                    //modified by tyd
                    var folderName = '新建报表';
                    addMenu($currentRightDom.attr("id"),menuTypeEnum[4],folderName);
                }},
                {text:'添加挖掘模型', action:function(e){
                    e.preventDefault();
                    console.log('添加DataMining');
                    //modified by tyd
                    var folderName = '新建DataMining';
                    addMenu($currentRightDom.attr("id"),menuTypeEnum[3],folderName);
                }},
                {text:'添加控制器', action:function(e){
                    e.preventDefault();
                    console.log('添加Controller');
                    //modified by tyd
                    var folderName = '新建控制器';
                    addMenu($currentRightDom.attr("id"),menuTypeEnum[1],folderName);
                }},
            ]},
            {text: '删除', action:function(e){
                e.preventDefault();
                console.log('删除当前文件（夹）');
                //modified by tyd
                var menuId = $currentRightDom.attr("id");
                var menuType = $currentRightDom.attr("menuType");
                deleteMenu(menuId,menuType);
            }},
            {divider: true},
            {text: '重命名', action:function(e){
                e.preventDefault();
                console.log('重命名');

                if($currentRightDom){
                    var text = $currentRightDom.children().last().text();
                    $currentRightDom.children().last().remove();
                    $currentRightDom.append($('<input type="text" value="'+ text + '" />'));
                    $('.folder input').select();

                    $('.folder input').unbind('keydown').keydown(function(e){
                        if (e.keyCode == "13") {//keyCode=13是回车键
                            var val = $currentRightDom.children().last().val();
                            if(/['"#$%&\^*]/.test(val)){
                                $.dialog("不能包含特殊字符！");
                                return;
                            }else if(val == ""){
                                $.dialog("不能为空！");
                                return;
                            }
                            var menuId=$currentRightDom.attr("id");
                            var name=$currentRightDom.children().last().val();
                            var type=$currentRightDom.attr("menuType");
                            updateMenu(menuId,name,type);
                            $currentRightDom.children().last().remove();
                            $currentRightDom.append($('<span>' + val + '</span>'));

                            $currentRightDom = null;
                        }
                    });
                }
            }},
        ]);

        context.attach('.folder .folder_child', [
            {text: '删除', action:function(e){
                e.preventDefault();
                console.log('删除当前文件（夹）');
                //modified by tyd
                var menuId = $currentRightDom.attr("id");
                var menuType = $currentRightDom.attr("menuType");
                deleteMenu(menuId,menuType);
            }},
            {divider: true},
            {text: '重命名', action:function(e){
                e.preventDefault();
                console.log('重命名');

                if($currentRightDom){
                    var text = $currentRightDom.children().last().text();
                    $currentRightDom.children().last().remove();
                    $currentRightDom.append($('<input type="text" value="'+ text + '" />'));
                    $('.folder input').select();

                    $('.folder input').unbind('keydown').keydown(function(e){
                        if (e.keyCode == "13") {//keyCode=13是回车键
                            var val = $currentRightDom.children().last().val();
                            if(/['"#$%&\^*]/.test(val)){
                                $.dialog("不能包含特殊字符！");
                                return;
                            }else if(val == ""){
                                $.dialog("不能为空！");
                                return;
                            }
                            var id=$currentRightDom.attr("id");
                            var name=$currentRightDom.children().last().val();
                            var type=$currentRightDom.attr("menuType");
                            updateMenu(id,name,type);
                            $currentRightDom.children().last().remove();
                            $currentRightDom.append($('<span>' + val + '</span>'));

                            $currentRightDom = null;
                        }
                    });
                }
            }},
        ]);
    };
    context.attach('.module-data-navigation', [
       {header: '请选中文件，文件夹或者home'}
    ]);
    //contextMenu();


    window.$currentRightDom = null;
    $('.root_tree div').unbind('mousedown').mousedown(function(event, a){
        if(event.which == 3 || a == 'right'){
            $currentRightDom = $(this);
            console.log($currentRightDom.html());
        }

        if($(this).html().indexOf('input') > 0){
            console.log('is current element.');
            return;
        }
        resetFolder();
    });*/

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
    }
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
        addTargetRecord();
    });





    //target layer --start
    $('.table_name').on("keyup", function(){
        $('.name_list ul li.selected').children().text($(this).val());
    });

    //columnSet 列设置
    $('.setting_col').on('click',function(){
        $('.columnSetEvent,.mask').show();

        //TODO
        /*var str='';
        $.ajax({
            url: '',
            type:'POST',
            dataType:"json",
            success:function(data) {
                $(data).each(function(index,item){
                    str+='<tr><td><i class="single"></i></td><td contenteditable="true"></td><td><i class="single"></i></td><td contenteditable="true">January</td><td contenteditable="true">January</td><td contenteditable="true">January</td><td contenteditable="true">January</td><td><i class="single"></i></td><td contenteditable="true">January</td></tr>';
                });
                $('.tableContainerEvent').append($(str));
            }
            /!*error : function() {
                $.dialog("异常！");
            }*!/
        });*/

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
            var columnList = new Array();
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
            bigObj.nodeId=columnList;
            console.log(bigObj);


            //TODO



        })
    });




    $('.tl_header .close, .btn_group input:eq(0)').on('click', function(event){
        $('.target_layer').hide();
        $('.mask').hide();
    });
    $('.btn_group input:eq(1)').on('click', function(event){
        //TODO
        var nameListObj = $('.name_list ul li').children();
        for(var i in saveTargetMap){
    		if(saveTargetMap[i].conId=="0"){
    			window.event? window.event.cancelBubble = true : e.stopPropagation();
    			$.dialog("请选择数据连接");
    			return;
    		}
    		if(!saveTargetMap[i].savetable){
    			window.event? window.event.cancelBubble = true : e.stopPropagation();
    			$.dialog("请输入表名");
    			return;
    		}
    		var a =0;
    		for(var j in saveTargetMap){
    			if(saveTargetMap[i].savetable==saveTargetMap[j].savetable){
    				a+=1;
    				if(a==2){
        				$.dialog("表名不能重复");
        				return;
        			}
    			}
    		}
    		if(saveTargetMap[i].mode=="请选择模式"){
    			window.event? window.event.cancelBubble = true : e.stopPropagation();
    			$.dialog("请选择模式");
    			return;
    		}
    	}
    	
    	savetargetok();
        //$('.targets').empty();
        /*for(var i=0; i< nameListObj.length; i++){
            var dom = $('<div class="target"><label>' +  nameListObj[i].innerHTML + '</label><span class="edit"><i class="fa fa-pencil-square-o"></i></span> <span class="trash2"><i class="fa fa-trash2"></i></span></div>');
            $('.targets').append(dom);
        }*/

        /*$('.edit').on('click', function(){
        	var id= $(this).data("id");
            if($(this).prev().find('input') && $(this).prev().find('input').length > 0){
                console.log('need add name firstly.');
                return;
            }

            selectedTargetName = $(this).prev().text();

            targetObjs = $('.target label');

            $('.name_list ul').empty();
            for(var i=0; i < targetObjs.length; i++){
                if(selectedTargetName == targetObjs[i].innerHTML){
                    $('.name_list ul').append($('<li class="selected"><a>'+ targetObjs[i].innerHTML + '</a></li>'));
                }else if(targetObjs[i].innerHTML.indexOf('input') < 0){
                    $('.name_list ul').append($('<li><a>'+ targetObjs[i].innerHTML + '</a></li>'));
                }
            }

            $('.name_list ul li').on('click', function(){
                $('.name_list ul li').removeClass('selected');
                $(this).addClass('selected');
                $('.table_name').val($(this).children().text());
            });

            $('.table_name').val(selectedTargetName);
            $('.target_layer').show();
            $('.mask').show();
        });*/
        edittest();

        /*$('.fa-trash2').on('click', function(e){
            try{
                $(e.target.parentElement.parentElement).slideUp('slow',function(){
                    e.target.parentElement.parentElement.remove();
                });
            }catch(e){
                console.log(e)
            }
        });*/

        $('.target_layer').hide();
        $('.mask').hide();
    });
    //target layer --end
    //property end.

    $('.save').on('click', function(){
        console.log('saving...');
    });


    /***
     * using methods
     */
    /* var addJoinRecord = function(){
     console.log('join...');
     $('.join .operations').last().show();

     var dom = $('<div class="join">' +  $('.join')[0].innerHTML + '</div>');
     $('.joins').append(dom);
     $('.join .trash').last().show();
     $('.join .operations').last().hide();

     $('.fa-trash2').unbind('click').on('click', function(e){
     try{
     e.target.parentElement.parentElement.remove();
     $('.join .operations').last().hide();
     }catch(e){
     console.log(e)
     }
     });
     };*/

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
    /*var addTargetRecord = function(){
        console.log('target...');
        targetObjs = $('.target label');
        $('.name_list ul').empty();
        $('#sjlj').val('');
        $('#ms').val('请选择模式');

        for(var i=0; i < targetObjs.length; i++){
            $('.name_list ul').append($('<li data-id='+i+'><a >'+ targetObjs[i].innerHTML + '</a></li>'));
        }
        $('.name_list ul').append($('<li class="selected"><a>Target</a></li>'));

        $('.name_list ul li').on('click', function(){
            $('.name_list ul li').removeClass('selected');
            $(this).addClass('selected');
            $('.table_name').val($(this).children().text());
            var id = $(this).data("id");
            if(id==null){
            	document.getElementById("sjlj").value='0';
                document.getElementById("ms").value='请选择模式';
            }else{
            document.getElementById("sjlj").value=saveTarget[id].conId;
            document.getElementById("ms").value=saveTarget[id].mode;
            }
        });

        $('.table_name').val('Target');
        $('.target_layer').show();
        $('.mask').show();

        var userId=4;
        $.ajax({
            type:"POST",
            url:urlId+"/selectDataConnection?userId="+userId,
            dataType:"json",
            contentType: "application/json",
            //data:{userId:4},
            success:function(data){
                for(var i=0;i<data.length;i++){
                    $('#sjlj').append("<option value="+data[i].id+">"+data[i].name+"</option>")
                }
                //alert(data);

            }
        });




        $('.fa-trash2').unbind('click').on('click', function(e){
            try{
                e.target.parentElement.parentElement.remove();
            }catch(e){
                console.log(e)
            }
        });

    };*/


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
    //end--

    $('#tabbox2 .dtt span').click(function(e){
        if($(this).hasClass('active_t')){
            return;
        }
        $('#tabbox2 .dtt span').removeClass('active_t');
        $(this).addClass('active_t');
        var cls =  $(this).data('cls');
        $('#tabbox2 .dt_con div').hide();
        $('.' + cls).show();
    });

});

function addTargetRecord(){
	var saverel = new Object();
	saverel.conId = 0;
	saverel.savetable = "";
	saverel.mode = '请选择模式';
	saverel.nstrId = 0;
	saveTargetMap[0] = saverel;
    console.log('target...');
    targetObjs = $('.target label');
    $('.name_list ul').empty();
    for(var i=0; i < targetObjs.length; i++){
        $('.name_list ul').append($('<li data-id="'+$(targetObjs.parent().get(i)).data("id")+'"><a>'+ targetObjs[i].innerHTML + '</a></li>'));
        document.getElementById("sjlj").value='0';
        document.getElementById("ms").value='请选择模式';
        tarGid = 0;
        //$('.name_list ul li').last().attr('data-id', i);
    }
    $('.name_list ul').append($('<li class="selected"><a>Target</a></li>'));

    $('.name_list ul li').on('click', function(){
        $('.name_list ul li').removeClass('selected');
        $(this).addClass('selected');
        $('.table_name').val($(this).children().text());
        var id = $(this).data("id");
        console.log(id);
        if(id==null){
        	document.getElementById("sjlj").value='0';
            document.getElementById("ms").value='请选择模式';
            tarGid = 0;
        }else{
        	document.getElementById("sjlj").value=saveTargetMap[''+id+''].conId;
        	document.getElementById("ms").value=saveTargetMap[''+id+''].mode;
        	tarGid = id;
        }
    });

    $('.table_name').val('Target');
    $('.target_layer').show();
    $('.mask').show();

    //var userId = userId;
    $.ajax({
        type:"POST",
        url:urlId+"/selectDataConnection?userId="+userId,
        dataType:"json",
        contentType: "application/json",
        //data:{userId:4},
        success:function(data){
            for(var i=0;i<data.length;i++){
                $('#sjlj').append("<option value="+data[i].ID+">"+data[i].NAME+"</option>")
            }
            //$.dialog(data);

        }
    });




    $('.fa-trash2').unbind('click').on('click', function(e){
        try{
            e.target.parentElement.parentElement.remove();
        }catch(e){
            console.log(e)
        }
    });

};

function edittest(){
	$('.edit').on('click', function(){
		delete saveTargetMap[0];
	var id= $(this).data("id");
    if($(this).prev().find('input') && $(this).prev().find('input').length > 0){
        console.log('need add name firstly.');
        return;
    }
   
    selectedTargetName = $(this).prev().text();

    targetObjs = $('.target label');

    $('.name_list ul').empty();
    for(var i=0; i < targetObjs.length; i++){
        if(selectedTargetName == targetObjs[i].innerHTML){
            $('.name_list ul').append($('<li class="selected" data-id="'+$(targetObjs.parent().get(i)).data("id")+'"><a>'+ targetObjs[i].innerHTML + '</a></li>'));
            document.getElementById("sjlj").value=saveTargetMap[''+$(targetObjs.parent().get(i)).data("id")+''].conId;
        	document.getElementById("ms").value=saveTargetMap[''+$(targetObjs.parent().get(i)).data("id")+''].mode;
           
        }else if(targetObjs[i].innerHTML.indexOf('input') < 0){
            $('.name_list ul').append($('<li data-id="'+$(targetObjs.parent().get(i)).data("id")+'"><a>'+ targetObjs[i].innerHTML + '</a></li>'));
        }
    }
    $('.name_list ul li').on('click', function(){
    	tarGid = $(this).data("id");
        $('.name_list ul li').removeClass('selected');
        $(this).addClass('selected');
        $('.table_name').val($(this).children().text());
        
        var $id= $(this).data("id");
        console.log(saveTargetMap[''+$id+''].conId);
        document.getElementById("sjlj").value=saveTargetMap[''+$id+''].conId;
    	document.getElementById("ms").value=saveTargetMap[''+$id+''].mode;
    });

    $('.table_name').val(selectedTargetName);
    $('.target_layer').show();
    $('.mask').show();
    
    $.ajax({
        type:"POST",
        url:urlId+"/selectDataConnection?userId="+userId,
        dataType:"json",
        contentType: "application/json",
        success:function(data){
            for(var i=0;i<data.length;i++){
                $('#sjlj').append("<option value="+data[i].id+">"+data[i].name+"</option>")
            }
            //$.dialog(data);

        }
    });
});
	$('.fa-trash2').on('click', function(e){
        try{
            $(e.target.parentElement.parentElement).slideUp('slow',function(){
                e.target.parentElement.parentElement.remove();
            });
        }catch(e){
            console.log(e)
        }
        var targetid = $(this).parent().parent().data("id");
        console.log(targetid);
        deleteNodeSaveTarget(targetid);
    });
}