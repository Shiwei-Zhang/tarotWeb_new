/**
 * Created by tian yidong on 2016/9/23.
 */
$(function(){
	    document.oncontextmenu = function(e){
	        e.preventDefault();
	    };
	    $('input').click(function(){
	    	_jm1.deleteflag=false;
			_jm2.deleteflag=false;
	    });
	});
//logic_node的序列号
var logic_node_num = 1;
var column_num = 2;
function initDragable_updown(){
	var width_ = $('.module-core').width();
  	$('#tabbox1').resizable({
  		alsoResize:"#_source_add,#jsmind_container",
  		maxWidth: width_,
  		minWidth: width_,
  		maxHeight: 600,
  		minHeight: 100,
		resize: function( event, ui ) {
			var newheight = ui.element.parent().height()-ui.element.height();
			$('#tabbox2').height(newheight);
			$('#jsmind_container2').height(newheight-80);
			$('.logClass').height(newheight-80);
			$('#_column_trans').height(newheight-125);
		}
  	});
}
function initDragable(){
	$( ".draggable" ).draggable({
		drag: function(event) {
		},
		cursor: "move",
		cursorAt: { top: 5, left: 5 },
		helper: function( event ) {
			var element = event.target;
			var fk = element.getAttribute('fk')||element.parentNode.getAttribute('fk');
			var textValue = element.getAttribute('textValue')||element.parentNode.getAttribute('textValue');
			var level = event.target.getAttribute('level')||element.parentNode.getAttribute('level');
			var flowid = event.target.getAttribute('flowid')||element.parentNode.getAttribute('flowid');
			var sourceid = event.target.getAttribute('sourceid')||element.parentNode.getAttribute('sourceid');
			var functionName = event.target.getAttribute('functionName')||element.parentNode.getAttribute('functionName');
			var functionType = event.target.getAttribute('functionType')||element.parentNode.getAttribute('functionType');
			var paramNumber = event.target.getAttribute('paramNumber')||element.parentNode.getAttribute('paramNumber');
			var columnType = event.target.getAttribute('columnType')||element.parentNode.getAttribute('columnType');
			var fixed = event.target.getAttribute('fixed')||element.parentNode.getAttribute('fixed');
			var sourcedatatype = event.target.getAttribute('sourcedatatype')||element.parentNode.getAttribute('sourcedatatype');
			var line_color;
			if(level=='1'||level=='2'){
				line_color = _jm1.options.view.line_color;
			}else{
				line_color = _jm2.options.view.line_color;
			}
			if(!_jm1.get_editable()){
				return $( "<jmnode id='jmnodeModel' style='display:none;' ></jmnode>" );
			}else{
				return $( "<jmnode id='jmnodeModel' style='border-color:"+line_color+"' functionName='"+functionName+"' functionType='"+functionType+"' columnType='"+columnType+"' paramNumber='"+paramNumber+"' fixed='"+fixed+"' fk='"+fk+"' level='"+level+"' flowid='"+flowid+"' sourcedatatype='"+sourcedatatype+"' sourceid='"+sourceid+"' line_color='"+line_color+"'>"+textValue+"</jmnode>" );
			}
		}
	});
}
function create_jsmindStr(){
	var selected_node = _jm1.get_selected_node();
	save_current(selected_node);
	var nodes = _jm1.mind.nodes;
	var node = null;
	for(var nodeid in nodes){
		node = nodes[nodeid];
		if(!node.isroot){
			var pk = node.data.pk;
			var obj = loop_node(node);
			node.data.sql = obj.sql;
			node.data.exportColumns = obj.exportColumns;
			node.data.subMind = subtreeMap.get(pk);
			node.data.params = paramsMap.get(pk);
			node.data.saveTargets = targetsMap.get(pk);
			node.data.joins = joinsMap.get(pk);
		}
	}
	var jsmind = _jm1.get_data('node_array');
	var jsmindStr = JSON.stringify(jsmind);
	return jsmindStr;
}
//保存jsmind
function save_jsmind(type){
	hide_column_constant_predict();
	var jsmindStr = create_jsmindStr();
	var udfInfosMap_min = udfInfosMap.get(flowId_global);
	var keySet = udfInfosMap_min.keySet();
	var udfInfos = new Array();
	$.each(keySet,function(index,item){
		udfInfos.push(udfInfosMap_min.get(item));
	});
	var udfInfosStr = JSON.stringify(udfInfos);
	var async = false;
	if(!type){
		async = true;
	}
	$.ajax({
        type:"POST",
        url:urlId+"/saveFlow",
        dataType:"json",
        async:async,
        data:{jsmindStr:jsmindStr,flowid:flowId_global,udfInfosStr:udfInfosStr},  
        success:function(data) {
        	$.each(data,function(index,item){
        		var genid = item.genid!=0?item.genid:item.id;
        		var nodeid = item.tempid;
        		var node = _jm1.get_node(nodeid);
        		node.data.genid = parseInt(genid);
        		var exportColumns = item.exportColumns;
        		var pk = item.pk;
        		var dataArray = subtreeMap.get(pk).data;
        		$.grep( dataArray, function(n,i){
        			if(n.parentid==pk){
        				$.each(exportColumns,function(j,element){
        					if(element.tempid==n.id){
        						var genid_ = element.genid!=0?element.genid:element.id;
        						n.genid = parseInt(genid_);
        						exportColumns.splice(j,1);
        						return false;
        					}
        				});
        			}
     			   return null;
 			 	});
        	});
        	//子树恢复
        	recoverySubtree();
        	if(!type){
             	alert("修改成功！");  
        	}
        },  
        error : function() {   
        	//子树恢复
        	recoverySubtree();
            alert("异常！");  
        } 
    });
}
function loop_node(node){
	var flagList = new Array();
	var pk = node.data.pk;
	open_detail(pk);
	var sql = "select ";
	var root = _jm2.get_root();
	var children = root.children;
	var exportColumns = new Array();
	$.each(children,function(index,item){
		var exportColumn = new Object();
		exportColumn.name = item.topic;
		exportColumn.type = item.data.columnType;
		exportColumn.isImport = 0;
		exportColumn.tempid = item.id; 
		exportColumn.genid = item.data.genid; 
		exportColumns.push(exportColumn);
	});
	if(children.length>0){
		var array = loop_sql(children);
		var arraystr = array.join(',');
		sql+=arraystr;
	}else{
		//如果没有子节点就标记
		flagList.push(root.id);
	}
	sql+=" from ";
	if(node.data.level==1){
		//如果sourceids的长度为1，那么就是说只有一个子节点，那么join语句就变成子节点的别名；而且此时joins的长度为0
		var sourceids = node.data.sourceids;
		if(sourceids.length==1){
			var tableA = node.children[0].topic;
			sql+="["+tableA+"] "+""+tableA+"";
		}
		var joins = joinsMap.get(pk);
		$.each(joins,function(index,item){
			var tableA = item.tableA;
			var joinType = item.joinType;
			var tableB = item.tableB;
			var onList = item.onList;
			if(index==0){
				sql+="["+tableA+"] "+""+tableA+""+" "+joinType+" ["+tableB+"] "+""+tableB+"";
			}else{
				sql+=" "+joinType+" ["+tableB+"] "+""+tableB+"";
			}
			var onlength = onList.length;
			if(onlength>0){
				sql+=" on ";
			}
			$.each(onList,function(i,element){
				var condition1_text = element.condition1_text;
				var condition2 = element.condition2;
				var condition3_text = element.condition3_text;
				var condition4 = element.condition4;
				var condition5 = element.condition5;
				var exp="";
				if(!element.condition1){
					exp+="'"+condition1_text+"'";
				}else{
					exp+=condition1_text;
				}
				exp+=" "+condition2+" ";
				if(element.condition3){
					exp+=condition3_text;
				}else if(condition2=='in'&&!element.condition3){
					exp+="("+condition3_text+")";
				}else if(condition2!='in'&&!element.condition3){
					exp+="'"+condition3_text+"'";
				}
				//i==onlength-1表示最后一个
				if(i!=onlength-1){
					exp+=" "+condition4+" ";
				}
				sql+=exp;
			});
		});
	}else{
		//sqlserver和csv过滤topic
		var sourcedatatype = node.data.source_data_type;
		var source_name = node.data.source_name;
		if(sourcedatatype=='csv'){
			source_name = source_name.substring(0,source_name.lastIndexOf("."));
		}else{
			source_name = source_name.substring(source_name.indexOf(".")+1);
		}
		sql+="["+source_name+"] "+""+source_name+"";
	}
	var filter = paramsMap.get(pk).filter;
	var filterlength = filter.length;
	if(filterlength>0){
		sql+=" where ";
	}
	$.each(filter,function(index,item){
		var condition1_text = item.condition1_text;
		var condition2 = item.condition2;
		var condition3 = item.condition3;
		var condition4 = item.condition4;
		var condition5 = item.condition5;
		var exp = "";
		//index==filterlength-1表示最后一个
		if(index==filterlength-1){
			exp = condition1_text+" "+condition2+" '"+condition3+"'";
			if(condition2=='in'){
				exp = condition1_text+" "+condition2+" ("+condition3+")";
			}
		}else{
			exp =condition1_text+" "+condition2+" '"+condition3+"' "+condition4+" ";
			if(condition2=='in'){
				exp = condition1_text+" "+condition2+" ("+condition3+") "+condition4+" ";
			}
		}
		sql+=exp;
	});
	var group = paramsMap.get(pk).group;
	var grouplength = group.length;
	if(grouplength>0){
		sql+=" group by ";
	}
	$.each(group,function(index,item){
		var column_text = item.column_text;
		if(index==grouplength-1){
			sql+=column_text+" ";
		}else{
			sql+=column_text+",";
		}
	});
	var order = paramsMap.get(pk).order;
	var orderlength = order.length;
	if(orderlength>0){
		sql+=" order by ";
	}
	$.each(order,function(index,item){
		var column_text = item.column_text;
		var asc = item.asc;
		if(index==orderlength-1){
			sql+=column_text+" "+asc+" ";
		}else{
			sql+=column_text+" "+asc+",";
		}
	});
	console.log(sql);
	var obj = new Object();
	obj.sql = sql;
	obj.exportColumns = exportColumns;
	return obj;
}

