//variables default
//TODO ...
var _trainType = 'naivebayes';
var _sourceType = 'interface';
var _conId = null,
	_tableName = null,
	_menuId = null;
var _connInfo = {
		con: '',
		tableName: '',
		column: ''
};

//DATA MINING entrance
var dataMiningInit = function($dataMiningId){
	_menuId = $dataMiningId;
	console.log(_menuId);
	
	$.showLoading();
	$.ajax({
		url:urlId+'/getDataMining',
		type:'POST',
		data:{
			menuId: _menuId
		},
		success:function(data) {
			if(data){
				data = JSON.parse( data );
				var dataMining = data['dataMining'];
				var dataMiningTrainInfo = data['dataMiningTrainInfo'];
				var targetInfo = data['targetInfo'];
				var connectionInfo = data['connectionInfo'];
				var sourceData = data['sourceData'];
				
				renderPage(dataMining, dataMiningTrainInfo, targetInfo, connectionInfo, sourceData);
			}else{
				resetPage();
			}
			$.hideLoading();
		}
	});
};

//渲染已经有dataming信息的页面
var renderPage = function(dataMining, dataMiningTrainInfo, targetInfo, connectionInfo, sourceData){
	//训练模型 和属性信息
	var  trainType = '';
	var trainColumn = '';
	for(var i = 0; i < dataMiningTrainInfo.length; i ++){
		var dmt = dataMiningTrainInfo[i];
		trainType = dmt.dataMiningType;
		if( dmt.enumCode == 'trainColumn' ){
			trainColumn = dmt.value;
		}else{
			$('.datamining-attr .' + dmt.enumCode).val(dmt.value);
		}
	}
	$('.datamining-train .train-type select').val();
	
	//类型
	if(sourceData.isInterface == 1){
		_sourceType = 'interface';
		$('.datamining-train .interfaceName').val(sourceData.fileName);
	}else{
		_sourceType = 'datasource';
		_connInfo = {
				con: connectionInfo.id,
				tableName: sourceData.fileName,
				column: trainColumn
		};
		//render data source
		renderDataSourceConnection();
	}
	changeType(_sourceType);
	
	//按钮
	$('.datamining-save').attr('data-flowid', dataMining.logicFlowId).attr('data-nodeid', dataMining.logicNodeId).attr('data-id', dataMining.id);
	$('.datamining-test').attr('data-flowid', dataMining.logicFlowId).attr('data-type', 2);
};

//初始化无dataming信息的页面
var resetPage = function(){
	_trainType = 'naivebayes', _sourceType = 'interface', _conId = null, _tableName = null,
	_connInfo = {
			con: '',
			tableName: '',
			column: ''
	};
	
	changeType(_sourceType);
	$('.train-type select').val( _trainType );
	//render data source
	renderDataSourceConnection();
	
	$('.interface input').val(''); 
	var conTables = $('.datamining-train .datasource-tables select');
	var str = '<option value="">请选择表</option>';
	conTables.empty().append( $( str ) );
	
	var columns = $('.datamining-train .datasource-columns select');
	var columnDom = '<option value="">请选择或者填写字段</option>';
	columns.empty().append( $(columnDom) );
	
	//属性清空
	$('.datamining-attr input').val('');
};

//类型选择
$('.datamining-train .source-type select').unbind('change').change(function(){
	var $this = $(this);
	_sourceType = $this.val();
	
	changeType(_sourceType);
});

//|---------------------------------------------|
//|---------------------------------------------|
//|---------------------------------------------|
//|------------ train part ---------------------|
//|---------------------------------------------|
//|---------------------------------------------|
//|---------------------------------------------|
//类型切换
var changeType = function(type){
	if(type == 'interface'){
		$('.interface').css({'color': 'black'});
		$('.interface input').removeAttr('disabled');
		$('.datasource').css({'color': '#A0A0A0'});
		$('.datasource select').attr('disabled', 'disabled');
	}else if(type == 'datasource'){
		$('.datasource').css({'color': 'black'});
		$('.datasource select').removeAttr('disabled');
		$('.interface').css({'color': '#A0A0A0'});
		$('.interface input').attr('disabled', 'disabled');
	}
	
	$('.source-type select').val(type);
};

