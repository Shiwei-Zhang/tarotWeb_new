$(function(){
	var $body = $('body');
	$body.css({'position':'relative', 'height':'900px'});
	
	var templateId = $.getQueryString('templateId');
	if(!templateId){
		$.dialog('暂无数据, 请关闭当前页面。');
		return ;
	};
	
	 var baseUrl='http://localhost:8080/TarotIDE';
	//TODO deleting
	 //baseUrl = 'http://localhost:800/';
	 
	var p_variableMap = {};
	var p_chartVarMap = {};
	var p_templateObjMap = {theme: ''};
	var p_templateContainer = {};
	var templateThemeToBGColor = {
			'vintage':'rgba(254,248,239,1)',
			'westeros':'rgba(0,0,0,0)',
			'wonderland':'rgba(255,255,255,0)',
			'chalk':'rgba(41,52,65,1)',
			'macarons':'rgba(0,0,0,0)',
			'shine':'rgba(0,0,0,0)',
			'halloween':'rgba(64,64,64,0.5)',
			'dark':'rgba(51,51,51,1)',
			'essos':'rgba(242,234,191,0.15)',
			'walden':'rgba(252,252,252,0)',
			'infographic':'rgba(0,0,0,0)',
			'roma':'rgba(0,0,0,0)',
			'purple-passion':'rgba(91,92,110,1)'
	};
	
	$('.bi-preview').css({'height':'900px', 'width':'1400px', 'position':'absolute','margin':'50px auto','left':'0px', 'right':'0px'});
	$.showLoading();
	$.ajax({
		url:baseUrl+'/bi/getEchartsByTemplateId',
		type:'POST',
		data:{
			templateId: templateId
		},
		success:function(data) {
			if(data){
				data = JSON.parse( data );
				var template = data.template;
				p_reloadAndRnderTemplate(template);
				
				var charts = data.charts;
				//分离变量图表,跟实例图表
				var varCharts = [];
				var instCharts = [];
				for(var i = 0; i < charts.length; i ++){
					var chart = charts[i];
					if(chart.classType == 'input' || chart.classType == 'droplist'){
						varCharts.push(chart);
					}else{
						instCharts.push(chart);
					}
				}
				//a.渲染变量图表
				for(var i = 0; i < varCharts.length; i ++){
					var chart = varCharts[i];
					p_renderChartLayout(chart, false);
				}
				//b.渲染实例图表
				for(var i = 0; i < instCharts.length; i ++){
					var chart = instCharts[i];
					p_renderChartLayout(chart, true);
				}
			}
			
			$.hideLoading();
		}
	});
	
	var p_reloadAndRnderTemplate = function($template){
    	var $theme = $template.theme;
    	p_templateObjMap['theme'] = $theme;
    	if($theme){
    		var color = templateThemeToBGColor[$theme];
    		$body.css({'background-color': color});
    	}
    };
    
  //渲染已经布局过的chart
	var p_renderChartLayout = function($chart, isAsync){
		var width = $chart.width;
		var height = $chart.height;
		if( !width || !height ){
			console.log('do not layout, the chart is:' + $chart.id);
			return ;
		}
		
		var left = $chart.beginXCoordinate;
		var top = $chart.beginYCoordinate;
		var templateId = $chart.templateId;
		var chartId = $chart.id;
		
		$.ajax({
			url:baseUrl+'/bi/getEchartJSONByIds',
			type:'POST',
			data:{
				chartId: chartId,
				templateId: templateId,
				variableMap: JSON.stringify(p_variableMap)
			},
			async: isAsync,
			success:function(data) {
				if(data){
					//template面板追加一个默认的容器
					var divId = 'tmp-' + chartId + '-' + templateId;
					$('.bi-preview').append( $( '<div id="' + divId + '-parent" style="position: absolute;"><div class="tmp-chart" id="' + divId  + '" style=""></div></div>' ) );
					//还原位置
					$('#' + divId + '-parent').css({'width': width + 'px', 'height':height + 'px', 'top':top + 'px', 'left':left + 'px'});
					$('#' + divId).css({'width': width + 'px', 'height':height + 'px'});
					
					data = JSON.parse( data );
					var chartJson_ = data['chartJson'];
					var chartType_ = data.chartType;
					if(chartJson_){
						if( chartType_ == 'input' || chartType_ == 'droplist' ){
							var variableName = data.variable;
							var variableValue = chartJson_.value;
							var title = JSON.parse(data.title);
							if(chartType_ == 'input'){
								$('#' + divId + '-parent').hide();
							}else{
								variableValue = chartJson_.value[0];
							}
							
							p_variableMap[variableName] = variableValue + '';
							p_chartVarMap[divId] = variableName;
							$('#' + divId).createVariable(event, chartJson_, chartType_, title);
							
							if(chartType_ == 'droplist'){
								//绑定change事件
								p_bindVarDroplistEvent(divId);
							}
						}else if( chartType_ == 'table' ){
							var title = JSON.parse(data.title);
							chartJson_.caption = title;
							$('#' + divId).createVariable(event, chartJson_, chartType_, title);
						}else{
							var theme_ = p_templateObjMap['theme'] || data.chartCommonAttr.theme;
							var myChart_ = echarts.init(document.getElementById(divId), theme_);
							myChart_.clear();//清空组件
							myChart_.setOption( chartJson_ );
						}
						
						p_templateContainer[divId] = data.filter;
					}
				}
				$.hideLoading();
			}
		});
	};
	
	var p_bindVarDroplistEvent = function($divId){
		$('#' + $divId + '-parent select').unbind('change').change(function(){
			var value = $(this).val();
			if(!value){
				return;
			}
			var varName = p_chartVarMap[$divId];
			p_variableMap[varName] = value;
			
			//遍历所有Chart,根据是否包含当前变量来进行重新布局
			for(var divId in p_templateContainer){
				var filter = p_templateContainer[divId];
				if(filter && filter.indexOf(varName) > -1 ){
					var ids = divId.split('-');
					var chartId =  ids[1];
					var templateId =  ids[2];
					
					$.ajax({
						url:baseUrl+'/bi/getChartByIds',
						type:'POST',
						data:{
							chartId: chartId,
							templateId: templateId
						},
						success:function(data) {
							if(data){
								var chart = JSON.parse(data);
								
								var parentId =  'tmp-' + chart.id + '-' + chart.templateId + '-parent';
								var currentChartInCon = $('#' + parentId);
								chart['width'] = currentChartInCon.width();
								chart['height'] = currentChartInCon.height();
								chart['beginXCoordinate'] = currentChartInCon.position().left;
								chart['beginYCoordinate'] = currentChartInCon.position().top;
								
								delete p_templateContainer[divId];
								currentChartInCon.remove();
								
								p_renderChartLayout(chart, true);
							}
						}
					});
				}
			}
		});
	};
});