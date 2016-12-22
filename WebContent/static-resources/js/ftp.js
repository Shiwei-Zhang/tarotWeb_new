/**
*
*/
var __detailId = null, __flowId = null, __ftp = false, __sourceType = null;
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
	__sourceType = data.sourceType;
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
						  if(files.length<1){
							  return;
						  }
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
var ftpConfig = function(files,conId,conName){
	if(files.length < 1){
		return ;
	}
	
	var $fl = $(ftpLayer);
	$('body').append( $fl );
	
	var strDom = '<table>' + 
	'<tr><td>分隔符</td><td><input class="sep" value=","/></td></tr>' +	
	'<tr><td>列名行</td><td><input class="cRow" type="number" value="1" readonly="readonly"/></td></tr>' +
	'<tr><td>头行列名</td><td><select class="header"><option value="1">True</option><option value="0">False</option></select></td></tr>' +
	+ '</table>';
	$('.file-parse-config').append( $(strDom) );
	
	$('.mask').show();
	$fl.show();
	
	bindConfigBtnsEvent(files,conId,conName);
};

var bindConfigBtnsEvent = function(files,conId,conName){
	$('.ftp-layer .cancel, .ftp-layer .closeA').unbind().click(function(){
		$('.mask').hide();
		$('.ftp-layer').remove();
	});
	$('.ftp-layer .sure').unbind().click(function(){
		var sep = $('.sep').val();
		var cRow = $('.cRow').val();
		var header = $('.header').val();
		var index = files[0].lastIndexOf("/");
		var filess = files[0].substring(index + 1, files[0].length);
		
		var source_data = new Object();
		source_data.conId = conId;
		source_data.conName = conName;
		source_data.flowId = flowId_global;
		source_data.isInterface = 0;
		/*if(__sourceType == "ftp"){
			source_data.sourceDataType = 'ftp';
		}
		if(__sourceType == "hdfs"){
			source_data.sourceDataType = 'hdfs';
		}*/
		source_data.sourceDataType = 'csv';
		var enumValues = new Array();
		var enumValue = new Object();
		enumValue.enumCode = "sourcetable";
		enumValue.value = files[0];
		enumValues.push(enumValue);
		var enumValue2 = new Object();
		enumValue2.enumCode = "sep";
		enumValue2.value = sep;
		enumValues.push(enumValue2);
		var enumValue3 = new Object();
		enumValue3.enumCode = "cRow";
		enumValue3.value = cRow;
		enumValues.push(enumValue3);
		var enumValue4 = new Object();
		enumValue4.enumCode = "header";
		enumValue4.value = header;
		enumValues.push(enumValue4);
		var enumValue5 = new Object();
		enumValue5.enumCode = "alias";
		var fileName = files[0].substr(files[0].lastIndexOf('%252F')+5);
		enumValue5.value = fileName.substring(0, fileName.lastIndexOf('.'));
		enumValues.push(enumValue5);
		source_data.fileName = files[0];
		var enumValue6 = new Object();
		enumValue6.enumCode = "conId";
		enumValue6.value = conId;
		enumValues.push(enumValue6);
		var enumValue7 = new Object();
		enumValue7.enumCode = "conType";
		enumValue7.value = __sourceType;
		enumValues.push(enumValue7);
		source_data.enumValues = enumValues;
		if(!sep || !cRow || !header){
			return ;
		}
		
		//获得字段 ajax
		$.ajax({
			url: urlId+'/addFTP',
			type:'POST',
			dataType:"json",
            contentType: "application/json; charset=utf-8",
            data:JSON.stringify(source_data),
			success: function(data){
				appendDataSources(data);
				$('.ftp-layer .cancel').trigger('click');
			}
		});
	});
};



