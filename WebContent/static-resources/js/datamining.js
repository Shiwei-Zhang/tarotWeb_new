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
	var attrs = getAttrs(_trainType);
	
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
								logs.find('p').last().remove();
								if(log.result == 'byebye' || log.result_code == '999'){
									console.log('stop it...');
									isStop = true;
									break;
								}
								if(log.result_code == '402'){
									console.log('stop it when error.');
									logs.append( $('<p>' + log.result + '</p>') );
									isStop = true;
									break;
								}
								logs.append( $('<p>' + log.result + '</p>') );
								logs.append( $('<p> ... </p>') );
							}
						}
					}
		})}, 1000);
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
		$('.datamining-attr ul.linearRegression-attr').show();
		break;
	case 'logisticregression':
		//TODO 逻辑回归类型...
		$('.datamining-attr ul.logisticRegression-attr').show();
		break;
	case 'ridgeregression':
		//TODO 岭回归类型...
		$('.datamining-attr ul.ridgeregression-attr').show();
		break;
	case 'svm':
		//TODO 支持向量机SVM类型...
		$('.datamining-attr ul.svm-attr').show();
		break;
	case 'kmeans':
		//TODO K-means聚类类型...
		$('.datamining-attr ul.kmeans-attr').show();
		break;
	case 'decisiontreesclassifier':
		//TODO 分类树类型...
		$('.datamining-attr ul.decisiontreesclassifier-attr').show();
		break;
	case 'decisiontreesregression':
		//TODO 回归树类型...
		$('.datamining-attr ul.decisiontreesregression-attr').show();
		break;
	case 'als':
		//TODO ALS推荐类型...
		$('.datamining-attr ul.als-attr').show();
		break;
	}
};
var getAttrs = function($trainType){
	var attrs = null;
	if($trainType == 'naivebayes'){
		attrs = bayesianAttrs();
	}
	if($trainType == 'linearregression'){
		attrs = linearRegressionAttrs();
	}
	if($trainType == 'logisticregression'){
		attrs = logisticRegressionAttrs();
	}
	if($trainType == 'ridgeregression'){
		attrs = ridgeregressionAttrs();
	}
	if($trainType == 'svm'){
		attrs = svmAttrs();
	}
	if($trainType == 'kmeans'){
		attrs = kmeansAttrs();
	}
	if($trainType == 'decisiontreesregression'){
		attrs = decisiontreesregressionAttrs();
	}
	if($trainType == 'decisiontreesclassifier'){
		attrs = decisiontreesclassifierAttrs();
	}
	if($trainType == 'als'){
		attrs = alsAttrs();
	}
	return attrs;
}

//Double验证^\d+(\.\d*)?$
var rgexp = new RegExp(/^(-?\d+)\.(\d+)?/);
//Integer、Long验证^[0-9]*$
var rgexp2 = new RegExp(/^[0-9]*$/);

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

//线性回归  属性信息
var linearRegressionAttrs = function(){
	var remark = $('.linearRegression-attr .remark').val();
	var elasticNetParam = $('.linearRegression-attr .elasticNetParam').val();
	var fitIntercept = $('.linearRegression-attr .fitIntercept').val();
	var maxIter = $('.linearRegression-attr .maxIter').val();
	var regParam = $('.linearRegression-attr .regParam').val();
	var solver = $('.linearRegression-attr .solver').val();
	var standardization = $('.linearRegression-attr .standardization').val();
	var tol = $('.linearRegression-attr .tol').val();
	if(!remark || !elasticNetParam || !fitIntercept || !maxIter || !regParam || !solver || !standardization || !tol){
		return null;
	}
	
	if(!rgexp.test(elasticNetParam)){
		$.dialog("elasticNetParam只能输入小数");
		return null;
	}
	if(!rgexp.test(regParam)){
		$.dialog("regParam只能输入小数");
		return null;
	}
	if(!rgexp.test(tol)){
		$.dialog("tol只能输入小数");
		return null;
	}
	if(!rgexp2.test(maxIter)){
		$.dialog("maxIter只能输入整数");
		return null;
	}
	var linearRegression = {};
	//备注
	linearRegression['remark'] = remark
	linearRegression['elasticNetParam'] = elasticNetParam
	linearRegression['fitIntercept'] = fitIntercept
	linearRegression['maxIter'] = maxIter
	linearRegression['regParam'] = regParam
	linearRegression['solver'] = solver
	linearRegression['standardization'] = standardization
	linearRegression['tol'] = tol
	
	return linearRegression;
};

