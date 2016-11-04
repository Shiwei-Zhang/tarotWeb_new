//公共对象：刷新类型枚举，1是工作区目录刷新，2是管理目录刷新
var refreshEnum2 = [1,2];
//公共对象：标记枚举
var signArray = new Array();
//公共对象：权限枚举
var powerEnum2 = ["0b10","0b01"];
//公共对象：最高权限
var maxPower2 = "0b11";
var dbtype;
var detailId;
var interfaceName;
var flowIdName;
$(function(){
    $('.paramMain:before').click(function () {
        console.log('ok')
    });
    //目录树点击事件
    //TODO

    $('.folder').unbind('click').on('click', 'li div', function () {
        console.log($(this).attr('menutype'));
        $('.module-data-right-navigation').show();

        //var data_type=$(this).attr('menutype');
        var idName=$(this).attr('id');
        var dataType=$(this).attr('menutype');
        var fileName = $(this).children().last().text();
        flowIdName=idName;
        //console.log(flowIdName);
        if(dataType == 1){//文件夹
        	return;
        }
        //other files
        //getSelectAllFlowId(flowIdName);
        tabCheck(idName, dataType, fileName);
        //初始化事件
    });

    //module-data-right-navigation
    $('.tabsEvent').off('click').on('click','li', function (e) {

        if($(this).hasClass('thistab')){
        	return ;
        }
        var $dataType = $(this).attr('data_type');
        var $idName = $(this).attr('idName');
        $(this).addClass('thistab').siblings().removeClass('thistab');

        //隐藏所有
        $('.module-manager').hide();
        $('.module-flow, .module-bi, .module-datamining, .module-controller').hide();

        //2.controller, 3.flow, 4.datamining, 5.bi
        showType($idName, $dataType)
    });


    //工作区管理按钮点击事件
    $('.managers').off('click').on('click', function (e) {
        e.stopPropagation();
        $('.managers').addClass('header_active');
        $('.flows').removeClass('header_active');
        $('#manag').show();
    });
    $('html').off('click').on('click', function () {
        $('#manag').hide();
    });
    $('.flows').unbind('click').click(function () {
        $('.managers').removeClass('header_active');
        $('.flows').addClass('header_active');
        $('.module-data,.module-data-navigation,.module-data-all,.content').show();
        $('.module-manager,.dataManager,#manag').hide();
        console.log('flow...');
        // add by tyd
        refreshMenu(refreshEnum[0]);
    });


    //bi filter
    createMenu();
    //TODO
    function createMenu(){
        var obj_temp=$("<li><div class='filterMain'><select class='seleIdName'><option value='' selected>ID</option></select><select class='seleList'><option value='' selected>=</option><option value=''>+</option><option value=''>-</option><option value=''>*</option></select><input type='text'><i class='closeB'></i></div><div class='filterMain'><select class='seleIdName'><option value='' selected>OR</option></select><select class='seleList'><option value='' selected>升</option><option value=''>降</option></select></div></li>");

        $('.createMenu').unbind().click(function(e){
            e = e || window.event;
            e.stopPropagation?e.stopPropagation():e.cancelBubble = true;
            console.log('add');
            $(this).parent().parent().prepend(obj_temp);
        });

        $('.filterContainer .closeB').unbind().click(function(e){
            e = e || window.event;
            e.stopPropagation?e.stopPropagation():e.cancelBubble = true;
            console.log('close');
            $(this).parent().parent().remove();
        })
        
    };

    //增加参数列表的每一列
    function addList() {
        $('.addBtn').unbind('click').click(function () {
            var new_obj = $("<li><span contenteditable='true'>column1</span><span contenteditable='true'>int</span><i class='closeL'></i></li>");
            $('.paramMain').append(new_obj);
            //参数列表的列
            delList()
        });
    };

    //删除参数列表的每一列
    function delList() {
        $('.closeL').unbind('click').click(function () {
            //console.log($(this).parent());
            $(this).parent().remove();
        })
    };

    //数据源
    function getSelectValue(){
        //单选
        $('.mainList1').find('.singleChecked').next().each(
            function(index,item){
                console.log($(item).html());
                interfaceName=$(item).html()
            })
    };

    //点击确定
    function sureBtn() {
        var isInterface;
        var sourceColumn=[];
        $('.sureEvent').unbind('click').click(function () {
            var paren = $(this).parent().parent();
            var interName=$('.partN input').val();
            //console.log($(this).parent().parent().attr('class'));
            for(var i=1;i<$('.paramMain').find('li').length;i++){
                var cur=$('.paramMain').find('li')[i];
                source={
                    'name':$(cur).find('span').eq(0).html(),
                    'type':$(cur).find('span').eq(1).html()
                };
                sourceColumn.push(source)
            }
            console.log(paren.attr('class'));
            closeAdd4();
            if (paren.attr('class').indexOf('ContainerAevnet') >0 ) {
                isInterface=0;
                getSelectValue();
                if(interfaceName){
                    sendMessage(isInterface,flowIdName,detailId,interfaceName,sourceColumn)
                }
            } else if (paren.attr('class').indexOf('optionAevnet') >0 ) {
                console.log(1);
                isInterface=1;
                interfaceName=interName;
                if(interName){
                    sendMessage(isInterface,flowIdName,detailId,interfaceName,sourceColumn)
                }
            }
        })
    };

    getSelect();
    //获取mainEvent下选中的内容
    function getSelect() {
        //console.log($('.mainEvent li .singleChecked'))
        $('.mainEvent li .singleChecked').each(function (index, item) {
            console.log(item)
            for (var i = 0; i < $('.mainEvent li .singleChecked').length; i++) {
                console.log($($('.mainEvent li .singleChecked')[i]).next())
            }
        })
    };

    //controller
    $('.add3').unbind('click').click(function () {
        console.log('add3');
        $('.add3-con').show();
        $('.mask').show();
    });
    $('.content1 .closeA,.content1 .cancel').unbind('click').click(function () {
        $('.add3-con').hide();
        $('.mask').hide();
    });

    //单选框
    $('.mainEvent,.add3-con,.table1Event,.biDataR').unbind('click').click(function (e) {
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

    //BI 数据分析
    $('.biData .closeA').click(function () {
        $('.biData').hide();
        $('.mask').hide();
    });
    $('.mapList p span').click(function () {
        console.log($(this));
        if ($(this).hasClass('.clicked')) {
            $(this).removeClass('.clicked')
        } else {
            $(this).addClass('.clicked')
        }
    });

    $('.fa-trash2').click(function () {
        $('.add2-f').hide();
        $('.look-detail').hide();
        $('.look-input tr td').empty();
        $('.lookTable tr td').empty();
        $('.edit-conn').hide();
        $('.look-detail .h4 span').html('查看');
        $('.mask').hide();
    });

    $('.add4').off('click').click(function () {
        getDataAdd4();
        //console.log('add4');
        $('.add4Event').show().find('.add4NavEvent li').click(function () {
            $(this).addClass('bg').siblings('li').removeClass('bg');
            $('.add4Event').children('div').eq($(this).index()).addClass('showCon').siblings('div').removeClass('showCon')
        });

        //增加参数列表的每一列
        addList();
        //点击确定按钮
        sureBtn();
        //input下拉菜单
        $('.connectionEvent').change(function(){
            detailId = $(this).children('option:selected').prop('id');
            if(detailId){
                getDataDetail(detailId);
            }else {
                alert('detailId不存在');
                //TODO
                if ($('.connectionEvent').val() === 'other') {

                }

            }


        });

        $('.mask').show();
        $('.add4Event .closeA,.add4Event .cancel').click(function () {
            closeAdd4();
        })
    });

    function tabCheck($idName, $dataType, $fileName){
        //TODO
        var isExist = false;
        $('.tabsEvent li').each(function(index, item){
            var $item = $(item);
            var idName = $item.attr('idName');
            if($idName == idName){
                isExist = true;
            }
        });
        var iconType;
        //2是controller，3是flow，4是datamining，5是bi
        if($dataType==2){
            iconType='controllerIcon';
        }else if($dataType==3){
            iconType='flow';
        }else if($dataType==4){
            iconType='DataMicon';
        }else if($dataType==5){
            iconType='biIcon';
        }
        if( !isExist ){
            $('.tabsEvent li').removeClass('thistab');
            $('.tabsEvent').append(
                '<li class="thistab tabs-'+ $idName +'" data_type="'+$dataType+'" idName="'+$idName+'"><a tab="tab1_1"><span class="'+iconType+'"></span><span class="name_m" title="Co Flow">' + $fileName + '</span><span class="close_m"><i class="fa  fa-close-m"></i></span></a></li>'
            );
            //隐藏其他页面
            $('.module-manager').hide();
            $('.module-flow, .module-bi, .module-datamining, .module-controller').hide();
            //显示当前对象
            showType($idName, $dataType);

            $('.close_m').unbind('click').click(function(e){
                e = e || window.event;
                if(e.stopPropagation) { //W3C阻止冒泡方法
                    e.stopPropagation();
                } else {
                    e.cancelBubble = true; //IE阻止冒泡方法
                }
                var $liObj = $(this).parent().parent();

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
                }
                $liObj.hide();

                if($liObj.hasClass('thistab')){
                    if($('.tabsEvent li').length > 0){
                        $('.module-manager').hide();
                        $('.module-flow, .module-bi, .module-datamining, .module-controller').hide();
                        var i = 0;
                        while($($('.tabsEvent li')[i]).css('display') == 'none'){
                            i++
                        }
                        $($('.tabsEvent li')[i]).addClass('thistab');

                        var needShowObj = $($('.tabsEvent li')[i]);
                        showType(needShowObj.attr('idName'), needShowObj.attr('data_type'))
                    }
                }
            });
        }else{
            $('.module-manager').hide();
            $('.module-flow, .module-bi, .module-datamining, .module-controller').hide();
            $('.tabsEvent li').removeClass('thistab');
            $('.tabs-' + $idName).addClass('thistab').show();

            showType($idName, $dataType);
        }
    };

    //loading related data
    function showType($idName, $dataType){
        //TODO 2是controller，3是flow，4是datamining，5是bi
        if($dataType == 2){
            //TODO Loading controller data and mask
            $('.controller-template').show();
        }else if($dataType == 3){
            //TODO Loading flow data and mask
        	getSelectAllFlowId($idName);
            $('.flow-template').show();
        }else if($dataType == 4){
            //TODO Loading datamining data and mask
            $('.datamining-template').show();
        }else if($dataType == 5){
            //TODO Loading bi data and mask
        	$('.showbiData').attr('data-templateid', $idName);
        	biInit($idName);
            $('.bi-template').show();
        }

    };

    //数据源、数据接口弹出框
    function closeAdd4(){
        $('.add4Event').hide();
        $('.mask').hide();
    };

    //目录管理点击事件
    $('.man1').unbind('click').click(function () {
        $('.module-data,.dataManager').hide();
        $('.module-data-navigation,.module-manager').show();
        refreshMenu(refreshEnum[1]);
        $('.manager-bodyer,.center-table1').show();
        $('.center-table2,.power-detail,.task,#manag').hide();
        goPage(1, 10, 'table1', 'barcon1');
    });

	//数据连接管理
	var conId;
	$('.man2').click(function () {
		var user = $("#userId").val();
        goDatasource(user,null);
	});
	//数据源管理页面---添加按钮
	$('.add2').click(function(){
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
				//console.log(data);
				var optionStr='';
				for(var i=0;i<data.length;i++){
					//console.log(data[i].code);
					optionStr+='<option value="'+data[i].code+'">'+data[i].name+'</option>';
				}
				$('.add2-input').append('<tr><th>数据库类型</th><td><select name = "sel" class="add2-sel" id="selectType" '
						+'onchange="show_detail(this);"><option  selected=""  value="">- - - - - - Type</option>'+ optionStr +'</select></td></tr>');

			}
		});
	});
});


