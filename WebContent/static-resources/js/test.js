/**
 * Created by tian yidong on 2016/9/23.
 */
//logic_node的序列号
$(function(){
	    document.oncontextmenu = function(e){
	        e.preventDefault();
	    };
	});
var logic_node_num = 1;
/*//先添加父节点，再把选中节点移到父节点上
function add_node_p(jm,nodeid){
    var selected_node = jm.get_node(nodeid); 
    //添加父节点，sourceid为"".
    var nodeid = jsMind.util.uuid.newid();
    var topic = 'logic_node'+logic_node_num;
    var flowid = selected_node.data.flowid;
    var line_color = selected_node.data.line_color;
    var level = selected_node.data.level;
	var pk = jsMind.util.uuid.newid();
	var data = {"level":level,"pk":pk,"sql":"","isSave":0,"isInterface":0,"isDebug":0,"alias":topic,"flowid":flowid,"sourceid":"","subMind":"","columns":"","params":"","line_color":line_color};
	var index = selected_node.index;
	var node = jm.add_node(selected_node.parent, nodeid, topic,data,index);
	logic_node_num++;
	//把选中节点移到父节点上
	jm.move_node(selected_node.id, "_last_", node.id, "-1");
	jm.select_node(nodeid);
}
//先添加父节点，再把目标节点移到父节点上，再把选中节点移到父节点上
function fuse_node(jm,target_node,beforeid){
	var selected_node = jm.get_selected_node(); 
    if(!selected_node){prompt_info('please select a node first.');}
    //添加父节点level为1，sourceid为"".
    var flowid = selected_node.data.flowid;
    var line_color = selected_node.data.line_color;
    var level;
    if(jm.options.container=="jsmind_container"){
    	level = 1;
    }else{
    	level = 3;
    }
    var topic = 'logic_node'+logic_node_num;
	var pk = jsMind.util.uuid.newid();
	var data = {"level":level,"pk":pk,"sql":"","isSave":0,"isInterface":0,"isDebug":0,"alias":topic,"flowid":flowid,"sourceid":"","subMind":"","columns":"","params":"","line_color":line_color};
	var index = target_node.index;
	var nodeid = jsMind.util.uuid.newid();
	var node = jm.add_node(target_node.parent, nodeid, topic,data,index);
	logic_node_num++;
	//把目标节点移到父节点上
	jm.move_node(target_node.id, "_first_", node.id, "-1");
	//把选中节点移到父节点上
	jm.move_node(selected_node.id, beforeid, node.id, "-1");
	jm.select_node(nodeid);
}
//先添加父节点，再创建新节点，最后把目标节点移到父节点上
function fuse_node2(jm,target_node,beforeid){
	//添加父节点level为1，sourceid为"".
	var flowid = $('#jmnodeModel').attr('flowid');
	var line_color = $('#jmnodeModel').attr('line_color');
    var topic = 'logic_node'+logic_node_num;
    var nodeid = jsMind.util.uuid.newid();
	var pk = jsMind.util.uuid.newid();
	var level;
	if(jm.options.container=="jsmind_container"){
    	level = 1;
    }else{
    	level = 3;
    }
	var data = {"level":level,"pk":pk,"sql":"","isSave":0,"isInterface":0,"isDebug":0,"alias":topic,"flowid":flowid,"sourceid":"","subMind":"","columns":"","params":"","line_color":line_color};
	var index = target_node.index;
	var node = jm.add_node(target_node.parent, nodeid, topic,data,index);
	logic_node_num++;
	//创建新节点
	var topic2 = $('#jmnodeModel').html();
	var level2 = $('#jmnodeModel').attr('level');
	var sourceid = $('#jmnodeModel').attr('sourceid');
	var nodeid2 = jsMind.util.uuid.newid();
	var pk2 = jsMind.util.uuid.newid();
	var data2 = {"level":level2,"pk":pk2,"sql":"","isSave":0,"isInterface":0,"isDebug":0,"alias":topic2,"flowid":flowid,"sourceid":sourceid,"subMind":"","columns":"","params":"","line_color":line_color};
	jm.add_node(node, nodeid2, topic2,data2);
	//把目标节点移到父节点上
	jm.move_node(target_node.id, beforeid, node.id, "-1");
	jm.select_node(nodeid);
}*/
function set_flag(e,type){
	e.parentNode.style.visibility = 'hidden';
	var nodeid = e.parentNode.getAttribute('nodeid');
	if(type==1){
		if($($($('jmnode[nodeid="'+nodeid+'"]')[0]).find('div')[0]).css('visibility')=='visible'){
			$($($('jmnode[nodeid="'+nodeid+'"]')[0]).find('div')[0]).css('visibility','hidden');
		}else{
			$($($('jmnode[nodeid="'+nodeid+'"]')[0]).find('div')[0]).css('visibility','visible');
		}
	}else if(type=2){
		if($($($('jmnode[nodeid="'+nodeid+'"]')[0]).find('div')[1]).css('visibility')=='visible'){
			$($($('jmnode[nodeid="'+nodeid+'"]')[0]).find('div')[1]).css('visibility','hidden');
		}else{
			$($($('jmnode[nodeid="'+nodeid+'"]')[0]).find('div')[1]).css('visibility','visible');
		}
	}
}
function open_detail(pk){
	var mind = subtreeMap.get(pk);			
	_jm2.show(mind);		
}
//拖拉拽的操作定义allowDrop(ev)，drag(ev)，drop(ev)
	function allowDrop(ev)
		{
		ev.preventDefault();
	}
	function drag(ev)
		{
		var paramsStr = ev.target.getAttribute('jm')+";"+ev.target.getAttribute('textValue')+";"+ev.target.getAttribute('level')+";"+ev.target.getAttribute('flowId')+";"+ev.target.getAttribute('sourceId');
		ev.dataTransfer.setData("Text",paramsStr);
	}
	function drop(ev)
		{
		ev.preventDefault();
		var paramsArr = ev.dataTransfer.getData("Text").split(";");
		var jm = paramsArr[0];
		var topic = paramsArr[1];
		var level = paramsArr[2];
		var flowid = paramsArr[3];
		var sourceid = paramsArr[4];
		if(jm=="1"){
			var mind = {
				/* 元数据，定义思维导图的名称、作者、版本等信息 */
				"meta":{
					"name":"example",
					"author":"hizzgdev@163.com",
					"version":"0.2"
				},
				/* 数据格式声明 */
				"format":"node_array",
				/* 数据内容 */
				/* "data":[
					{"id":jsMind.util.uuid.newid(), "isroot":true, "topic":"rootNode"}
				]*/
			};
			//暂时先这么定义右边的参数值
			var paramsArray = new Array();
			paramsArray[0] = "";
			paramsArray[1] = "";
			paramsArray[2] = "";
			paramsArray[3] = "";
			//as值
			paramsArray[4] = topic;
			//save-target的name
			paramsArray[5] = "";
			//save-target的id
			paramsArray[6] = "";		
			
			var subAsArray = new Array();
			var target_node_id = ev.target.getAttribute('nodeid');
			//规定join后可以继续放table或join，但table后面不能再添加子节点
			var pk = jsMind.util.uuid.newid();
			var data = {"level":level,"pk":pk,"sql":"","isSave":0,"alias":topic,"flowid":flowid,"sourceid":sourceid,"subMind":"","columns":"","params":"","line_color":"#0080ff"};
			var target_node = null;
			if(target_node_id){
				target_node = _jm.get_node(target_node_id);
				if(target_node.data.level==2){
					alert("table节点后面不能再添加子节点，请拖放至Logic_Node节点上");
					return;
				}				
			}else{
				target_node = _jm.get_root();
				//alert("请拖放在根节点或某个Logic_Node节点上");
			}
			//先创建节点
			var nodeid = jsMind.util.uuid.newid();
			_jm.add_node(target_node, nodeid, topic,data);
			/* 数据内容 */
			var sql = "select * from "+topic;
			mind.data = [
				{"id":pk, "isroot":true, "topic":topic,"level":"3","sql":sql}
			];						
			//再创建节点下的子树
			subtreeMap.put(pk,mind);
			//初始化参数列表
			paramsMap.put(pk,paramsArray);
			//初始化as列表，根节点好像不要这个列表，暂时先要
			columnsMap.put(pk,subAsArray);
			//添加节点即为选中节点
			_jm.select_node(nodeid);
		}else if(jm=="2"){
			var target_node_id = ev.target.getAttribute('nodeid');
			var target_node = null;
			if(target_node_id){
				var target_node = _jm2.get_node(target_node_id);
				if(target_node.data.level==4||target_node.data.level==5){
					alert("字段节点或常量节点后面不能再添加子节点，请拖放至函数节点上");
					return;
				}
			}else{
				target_node = _jm2.get_root();
				//alert("请拖放在根节点或某个函数节点上");
			}		
			var nodeId = jsMind.util.uuid.newid();
			//当节点是主节点的子节点时，如果是字段就默认将topic作为该节点的别名,如果不是字段就为""
			var subAlias = "";
			if(target_node.isroot&&level==4){
				subAlias = topic.substring(topic.indexOf(".")+1,topic.length);
			}
			data = {"level":level,"sql":topic,"constantValue":"0","line_color":"#1abc9c","subAlias":subAlias};
			//创建节点
			_jm2.add_node(target_node, nodeId, topic,data);
		}		
	}
	//定义subtreeMap及Map方法
	var subtreeMap = new Map();
	var paramsMap = new Map();
	var columnsMap = new Map();
	var tableColumnsMap = new Map();
	function Map(){
		this.container = new Object();
	}
	Map.prototype.put = function(key, value){
	this.container[key] = value;
	}
	Map.prototype.get = function(key){
	return this.container[key];
	}
	Map.prototype.size = function() {
		var count = 0;
		for (var key in this.container) {
			// 跳过object的extend函数
			if (key == 'extend'){
			continue;
			}
			count++;
		}
		return count;
	}
	Map.prototype.clear = function(){
		this.container = new Object();
	}
	//思维导图参数初始化
	var _jm = null;
	var _jm2 = null;
    function open_empty(){
        var options = {
            container:'jsmind_container',
            theme:'bluesea',
			mode:'side',
			view:{
			   hmargin:310,        // 思维导图距容器外框的最小水平距离
			   vmargin:10,         // 思维导图距容器外框的最小垂直距离
			   line_width:3,       // 思维导图线条的粗细
			   line_color:'#0080ff'   // 思维导图线条的颜色
		    },
			layout:{
			   hspace:100,          // 节点之间的水平间距
			   vspace:10,          // 节点之间的垂直间距
			   pspace:13           // 节点收缩/展开控制器的尺寸
		    },
            editable:true
        };		
        _jm = jsMind.show(options);
        //自定义的js，用来初始化自定义的拖拽磁铁效果 by tyd
        var jd_tyd = new jsMind.draggable.tyd(_jm);
        jd_tyd.init();
		//定义子树，只是容器不同，其他参数一样
		options.container = "jsmind_container2";	
		options.theme = "greensea";
		options.view.line_color = "#1abc9c";
		_jm2 = jsMind.show(options);
		//_jm2 = new jsMind(options);
		//自定义的js，用来初始化自定义的拖拽磁铁效果 by tyd
		var jd_tyd2 = new jsMind.draggable.tyd(_jm2);
		jd_tyd2.init();
    }
    open_empty();