//获得连接信息, 并渲染
var renderDataSourceConnection = function(){
	$.showLoading();
    var str='<option value="">请选择数据连接</option>';
    $.ajax({
        url:urlId+'/selectDataConnectionAndPowerByUserId?userId=' + user_.id,
        type:'POST',
        success:function(data) {
			if(!data){
				$.hideLoading();
				return ;
			}
			
            $( JSON.parse(data) ).each(function(index,item){
                str+='<option value='+item["ID"]+'>'+item["NAME"]+'</option>';
            });
            var $connSelect = $('.datamining-train .datasource-connection select');
            $('.datamining-target .datasource-connection select').empty().append($(str));//target
            $connSelect.empty().append($(str));
            bindConnectionInfoChangeEvent( $connSelect );
            if(_connInfo.con){
            	$connSelect.val( _connInfo.con );
            	$connSelect.trigger('change');	
            }
            
    		$.hideLoading();
        }
    });
};
//表信息渲染
var bindConnectionInfoChangeEvent = function( $connSelect ){
	$connSelect.unbind('change').change(function(){
		_conId = $connSelect.val();
		var conTables = $('.datamining-train .datasource-tables select');
		var str = '<option value="">请选择表</option>';
		if(!_conId){
			console.log('Please choose one connection');
			conTables.empty().append( $( str ) );
			
			var columns = $('.datamining-train .datasource-columns select');
			var columnDom = '<option value="">请选择或者填写字段</option>';
			columns.empty().append( $(columnDom) );
			return;
		}
		
		$.ajax({
            url:urlId+'/selectValueAndTableByConId'+'?conId=' + _conId,
            type:'POST',
            success:function(data) {
            	if(!data){//无表数据
            		conTables.empty();
            		return ;
            	}
				var dataJson = JSON.parse(data );
            	var tableName = dataJson.tableName;
				if( !tableName ){
					conTables.empty();
					return ;
				}
                for(var i=0;i<tableName.length;i++){
                    str+='<option value="'+tableName[i]+'">'+tableName[i]+'</option>';
                }
                conTables.empty().append( $( str ) );
                bindConTablesChangeEvent(conTables, _conId);
                
                if(_connInfo.tableName){
                	conTables.val(_connInfo.tableName);
                	conTables.trigger('change');
                }
                $.hideLoading();
            }
        });
	});
};
//字段信息渲染
var bindConTablesChangeEvent = function($conTables, $conId){
	$conTables.unbind('change').change(function(){
		_tableName = $conTables.val();
		var columns = $('.datamining-train .datasource-columns select');
		var columnDom = '<option value="">请选择或者填写字段</option>';
		if(!_tableName){
			console.log('Please choose one table');
			columns.empty().append( $(columnDom) );
			return ;
		}
		$.ajax({
			url:urlId+'/selectTableColumn',
			type:'POST',
			data:{
				conId: $conId,
				tableName: _tableName
			},
			success:function(data) {
				if(data){
					data = JSON.parse( data );
					//获得column数据
					var columnObjects = data.table[_tableName];
					if(columnObjects){
						for(var i = 0; i < columnObjects.length; i ++){
							var columnObject = columnObjects[i];
							columnDom += '<option value="'+columnObject.column+'">' + columnObject.column + '</option>';
						}
						//渲染 字段
						columns.empty().append( $(columnDom) );
						
						if(_connInfo.column){
							columns.val(_connInfo.column);
						}
					}
				}
			}
		});
	});
};



//----------data mining save & test
//1.save
$('.datamining-target .datamining-save').unbind('click').click(function(){
	var dataMining = {
			menuId: _menuId
	};
	//a. train type
	dataMining['trainType'] = _trainType;
	//a2. train type attrs
	var attrs = null
	if(_trainType == 'naivebayes'){
		attrs = bayesianAttrs();
	}
	
	if(!attrs){
		return ;
	}
	dataMining[_trainType] = JSON.stringify( attrs );
	
	
	//b. source type
	dataMining['sourceType'] = _sourceType;
	var sourceTypeParams = {};
	if(_sourceType == 'interface'){
		var interfaceName = $('.datamining-train .interfaceName').val();
		if(!interfaceName){
			return ;
		}
		sourceTypeParams['interfaceName'] = interfaceName;
	}else if(_sourceType == 'datasource'){
		var trainColumn = $('.datasource-columns select').val();
		if(!_conId || !_tableName || !trainColumn){
			return ;
		}
		sourceTypeParams['conId'] = _conId;
		sourceTypeParams['tableName'] = _tableName;
		sourceTypeParams['trainColumn'] = trainColumn;
	}
	dataMining[_sourceType] = JSON.stringify( sourceTypeParams );
	
	//c. target
	//TODO ... 待定
	var target = {};
	/*var targetConId = $('.datamining-target .datasource-connection select').val();
	var targetTableName = $('.datamining-target .tableName').val();
	if(!targetConId || !targetTableName){
		return ;
	}*/
	//target['url'] = targetConId + '/' + targetTableName;
	//TODO will be deleted
	target['url'] = 'hdfs://tarot1:9000/testML/alsModel';
	dataMining['target'] = JSON.stringify( target );
	var $saveBtn = $('.datamining-save');
	if( $saveBtn.attr('data-flowid') || $saveBtn.attr('data-nodeid') || $saveBtn.attr('data-id') ){
		//更新DATA MINING
		dataMining['flowId'] = $saveBtn.attr('data-flowid');
		dataMining['nodeId'] = $saveBtn.attr('data-nodeid');
		dataMining['id'] = $saveBtn.attr('data-id');
		updateDataMining(dataMining);
		return ;
	}
	//d. saved
	$.showLoading();
	$.ajax({
		url:urlId+'/saveDataMining',
		type:'POST',
		data:dataMining,
		success:function(data) {
			if(data){
				$.dialog('保存成功');
				data = JSON.parse( data );
				$('.datamining-save').attr('data-flowid', data.logicFlowId).attr('data-nodeid', data.logicNodeId).attr('data-id', data.id);
				$('.datamining-test').attr('data-flowid', data.logicFlowId).attr('data-type', 3);
			}
			$.hideLoading();
		}
	});
});
var updateDataMining = function(dataMining){
	$.showLoading();
	$.ajax({
		url:urlId+'/updateDataMining',
		type:'POST',
		data:dataMining,
		success:function(data) {
			if(data){
				$.dialog('更新成功');
			}
			$.hideLoading();
		}
	});
}