//下拉框变化显示不同table

function show_detail(obj){
	var opt = obj.options[obj.selectedIndex];
	//console.log("The option you select is:"+opt.text+"("+opt.value+")");
	dbtype=opt.value;

	$.ajax({
		type:"POST",
		url:urlId+"/selectBusinessEnumByBusinessType",
		dataType:"json",
		data:{
			businessType: opt.value
		},
		success:function(data){
			$('.conAdd').html('');
			//console.log(data);
			var conAddStr='<tr><th><input type="hidden" value="数据连接名">数据连接名</th><td><input type="text" id="conName"></td></tr>';
			for(var i=0;i<data.length;i++){
				//console.log(data[i].code);
				conAddStr+='<tr><th><input type="hidden" value="'+data[i].code+'">'+ data[i].name+'</th><td><input type="text"/></td>';
			}
			$('.conAdd').append(conAddStr);
		}
	});
};

//添加数据源----保存按钮
//var uid = $("#userId").val();
var uid=$("#userId").val();
function addConnection(){
	var powerArray = new Array();
	var tableAdd=$('.conAdd').find(':text');
	var thAdd=$('.conAdd').find(':hidden');
	for(var i=1;i<tableAdd.length;i++){
		var Obj = new Object();
		Obj.name = thAdd.eq(i).val();
		Obj.value = tableAdd.eq(i).val();
		//console.log(Obj);
		powerArray.push(Obj);
		console.log(powerArray);
	}
	var jsonObj = new Object();
	jsonObj.connectionName =$('#conName').val();
	jsonObj.uid =uid ;
	jsonObj.powerArray=powerArray;
	jsonObj.dbtype = dbtype;
	console.log(jsonObj);
	$.ajax({
		type:"POST",
		url:urlId+"/addDataconnection",
		dataType:"json",
		contentType: "application/json",
		data:JSON.stringify(jsonObj),
		success:function(data){
			/*var createTime = new Date(data.createTime).toLocaleString();
			var updateTime = new Date(data.updateTime).toLocaleString();
			$('#table2').prepend('<tr name="powerData"><td>'+data.sourceType+'</td><td value="'+data.name+'">'+data.name+'</td><td>'
					+data.ip+'</td><td>'+createTime+'</td><td>'+updateTime+'</td>'
					+'<td class="w100"><span class="presh"><span class="mark"/></span>'
					+'<div class="task"><div class="look" data-id=' + data.id +' data-name='+data.name+ '>查看</div>'
					+'<div class="power" data-id=' + data.id + '>权限管理</div>'
					+'<div class="delete" data-id=' + data.id + '>删除</div></div></div>'+'</td></tr>');*/
			$('.add2-f').css("display","none");
			$('.mask').css("display","none");
			$('#table2').css("display","block");
			goDatasource(uid,null);
			//goPage(1,10,'table2','barcon2');
			alert('新增成功！');			
		}
	})
};
//添加数据源----测试按钮
function testConnection(){
	var testArray = new Array();
	var tableTest=$('.conAdd').find(':text');
	var thTest=$('.conAdd').find(':hidden');
	for(var i=1;i<tableTest.length;i++){
		var Obj = new Object();
		Obj.name = thTest.eq(i).val();
		Obj.value = tableTest.eq(i).val();
		//console.log(Obj);
		testArray.push(Obj);
		//console.log(testArray);
	}
	var jsonObj = new Object();
	jsonObj.powerArray=testArray;
	jsonObj.dbtype = dbtype;
	console.log(jsonObj);
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
		}
	})
}
//目录管理搜索框
$('#itemValue').focus(function () {
	$('#searchInfo').show()
}).blur(function () {
	$('#searchInfo').hide()
});