//逻辑回归  属性信息
var logisticRegressionAttrs = function(){
	var remark = $('.logisticRegression-attr .remark').val();
	var elasticNetParam = $('.logisticRegression-attr .elasticNetParam').val();
	var fitIntercept = $('.logisticRegression-attr .fitIntercept').val();
	var maxIter = $('.logisticRegression-attr .maxIter').val();
	var regParam = $('.logisticRegression-attr .regParam').val();
	var standardization = $('.logisticRegression-attr .standardization').val();
	var tol = $('.logisticRegression-attr .tol').val();
	var thresholds = $('.logisticRegression-attr .thresholds').val();
	var threshold = $('.logisticRegression-attr .threshold').val();
	if(!remark || !elasticNetParam || !fitIntercept || !maxIter || !regParam || !standardization || !tol || !thresholds || !threshold){
		return null;
	}
	
	if(!rgexp.test(elasticNetParam)){
		$.dialog("elasticNetParam只能输入小数");
		return null;
	}
	if(!rgexp.test(regParam)){
		$.dialog("regParam只能输入小数");
		return null;
	}
	if(!rgexp.test(tol)){
		$.dialog("tol只能输入小数");
		return null;
	}
	if(!rgexp.test(threshold)){
		$.dialog("threshold只能输入小数");
		return null;
	}
	if(!rgexp2.test(maxIter)){
		$.dialog("maxIter只能输入整数");
		return null;
	}
	
	var logisticRegression = {};
	//备注
	logisticRegression['remark'] = remark
	logisticRegression['elasticNetParam'] = elasticNetParam
	logisticRegression['fitIntercept'] = fitIntercept
	logisticRegression['maxIter'] = maxIter
	logisticRegression['regParam'] = regParam
	logisticRegression['standardization'] = standardization
	logisticRegression['tol'] = tol
	logisticRegression['thresholds'] = thresholds
	logisticRegression['threshold'] = threshold
	
	return logisticRegression;
}

//岭回归  属性信息
var ridgeregressionAttrs = function(){
	var remark = $('.ridgeregression-attr .remark').val();
	var elasticNetParam = $('.ridgeregression-attr .elasticNetParam').val();
	var fitIntercept = $('.ridgeregression-attr .fitIntercept').val();
	var maxIter = $('.ridgeregression-attr .maxIter').val();
	var regParam = $('.ridgeregression-attr .regParam').val();
	var solver = $('.ridgeregression-attr .solver').val();
	var standardization = $('.ridgeregression-attr .standardization').val();
	var tol = $('.ridgeregression-attr .tol').val();
	if(!remark || !elasticNetParam || !fitIntercept || !maxIter || !regParam || !solver || !standardization || !tol){
		return null;
	}
	
	if(!rgexp.test(elasticNetParam)){
		$.dialog("elasticNetParam只能输入小数");
		return null;
	}
	if(!rgexp.test(regParam)){
		$.dialog("regParam只能输入小数");
		return null;
	}
	if(!rgexp.test(tol)){
		$.dialog("tol只能输入小数");
		return null;
	}
	if(!rgexp2.test(maxIter)){
		$.dialog("maxIter只能输入整数");
		return null;
	}
	
	var ridgeregression = {};
	//备注
	ridgeregression['remark'] = remark
	ridgeregression['elasticNetParam'] = elasticNetParam
	ridgeregression['fitIntercept'] = fitIntercept
	ridgeregression['maxIter'] = maxIter
	ridgeregression['regParam'] = regParam
	ridgeregression['solver'] = solver
	ridgeregression['standardization'] = standardization
	ridgeregression['tol'] = tol
	
	return ridgeregression;
}

//支持向量机SVM类型  属性信息
var svmAttrs = function(){
	var remark = $('.svm-attr .remark').val();
	var stepSize = $('.svm-attr .stepSize').val();
	var numIterations = $('.svm-attr .numIterations').val();
	var regParm = $('.svm-attr .regParm').val();
	var miniBatchFraction = $('.svm-attr .miniBatchFraction').val();
	if(!remark || !stepSize || !numIterations || !regParm || !miniBatchFraction){
		return null;
	}
	
	if(!rgexp.test(stepSize)){
		$.dialog("stepSize只能输入小数");
		return null;
	}
	if(!rgexp.test(regParam)){
		$.dialog("regParam只能输入小数");
		return null;
	}
	if(!rgexp.test(miniBatchFraction)){
		$.dialog("miniBatchFraction只能输入小数");
		return null;
	}
	if(!rgexp2.test(numIterations)){
		$.dialog("numIterations只能输入整数");
		return null;
	}
	
	var svm = {};
	//备注
	svm['remark'] = remark
	svm['stepSize'] = stepSize
	svm['numIterations'] = numIterations
	svm['regParm'] = regParm
	svm['miniBatchFraction'] = miniBatchFraction
	
	return svm;
}

//K-means聚类类型  属性信息
var kmeansAttrs = function(){
	var remark = $('.kmeans-attr .remark').val();
	//var initMode = $('.kmeans-attr .initMode').val();
	var initSteps = $('.kmeans-attr .initSteps').val();
	var k = $('.kmeans-attr .k').val();
	var maxIter = $('.kmeans-attr .maxIter').val();
	var seed = $('.kmeans-attr .seed').val();
	var tol = $('.kmeans-attr .tol').val();
	if(!remark || !initSteps || !k || !maxIter || !seed || !tol){
		return null;
	}
	var kmeans = {};
	//备注
	kmeans['remark'] = remark
	//kmeans['initMode'] = initMode
	kmeans['initSteps'] = initSteps
	kmeans['k'] = k
	kmeans['maxIter'] = maxIter
	kmeans['seed'] = seed
	kmeans['tol'] = tol
	
	return kmeans;
}

