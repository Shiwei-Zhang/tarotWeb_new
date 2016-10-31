	  $(function() {
		  var hlookup_timer_y = 0;
		  var target_node = null;
		  $( ".draggable" ).draggable({
			  drag: function(event) {
				    //console.log(event);
			        //console.log(event.clientX);
		      },
		      cursor: "move",
		      cursorAt: { top: 5, left: 5 },
		      helper: function( event ) {
		    	  var textValue = event.target.getAttribute('textValue');
		    	  var jmType = event.target.getAttribute('jmType');
		    	  var level = event.target.getAttribute('level');
		    	  var flowid = event.target.getAttribute('flowid');
		    	  var sourceid = event.target.getAttribute('sourceid');
		    	  var line_color = event.target.getAttribute('line_color');
		    	  var border_color = "#0080ff;";
		    	  if(jmType=='2'){
		    		  border_color = "#1abc9c;";
		    	  }
		        return $( "<jmnode id='jmnodeModel' style='border-color:"+border_color+"' jm ='"+jmType+"' level='"+level+"' flowid='"+flowid+"' sourceid='"+sourceid+"' line_color='"+line_color+"'>"+textValue+"</jmnode>" );
		      }
		    });
		  $( "#jsmind_container" ).droppable({
			  over: function(event){
				  hlookup_timer_y = window.setInterval(function(){
					  var jmnode = document.getElementById("jmnodeModel");
					  var node_data = _lookup_close_node_y(jmnode.clientWidth,jmnode.clientHeight,jmnode.offsetLeft,jmnode.offsetTop);
					  if(!!node_data){
						  target_node = node_data.node;
						  
							//flag为true则出现磁铁线，false则不出现
							var flag=true;
							var shadow_h = jmnode.offsetTop;
			                var sibling_nodes = target_node.children;
			                var sc = sibling_nodes.length;
			                var node = null;
			                var delta_y = Number.MAX_VALUE;
			                while(sc--){
			                    node = sibling_nodes[sc];
		                        var dy = node.get_location().y - shadow_h;
		                        if(dy<10 && dy>-10){
		                        	//这里定义式样
		                        	$($("jmnode[nodeid='"+node.id+"']")[0]).addClass("intro");
		                        	//暂时先都出现磁铁线
		                        	//flag=false;
		                        }else{
		                        	$($("jmnode[nodeid='"+node.id+"']")[0]).removeClass("intro");
		                        }
			                }
			                
						  var c=document.getElementById("canvas_1");
						  var ctx=c.getContext("2d");
						  if(!target_node.isroot){
							  ctx.clearRect(0,0,_jm.view.size.w,_jm.view.size.h);
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
							  ctx.clearRect(0,0,_jm.view.size.w,_jm.view.size.h);
						  }
					  }
                  },50);
			  },
			  out: function(event){
				  var c=document.getElementById("canvas_1");
				  var ctx=c.getContext("2d");
				  ctx.clearRect(0,0,_jm.view.size.w,_jm.view.size.h);
				  window.clearInterval(hlookup_timer_y);
			  },
			  drop: function(event) {
				  
				  var c=document.getElementById("canvas_1");
				  var ctx=c.getContext("2d");
				  ctx.clearRect(0,0,_jm.view.size.w,_jm.view.size.h);
				  window.clearInterval(hlookup_timer_y);
				  
				  var jmnode = document.getElementById("jmnodeModel");
				  var shadow_h = jmnode.offsetTop;
				  //如果没有被磁铁吸引，则默认添加为根节点的子节点
  				  if(!target_node){target_node = _jm.get_root();}
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
                       var dy = node.get_location().y - shadow_h;
                       if(dy<10 && dy>-10){
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
	                    if(target_node.data.level==2){
	                    	alert("哦哦");
	                    }else{
	                    	  var topic = $('#jmnodeModel').html();
	                    	  var level = $('#jmnodeModel').attr('level');
	                    	  var flowid = $('#jmnodeModel').attr('flowid');
	                    	  var sourceid = $('#jmnodeModel').attr('sourceid');
	                    	  var line_color = $('#jmnodeModel').attr('line_color');
		      				  var pk = jsMind.util.uuid.newid();
		      				  var nodeid = jsMind.util.uuid.newid();
		      				  var data = {"level":level,"pk":pk,"sql":"","isSave":0,"isInterface":0,"isDebug":0,"alias":topic,"flowid":flowid,"sourceid":sourceid,"subMind":"","columns":"","params":"","line_color":line_color};
		      				  //如果父节点没有子节点则用add_node，否则用insert_node_before
		      				  if(node_before){
		      					_jm.insert_node_before(node_before, nodeid, topic, data);
		      				  }else{
		      					_jm.add_node(target_node, nodeid, topic,data);
		      				  }
		                      _jm.select_node(nodeid);
	                    }
	                }else{
	                	$("jmnode").removeClass("intro");
	                	fuse_node2(node_before,beforeid);
	                }
			  }
			});
	  });
	  function _lookup_close_node_y(shadow_w,shadow_h,offsetLeft,offsetTop){
	        var root = _jm.get_root();
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
	        var nodes = _jm.mind.nodes;
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
	                if(direct == jsMind.direction.right){
	                    if(sx-nl.x-ns.w<=0){continue;}
	                    distance = Math.abs(sx-nl.x-ns.w) + Math.abs(sy+sh/2-nl.y-ns.h/2);
	                    np = {x:nl.x+ns.w-5,y:nl.y+ns.h/2};
	                    sp = {x:sx+5,y:sy+sh/2};
	                }else{
	                    if(nl.x-sx-sw<=0){continue;}
	                    distance = Math.abs(sx+sw-nl.x) + Math.abs(sy+sh/2-nl.y-ns.h/2);
	                    np = {x:nl.x+5,y:nl.y+ns.h/2};
	                    sp = {x:sx+sw-5,y:sy+sh/2};
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
	    };	  