//数据连接回车搜索--完成BUG-34
$('#itemValue2').keydown(function(e){
	if(e.keyCode==13){
		searchItem2(); //处理事件
	}
	});
function searchItem2(){
	var str = $('#itemValue2').val();
	var user = $("#userId").val();
	goDatasource(user,str);
}

function goDatasource(userId,content){
	$('.module-data-navigation,.module-data-all,.manager-bodyer,.content,.center-table1').hide();
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
	/*alert(user);*/
	$.ajax({
		type:"POST",
		url:url,
		dataType:"json",
		data:data,
		success:function(data){
			console.log(data);
			$('#table2').append('<tr class="firTr"><th>SourceType</th><th>Name</th><th>Ip</th><th>CreateTime</th><th>UpdateTime</th><th class="w100"></th></tr>');
			for(var i=0 ;i<data.length ; i++){
				var createTime = new Date(data[i].createTime).toLocaleString();
				if(data[i].updateTime!=null){
					var updateTime = new Date(data[i].updateTime).toLocaleString();
				}else{
					var updateTime = '';
				}

				console.log(data[i].updateTime+"**********"+updateTime);
				$('#table2').append('<tr name="powerData"><td>'+data[i].sourceType+'</td><td value="'+data[i].name+'">'+data[i].name+'</td><td>'
						+data[i].ip+'</td><td>'+createTime+'</td><td>'+updateTime+'</td>'
						+'<td class="w100"><span class="presh"><span class="mark"/></span>'
						+'<div class="task"><div class="look" data-id=' + data[i].id +' data-name='+data[i].name+ '>查看</div>'
						+'<div class="power" data-id=' + data[i].id + '>权限管理</div>'
						+'<div class="delete" data-id=' + data[i].id + '>删除</div></div></div>'+'</td></tr>');
                $('.table2').unbind('click').click(function (e) {
                    e = e || window.event;
                    var tar = e.target || e.srcElement;
                    if (tar.tagName.toLowerCase() === 'span' && $(tar).hasClass('mark')) {
                        $('.task').hide();
                        $(tar).parent().next().show();
                    }else {
                        $('.task').hide();
                    }
                });
			}
			goPage(1,10,'table2','barcon2');
			//查看按钮
			$('.look').click(function(){
				$('.look-input').html('');
				$('.lookTable').html('');
				$('.look-button').show();
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
						$('.look-input').append('<tr><th>数据库类型</th><td>'+ shuju.businessType.name+'</td></tr>');
						$('.lookTable').append('<tr><th><input type="hidden" value="数据连接名">数据连接名</th><td>'+ conName+'</td></tr>');
						for(var i=0;i<length;i++){
							$('.lookTable').append('<tr><th><input type="hidden" value="'+shuju.businessEnum[i].code+'">'+shuju.businessEnum[i].name+'</th><td>'+ shuju.dataConnectEnumValue[i].value+'</td></tr>');
						}
						//查看页面保存按钮
						$('.save2').click(function(){
							$('.look-detail').hide();
							$('.mask').hide();
						});
						//查看页面编辑按钮
						$('.edit2').unbind('click').click(function(){
							/*$('.edit-conn').show();
					        $('.look-detail').hide();*/
							$('.mask').show();
							$('#result2').empty();
							$('.edit-button').show();
							$('.look-button').hide();
							$('.look-input tr td').empty();
							$('.lookTable tr td').empty();
							$('.look-detail .h4 span').html('编辑');
							$($('.look-input tr td')[0]).append($('<select class="add2-sel" id="selectType1">'
									+'<option  selected=""  value="">- - - - - - Type'
									+'</option><option value="mysql">MY SQL</option><option value="oracle">ORACLE</option>'
									+'<option value="sqlserver">SQL SERVER</option></select>'));
							$($('.lookTable tr td')[0]).append($('<input  value='+ conName+' />'));
							for(var i=1;i<$('.lookTable tr td').length;i++){
								$($('.lookTable tr td')[i]).append($('<input  value='+ shuju.dataConnectEnumValue[i-1].value+' />'));
							}
							//console.log(shuju.businessType.name);
							$("#selectType1 option[value='"+shuju.businessType.code+"']").attr("selected",true);
							//编辑页面保存按钮
							$('.edit-save').unbind('click').click(function(){
								var powerArray = new Array();
								var conType = $('#selectType1').val();
								var tableEdit=$('.lookTable').find(':text');
								var thEdit=$('.lookTable').find(':hidden');
								for(var i=1;i<tableEdit.length;i++){
									var Obj = new Object();
									Obj.name = thEdit.eq(i).val();
									Obj.value = tableEdit.eq(i).val();
									/*console.log(Obj);*/
									powerArray.push(Obj);
									/*console.log(powerArray);*/
								}
								var jsonObj = new Object();
								jsonObj.conType=conType;
								jsonObj.connectionName =$($(".lookTable tr td input")[0]).val();
								jsonObj.id =conId ;
								jsonObj.enumArray=powerArray;
								/*console.log(jsonObj);*/
								$.ajax({
									type:"POST",
									url:urlId+"/upDateDataConnection",
									dataType:"json",
									contentType: "application/json",
									data:JSON.stringify(jsonObj),
									success:function(data){
										$('.look-detail').hide();
										$('.mask').hide();
										alert('修改成功！');
									}
								});
							});
							//编辑页面测试按钮
							$('.edit-test').unbind('click').click(function(){
								var powerArray = new Array();
								var conType = $('#selectType1').val();
								var tableEdit=$('.lookTable').find(':text');
								var thEdit=$('.lookTable').find(':hidden');
								for(var i=1;i<tableEdit.length;i++){
									var Obj = new Object();
									Obj.name = thEdit.eq(i).val();
									Obj.value = tableEdit.eq(i).val();
									/*console.log(Obj);*/
									powerArray.push(Obj);
									/*console.log(powerArray);*/
								}
								var jsonObj = new Object();
								jsonObj.powerArray=powerArray;
								jsonObj.dbtype = conType;
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
									}
								})
							})
						});
					}
				});
			});
			
			//点击删除
			$('.delete').click(function(){
				var $this = $(this);
				var cid = $(this).data('id');
				var uid = $("#userId").val();
				$.ajax({
					type:"POST",
					url:urlId+"/deleteDataConnection",
					dataType:"json",
					data:{
						cid:cid,
						uid:uid
					},
					success:function(data){
						$('.task').hide();
						$this.parent().parent().parent().remove();
						//re-layer  
						var currentPage=$('.numPage.active').text();
						goPage(currentPage,10,'table2','barcon2');
					}
					
					});
			});
			//权限管理
			$('.power').click(function(){
				conId = $(this).data('id');
				powerList(conId,null);
			});

			//权限管理页面保存按钮
			window.savePower2 = function(){
				var powerArray = new Array();
				//var username = $("#userName").val();
				var username=$("#userName").val();
				console.log('长度'+signArray.length);
				for(var i=0;i<signArray.length;i++){
					var id = signArray[i];
					var powerStr = "0b";
					$("#userPower"+id).find("i[name='checkbox']").each(
							function(){
								 if($(this).hasClass('singleChecked')){
									powerStr+="1";	
								}else{
									powerStr+="0";
								}
							}
					);
					var isAdd = $("#userPower"+id).attr("isadd");
					//console.log(powerStr);
					var Obj = new Object();
					Obj.conId=conId;
					Obj.username=username;
					Obj.userId=id;
					Obj.power=powerStr;
					Obj.isadd=isAdd;
					powerArray.push(Obj);
				}
				//console.log(powerArray);
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
						for(var i=0;i<signArray.length;i++){
							var id = signArray[i];
							$("#userPower"+id).attr("isadd","0");
						}
						//及时修改当前用户该菜单的权限
						var currentUserPowerStr = "0b";
						//var currentUserId = $("#userId").val();
						var currentUserId =$("#userId").val();;
						$("#userPower"+currentUserId).find("i[name='checkbox']").each(
								function(){
									 if($(this).hasClass('singleChecked')){
										currentUserPowerStr+="1";	
									}else{
										currentUserPowerStr+="0";
									}
								}
						);
						/*var isShow = showType(currentUserPowerStr);
		    			 $("#"+menuIdPre+selectedMenuId).attr("name",isShow);
				    	 $("#"+menuIdPre+selectedMenuId).attr("power",currentUserPowerStr);*/
						//清空signArray
						signArray = [];
						//console.log(data);
						alert("修改成功！");
					},  
					error : function() {   
						//清空signArray
						signArray = [];
						alert("异常！");  
					}  
				})

			};
			//工具类方法：标记被选中过的条目id，该id也恰好是userId
			window.signClick = function(id){
				if(signArray.indexOf(id)==-1){
					signArray.push(id);
				}
			}
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
	var str = $('#itemValue3').val();
	powerList(conId,str);
}
function powerList(conId,content){
	console.log(conId);
	console.log(content);
	$('.power-detail').show();
	$('.center-table2').hide();
	if(content!=null){
		url=urlId+"/selectByConIdLike";
		data={conId: conId,content:content,userId:$("#userId").val()}
	}else{
		url=urlId+"/selectUserPowerByConId";
		data={conId: conId,userId:$("#userId").val()}
	}
	$.ajax({
		type:"POST",
		url:url,
		dataType:"json",
		data:data,
		success:function(data){
			/*console.log('显示'+data);*/
			var tablestr="";
			for(var i=0 ;i<data.length ; i++){
				var power = data[i].POWER;
				var checkboxStr = "";
				for(var j=0;j<powerEnum2.length;j++){
					if(powerConjunction(power,powerEnum2[j])){
						checkboxStr+='<td class="w50" ><i name=checkbox class="single singleChecked"></i>';
					}else{
						checkboxStr+='<td class="w50"><i name=checkbox class="single"></i>';
					}
				}
				var createTime = new Date(data[i].CREATE_DATA).toLocaleString();
				var updateTime = new Date(data[i].UPDATE_DATA).toLocaleString();
				//1是add，0是update
				var isAdd = 0;
				if(!power){
					isAdd = 1;
				}
				tablestr+='<tr id = "userPower'+data[i].ID+'" isadd="'+isAdd+'" name="powerData" style="display: block;" onclick="signClick('+data[i].ID+');">'
				+'<td value="'+data[i].NAME+'">'+data[i].NAME+'</td>'
				+'<td  value="'+data[i].LOGIN_ID+'">'+data[i].LOGIN_ID+'</td>'
				+'<td>'+data[i].E_MAIL+'</td><td>'
				+createTime+'</td><td>'+updateTime+'</td>'
				+checkboxStr+'</tr>';
			}
			$("#table3 tr[name='powerData']").remove();
			$('#table3').append($(tablestr));
			goPage(1,10,'table3','barcon3');
		},  
		error : function() {   
			alert("异常！");  
		}  
	});
}