//回归树类型  属性信息
var decisiontreesregressionAttrs = function(){
	var remark = $('.decisiontreesregression-attr .remark').val();
	var cacheNodeIds = $('.decisiontreesregression-attr .cacheNodeIds').val();
	var checkpointInterval = $('.decisiontreesregression-attr .checkpointInterval').val();
	var impurity = $('.decisiontreesregression-attr .impurity').val();
	var maxBins = $('.decisiontreesregression-attr .maxBins').val();
	var maxDepth = $('.decisiontreesregression-attr .maxDepth').val();
	var maxMemoryInMB = $('.decisiontreesregression-attr .maxMemoryInMB').val();
	var minInfoGain = $('.decisiontreesregression-attr .minInfoGain').val();
	var minInstancesPerNode = $('.decisiontreesregression-attr .minInstancesPerNode').val();
	var seed = $('.decisiontreesregression-attr .seed').val();
	if(!remark || !cacheNodeIds || !checkpointInterval || !impurity || !maxBins || !maxDepth || !maxMemoryInMB || !minInfoGain || !minInstancesPerNode || !seed){
		return null;
	}
	var decisiontreesregression = {};
	//备注
	decisiontreesregression['remark'] = remark
	decisiontreesregression['cacheNodeIds'] = cacheNodeIds
	decisiontreesregression['checkpointInterval'] = checkpointInterval
	decisiontreesregression['impurity'] = impurity
	decisiontreesregression['maxBins'] = maxBins
	decisiontreesregression['maxDepth'] = maxDepth
	decisiontreesregression['maxMemoryInMB'] = maxMemoryInMB
	decisiontreesregression['minInfoGain'] = minInfoGain
	decisiontreesregression['minInstancesPerNode'] = minInstancesPerNode
	decisiontreesregression['seed'] = seed
	
	return decisiontreesregression;
}

//分类树类型  属性信息
var decisiontreesclassifierAttrs = function(){
	var remark = $('.decisiontreesregression-attr .remark').val();
	var cacheNodeIds = $('.decisiontreesregression-attr .cacheNodeIds').val();
	var checkpointInterval = $('.decisiontreesregression-attr .checkpointInterval').val();
	var impurity = $('.decisiontreesregression-attr .impurity').val();
	var maxBins = $('.decisiontreesregression-attr .maxBins').val();
	var maxDepth = $('.decisiontreesregression-attr .maxDepth').val();
	var maxMemoryInMB = $('.decisiontreesregression-attr .maxMemoryInMB').val();
	var minInfoGain = $('.decisiontreesregression-attr .minInfoGain').val();
	var minInstancesPerNode = $('.decisiontreesregression-attr .minInstancesPerNode').val();
	var seed = $('.decisiontreesregression-attr .seed').val();
	var thresholds = $('.decisiontreesregression-attr .thresholds').val();
	if(!remark || !cacheNodeIds || !checkpointInterval || !impurity || !maxBins || !maxDepth || !maxMemoryInMB || !minInfoGain || !minInstancesPerNode || !seed || !thresholds){
		return null;
	}
	var decisiontreesclassifier = {};
	//备注
	decisiontreesclassifier['remark'] = remark
	decisiontreesclassifier['cacheNodeIds'] = cacheNodeIds
	decisiontreesclassifier['checkpointInterval'] = checkpointInterval
	decisiontreesclassifier['impurity'] = impurity
	decisiontreesclassifier['maxBins'] = maxBins
	decisiontreesclassifier['maxDepth'] = maxDepth
	decisiontreesclassifier['maxMemoryInMB'] = maxMemoryInMB
	decisiontreesclassifier['minInfoGain'] = minInfoGain
	decisiontreesclassifier['minInstancesPerNode'] = minInstancesPerNode
	decisiontreesclassifier['seed'] = seed
	decisiontreesclassifier['thresholds'] = thresholds
	
	return decisiontreesclassifier;
}

//ALS推荐类型  属性信息
var alsAttrs = function(){
	var remark = $('.als-attr .remark').val();
	var numBlocks = $('.als-attr .numBlocks').val();
	var rank = $('.als-attr .rank').val();
	var iterations = $('.als-attr .iterations').val();
	var lambda = $('.als-attr .lambda').val();
	var implicitPrefs = $('.als-attr .implicitPrefs').val();
	var alpha = $('.als-attr .alpha').val();
	if(!remark || !numBlocks || !rank || !iterations || !lambda || !implicitPrefs || !alpha){
		return null;
	}
	var als = {};
	//备注
	als['remark'] = remark
	als['numBlocks'] = numBlocks
	als['rank'] = rank
	als['iterations'] = iterations
	als['lambda'] = lambda
	als['implicitPrefs'] = implicitPrefs
	als['alpha'] = alpha
	
	return als;
}