function loop_sql(children){
	var array = new Array();
	$.each(children,function(index,item){
		var spice;
		var level = item.data.level;
		var functionType = item.data.functionType;
		var subchildren = item.children;
		if(subchildren.length>0){
			var array_min = loop_sql(subchildren);
			var number = item.data.paramNumber;
			var over = number-array_min.length;
			if(item.data.fixed==1){
				if(over>0){
					//这里可以做标记
					var overList = new Array();
					for(var i=0;i<over;i++){
						overList.push('?');
					}
					array_min = array_min.concat(overList);
				}
			}else{
				if(over>1){
					//这里可以做标记
					var overList = new Array();
					for(var i=1;i<over;i++){
						overList.push('?');
					}
					overList.push('...');
					array_min = array_min.concat(overList);
				}
			}
			var functionName = item.data.functionName;
			if(functionType==9){
				var arraystr = array_min.join(',');
				var udfInfosMap_min = udfInfosMap.get(flowId_global);
				if(udfInfosMap_min.get(item.id)){
					spice = udfInfosMap_min.get(item.id).udfalias+"("+arraystr+")";
				}else{
					spice = item.data.source_name+"("+arraystr+")";
				}
			}else if(functionType==1){
				spice = "("+array_min.join(functionName)+")";
			}else{
				var arraystr = array_min.join(',');
				spice = functionName+"("+arraystr+")";
			}
		}else{
			//表示函数
			if(level==3){
				//如果是类似于concat(...),可以直接是concat()
				if((item.data.fixed==0&&item.data.paramNumber==1)||(item.data.fixed==1&&item.data.paramNumber==0)){
					spice = item.data.functionName+"()";
				}else if(functionType==2){
					spice = item.data.constantValue;
				}else{
					spice = item.data.source_name;
				}
			//表示字段
			}else if(level==4){
				spice = item.data.source_name;
			}
		}
		//如果是出参，需要加上别名
		if(item.parent.isroot){
			spice+=" as "+item.topic;
		}
		array.push(spice);
	}); 
	return array;
}
function save_current(selected_node){
	//保证了udfinfo保存的是最新的信息
	var sub_selected_node = _jm2.get_selected_node();
	if(sub_selected_node&&sub_selected_node.data.functionType==9){
		$load_predict_detail();
	}
	if(selected_node){
		var pk = selected_node.data.pk;
		//要先保存子树状态再执行modify_alias_ref
		subtreeMap.put(pk,_jm2.data.get_data('node_array'));
		//保存tableName
		var tableName = "";
		tableName = $('.new_table_name input').val();
		selected_node.topic = tableName;
		//先保存子树状态再执行modify_alias_ref
		_jm1.modify_alias_ref(selected_node);
		//保存joins
		var joinsList = new Array();
		$('.joins .related_table').each(function(index,item){
			var option = new Object();
			option.tableA_id = $(item).find('.tableA').val();
			option.tableA = $(item).find('.tableA').find("option:selected").text();
			option.joinType = $(item).find('.joinType').val();
			option.tableB_id = $(item).find('.tableB').val();
			option.tableB = $(item).find('.tableB').find("option:selected").text();
			var subList = new Array();
			$(item).find('.join').each(function(i,element){
				var option_mini = new Object();
				option_mini.condition1 = $(element).find('.condition1').val();
				//option_mini.condition1_text = $(element).find('.condition1').find("option:selected").text();
				option_mini.condition1_text = $(element).find('input').eq(0).val();
				option_mini.condition2 = $(element).find('.condition2').val();
				option_mini.condition3 = $(element).find('.condition3').val();
				//option_mini.condition3_text = $(element).find('.condition3').find("option:selected").text();
				option_mini.condition3_text = $(element).find('input').eq(1).val();
				option_mini.condition4 = $($(item).find('.operations')[i]).find('.condition4').val();
				option_mini.condition5 = $($(item).find('.operations')[i]).find('.condition5').val();
				subList.push(option_mini);
			})
			option.onList = subList;
			joinsList.push(option);
		});
		joinsMap.put(pk,joinsList);
		//保存filter
		var filterList = new Array();
		$('.filters .filter').first().nextAll().each(function(index,item){
			var option = new Object();
			option.condition1 = $(item).find('.condition1').val();
			option.condition1_text = $(item).find('.condition1').find("option:selected").text();
			option.condition2 = $(item).find('.condition2').val();
			option.condition3 = $(item).find('.condition3').val();
			option.condition4 = $(item).find('.condition4').val();
			option.condition5 = $(item).find('.condition5').val();
			filterList.push(option);
		});
		paramsMap.get(pk).filter = filterList;
		//保存group
		var groupList = new Array();
		$('.groups .group').first().nextAll().each(function(index,item){
			var option = new Object();
			option.column = $($(item).find('select')[0]).val();
			option.column_text = $($(item).find('select')[0]).find("option:selected").text();
			groupList.push(option);
		});
		paramsMap.get(pk).group = groupList;
		//保存order
		var orderList = new Array();
		$('.orders .order').first().nextAll().each(function(index,item){
			var option = new Object();
			option.column = $($(item).find('select')[0]).val();
			option.column_text = $($(item).find('select')[0]).find("option:selected").text();
			option.asc = $($(item).find('select')[1]).val();
			orderList.push(option);
		});
		paramsMap.get(pk).order = orderList;
	}
}
function open_detail(pk){
	var mind = subtreeMap.get(pk);			
	_jm2.show(mind);	
	var nodes = _jm2.mind.nodes;
	var node = null;
	for(var nodeid in nodes){
		node = nodes[nodeid];
		if(!node.isroot){
			var border_color = node.data.border_color;
			$('jmnode[nodeid="'+nodeid+'"]').css('border-color',border_color);
		}
	}
}
	var error_color='#FF6159';
	var running_color='#64D3E4';
	var runError_color='#CB416C';
	var runSuccess_color='#65C066';
	//functionsMap,dataConnections_global,conversionRules_global是系统级别
	var functionsMap = new Map();
	var dataConnections_global = new Array();
	var conversionRules_global = new Array();
	//jsmindStrsMap和sourceDatasMap和flowInfosMap是flow级别
	var flowInfosMap = new Map();
	var jsmindStrsMap = new Map();
	var sourceDatasMap = new Map();
	//udfInfos_global是column级别,也是flow级别
	var udfInfosMap = new Map();
	//tableColumnsMap是sourceData级别
	var tableColumnsMap = new Map();
	//subtreeMap、paramsMap、joinsMap、targetsMap是node级别
	var subtreeMap = new Map();
	var paramsMap = new Map();
	var joinsMap = new Map();
	var targetsMap = new Map();
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
	Map.prototype.keySet = function() {
		var keyset = new Array();
		var count = 0;
		for (var key in this.container) {
		// 跳过object的extend函数
		if (key == 'extend') {
		continue;
		}
		keyset[count] = key;
		count++;
		}
		return keyset;
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
    			   line_color:'#0087E5'   // 思维导图线条的颜色
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
    			   line_color:'#00C9DB'   // 思维导图线条的颜色
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