//test
$('.datamining-test').unbind().click(function(){
	var flowId = $(this).attr('data-flowid');
	var type = $(this).attr('data-type');
	if(!flowId || !type){
		$.dialog('请确认信息是否保存成功');
		return;
	}
	
	$.ajax({
		url:urlId+'/sendEngineByTest',
		type:'POST',
		data:{
			flowId: flowId,
			type: type
		},
		success:function(data) {
			if(data){
				data = JSON.parse(data);
				if(data.flag){
					$.dialog('信息发送成功。');
					startSchedule(data.uuid);
				}
			}
			$.hideLoading();
		}
	});
});

var startSchedule = function( uuid ){
	var logs = $('.data-mining-log');
	logs.empty();
	var isStop = false;
	var plan = window.setInterval(
			function(){
				if(isStop){
					window.clearInterval(plan);
					return ;
				}
				
				$.ajax({
					url:urlId+'/getLogByUuid?time=' + new Date().getTime(),
					type:'POST',
					data:{
						uuid: uuid
					},
					success:function(data) {
						if(data){
							data = JSON.parse( data );
							for(var i = 0; i < data.length; i++){
								var log = JSON.parse( data[i] );
								if(log.result == 'byebye' || log.result_code == '999'){
									console.log('stop it...');
									isStop = true;
									logs.find('p').last().remove();
									break;
								}
								if(log.result_code == '402'){
									console.log('stop it when error.');
									logs.append( $('<p>' + log.result + '</p>') );
									isStop = true;
									break;
								}
								logs.find('p').last().remove();
								logs.append( $('<p>' + log.result + '</p>') );
								logs.append( $('<p> ... </p>') );
							}
						}
					}
		})}, 500);
};

//|---------------------------------------------|
//|---------------------------------------------|
//|--------- attribution part ------------------|
//|---------------------------------------------|
//|---------------------------------------------|
$('.datamining-train .train-type select').unbind('change').change(function(){
	_trainType = $(this).val();
	if(_trainType){
		showAttr(_trainType);
	}
});
var showAttr = function(trainType){
	$('.datamining-attr ul').hide();
	switch(trainType){
	case 'naivebayes':
		//TODO 朴素贝叶斯类型...
		$('.datamining-attr ul.naivebayes-attr').show();
		break;
	case 'linearregression':
		//TODO 线性回归类型...
		break;
	case 'logisticregression':
		//TODO 逻辑回归类型...
		break;
	case 'ridgeregression':
		//TODO 岭回归类型...
		break;
	case 'svm':
		//TODO 支持向量机SVM类型...
		break;
	case 'kmeans':
		//TODO K-means聚类类型...
		break;
	case 'decisiontreesclassifier':
		//TODO 分类树类型...
		break;
	case 'decisiontreesregression':
		//TODO 回归树类型...
		break;
	case 'als':
		//TODO ALS推荐类型...
		break;
	}
};
//朴素贝叶斯 属性信息
var bayesianAttrs = function(){
	var remark = $('.naivebayes-attr .remark').val();
	var smoothing = $('.naivebayes-attr .smoothing').val();
	var thresholds = $('.naivebayes-attr .thresholds').val();
	var modelType = $('.naivebayes-attr .modelType').val();
	if(!remark || !smoothing || !thresholds || !modelType){
		return null;
	}
	var bayesian = {};
	//备注
	bayesian['remark'] = remark;
	bayesian['smoothing'] = smoothing;
	bayesian['thresholds'] = thresholds;
	bayesian['modelType'] = modelType;
	
	return bayesian;
};