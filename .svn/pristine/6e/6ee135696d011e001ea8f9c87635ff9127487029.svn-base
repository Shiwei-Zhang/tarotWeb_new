
$(function(){
    
    
    var flowIdName;
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
        $('.module-data').show();
        $('.module-data-navigation').show();
        $('.module-data-all').show();
        $('.module-manager').hide();
        $('.content').show();
        $('.dataManager').hide();
        $('#manag').hide();
        console.log('flow...');
        // add by tyd
        refreshMenu(refreshEnum[0]);
    });


    //目录管理点击事件
    $('.man1').unbind('click').click(function () {
        $('.module-data-navigation').show();
        $('.module-data').hide();
        $('.dataManager').hide();
        $('.module-manager').show();

        refreshMenu(refreshEnum[1]);

        $('.manager-bodyer').show();
        $('.center-table2').hide();
        $('.center-table1').show();
        $('.power-detail').hide();
        $('.task').hide();
        $('#manag').hide();
        goPage(1, 10, 'table1', 'barcon1');
    });



    //数据源管理点击事件
    var conId;
    $('.man2').unbind('click').click(function () {
        $('.module-data-navigation').hide();
        $('.module-data-all').hide();
        $('.manager-bodyer').hide();
        $('.content').hide();
        $('.dataManager').show();
        $('.center-table1').hide();
        $('.center-table2').show();


        $('.task').hide();
        $('#manag').hide();/*
        $('.BI-bodyer').hide();
        $('.controll-bodyer').hide();*/
        var user = $("#userId").val();
        $('#table2').html('');
        /*alert(user);*/
        $.ajax({
            type: "POST",
            url: "../../json/selectDataConnection.json",
            dataType: "json",
            data: {
                userId: user
            },
            success: function (data) {
                $('#table2').append('<tr class="firTr"><th>SourceType</th><th>Name</th><th>Ip</th><th>CreateTime</th><th>UpdateTime</th><th class="w100"></th></tr>');
                for (var i = 0; i < data.length; i++) {
                    var createTime = new Date(data[i].createTime).toLocaleString();
                    var updateTime = new Date(data[i].updateTime).toLocaleString();
                    $('#table2').append('<tr name="powerData"><td>' + data[i].sourceType + '</td><td value="' + data[i].name + '">' + data[i].name + '</td><td>' + data[i].ip + '</td><td>'
                        + createTime + '</td><td>' + updateTime + '</td><td class="w100"><span class="presh"><span class="mark"/></span>'
                        + '<div class="task"><div class="look" data-id=' + data[i].id + '>查看</div><div class="power">权限管理</div></div></div>' + '</td></tr>');
                    $('.mark').click(function () {
                        //console.log($(this).next());
                        $('.task').hide();
                        $(this).parent().next().show();
                    });
                }
                goPage(1, 10, 'table2', 'barcon2');
                $('.look').click(function () {
                    $('.look-input').html('');
                    $('.lookTable').html('');
                    $('.look-button').show();
                    $('.edit-button').hide();
                    var conId = $(this).data('id');
                    $('.look-detail').show();
                    $('.task').hide();
                    $('.mask').show();

                    $.ajax({
                        type: "POST",
                        url: "../../json/selectValueById.json",
                        dataType: "json",
                        data: {
                            id: conId
                        },
                        success: function (shuju) {
                            $('.look-input').append('<tr><th>数据库类型</th><td>' + shuju.businessType.name + '</td></tr>');
                            $('.lookTable').append('<tr><th>' + shuju.businessEnum[0].name + '</th><td>' + shuju.dataConnectEnumValue[0].value + '</td></tr>');
                            $('.lookTable').append('<tr><th>' + shuju.businessEnum[1].name + '</th><td>' + shuju.dataConnectEnumValue[1].value + '</td></tr>');
                            $('.lookTable').append('<tr><th>' + shuju.businessEnum[2].name + '</th><td>' + shuju.dataConnectEnumValue[2].value + '</td></tr>');
                            $('.lookTable').append('<tr><th>' + shuju.businessEnum[3].name + '</th><td>' + shuju.dataConnectEnumValue[3].value + '</td></tr>');
                            $('.lookTable').append('<tr><th>' + shuju.businessEnum[4].name + '</th><td>' + shuju.dataConnectEnumValue[4].value + '</td></tr>');
                            $('.save2').click(function () {
                                $('.look-detail').hide();
                                $('.mask').hide();
                            });
                            $('.edit2').click(function () {
                                /*$('.edit-conn').show();
                                 $('.look-detail').hide();*/
                                $('.mask').show();
                                $('.edit-button').show();
                                $('.look-button').hide();
                                $('.look-input tr td').empty();
                                $('.lookTable tr td').empty();
                                $($('.look-input tr td')[0]).append($('<select class="add2-sel" id="selectType1">'
                                    + '<option  selected=""  value="">- - - - - - Type'
                                    + '</option><option value="My SQL">Mysql</option><option value="Oracle">Oracle</option>'
                                    + '<option value="SqlServer">SqlServer</option></select>'));
                                $($('.lookTable tr td')[0]).append($('<input  value=' + shuju.dataConnectEnumValue[0].value + ' />'));
                                $($('.lookTable tr td')[1]).append($('<input  value=' + shuju.dataConnectEnumValue[1].value + ' />'));
                                $($('.lookTable tr td')[2]).append($('<input  value=' + shuju.dataConnectEnumValue[2].value + ' />'));
                                $($('.lookTable tr td')[3]).append($('<input  value=' + shuju.dataConnectEnumValue[3].value + ' />'));
                                $($('.lookTable tr td')[4]).append($('<input  value=' + shuju.dataConnectEnumValue[4].value + ' />'));
                                console.log(shuju.businessType.name);
                                $("#selectType1 option[value='" + shuju.businessType.name + "']").attr("selected", true);
                                $('.edit-save').click(function () {
                                    var dbtype = $('#selectType1').val();
                                    var user = $($(".lookTable tr td input")[0]).val();
                                    var password = $($(".lookTable tr td input")[1]).val();
                                    var ip = $($(".lookTable tr td input")[2]).val();
                                    var port = $($(".lookTable tr td input")[3]).val();
                                    var dbName = $($(".lookTable tr td input")[4]).val();
                                    console.log(dbtype);
                                    console.log(user);
                                    console.log(password);
                                    console.log(ip);
                                    console.log(port);
                                    console.log(dbName);
                                    $.ajax({
                                        type: "POST",
                                        url: "upDateDataConnection",
                                        dataType: "json",
                                        data: {
                                            id: conId,
                                            user: user,
                                            password: password,
                                            conType: dbtype,
                                            ip: ip,
                                            port: port,
                                            dbName: dbName
                                        },
                                        success: function (data) {
                                            $('.look-detail').hide();
                                            $('.mask').hide();
                                            alert('修改成功！');
                                        }
                                    });
                                });
                                $('.edit-test').click(function () {
                                    var dbtype = $('#selectType1').val();
                                    var conName = $("#conName").val();
                                    var ip = $($(".lookTable tr td input")[2]).val();
                                    var port = $($(".lookTable tr td input")[3]).val();
                                    var databaseName = $($(".lookTable tr td input")[4]).val();
                                    var user = $($(".lookTable tr td input")[0]).val();
                                    var pwd = $($(".lookTable tr td input")[1]).val();
                                    var uid = $("#userId").val();
                                    console.log(dbtype + '-----' + conName + '-----' + ip + '-----' + port + '-----' + databaseName + '-----' +
                                        user + '-----' + pwd + '-----' + uid + '-----')
                                    $.ajax({
                                        type: "POST",
                                        url: "testConnection",
                                        dataType: "json",
                                        data: {
                                            uid: uid,
                                            connectionName: null,
                                            ip: ip,
                                            port: port,
                                            dbname: databaseName,
                                            user: user,
                                            pwd: pwd,
                                            dbtype: dbtype
                                        },
                                        success: function (data) {
                                            $('#result2').html('');
                                            if (data == true) {
                                                $('#result2').append("连接成功");
                                            } else {
                                                $('#result2').append("连接失败");
                                            }
                                        }
                                    })
                                })
                            });
                        }
                    });
                });
                $('.power').unbind('click').click(function () {
                    $('.power-detail').show();
                    $('.center-table2').hide();
                    goPage(1, 10, 'table3', 'barcon3');
                });

            }
        });
    });


    //数据源管理页面---添加按钮
    $('.add2').click(function(){
        $('.add2-f').show();
        $('.mask').show();
        $('.add2-input').html('');
        $('.conAdd').html('');
        $.ajax({
            type:"POST",
            url:"http://localhost:8080/TarotIDE/selectBusinessTypeAll",
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



    //目录树点击事件
    $('.folder').off('click').on('click', 'li div', function () {
        console.log($(this).attr('menutype'));
        $('.module-data-right-navigation').show();

        //var data_type=$(this).attr('menutype');
        var idName=$(this).attr('id');
        var dataType=$(this).attr('menutype');
        flowIdName=idName;
        tabCheck(idName, dataType);

    });




    //module-data-right-navigation
    $('.tabsEvent').off('click').on('click','li', function (e) {
        e.stopPropagation();
        var targetName=$(this).attr('data_type');
        $(this).addClass('thistab').siblings().removeClass('thistab');
        showType(targetName)
    });


    //bi
    function menutype5(){
        $('.module-data-navigation').show();
        $('.module-data').show();
        $('.module-data-all').show();
        $('.module-flow').hide();
        $('.dataMining-bodyer').hide();
        $('.controll-bodyer').hide();
        $('.BI-bodyer').show();
    }


    //controller
    function menutype2(){
        $('.module-data-navigation').show();
        $('.module-data').show();
        $('.module-data-all').show();
        $('.BI-bodyer').hide();
        $('.module-flow').hide();
        $('.dataMining-bodyer').hide();
        $('.controll-bodyer').show()
    }

    //flow
    function menutype3(){
        $('.module-data-navigation').show();
        $('.module-data').show();
        $('.module-data-all').show();
        $('.BI-bodyer').hide();
        $('.controll-bodyer').hide();
        $('.dataMining-bodyer').hide();
        $('.module-flow').show();
    }

    //
    function menutype4(){
        $('.module-data-navigation').show();
        $('.module-data').show();
        $('.module-data-all').show();
        $('.BI-bodyer').hide();
        $('.controll-bodyer').hide();
        $('.module-flow').hide();
        $('.dataMining-bodyer').show();
    }

    //biData
    $('.Rtitle input').off('click').click(function () {
        console.log($('.biData'));
        $('.biData').show();
        $('.mask').show();
        $('.biData-T .closeA').off('click').click(function () {
            $('.biData').hide();
            $('.mask').hide();
        });
    });


    //数据源、数据接口弹出框
    var detailId;
    $('.add4').off('click').click(function () {
        getDataAdd4();
        //console.log('add4');
        $('.add4-con').show().find('.add4Nav li').click(function () {
            $(this).addClass('bg').siblings('li').removeClass('bg');
            $('.add4-con').children('div').eq($(this).index()).addClass('showCon').siblings('div').removeClass('showCon')
        });

        //增加参数列表的每一列
        addList();
        //点击确定按钮
        sureBtn();
        //input下拉菜单
        $('.connection').change(function(){
            //console.log($(this).children('option:selected').val())
            //console.log($(this).children('option:selected').prop('id'))
            detailId = $(this).children('option:selected').prop('id')
            getDataDetail(detailId);
            if ($('.connection').val() === 'other') {

            }
        })
        /*$('.connection').focus(function (event) {
            var userId = $("#usersId").val();
            console.log(userId)
            getDataAdd4(userId);
            $('.optionList').show()

        }).blur(function (event) {
            event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
            $('.optionList').mouseover(function () {
                $('.optionList').show().on('click', 'li', function () {
                    $('.connection').val($(this).html());
                    detailId = $(this).prop('id');

                    console.log(detailId)
                    getDataDetail(detailId);

                    $('.optionList').hide();
                    if ($('.connection').val() === 'other') {

                    }
                })
            }).mouseout(function () {
                $('.optionList').hide()
            })

        });*/
        $('.mask').show();
        $('.add4-con .closeA,.add4-con .cancel').click(function () {
            $('.add4-con').hide();
            $('.mask').hide();
        })
    });

    //增加参数列表的每一列
    function addList() {
        $('.addBtn').unbind('click').click(function () {
            var new_obj = $("<li><span contenteditable='true'>column1</span><span contenteditable='true'>int</span><i class='closeL'></i></li>");
            $('.paramMain').append(new_obj);
            //参数列表的列
            delList()
        });
    }

    //删除参数列表的每一列
    function delList() {
        $('.closeL').unbind('click').click(function () {
            //console.log($(this).parent());
            $(this).parent().remove();
        })
    }


    var interfaceName;
    //数据源
    function getSelectValue(){
        //单选
        $('.mainList1').find('.singleChecked').next().each(
            function(index,item){
                console.log($(item).html());
                interfaceName=$(item).html()
            })
    }

    //点击确定
    function sureBtn() {
        var isInterface;
        var sourceColumn=[];
        $('.sure').unbind('click').click(function () {
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


            if (paren.attr('class') === 'dataContainerA') {
                console.log(0);
                isInterface=0;
                getSelectValue();
                sendMessage(isInterface,flowIdName,detailId,interfaceName,sourceColumn)
            } else if (paren.hasClass('optionA')) {
                console.log(1);
                isInterface=1;
                interfaceName=interName;
                sendMessage(isInterface,flowIdName,detailId,interfaceName,sourceColumn)
            }
        })
    }



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
    $('.mainEvent,.add3-con,.table1Event').unbind('click').click(function (e) {
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




    function showType($dataType){
        if ($dataType == 5) {
            menutype5();
        } else if ($dataType == 2) {
            menutype2()
        } else if ($dataType == 3) {
            menutype3()
        } else if ($dataType == 4) {
            menutype4()
        }
    }

    function tabCheck($idName, $dataType){
        var isExist = false;
        $('.tabsEvent li').each(function(index, item){
            var $item = $(item);
            var idName = $item.attr('idName');
            if($idName == idName){
                isExist = true;
            }
        });
        var iconType;
        //2是controller，3是flow，4是datamining，5是biIcon
        if($dataType==2){
            iconType='controllerIcon';
        }else if($dataType==3){
            iconType='flow';
        }else if($dataType==4){
            iconType='DataMicon';
        }else if($dataType==5){
            iconType='biIcon';
        }
        if( !isExist&& $dataType!=1){
            $('.tabsEvent li').removeClass('thistab');
            $('.tabsEvent').append(
                '<li class="thistab" data_type="'+$dataType+'" idName="'+$idName+'"><a tab="tab1_1"><span class="'+iconType+'"></span><span class="name_m" title="Co Flow">name</span><span class="close_m"><i class="fa  fa-close-m"></i></span></a></li>'
            );
            showType($dataType);

            $('.close_m').unbind('click').click(function(e){
                var className = $(this).parent().attr('tab');
                $(this).parent().parent().hide()//remove();
                $('.' + className).hide()//remove();
            });
        }else{
            showType($dataType)
        }
    }

});


function addConnection() {
    var dbtype = $('#selectType').val();
    var conName = $("#conName").val();
    var ip = $("#ip").val();
    var port = $("#post").val();
    var databaseName = $("#databaseName").val();
    var user = $("#user").val();
    var pwd = $("#password").val();
    var uid = $("#userId").val();
    $.ajax({
        type: "POST",
        url: "../../json/dataconnection.json",
        dataType: "json",
        data: {
            uid: uid,
            connectionName: conName,
            ip: ip,
            port: port,
            dbname: databaseName,
            user: user,
            pwd: pwd,
            dbtype: dbtype
        },
        success: function (data) {
            $('#table2').append('<tr><td>' + data.sourceType + '</td><td>' + data.name + '</td><td>' + data.ip + '</td><td>'
                + data.createTime + '</td><td>' + data.updateTime + '</td><td><div class="presh"><i class="fa fa-tasks"></i>'
                + '<div class="task"><div class="look">查看</div><div class="power">权限管理</div></div></div>' + '</td></tr>');
            $('.add2-f').hide();
            window.location.reload();
        }
    })
}