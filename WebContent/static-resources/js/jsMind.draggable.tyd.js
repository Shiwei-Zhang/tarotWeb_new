/*
 * Released under BSD License
 * Copyright (c) 2014-2015 hizzgdev@163.com
 * 
 * Project Home:
 *   https://github.com/hizzgdev/jsmind/
 */

(function($w){
	jsMind.draggable.tyd = function(jm){
        this.jm = jm;
        this.errorType = 0;
    };

    jsMind.draggable.tyd.prototype = {
            _lookup_close_node_y:function(shadow_w,shadow_h,offsetLeft,offsetTop){
            	var root = this.jm.get_root();
    	        var root_location = root.get_location();
    	        var root_size = root.get_size();
    	        var root_x = root_location.x + root_size.w/2;

    	        var sw = shadow_w;
    	        var sh = shadow_h;
    	        var sx = offsetLeft-200;
    	        var sy = offsetTop;
    	        var ns,nl;
    	        
    	        var scrollTop = $('#'+this.jm.options.container+' .jsmind-inner').scrollTop();
                var scrollLeft = $('#'+this.jm.options.container+' .jsmind-inner').scrollLeft();
    	        //var direct = (sx + sw/2)>=root_x ?
    	        //                 jsMind.direction.right : jsMind.direction.left;
    	        var direct = sx>=root_location.x-100 ?
    	        		jsMind.direction.right : jsMind.direction.left;
    	        var nodes = this.jm.mind.nodes;
    	        var node = null;
    	        var min_distance = Number.MAX_VALUE;
    	        var distance = 0;
    	        var closest_node = null;
    	        var closest_p = null;
    	        var shadow_p = null;
    	        for(var nodeid in nodes){
    	            var np,sp;
    	            node = nodes[nodeid];
    	            //if(node.isroot || node.direction == direct){
    	                ns = node.get_size();
    	                nl = node.get_location();
    	                if(direct == jsMind.direction.right){
    	                    if(sx-nl.x-ns.w<=0){continue;}
    	                    distance = Math.abs(sx-nl.x-ns.w+scrollLeft) + Math.abs(sy+sh/2-nl.y-ns.h/2+scrollTop);
    	                    np = {x:nl.x+ns.w-5,y:nl.y+ns.h/2};
    	                    sp = {x:sx+5+scrollLeft,y:sy+sh/2+scrollTop};
    	                }else{
    	                    if(nl.x-sx-sw<=0){continue;}
    	                    distance = Math.abs(sx+sw-nl.x+scrollLeft) + Math.abs(sy+sh/2-nl.y-ns.h/2+scrollTop);
    	                    np = {x:nl.x+5,y:nl.y+ns.h/2};
    	                    sp = {x:sx+sw-5+scrollLeft,y:sy+sh/2+scrollTop};
    	                }
    	                if(distance < min_distance){
    	                	if(direct==jsMind.direction.right&&node.isroot){
                        		
                        	}else{
	    	                    closest_node = node;
	    	                    closest_p = np;
	    	                    shadow_p = sp;
	    	                    min_distance = distance;
                        	}
    	                }
    	            //}
    	        }
    	        var result_node = null;
    	        if(!!closest_node){
    	            result_node = {
    	                node:closest_node,
    	                direction:direct,
    	                sp:shadow_p,
    	                np:closest_p
    	            };
    	        }
    	        return result_node;
            },
            //先添加父节点，再创建新节点，最后把目标节点移到父节点上
            fuse_node:function(target_node,beforeid){
            	var jd = this.jm;
            	if(jd.options.container=="jsmind_container"){
            		//添加父节点
    	        	var flowid = $('#jmnodeModel').attr('flowid');
    	        	var line_color = $('#jmnodeModel').attr('line_color');
    	            var topic = 'logic_node'+logic_node_num;
    	            var nodeid = jsMind.util.uuid.newid();
    	        	var pk = jsMind.util.uuid.newid();
    	        	var level = 1;
    	        	var sourceids = new Array();
    	        	var source_type=0;
    	        	var data = jd.construct_data(null,null,null,null,null,null,level,topic,line_color,sourceids,pk,flowid,null,source_type);
    	        	var index = target_node.index;
    	        	var node = this.jm.add_node(target_node.parent, nodeid, topic,data,index);
    	        	logic_node_num++;
    	        	//创建新节点
    	        	topic = $('#jmnodeModel').html();
    	        	level = $('#jmnodeModel').attr('level');
    	        	sourceid = $('#jmnodeModel').attr('sourceid');
    	        	source_type = 1;
    	        	nodeid = jsMind.util.uuid.newid();
    	        	pk = jsMind.util.uuid.newid();
    	        	data = jd.construct_data(null,null,null,null,null,null,level,topic,line_color,null,pk,flowid,sourceid,source_type);
    	        	topic = topic.substring(topic.indexOf(".")+1);
    	        	jd.add_node(node, nodeid, topic,data);
    	        	//把目标节点移到父节点上
    	        	jd.move_node(target_node.id, beforeid, node.id, "-1");
    	        	//默认选中logicNode
    	        	jd.select_node(nodeid);
            	}else{
            		var element = $('jmexpanderp[nodeid="'+target_node.id+'"]')[0];
                	var jqueryDom = $('#showTip_'+jd.options.container+'');
            		jqueryDom.css('top',element.offsetTop+element.clientHeight);
            		jqueryDom.css('left',element.offsetLeft);
            		jqueryDom.css('visibility','visible');
            		$('body').unbind('mousedown').mousedown(function(e){
            	    	if(e.target.parentNode.getAttribute('id')!="showTip_jsmind_container2"){
            	    		jqueryDom.css('visibility','hidden');
            	    	}
            	    });
            		var newnodeid = jsMind.util.uuid.newid();
        			var line_color = this.jm.options.view.line_color;
        			var source_name2 = $('#jmnodeModel').html();
        			var topic2 = source_name2.substring(source_name2.indexOf('.')+1);
    	        	var level2 = $('#jmnodeModel').attr('level');
    	        	var fk2 = $('#jmnodeModel').attr('fk');
    	        	var functionName2 = $('#jmnodeModel').attr('functionName');
    	        	var functionType2 = $('#jmnodeModel').attr('functionType');
    	        	var paramNumber2 = $('#jmnodeModel').attr('paramNumber');
        			var columnType2 = $('#jmnodeModel').attr('columnType');
    	        	var fixed2 = $('#jmnodeModel').attr('fixed');
    	        	var nodeid2 = jsMind.util.uuid.newid();
    	        	var data;
            		jqueryDom.find('p').unbind('click').click(function(){
            			jqueryDom.css('visibility','hidden');
            			var level = $(this).attr('level');;
            			var topic = $(this).attr('textValue');
            			var functionName = $(this).attr('functionName');
            			var functionType = $(this).attr('functionType');
            			var paramNumber = $(this).attr('paramNumber');
            			var columnType = $(this).attr('columnType');
            			var fixed = $(this).attr('fixed');
            			var fk = 0;
            			data = jd.construct_data(functionName,functionType,columnType,paramNumber,fixed,fk,level,topic,line_color);
                    	var newnode = jd.add_node(target_node.parent, newnodeid, topic,data,target_node.index);
                    	//创建新节点
                    	data = jd.construct_data(functionName2,functionType2,columnType2,paramNumber2,fixed2,fk2,level2,source_name2,line_color);
        	        	var node = jd.add_node(newnode, nodeid2, topic2,data);
        	        	//把目标节点移到父节点上
        	        	jd.move_node(target_node.id, beforeid, newnodeid, "-1");
        	        	jd.check_subnode(newnode);
        	        	jd.check_subnode_(newnode);
        	        	jd.check_subnode_(node);
        	        	jd.check_subnode_alias();
        	        	//默认选中logicNode
        	        	jd.select_node(newnodeid);
            		});
            	}
	        },
        init:function(){
        	var hlookup_timer_y = 0;
  		  	var target_node = null;
  		  	var target_direct = null;
  		  	var jdt = this;
  		  	var jd = this.jm;
	  		  $( '#'+jd.options.container+'').droppable({
	  			  over: function(event){
	  				  var level_ = $('#jmnodeModel').attr('level');
	  				  if(jd.options.container=='jsmind_container'&&level_!=1&&level_!=2){
	  					  return null;
	  				  }
	  				  if(jd.options.container=='jsmind_container2'&&(level_==1||level_==2)){
	  					  return null;
	  				  }
	  				  if(!_jm1.get_editable()){return null;}
	  				  //每次移入都格式化target_node，这样就避免了target_node为前一个节点的情况，从而避免了get_node_point_out方法报错TypeError: invalid 'in' operand
	  				  target_node = null;
	  				  hlookup_timer_y = window.setInterval(function(){
	  					  var jmnode = document.getElementById("jmnodeModel");
	  					  var node_data = jdt._lookup_close_node_y(jmnode.clientWidth,jmnode.clientHeight,jmnode.offsetLeft,jmnode.offsetTop);
	  					  if(!!node_data){
	  						  	target_node = node_data.node;
	  						    target_direct = node_data.direction;
	  							//flag为true则出现磁铁线，false则不出现
	  							var flag=true;
	  							var shadow_h = jmnode.offsetTop;
	  							var shadow_w = jmnode.offsetLeft;
	  							var scrollTop = $('#'+jd.options.container+' .jsmind-inner').scrollTop();
	  			                var sibling_nodes = target_node.children;
	  			                var sc = sibling_nodes.length;
	  			                var node = null;
	  			                var node_before = null;
	  			                var delta_y = Number.MAX_VALUE;
	  			                while(sc--){
	  			                    node = sibling_nodes[sc];
	  			                    var nodeWidth = node._data.view.width;
	  		                        var dy = node.get_location().y - shadow_h-scrollTop;
	  		                        var dx = node.get_location().x - shadow_w;
	  		                        if(dy<10 && dy>-10&&dx<5&&dx>-nodeWidth&&target_node.isroot){
	  		                        	//这里定义式样
	  		                        	$($("jmnode[nodeid='"+node.id+"']")[0]).addClass("selected");
	  		                        	//暂时先都出现磁铁线
	  		                        	//flag=false;
	  		                        }else{
	  		                        	$($("jmnode[nodeid='"+node.id+"']")[0]).removeClass("selected");
	  		                        	if(dy > 0 && dy < delta_y){
	  		                                node_before = node;
	  		                            }
	  		                        }
	  			                }
	  			                 
	  						  var c=document.getElementById("canvas_"+jd.options.container+"");
	  						  var ctx=c.getContext("2d");
	  						  if(!target_node.isroot){
	  							  ctx.clearRect(0,0,jd.view.size.w,jd.view.size.h);
	  							  var strokeStyle = 'rgba(0,0,0,0.3)';
	  							  jdt.errorType = 0;
	  							  if(jd.options.container=="jsmind_container"){
	  								  if(target_direct==jsMind.direction.right){
	  									  strokeStyle = error_color;
		  								  jdt.errorType = 101;
		  							  }else if(target_node.data.level==2){
		  								  strokeStyle = error_color;
		  								  jdt.errorType = 102;
		  							  }
	  							  }else{
	  								  if(target_direct==jsMind.direction.right){
	  									    var $jmnode = $(jmnode);
		  									if($jmnode.attr('level')==4){
		  				                		strokeStyle = error_color;
		  				                		jdt.errorType = 201;
		  				                	}else if($jmnode.attr('functionType')==2){
		  				                		strokeStyle = error_color;
		  				                		jdt.errorType = 202;
		  				                	}else if($jmnode.attr('paramNumber')==0){
		  				                		strokeStyle = error_color;
		  				                		jdt.errorType = 203;
		  				                	}else{
		  						                var columnType = target_node.data.columnType;
		  						                var functionName = $jmnode.attr('functionName');
		  						                var parameters = functionsMap.get(functionName);
		  					                	var paramDataType = parameters[0].paramDataType;
		  					                	if(columnType!=paramDataType){
		  					                		var newArray = $.grep( conversionRules_global, function(n,i){
		  					                    		return n.theType==columnType&&n.depType==paramDataType&&n.type==1;
		  					             			});
		  					                    	if(newArray.length==0){
		  					                    		strokeStyle = error_color;
		  					                    		jdt.errorType = 207;
		  					                    	}
		  					                	}
		  				                	}
	  								  }else{
		  									if(target_node.data.level==4){
		  				                		strokeStyle = error_color;
		  				                		jdt.errorType = 204;
		  				                	}else if(target_node.data.functionType==2){
		  				                		strokeStyle = error_color;
		  				                		jdt.errorType = 205;
		  			                		}else if(target_node.data.fixed==1&&target_node.data.paramNumber==sibling_nodes.length){
		  				                		strokeStyle = error_color;
		  				                		jdt.errorType = 206;
		  			                		}else{
		  					                	var paramIndex = 0;
		  					                	if(!!node_before){
		  				                    		paramIndex = node_before.index-1;
		  				                		}else{
		  				                			paramIndex = sibling_nodes.length;
		  				                		}
		  					                	var $jmnode = $(jmnode);
		  						                var columnType = $jmnode.attr('columnType');
		  						                var functionName = target_node.data.functionName;
		  						                var parameters = functionsMap.get(functionName);
		  					                	var paramDataType = parameters[paramIndex].paramDataType;
		  					                	if(columnType!=paramDataType){
		  					                		var newArray = $.grep( conversionRules_global, function(n,i){
		  					                    		return n.theType==columnType&&n.depType==paramDataType&&n.type==1;
		  					             			});
		  					                    	if(newArray.length==0){
		  					                    		strokeStyle = error_color;
		  					                    		jdt.errorType = 207;
		  					                    	}
		  					                	}
		  				                	}
	  								  }
	  							  }
	  							  var jcanvas = jsMind.util.canvas;
	  							  ctx.lineWidth = 3;
	  							  ctx.strokeStyle = strokeStyle;
	  							  ctx.lineCap = 'round';
	  							  jcanvas.lineto(ctx,
	  									  node_data.sp.x,
	  									  node_data.sp.y,
	  									  node_data.np.x,
	  									  node_data.np.y);
	  						  }else{
	  							  jdt.errorType = 0;
	  							  ctx.clearRect(0,0,jd.view.size.w,jd.view.size.h);
	  						  }
	  					  }
	                    },50);
	  			  },
	  			  out: function(event){
	  				  var level_ = $('#jmnodeModel').attr('level');
	  				  if(jd.options.container=='jsmind_container'&&level_!=1&&level_!=2){
	  					  return null;
	  				  }
	  				  if(jd.options.container=='jsmind_container2'&&(level_==1||level_==2)){
	  					  return null;
	  				  }
	  				  if(!_jm1.get_editable()){return null;}
	  				  var c=document.getElementById("canvas_"+jd.options.container+"");
	  				  var ctx=c.getContext("2d");
	  				  ctx.clearRect(0,0,jd.view.size.w,jd.view.size.h);
	  				  window.clearInterval(hlookup_timer_y);
	  			  },
	  			  drop: function(event) {
	  				var level_ = $('#jmnodeModel').attr('level');
	  				  if(jd.options.container=='jsmind_container'&&level_!=1&&level_!=2){
	  					  return null;
	  				  }
	  				  if(jd.options.container=='jsmind_container2'&&(level_==1||level_==2)){
	  					  return null;
	  				  }
	  				if(!_jm1.get_editable()){return null;}
	  				var c=document.getElementById("canvas_"+jd.options.container+"");
	  				  var ctx=c.getContext("2d");
	  				  ctx.clearRect(0,0,jd.view.size.w,jd.view.size.h);
	  				  window.clearInterval(hlookup_timer_y);
	  				  
	  				  var jmnode = document.getElementById("jmnodeModel");
	  				  var shadow_h = jmnode.offsetTop;
	  				  var shadow_w = jmnode.offsetLeft;
	  				  var scrollTop = $('#'+jd.options.container+' .jsmind-inner').scrollTop();
	  				  //如果没有被磁铁吸引，则默认添加为根节点的子节点
    				    if(!target_node){target_node = jd.get_root();}
	  	                var sibling_nodes = target_node.children;
	  	                var sc = sibling_nodes.length;
	  	                var node = null;
	  	                var delta_y = Number.MAX_VALUE;
	  	                var node_before = null;
	  	                //flag为true则进行添加节点，false则进行融合节点
	  	                var flag = true;
	  	                var beforeid = '_first_';
	  	                while(sc--){
	  	                   node = sibling_nodes[sc];
	  	                   var nodeWidth = node._data.view.width;
	                         var dy = node.get_location().y - shadow_h-scrollTop;
	                         var dx = node.get_location().x - shadow_w;
	                         if(dy<10 && dy>-10&&dx<5&&dx>-nodeWidth&&target_node.isroot){
	  	                       	//表示可以融合节点,此时的node_before表示被融合的节点
	  	                       	flag = false;
	  	                       	node_before = node;
	  	                       	//如果dy大于0，则添加的子节点排在前面
                         		if(dy>0){beforeid = '_last_';}
	                         }else if(dy > 0 && dy < delta_y){
	                             delta_y = dy;
	                             node_before = node;
	                         }
	  	                }
	  	                if(flag){
	  	                    //在这里对磁铁吸引进行判断
	  	                	if(jd.options.container=="jsmind_container"){
	  	                		if(jdt.errorType==101){
	  	                			$.dialog("数据源节点不可添加为父节点！");
	  	                		}else if(jdt.errorType==102){
	  	                			$.dialog("不能在数据源节点添加子节点！");
	  	                		}else{
	  	                			  var source_name = $('#jmnodeModel').html();
		  	                    	  var topic = source_name;
		  	                    	  var level = $('#jmnodeModel').attr('level');
		  	                    	  //如果是sqlserver表，那么需要过滤一下topic
	  	                    		  topic = topic.substring(topic.indexOf('.')+1);
		  	                    	  var flowid = $('#jmnodeModel').attr('flowid');
		  	                    	  var sourceid = $('#jmnodeModel').attr('sourceid');
		  	                    	  var source_type = 1;
		  	                    	  var line_color = $('#jmnodeModel').attr('line_color');
		  		      				  var pk = jsMind.util.uuid.newid();
		  		      				  var nodeid = jsMind.util.uuid.newid();
	  		      					  //拖进来的节点一定是底层节点，所以不用sourceids
		  		      				  var data = jd.construct_data(null,null,null,null,null,null,level,source_name,line_color,null,pk,flowid,sourceid,source_type);
		  		      				  //如果父节点没有子节点则用add_node，否则用insert_node_before
		  		      				  if(node_before){
		  		      					jd.insert_node_before(node_before, nodeid, topic, data);
		  		      				  }else{
		  		      					jd.add_node(target_node, nodeid, topic,data);
		  		      				  }
		  		      				  jd.select_node(nodeid);
	  	                		}
	  	                	}else{
	  	                		var selected_node = _jm1.get_selected_node();
	  	                		if(!selected_node){
	  	                			$.dialog("请选中一个逻辑节点！");
	  	                			return;
	  	                		}
	  	                		switch(jdt.errorType){
		                		case 201:
		                			$.dialog("字段节点不可添加为父节点！");
		                			break;
		                		case 202:
		                			$.dialog("常量节点不可添加为父节点！");
		                			break;
		                		case 203:
		                			$.dialog("无参函数不可添加为父节点！");
		                			break;
		                		case 204:
		                			$.dialog("不能在字段节点添加子节点！");
		                			break;
		                		case 205:
		                			$.dialog("不能在常量节点添加子节点！");
		                			break;
		                		case 206:
		                			$.dialog("该节点的入参个数已经到了极限！");
		                			break;
		                		case 207:
		                			$.dialog("入参类型不正确！");
		                			break;
		                		case 0:
		                			var source_name = $('#jmnodeModel').html();
		  	                    	var topic = source_name;
		  	                    	var level = $('#jmnodeModel').attr('level');
		  	                    	//如果是字段，过滤一下topic
	  	                    		topic = topic.substring(topic.indexOf('.')+1);
		  	                    	var functionName = $('#jmnodeModel').attr('functionName');
		  	                    	var functionType = $('#jmnodeModel').attr('functionType');
		  	                    	var paramNumber = $('#jmnodeModel').attr('paramNumber');
		  	          			    var columnType = $('#jmnodeModel').attr('columnType');
		  	                    	var fixed = $('#jmnodeModel').attr('fixed');
		  	                    	var line_color = $('#jmnodeModel').attr('line_color');
		  	                    	var fk = $('#jmnodeModel').attr('fk');
		  		      				var nodeid = jsMind.util.uuid.newid();
		  		      				var data = jd.construct_data(functionName,functionType,columnType,paramNumber,fixed,fk,level,source_name,line_color);
		                    		if(target_direct == jsMind.direction.right){
		                    			var new_node = jd.add_node(target_node.parent, nodeid, topic,data,target_node.index);
		                    			jd.move_node(target_node.id, "_last_", new_node.id, "-1");
		                    			jd.check_subnode(new_node);
		                    			jd.check_subnode_(new_node);
		                    			jd.check_subnode_alias();
		                    		}else{
			  		      				  //如果父节点没有子节点则用add_node，否则用insert_node_before
			  		      				  if(node_before){
			  		      					jd.insert_node_before(node_before, nodeid, topic, data);
			  		      				  }else{
			  		      					jd.add_node(target_node, nodeid, topic,data);
			  		      				  }
			  		      				  var new_node = jd.get_node(nodeid);
		  		      					  var parentNode = new_node.parent;
		  		      					  if(new_node.data.level==3){
		  		      						  jd.check_subnode(new_node);
		  		      					  }
		  		      					  if(!parentNode.isroot){
		  		      						  jd.check_subnode(parentNode);
		  		      					  }
		  		      					  jd.check_subnode_(new_node);
		  		      					  if(parentNode.isroot){
		  		      						  jd.check_subnode_alias();
		  		      					  }
		                    		}
		                    		jd.select_node(nodeid);
		                			break;
	  	                		}
	  	                	}
	  	                }else{
	  	                	$("jmnode").removeClass("selected");
	  	                	jdt.fuse_node(node_before,beforeid);
	  	                }
	  			  }
  			});
        }
    };

})(window);
