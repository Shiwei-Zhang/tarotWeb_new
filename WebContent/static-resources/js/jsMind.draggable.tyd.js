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
        this.container = jm.options.container;
        window.initDragable = function(){
        	$( ".draggable" ).draggable({
    			drag: function(event) {
    			},
    			cursor: "move",
    			cursorAt: { top: 5, left: 5 },
    			helper: function( event ) {
    				var fk = event.target.getAttribute('fk');
    				var textValue = event.target.getAttribute('textValue');
    				var level = event.target.getAttribute('level');
    				var flowid = event.target.getAttribute('flowid');
    				var sourceid = event.target.getAttribute('sourceid');
    				var functionName = event.target.getAttribute('functionName');
    				var functionType = event.target.getAttribute('functionType');
    				var paramNumber = event.target.getAttribute('paramNumber');
    				var columnType = event.target.getAttribute('columnType');
    				var fixed = event.target.getAttribute('fixed');
    				var line_color;
    				if(level=='1'||level=='2'){
    					line_color = _jm1.options.view.line_color;
    				}else{
    					line_color = _jm2.options.view.line_color;
    				}
    				return $( "<jmnode id='jmnodeModel' style='border-color:"+line_color+"' functionName='"+functionName+"' functionType='"+functionType+"' columnType='"+columnType+"' paramNumber='"+paramNumber+"' fixed='"+fixed+"' fk='"+fk+"' level='"+level+"' flowid='"+flowid+"' sourceid='"+sourceid+"' line_color='"+line_color+"'>"+textValue+"</jmnode>" );
    			}
    		});
		};
    };

    jsMind.draggable.tyd.prototype = {
            _lookup_close_node_y:function(shadow_w,shadow_h,offsetLeft,offsetTop){
            	var root = this.jm.get_root();
    	        var root_location = root.get_location();
    	        var root_size = root.get_size();
    	        var root_x = root_location.x + root_size.w/2;

    	        var sw = shadow_w;
    	        var sh = shadow_h;
    	        var sx = offsetLeft;
    	        var sy = offsetTop;

    	        var ns,nl;

    	        var direct = (sx + sw/2)>=root_x ?
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
    	            //查看各个节点的方向
    	            //console.log("方向啊："+node.topic+":::"+node.direction);
    	            if(node.isroot || node.direction == direct){
    	                /* if(node.id == this.active_node.id){
    	                    continue;
    	                } */
    	                ns = node.get_size();
    	                nl = node.get_location();
    	                var scrollTop = $('#'+this.container+' .jsmind-inner').scrollTop();
    	                if(direct == jsMind.direction.right){
    	                    if(sx-nl.x-ns.w<=0){continue;}
    	                    distance = Math.abs(sx-nl.x-ns.w) + Math.abs(sy+sh/2-nl.y-ns.h/2+scrollTop);
    	                    np = {x:nl.x+ns.w-5,y:nl.y+ns.h/2};
    	                    sp = {x:sx+5,y:sy+sh/2+scrollTop};
    	                }else{
    	                    if(nl.x-sx-sw<=0){continue;}
    	                    distance = Math.abs(sx+sw-nl.x) + Math.abs(sy+sh/2-nl.y-ns.h/2+scrollTop);
    	                    np = {x:nl.x+5,y:nl.y+ns.h/2};
    	                    sp = {x:sx+sw-5,y:sy+sh/2+scrollTop};
    	                }
    	                if(distance < min_distance){
    	                    closest_node = node;
    	                    closest_p = np;
    	                    shadow_p = sp;
    	                    min_distance = distance;
    	                }
    	            }
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
    	        	nodeid = jsMind.util.uuid.newid();
    	        	pk = jsMind.util.uuid.newid();
    	        	source_type = 1;
    	        	data = jd.construct_data(null,null,null,null,null,null,level,topic,line_color,null,pk,flowid,sourceid,source_type);
    	        	topic = topic.substring(topic.indexOf(".")+1);
    	        	jd.add_node(node, nodeid, topic,data);
    	        	//把目标节点移到父节点上
    	        	jd.move_node(target_node.id, beforeid, node.id, "-1");
    	        	//默认选中logicNode
    	        	jd.select_node(nodeid);
            	}else{
            		var element = $('jmexpanderp[nodeid="'+target_node.id+'"]')[0];
                	var jqueryDom = $('#showTip_'+this.container+'');
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
        	        	//默认选中logicNode
        	        	jd.select_node(newnodeid);
            		});
            	}
	        },
        init:function(){
        	var hlookup_timer_y = 0;
  		  	var target_node = null;
  		  	var jd = this;
  		  	$('#tabbox1').resizable({
  		  		alsoResize:"#_source_add,#jsmind_container",
  		  		maxWidth: 1032.9,
  		  		minWidth: 1032.9,
  		  		maxHeight: 600,
  		  		minHeight: 100,
	  			resize: function( event, ui ) {
	  				var newheight = ui.element.parent().height()-ui.element.height();
	  				$('#tabbox2').height(newheight);
	  				$('#jsmind_container2').height(newheight);
	  				$('#_column_trans').height(newheight-125);
	  			}
  		  	});
	  		  /*$( ".draggable" ).draggable({
	  			  drag: function(event) {
	  		      },
	  		      cursor: "move",
	  		      cursorAt: { top: 5, left: 5 },
	  		      helper: function( event ) {
	  		    	  var textValue = event.target.getAttribute('textValue');
	  		    	  var level = event.target.getAttribute('level');
	  		    	  var flowid = event.target.getAttribute('flowid');
	  		    	  var sourceid = event.target.getAttribute('sourceid');
	  		    	  var fk = event.target.getAttribute('fk');
	  		    	  var border_color = "#0080ff;";
	  		    	  if(level=='3'||level=='4'||level=='5'){
	  		    		  border_color = "#1abc9c;";
	  		    	  }
	  		        return $( "<jmnode id='jmnodeModel' style='border-color:"+border_color+"' fk='"+fk+"' level='"+level+"' flowid='"+flowid+"' sourceid='"+sourceid+"' line_color='"+border_color+"'>"+textValue+"</jmnode>" );
	  		      }
	  		    });*/
	  		  $( '#'+jd.container+'').droppable({
	  			  over: function(event){
	  				  //每次移入都格式化target_node，这样就避免了target_node为前一个节点的情况，从而避免了get_node_point_out方法报错TypeError: invalid 'in' operand
	  				  target_node = null;
	  				  hlookup_timer_y = window.setInterval(function(){
	  					  var jmnode = document.getElementById("jmnodeModel");
	  					  var node_data = jd._lookup_close_node_y(jmnode.clientWidth,jmnode.clientHeight,jmnode.offsetLeft,jmnode.offsetTop);
	  					  if(!!node_data){
	  						  target_node = node_data.node;
	  						  
	  							//flag为true则出现磁铁线，false则不出现
	  							var flag=true;
	  							var shadow_h = jmnode.offsetTop;
	  							var shadow_w = jmnode.offsetLeft;
	  							var scrollTop = $('#'+jd.container+' .jsmind-inner').scrollTop();
	  			                var sibling_nodes = target_node.children;
	  			                var sc = sibling_nodes.length;
	  			                var node = null;
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
	  		                        }
	  			                }
	  			                
	  						  var c=document.getElementById("canvas_"+jd.container+"");
	  						  var ctx=c.getContext("2d");
	  						  if(!target_node.isroot){
	  							  ctx.clearRect(0,0,jd.jm.view.size.w,jd.jm.view.size.h);
	  							  var jcanvas = jsMind.util.canvas;
	  							  ctx.lineWidth = 5;
	  							  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
	  							  ctx.lineCap = 'round';
	  							  jcanvas.lineto(ctx,
	  									  node_data.sp.x,
	  									  node_data.sp.y,
	  									  node_data.np.x,
	  									  node_data.np.y);
	  						  }else{
	  							  ctx.clearRect(0,0,jd.jm.view.size.w,jd.jm.view.size.h);
	  						  }
	  					  }
	                    },50);
	  			  },
	  			  out: function(event){
	  				  var c=document.getElementById("canvas_"+jd.container+"");
	  				  var ctx=c.getContext("2d");
	  				  ctx.clearRect(0,0,jd.jm.view.size.w,jd.jm.view.size.h);
	  				  window.clearInterval(hlookup_timer_y);
	  			  },
	  			  drop: function(event) {
	  				var c=document.getElementById("canvas_"+jd.container+"");
	  				  var ctx=c.getContext("2d");
	  				  ctx.clearRect(0,0,jd.jm.view.size.w,jd.jm.view.size.h);
	  				  window.clearInterval(hlookup_timer_y);
	  				  
	  				  var jmnode = document.getElementById("jmnodeModel");
	  				  var shadow_h = jmnode.offsetTop;
	  				  var shadow_w = jmnode.offsetLeft;
	  				  var scrollTop = $('#'+jd.container+' .jsmind-inner').scrollTop();
	  				  //如果没有被磁铁吸引，则默认添加为根节点的子节点
    				    if(!target_node){target_node = jd.jm.get_root();}
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
	  	                    if(target_node.data.level==2||target_node.data.level==4||target_node.data.functionType==2){
	  	                    	$.dialog("不能在该节点添加子节点！");
	  	                    }else{
	  	                    	  var source_name = $('#jmnodeModel').html();
	  	                    	  var topic = source_name;
	  	                    	  var level = $('#jmnodeModel').attr('level');
	  	                    	  //如果是字段和sqlserver表，那么需要过滤一下topic
	  	                    	  if(level==4||level==2){
	  	                    		  topic = topic.substring(topic.indexOf('.')+1);
	  	                    	  }
	  	                    	  var flowid = $('#jmnodeModel').attr('flowid');
	  	                    	  var sourceid = $('#jmnodeModel').attr('sourceid');
	  	                    	  var functionName = $('#jmnodeModel').attr('functionName');
	  	                    	  var functionType = $('#jmnodeModel').attr('functionType');
	  	                    	  var paramNumber = $('#jmnodeModel').attr('paramNumber');
	  	          			      var columnType = $('#jmnodeModel').attr('columnType');
	  	                    	  var fixed = $('#jmnodeModel').attr('fixed');
	  	                    	  var source_type = 1;
	  	                    	  var line_color = $('#jmnodeModel').attr('line_color');
	  	                    	  var fk = $('#jmnodeModel').attr('fk');
	  		      				  var pk = jsMind.util.uuid.newid();
	  		      				  var nodeid = jsMind.util.uuid.newid();
  		      					  //拖进来的节点一定是底层节点，所以不用sourceids
	  		      				  var data = jd.jm.construct_data(functionName,functionType,columnType,paramNumber,fixed,fk,level,source_name,line_color,null,pk,flowid,sourceid,source_type);
	  		      				  //如果父节点没有子节点则用add_node，否则用insert_node_before
	  		      				  if(node_before){
	  		      					jd.jm.insert_node_before(node_before, nodeid, topic, data);
	  		      				  }else{
	  		      					jd.jm.add_node(target_node, nodeid, topic,data);
	  		      				  }
	  		      				  if(jd.container=="jsmind_container2"){
	  		      					  var node = jd.jm.get_node(nodeid);
	  		      					  var parentNode = node.parent;
	  		      					  if(parentNode.isroot&&node.data.level==3){
	  		      						  jd.jm.check_subnode(node);
	  		      					  }
	  		      					  if(!parent.isroot){
	  		      						  jd.jm.check_subnode(parentNode);
	  		      					  }
	  		      				  }
	  		      				  jd.jm.select_node(nodeid);
	  	                    }
	  	                }else{
	  	                	$("jmnode").removeClass("selected");
	  	                	jd.fuse_node(node_before,beforeid);
	  	                }
	  			  }
	  			});
        }
    };

})(window);
