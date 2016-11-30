/**
*
*/
var __detailId = null, __flowId = null, __ftp = false;
var ftpLayer = '<div class="add3-con ftp-layer" style="display: none">' + 
			   '	<div class="addT">' +
			   '		<span>文件类型配置</span> <i class="closeA"></i>' +
			   '	</div>' + 
			   '	<div class="addList">' +
			   '		<div class="addRoot addRoot01 file-parse-config">' +
			   
			   '		</div>' +
			   '	</div>' + 
			   '	<div class="addFoot ftp-btns">' +
			   ' 		<span class="sure">确定</span> <span class="cancel">取消</span>' +
			   '	</div>' +
			   '</div>';

var ftpInit = function(data, $detailId, $flowId){
	$('.mainEvent').empty();
	__ftp = true;
	__detailId = $detailId;
	__flowId = $flowId;
	
	var files = data.tableName;
	var fileTypes = data.nameType;
	var filePaths = data.path;
	
	var $liObj = $('</li><p><span>/</span></p><div class="ftp-childrens"></div></li>');
	$('.mainEvent').append( $liObj );
	renderList($('.ftp-childrens'), files,fileTypes, filePaths );
};
var renderList = function( $domObj, files, fileTypes, filePaths ){
	$domObj.empty();
	for(var i = 0; i < files.length; i++){
		var str = '';
		var file = files[i];
		var type = fileTypes[i];
		str += '<div class="menu1" name="'+file+'">';
		if(type){
			str += '<p class="ftp-p" data-path="'+escape(filePaths[i])+'"><i class="titleTip rightIcon"></i><span  data-path="'+escape(filePaths[i])+'">'+file+'</span></p>' +
				   '<ul class="menu1List" style="display: none;"><li></li></ul>';
		}else{
			str += '<p><i class="single"></i><span data-path="'+escape(filePaths[i])+'">'+file+'</span></p>';
		}
		str += '</div>';
		
		$domObj.append( $(str) );
	}
	
	bindEvent4FTP();
};

var bindEvent4FTP = function(){
	$('.mainEvent  .ftp-p').unbind().click(function(){
		var $this = $(this);
		if($this.find('i').hasClass('rightIcon')){
			$this.find('i').removeClass('rightIcon').addClass('downIcon');
			
			var path = $this.attr('data-path');
			//TODO...
			var url = urlId + '/selectFTP';
			$.ajax({
				  url:url,
                  type:'POST',
                  data:{
                	  conId: __detailId,
                	  flowId: __flowId,
                	  folderUrl: path
                  },
                  dataType:"json",
                  success: function(data){
                	  if(data){
                		  var files = data.tableName;
                		  var fileTypes = data.nameType;
                		  var filePaths = data.path;
                		  var $ul = $this.next();
                		  var $li = $ul.find('li');
                		  renderList($li, files,fileTypes, filePaths );
                		  $ul.show();
                	  }
                  }
			});
		}else{
			$this.find('i').addClass('rightIcon').removeClass('downIcon');
			$this.next().hide();
		}
	});
};


/******
**ftp Config
******/
var ftpConfig = function(files){
	if(files.length < 1){
		return ;
	}
	
	var $fl = $(ftpLayer);
	$('body').append( $fl );
	
	var strDom = '<table>' + 
	'<tr><td>分隔符</td><td><input class="sep" value=","/></td></tr>' +	
	'<tr><td>列名行</td><td><input class="cRow" type="number" value="1" readonly="readonly"/></td></tr>' +
	'<tr><td>头行列名</td><td><select class="header"><option value="0">False</option><option value="1">True</option></select></td></tr>' +
	+ '</table>';
	$('.file-parse-config').append( $(strDom) );
	
	$('.mask').show();
	$fl.show();
	
	bindConfigBtnsEvent(files);
};

var bindConfigBtnsEvent = function(files){
	$('.ftp-layer .cancel, .ftp-layer .closeA').unbind().click(function(){
		$('.mask').hide();
		$('.ftp-layer').remove();
	});
	$('.ftp-layer sure').unbind().click(function(){
		var sep = $('.sep').val();
		var cRow = $('.cRow').val();
		var header = $('.header').val();
		if(!sep || !cRow || !header){
			return ;
		}
		
		var dataParams = {
				sep: sep,
				cRow: cRow,
				header: header 
		};
		//获得字段 ajax
		$.ajax({
			url: '',
			data: dataParams,
			success: function(data){
				if(data){
					dataParams['columns'] = data;
					
					//保存信息 ajax
					//TODO ...
					saveInfo(dataParams);
					$('.ftp-layer').remove();
				}
			}
		});
	});
};

var saveInfo = function(dataParams){
	
}



