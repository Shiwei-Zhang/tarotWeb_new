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
var table_alias_num = 1;
var column_alias_num = 1;
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
	//定义subtreeMap及Map方法
	var subtreeMap = new Map();
	var paramsMap = new Map();
	var joinsMap = new Map();
	var targetsMap = new Map();
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
	Map.prototype.remove = function(key) {
		delete this.container[key];
	}
	//思维导图参数初始化
	var _jm1 = null;
	var _jm2 = null;
    function open_empty(){
        var options = {
                container:'jsmind_container',
                editable:true,
                theme:'bluesea',
    			mode:'side',
    			support_html : true,
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
    		    shortcut:{
    	            enable:true,
    	            handles:{
    	            },
    	            mapping:{
    	                addchild   : 45, // Insert
    	                addbrother : 13, // Enter
    	                editnode   : 113,// F2
    	                delnode    : 46, // Delete
    	                toggle     : 32, // Space
    	                left       : 37, // Left
    	                up         : 38, // Up
    	                right      : 39, // Right
    	                down       : 40, // Down
    	            }
    	        }
        };	
        _jm1 = jsMind.show(options);
        //自定义的js，用来初始化自定义的拖拽磁铁效果 by tyd
        var jd_tyd = new jsMind.draggable.tyd(_jm1);
        jd_tyd.init();
		//定义子树，只是container，theme，line_color不同，其他参数一样
        var options2 = {
                container:'jsmind_container2',
                editable:true,
                theme:'greensea',
    			mode:'side',
    			support_html : true,
    			view:{
    			   hmargin:310,        // 思维导图距容器外框的最小水平距离
    			   vmargin:10,         // 思维导图距容器外框的最小垂直距离
    			   line_width:3,       // 思维导图线条的粗细
    			   line_color:'#1abc9c'   // 思维导图线条的颜色
    		    },
    			layout:{
    			   hspace:100,          // 节点之间的水平间距
    			   vspace:10,          // 节点之间的垂直间距
    			   pspace:13           // 节点收缩/展开控制器的尺寸
    		    },
    		    shortcut:{
    	            enable:true,
    	            handles:{
    	            },
    	            mapping:{
    	                addchild   : 45, // Insert
    	                addbrother : 13, // Enter
    	                editnode   : 113,// F2
    	                delnode    : 46, // Delete
    	                toggle     : 32, // Space
    	                left       : 37, // Left
    	                up         : 38, // Up
    	                right      : 39, // Right
    	                down       : 40, // Down
    	            }
    	        }
        };	      	
		_jm2 = jsMind.show(options2);
		//_jm2 = new jsMind(options);
		//自定义的js，用来初始化自定义的拖拽磁铁效果 by tyd
		var jd_tyd2 = new jsMind.draggable.tyd(_jm2);
		jd_tyd2.init();
    }
    open_empty();