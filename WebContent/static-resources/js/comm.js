/**
 *API UTIL
 *ZHANG HAIJUN
*/
;(function($, window, document, undefined){
	$.getCookie = function(name){
		var needLogin = true;
		if(name){
			var cookieStr = document.cookie;
			if(cookieStr && cookieStr.length > 0 && cookieStr.indexOf(name) > -1){
				var nameAndId = cookieStr.split(name + '=')[1].split(';')[0];
				if(nameAndId && nameAndId.split('-').length > 1){
					nameAndId = nameAndId.split('-');
					needLogin = false; //是否需要登录
					var user= {
							name:nameAndId[0],
							id:nameAndId[1],
							isAdmin:nameAndId[2]};
					return user;
				}
			}
		}
		
		if(needLogin){
			location.href = location.origin + '/TarotIDE';
			return null
		}
		return null;
	};
	$(window).on('resize', $.resizeW);
	$.resizeW = function() {
		var $winW = $(document).width();
		$('.module-data,.module-manager,.module-data-all').css('width', $winW - 201);
		$('.dataMinL').css('width',($winW-201-345));
		$('.module-core').css('width',($winW-201-351));
		$('.codePart').css('width',($('.module-data-all').width()-351));//flow-code
	};
	$.isEmpty = function(obj){
		if(!obj){//'', null, undefined
			return true;
		}
		
		//map对象
		var objArray = [];
		for(var ele in obj){
			objArray.push(ele);
			return ;
		}
		if(objArray.length < 1){
			return true;
		}
		
		return false;
	};
	$.getQueryString = function(name)
	{
	     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
	     var r = window.location.search.substr(1).match(reg);
	     if(r!=null){
	    	 return  unescape(r[2]);  
	     }
	     return null;
	};
	$.showLoading = function(){
		var loadingDom = $(
				'<div class="slef-dialog-layer">' + 
				'	<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>' + 
				' 	<span class="sr-only">Loading...</span>' + 
				'	<div class="mask"></div>' + 
				'</div>' );
		var $body = $('body');
		$body.append(loadingDom);
		loadingDom.css({'position': 'absolute', 'z-index':'999', 
			'width': '50px', 'height': '50px', 'top':(($body.height() - 50)/2) + 'px', 'left': (($body.width() - 50)/2) + 'px'});
	};
	$.hideLoading = function(){
		$('.slef-dialog-layer').remove();
	};
	$.inputDialog = function(){
		$('.self-input-layer').remove();
		var dialogDom = $(
				'<div class="self-input-layer">' + 
				'	<div class="dialog" >' +
				'		<div class="d-content"><input type="text" placeholder="请输入布局的名称"/></div>' +
				'		<div>' +
				'		 	<input type="button" class="dialog-cancel" value="取消" />' +
				'		 	<input type="button" class="dialog-ok" value="确定"/>' +
				'		</div>' +
				'	</div>' +
				'	<div class="mask"></div>' +
				'</div>' );
		
		var $body = $('body');
		$body.append(dialogDom);
		dialogDom.find('div.dialog').css({'position': 'absolute', 'z-index':'999', 'width': '450px', 'height': '150px',
					   'top':(($body.height() - 300)/2) + 'px', 'left':(($body.width() - 450)/2) + 'px', 
					   'border':'1px #DCDCDC solid', 'border-radius': '10px', 'text-align': 'center',
					   'background-color': '#fff'});
		dialogDom.find('div.d-content').css({'width':'430px', 'text-align': 'center', 'height': '50px', 'padding':'50px 0px 0px 0px'});
		dialogDom.find('div.d-content input').css({'width': '210px', 'height': '30px'});
		dialogDom.find('input[type="button"]').css( {'width': '100px', 'height': '30px', 'background-color': '#ffffff', 'cursor':'pointer'} );
		dialogDom.find('input.dialog-cancel').css( {'border': '1px gray solid', 'color': 'gray', 'margin-right': '10px'} );
		dialogDom.find('input.dialog-ok').css( {'border': '1px deepskyblue solid', 'color': 'deepskyblue', 'margin-right': '20px'} );
		dialogDom.find('div.mask').css('z-index', '990');
		
		$('.self-input-layer .d-content input').unbind('focus').focus(function(e){
			$(this).css('border', '1px gray solid');
		});
		$('.self-input-layer .dialog-cancel').unbind().click(function(e){
			$('.self-input-layer').hide();
		});
	};
	$.dialog = function(tip){
		$('.self-dialog-layer').remove();
		tip = tip || '';
		tip = tip.substr(0, 100);
		var dialogDom = $(
				'<div class="self-dialog-layer">' + 
				'	<div class="dialog" >' +
				'		<div class="d-content">' + tip + '</div>' +
				'		<div>' +
				/*'		 	<input type="button" class="dialog-cancel" value="取消" />' +*/
				'		 	<input type="button" class="dialog-ok" value="确定"/>' +
				'		</div>' +
				'	</div>' +
				'	<div class="mask"></div>' +
				'</div>' );
		
		var $body = $('body');
		$body.append(dialogDom);
		dialogDom.find('div.dialog').css({'position': 'absolute', 'z-index':'999', 'width': '450px', 'height': '150px',
					   'top':(($body.height() - 300)/2) + 'px', 'left':(($body.width() - 450)/2) + 'px', 
					   'border':'1px #DCDCDC solid', 'border-radius': '10px', 'text-align': 'center',
					   'background-color': '#fff'});
		dialogDom.find('div.d-content').css({'width':'430px', 'text-align': 'center', 'height': '50px', 'word-break':'break-all'});
		dialogDom.find('input').css( {'width': '100px', 'height': '30px', 'background-color': '#ffffff', 'cursor':'pointer'} );
		/*dialogDom.find('input.dialog-cancel').css( {'border': '1px gray solid', 'color': 'gray', 'margin-right': '10px'} );*/
		dialogDom.find('div.mask').css('z-index', '990');
		$('.dialog-cancel').unbind().click(function(e){
			$('.self-dialog-layer').hide();
		});
		dialogDom.find('input.dialog-ok').css( {'border': '1px deepskyblue solid', 'color': 'deepskyblue', 'margin-right': '20px', 'float':'right'} );
		dialogDom.find('input.dialog-ok').unbind().click(function(e){
			$('.self-dialog-layer').hide();
		});
		
		document.onkeydown = function(e){ 
		    var ev = document.all ? window.event : e;
		    if(ev.keyCode==13) {
		    	dialogDom.find('input.dialog-ok').trigger('click');
		     }
		};
	};
	window.alert = function(tip){
		$.dialog(tip);
	};
	
	$.fn.test = function(e){
		var $this = $(this);
		console.log($this);
	}
})(jQuery, window, document);