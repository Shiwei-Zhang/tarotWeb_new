/**
 * Created by gjc on 16-11-2.
 */

$(function () {
    console.log('component');
    var conId = $('li.thistab').attr('idname');
    $('.component').off('click').on('click', function () {
        console.log("controller ok");
        $.ajax({
            /*url:'../../json/selectMenuByUserId.json',*/
            url: urlId + '/controller/queryLogicFlow',
            type: 'POST',
            dataType: "json",
            data: {userId: userId, conId: conId},
            success: function (data) {
                var htmlstr = "<p><i class=\"downIcon titleTip\"></i><span>Home</span></p><div>";
                if(data!=null && data.length>0) {
                    for (var i = 0; i < data.length; i++) {
                        htmlstr = flowLoop(htmlstr, data[i]);
                    }
                    htmlstr += "</div>";
                }
                $(".addRoot01").html(htmlstr);
                $('.add3EventOne,.mask').show();
                titleTip();
            },
            error: function () {
                alert("异常！");
            }
        })
    });

    //根据不同的节点,拼接html.  tempData是目录节点或者flow节点
    function flowLoop(htmlstr, tempData) {
        var type = tempData.type;
        var iname = tempData.name;

        //当前结点是目录的操作
        if(type == 1) {
            if(tempData.pid!=0) {
                htmlstr += "<li>";
            }
            htmlstr += "<div class=\"menu1\"><p><i class=\"downIcon titleTip\"></i><span>" + iname + "</span></p><ul class=\"menu1List\">\n";
            var childrens = tempData.childrens;
            if(childrens!=null && childrens.length>0) {
                for (var i = 0; i < childrens.length; i++) {
                    htmlstr = flowLoop(htmlstr, childrens[i]);
                }
            }
            htmlstr += "</ul></div>"
            if(tempData.pid!=0) {
                htmlstr += "</li>";
            }

            //当前结点不是目录的操作
        } else {
            htmlstr += "<li><i class=\"single";
            (tempData.isSelected==1) ? htmlstr += " singleChecked" : htmlstr += "";
            htmlstr += "\"></i><span id='"+tempData.id+"'>" + iname + "</span></li>"
        }
        return htmlstr;
    }

    //重新绑定事件
    function titleTip() {
        $('.titleTip').on('click',function(e){
            if ($(this).hasClass('downIcon')) {
                $(this).removeClass('downIcon').addClass('rightIcon');
                $(this).parent().next().hide()
            } else {
                $(this).removeClass('rightIcon').addClass('downIcon');
                $(this).parent().next().show()
            }
        });
    }


    $('div.stream-con').html(function () {
        console.log("stream-con ok");
        var children = $(".addRoot01 div").children();
        var array = {};
        for (var i; i<children.length; i++) {
            var dirLevel = "";
            nodeLoop(dirLevel, array.children[i]);
        }
     });

    function nodeLoop(array, dirLevel, node) {
        if(node.type==1) {
            dirLevel += node.name;
            var childs = node.children();
            var array = {};
            for (var i; i<childs.length; i++) {
                nodeLoop(dirLevel, childs[i]);
            }
        } else {
            var firstChild = node.firstChild;
            if(firstChild.attr("class") == 'single singleChecked')
                array.push(dirLevel += firstChild.next().text)
        }
    }

});