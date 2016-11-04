var baseUrl = urlId;
//$(function(){
	var conId = '';
	var templateId = '';
	var chartId = '';
	var $biMain = $('#bi-main');
	
	//will use
	var chartCommonAttr = {
		theme:'',

		titleShow: 0,//标题显示与否, 默认不显示
		titleText: 'untitled chart',
		titlePosition: 'center',//标题位置

		legendShow: 1,//图例是否显示,默认显示
		legendPosition: 'left',//图例位置

		labelShow: 0,//标签显示与否, 默认不显示
		labelPosition:  'top',//标签显示位置

		tooltipShow: 1,//提示框,默认显示

		toolboxShow:0,//工具栏是否显示, 默认显示
		toolboxOrient: 'horizontal',//工具栏布局朝向

		datazoomShow: 0,//区域缩放,默认不显示
		dataZoom:{
			type: 'slider'
		},

		visualmapShow: 0,//视觉映射是否显示, 默认不显示
		visualMap: {//默认值
			text: [ '高', '低'],
			calculable:'true',
			dimension:0,
			inRange:{
				color:['#50a3ba', '#eac736', '#d94e5d']
			}
		}
	};
	
	var theme = '';
	
	var titleShow = 0;//标题显示与否, 默认不显示
	var titleText = 'untitled chart';
	var titlePosition = 'center';//标题位置
	
	var legendShow = 1;//图例是否显示,默认显示
	var legendPosition = 'left';//图例位置
	
	var labelShow = 0;//标签显示与否, 默认不显示
	var labelPosition = 'top';//标签显示位置
	
	var tooltipShow = 1;//提示框,默认显示
	
	var toolboxShow = 0;//工具栏是否显示, 默认显示
	var toolboxOrient = 'horizontal';//工具栏布局朝向
	
	var datazoomShow = 0;//区域缩放,默认不显示
	var dataZoom = {
			type: 'slider'
	};
	
	var visualmapShow  = 0;//视觉映射是否显示, 默认不显示
	//默认值
	var visualMap = {
			text: [ '高', '低'],
			calculable:'true',
			dimension:0,
			inRange:{
				color:['#50a3ba', '#eac736', '#d94e5d']
			}
	};
	
	//图表相关
	var xaxis = [], 
	yaxis = [],
	filter = null,
	orderBy = null,
	tableName = '';
	var chartType = '';
	var oldChartType = '';
	window.chartJson = null;
	
	//template相关
	var templateContainer = {}

	//数据源事件
	$('.addPart').click(function(){
		$('.mask').show().css({"zIndex":"110"});
		showLoading();
		
		//获得连接信息
        var str='<option class="">请选择数据源</option>';
        $.ajax({
            url:baseUrl+'/selectDataConnectionAndPowerByUserId?userId=4',
            type:'POST',
            success:function(data) {
				if(!data){
					hideLoading();
					return ;
				}
				
                $( JSON.parse(data) ).each(function(index,item){
                    str+='<option value='+item["ID"]+'>'+item["NAME"]+'</option>';
                });
                str+='<option value="">other</option>';
                $('.bi-connection').empty().append($(str));
                bindChangeEvent($('.bi-connection'));
                
                
                //显示数据源选择面板
                $('.bi-datasource').show().css({"zIndex":"120"});
        		$('.dataContainerA .mainList').css('overflowY', 'auto');
        		hideLoading();
            }
        });
	});
	
	//编辑面板关闭
	$('.bi-close1').click(function(){
		$('.biData').hide();
		$('.mask').css({"zIndex":"100"}).hide();
	});
	//取消或者关闭数据源面板
	$('.bi-close2, .bi-cancel').click(function(){
		$('.bi-datasource').hide();
		$('.mask').show().css({"zIndex":"100"});
	});
	//确认选表
	$('.bi-sure').unbind('click').click(function(){
		$('.bi-datasource').hide();
		
		//初始化
		rest4bi();
		showLoading();
		
		//保存选择的表
		var nextEle = $('.bi-singleChecked').next();
		if(nextEle && nextEle.length > 0){
			tableName = nextEle.html().trim();
			renderColumns();
		}
		//then,清空数据表选择面板
		$('.bi-mainList').empty();
	});
	
	//生成图表
	$('.bi-generator').click(function(){
		var dimensionality = $('.bi-dimensionality li');
		var measure = $('.bi-measure li');
		var legend = $('.bi-menu .selected');
		
		if(dimensionality && dimensionality.length > 0 &&
				measure && measure.length > 0 && legend.length > 0){
			xaxis = [];
			dimensionality.each(function(index, item){
				xaxis.push($(item).text());
			});
			yaxis = [];
			measure.each(function(index, item){
				yaxis.push($(item).text());
			});
			chartType = legend.data('type');
			
			if(!chartType || !conId || !tableName || xaxis.length < 1 || yaxis.length < 1){
				console.log('data is error.');
				return ;
			}
			
			$.ajax({
	            url:baseUrl+'/bi/getEchartJSONInEdit',
	            type:'POST',
	            data:{
	            	conId: conId,
	            	tableName:tableName,
	            	chartType: chartType,
	            	xaxis: xaxis,
	            	yaxis: yaxis
	            },
	            success:function(data) {
	            	if(data){
						data = JSON.parse( data );
						
						chartJson = data['chartJson'];
						if(chartJson){
							var myChart = echarts.init($biMain[0], theme);
							myChart.clear();//清空组件
							//TODO
							if(chartType == 'table'){
								Table.buildTable(chartJson, 'bi-main');
							}else if(chartType == 'droplist'){
								Variable.buildDroplist(chartJson, 'bi-main');
							}else if(chartType == 'input'){
								Variable.buildInput(data, 'bi-main');
							}else{
								myChart.setOption( setChartJson(chartJson) );
							}
						}
	            	}
	            }
	        });
		}
	});
	
	//保存当前编辑chart
	$('.bi-save').click(function(e){
		//当前是否存在chart
		if(!chartJson){
			return;
		}
		
		var dataParams = {};
		//1.维度
		dataParams.xaxis = xaxis.join(',');
		//2.量度
		dataParams.yaxis = yaxis.join(',');
		//3.图表类型
		dataParams.chartType = chartType;
		//4.属性配置
		//4.1过滤
		dataParams.filter = filter;
		//4.2排序
		dataParams.orderBy = orderBy
		//4.3主题
		dataParams.theme = theme;
		//4.4标题
		dataParams.title = JSON.stringify({
			show:  titleShow,
			text:  titleText,
			position: titlePosition
		});
		//4.5图例
		dataParams.legend = JSON.stringify({
			show:  legendShow,
			position:  legendPosition
		});
		//4.6标签
		dataParams.label = JSON.stringify({
			show:  labelShow,
			position:  labelPosition
		});
		//4.7提示框
		dataParams.tooltip =  tooltipShow;
		//4.8工具栏
		dataParams.toolbox = JSON.stringify({
			show:  toolboxShow,
			orient: toolboxOrient
		});
		//4.9区域缩放
		dataParams.datazoom = datazoomShow;
		//4.10视觉映射
		dataParams.visualMap = JSON.stringify({
			show: visualmapShow,
			dimension: visualMap.dimension,
			text: visualMap.text.join(','),
			color: visualMap.inRange.color.join(',')
		});
		
		dataParams.name = titleText;
		dataParams.tableName = tableName;
		dataParams.conId = conId;
		dataParams.templateId = templateId;//templateId通过父层传递进来
		
		//true即是编辑已存在的chart
		if(chartId){
			dataParams.chartId = chartId;
			updateChartData(dataParams);
			return ;
		}
		
		$.ajax({
			url: baseUrl +'/bi/saveEchartDataInEdit',
			data: dataParams,
			type:'POST',
			success:function(data){
				
				$('.mask').hide();
				$('.biData').hide();
				if(data){
					data = JSON.parse(data);//chart
					renderChart(data);
				}
			},
			complete: function(){
				//初始化浮层数据
				rest4bi();
			}
		});
	});
	//重置选项
	$('.bi-reset').click(function(){
		rest4bi();
	});
	
	$('.bi-template-container').droppable({
	      accept: ".bi-edit",
	      activeClass: "ui-state-highlight",
	      drop: function( event, ui ) {
	    	  //处置被拖动的元素放置时
	    	  var $item = ui.draggable;
	    	  var chartId = $item.data('chartid');
	    	  var templateId = $item.data('templateid');
	    	  if(!chartId || !templateId){
	    		  return ;
	    	  }
	    	  
	    	  renderTemplate(chartId, templateId);
	      }
	    });
	
	//保存当前编辑的template
	$('.bi-template-save').unbind('click').click(function(e){
		var dataParams = {};
		for(var key in templateContainer){
			if(key.indexOf('theme') > -1){
				continue;
			}
			var divId = key;
			var positionAttr = $('#' + divId + '-parent').position();
			positionAttr['width'] = $('#' + divId).width();
			positionAttr['height'] = $('#' + divId).height();
			dataParams[divId] = JSON.stringify(positionAttr);
		}
		
		showLoading();
		
		$.ajax({
			url:baseUrl+'/bi/updateTemplateAndCharts',
			type:'POST',
			data:dataParams,
			success:function(data) {
				if(data){
					data = JSON.parse( data );
					
				}
				hideLoading();
			}
		});
	});
	//删除当前template已编辑好的chart
	$('.bi-template-delete').unbind('click').click(function(e){
		var chartId = $(this).data('chartid');
		var templateId = $(this).data('templateid');
		if(!chartId || !templateId || !templateContainer['temp-' + chartId + '-' + templateId]){
			console.log('data is error.');
			return;
		}
		
		var dataParams = {};
		var positionAttr = {top: 0, left: 0};
		positionAttr['width'] = 0;
		positionAttr['height'] = 0;
		dataParams['temp-' + chartId + '-' + templateId] = JSON.stringify(positionAttr);
		
		showLoading();
		$.ajax({
			url:baseUrl+'/bi/updateTemplateAndCharts',
			type:'POST',
			data:dataParams,
			success:function(data) {
				if(data){
					data = JSON.parse( data );
					//删除当前节点
					$('#temp-' + chartId + '-' + templateId + '-parent').empty().remove();
				}
				hideLoading();
			}
		});
	});
	
	$('.showbiData').off('click').click(function () {
		templateId = $(this).attr('data-templateid');
		init(templateId);//初始化页面
	    $('.biData,.mask').show();
	});
	 
	$('.biData-T .closeR').unbind('click').click(function () {
	   rest4bi();
		$('.biData,.mask').hide();
	});
	//选中样式
	$('.iconStyle').unbind().click(function(){
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
        	$('.bi-menu .iconStyle').removeClass('selected');
            $(this).addClass('selected');
        }
    });
	
	//echart 属性配置
	//1.主题
	$('.bi-theme select').unbind().change(function(){
		theme = $(this).val();
		if(!chartJson){
			return ;
		}
		echarts.init($biMain[0], theme).setOption(chartJson);
	});

	//2.标题
	$('.bi-title .show').unbind().click(function(){
		var $this = $(this);
		if($this.hasClass('singleChecked')){
			titleShow = 0;
			
			$this.removeClass('singleChecked');
		}else{
			titleShow = 1;
			
			$this.addClass('singleChecked');
		}
		if(!chartJson){
			return ;
		}
		
		chartJson.title.show = titleShow?true:false;
		chartJson.title.text = titleText;
		chartJson.title.left = titlePosition;
		echarts.init($biMain[0], theme).setOption(chartJson);
	});
	$('.bi-title input[name="text"]').unbind().blur(function(){
		titleText = $(this).val();
		if(titleShow == 1 && titleText && chartJson){
			chartJson.title.show = true;
			chartJson.title.text = titleText;
			chartJson.title.left = titlePosition;
			echarts.init($biMain[0], theme).setOption(chartJson);
		}
	});
	$('.bi-title .alignIcon').unbind().click(function(){
		var $this = $(this);
		if($this.hasClass('checked')){
			return ;
		}else{
			$('.bi-title .alignIcon').removeClass('checked');
			$this.addClass('checked');
			
			titlePosition = $this.hasClass('showL')? 'left': ($this.hasClass('showC')?'center':'right');
			if(titleShow == 1  && chartJson){
				chartJson.title.show = true;
				chartJson.title.text = titleText;
				chartJson.title.left = titlePosition;
				echarts.init($biMain[0], theme).setOption(chartJson);
			}
		}
	});
	
	//3.图例
	$('.bi-legend .lshow').unbind().click(function(){
		var $this = $(this);
		if($this.hasClass('singleChecked')){
			legendShow = 0;
			
			$this.removeClass('singleChecked');
		}else{
			legendShow = 1;
			
			$this.addClass('singleChecked');
		}
		
		if(!chartJson){
			return ;
		}
		chartJson.legend.show = legendShow?true:false;
		chartJson.legend.left = legendPosition;
		echarts.init($biMain[0], theme).setOption(chartJson);
	});
	$('.bi-legend .alignIcon').unbind().click(function(){
		var $this = $(this);
		if($this.hasClass('checked')){
			return ;
		}else{
			$('.bi-legend .alignIcon').removeClass('checked');
			$this.addClass('checked');
			
			legendPosition = $this.hasClass('showL')? 'left': ($this.hasClass('showC')?'center':'right');
			if(legendShow == 1  && chartJson){
				chartJson.legend.show = true;
				chartJson.legend.left = legendPosition;
				echarts.init($biMain[0], theme).setOption(chartJson);
			}
		}
	});
	
	//4.标签
	$('.bi-label .lbshow').unbind().click(function(){
		var $this = $(this);
		if($this.hasClass('singleChecked')){
			labelShow = 0;
			
			$this.removeClass('singleChecked');
		}else{
			labelShow = 1;

			$this.addClass('singleChecked');
		}
		
		if(!chartJson){
			return ;
		}
		for(var i = 0; i < chartJson.series.length; i ++){
			var sery = chartJson.series[i];
			sery.label.normal.show = labelShow?true:false;
			sery.label.emphasis.show = labelShow?true:false;
			sery.label.normal.position = labelPosition;
			sery.label.emphasis.position = labelPosition;
		}
		echarts.init($biMain[0], theme).setOption(chartJson);
	});
	$('.bi-label select[name="lbposition"]').unbind().change(function(){
		labelPosition = $(this).val();
		if(labelShow == 1 && labelPosition && chartJson){
			for(var i = 0; i < chartJson.series.length; i ++){
				var sery = chartJson.series[i];
				sery.label.normal.show = true;
				sery.label.emphasis.show = true;
				sery.label.normal.position = labelPosition;
				sery.label.emphasis.position = labelPosition;
			}
			echarts.init($biMain[0], theme).setOption(chartJson);
		}
	});
	
	//5.提示框
	$('.bi-tooltip .ttshow').unbind().click(function(){
		var $this = $(this);
		if($this.hasClass('singleChecked')){
			tooltipShow = 0;
			
			$this.removeClass('singleChecked');
		}else{
			tooltipShow = 1;
			
			$this.addClass('singleChecked');
		}
		if(!chartJson){
			return ;
		}
		chartJson.tooltip.show = true;
		echarts.init($biMain[0], theme).setOption(chartJson);
	});
	
	//6.工具栏
	$('.bi-toolbox .tbshow').unbind().click(function(){
		var $this = $(this);
		if($this.hasClass('singleChecked')){
			toolboxShow = 0;
			
			$this.removeClass('singleChecked');
		}else{
			toolboxShow = 1;
			
			$this.addClass('singleChecked');
		}
		
		if(!chartJson){
			return ;
		}
		chartJson.toolbox.show = toolboxShow?true:false;
		chartJson.toolbox.orient = toolboxOrient;
		echarts.init($biMain[0], theme).setOption(chartJson);
	});
	$('.bi-toolbox select[name="tborient"]').unbind().change(function(){
		toolboxOrient = $(this).val();
		if(toolboxShow == 1 && toolboxOrient && chartJson){
			chartJson.toolbox.orient = toolboxOrient;
			echarts.init($biMain[0], theme).setOption(chartJson);
		}
	});
	
	//7.区域缩放 --坐标轴特有
	$('.bi-datazoom .dzshow').unbind().click(function(){
		var $this = $(this);
		if($this.hasClass('singleChecked')){
			datazoomShow = 0;
			
			$this.removeClass('singleChecked');
		}else{
			datazoomShow = 1;

			$this.addClass('singleChecked');
		}
		
		if(!chartJson){
			return ;
		}
		if(datazoomShow){
			try{
				chartJson.dataZoom = [];
				chartJson.dataZoom.push(dataZoom);
			} catch(e){
				console.log(e);
				datazoomShow = 0;
				chartJson.dataZoom = [];
			}
		}else{
			chartJson.dataZoom = [];
		}
		echarts.init($biMain[0], theme).setOption(chartJson);
	});
	
	//8.视觉映射
	$('.bi-visualmap .vmshow').click(function(){
		var $this = $(this);
		if($this.hasClass('singleChecked')){
			visualmapShow = 0;
			
			$this.removeClass('singleChecked');
		}else{
			visualmapShow = 1;

			$this.addClass('singleChecked');
		}
		
		if(!chartJson){
			return ;
		}
		if(visualmapShow){
			chartJson.visualMap = [];
			chartJson.visualMap.push(visualMap);
		}else{
			chartJson.visualMap = [];
		}
		echarts.init($biMain[0], theme).setOption(chartJson);
	});
	$('.bi-visualmap input[name="dimension"]').change(function(){
		var dimension = $(this).val();
		if(visualmapShow == 1 && dimension && chartJson){
			visualMap.dimension = dimension;
			chartJson.visualMap = [];
			chartJson.visualMap.push(visualMap);
			echarts.init($biMain[0], theme).setOption(chartJson);
		}else{
			visualMap.dimension = dimension?dimension : 0;
		}
	});
	$('.bi-visualmap-text').blur(function(){
		var height = $($('.bi-visualmap-text')[0]).val();
		var low = $($('.bi-visualmap-text')[1]).val();
		height = height? height : '高';
		low = low? low:'低';
		visualMap.text = [height, low];
		if(visualmapShow == 1 && chartJson){
			chartJson.visualMap = [];
			chartJson.visualMap.push(visualMap);
			echarts.init($biMain[0], theme).setOption(chartJson);
		}else{
			visualMap.text = [height, low];
		}
		
	});
	$('.bi-visualmap-inrange').blur(function(){
		var inrangeColor = $(this).val();//,隔开
		if(visualmapShow == 1 && chartJson){
			if(inrangeColor){
				visualMap.inRange.color = inrangeColor.split(',')
				chartJson.visualMap = [];
				chartJson.visualMap.push(visualMap);
				echarts.init($biMain[0], theme).setOption(chartJson);
			}else{
				chartJson.visualMap = [];
				chartJson.visualMap.push(visualMap);
				echarts.init($biMain[0], theme).setOption(chartJson);
			}
		}else{
			if(inrangeColor){
				visualMap.inRange.color = inrangeColor.split(',')
			}
		}
	});
	//end 属性配置
	
	
	//方法集合
	var bindChangeEvent = function($connection){
		$connection.unbind().change(function(){
			conId = $connection.val();
			if(!conId){
				console.log('conId is empty');
				return ;
			}
			showLoading();
			//选择数据库并显示表
			$.ajax({
	            url:baseUrl+'/selectValueAndTableByConId'+'?conId=' + conId,
	            type:'POST',
	            success:function(data) {
	            	if(!data){//无表数据
	            		$('.bi-mainList').empty();
	            		console.log('暂无数据');
	            		hideLoading();
	            		return ;
	            	}
					var dataJson = JSON.parse(data );
	            	var tableName = dataJson.tableName;
					if( !tableName ){
						$('.bi-mainList').empty();
						console.log('暂无表数据');
						hideLoading();
						return ;
					}
	                //console.log(tableName)
	            	var str = '';
	                for(var i=0;i<tableName.length;i++){
	                    str+='<li><i class="single"></i><span>'+tableName[i]+'</span></li>';
	                }
	                $('.bi-mainList').empty().html( $( str ) );

	                //添加选中事件
	                $('.bi-mainList li').unbind('click').click(function(e){
	                	e=e||window.event;
	            		var tar= e.target|| e.srcElement;
	            		if(tar.tagName.toLowerCase()==='i'&& $(tar).hasClass('single')){
	            			if($(tar).hasClass('singleChecked')){
	            				$(tar).removeClass('singleChecked').removeClass('bi-singleChecked');
	            			}else {
	            				$('.bi-mainList li i').removeClass('singleChecked').removeClass('bi-singleChecked');
	            				$(tar).addClass('singleChecked').addClass('bi-singleChecked');
	            			}
	            		}
	                });
	                
	                hideLoading();
	            }
	        });
		});
	};
	
	//
	var biEditBindEvent = function(){
		//编辑当前chart
		$('.bi-edit').click(function(e){
			conId = $(this).data('conid');
			templateId = $(this).data('templateid');
			chartId = $(this).data('chartid');
			if( !conId || !templateId || !chartId ){
				console.log('当前chart不存在.');
				return ;
			}
			showLoading();
	
			//获得当前chart对象
			$.ajax({
				url:baseUrl+'/bi/getEchartJSONByIds',
				type:'POST',
				data:{
					chartId: chartId,
					templateId: templateId
				},
				success:function(data) {
					if(data){
						data = JSON.parse( data );
	
						//设置页面全局属性
						chartCommonAttr = data.chartCommonAttr;
						theme = chartCommonAttr.theme;
						chartType = data.chartType;
						xaxis = data.xaxis;
						yaxis = data.yaxis;
						tableName = data.tableName;
						filter = data.filter;
						orderBy = data.orderBy;
						chartJson = data['chartJson'];
						//--
						var chartJson_ = data['chartJson'];
						if(chartJson_){
							var myChart = echarts.init($biMain[0], theme);
							myChart.clear();//清空组件
							//TODO
							if(chartType == 'table'){
								Table.buildTable( chartJson_ , 'bi-main');
							}else if(chartType == 'droplist'){
								Variable.buildDroplist(chartJson_ , 'bi-main');
							}else if(chartType == 'input'){
								Variable.buildInput(data, 'bi-main');
							}else{
								myChart.setOption( chartJson_ );
	
								//初始化界面
								init(templateId, chartId);
								//显示面板
								$('.biData,.mask').show();
							}
						}
					}
					hideLoading();
				}
			});
		});
		
		//拖拽效果
		$('.bi-edit').draggable({
	      revert: "invalid", // 当未被放置时，条目会还原回它的初始位置
	      containment: "document",
	      helper: "clone",
	      cursor: "move",
	      start: function( event, ui ) {
	    	  //处理拖动的对象的背景颜色
	    	  ui.helper.css({'background-color':'red'});
	      }
	    });
	};

	//初始化BI编辑页面
	var init = function($templateId, chartId){
		$('.bi-list').empty();//字段列表
		$('.bi-dimensionality').empty();
		$('.bi-measure').empty();
		
		templateId = $templateId;

		if(!chartId){
			return;
		}
		//初始化已存在的CHART编辑页面
		//1.初始化字段面板
		renderColumns();

		//2.初始化维度,量度, 图表类型
		for(var i = 0; i < xaxis.length; i ++){
			$('.bi-dimensionality').append($( "<li></li>" ).append( $('<span>'+ xaxis[i] + '</span><i class="closeB bi-column-close"></i>') ));
			deleteDroppabledColumn();
		}

		for(var i = 0; i < yaxis.length; i ++){
			$('.bi-measure').append( $( "<li></li>" ).append( $('<span>'+ yaxis[i] + '</span><i class="closeB bi-column-close"></i>') ) );
			deleteDroppabledColumn();
		}
		

		//3.初始化属性
		//3.1初始化排序
		//TODO
		//3.2初始化过滤
		//TODO
		//3.3初始化chart属性
		initAttributeUI();
	};
	
	//初始化页面 test
	//init(1);
	
	//更新chart
	var updateChartData = function(dataParams){
		$.ajax({
			url: baseUrl +'/bi/updateChartData',
			data: dataParams,
			type:'POST',
			success:function(data){
				//初始化浮层数据
				rest4bi();
				$('.mask').hide();
				$('.biData').hide();
				if(data){
					var chart = JSON.parse(data);//chart
					
					//TODO 父页面更新chart列表数据
					$('.bi-chart-list div').each(function(index, item){
						if(chart.id == $(item).data('chartid')){
							$(item).attr('data-conid', chart.conId);
							//是否重新渲染到template
							var chartId = chart.id;
							var templateId = chart.templateId;
							var divId = 'tmp-' + chartId + '-' + templateId;
							if(templateContainer[divId]){
								//删除容器中相关信息,
								delete templateContainer[divId];
								delete templateContainer[divId+'-theme'];
								
								$('#' + divId + '-parent').remove();
								//重新加载
								renderChartLayout(chart);
							}
							
							return false;
						}
					});
				}
			}
		});
	}
	
	//重置页面属性
	var rest4bi = function(){
		//数据源相关重置
		$('.bi-dimensionality').empty();//x
		$('.bi-measure').empty();//y
		$('.bi-menu .iconStyle').removeClass('selected');//图表类型
		
		//chart reset
		chartJson = null;
		theme = '';
		chartType = '';
		xaxis = [], 
		yaxis = [],
		filter = null,
		orderBy = null;
		echarts.init($biMain[0]).clear();
		
		//reset attributes
		//1.theme
		$('.bi-theme select[name="theme"]').val('');
		//2.title
		$('.bi-title .show').removeClass('singleChecked');
		$('.bi-title input[name="text"]').val('untitled chart');
		$('.bi-title .alignIcon').removeClass('checked');
		$('.bi-title .showC').addClass('checked');
		//3.legend
		$('.bi-legend .lshow').removeClass('singleChecked');
		$('.bi-legend .alignIcon').removeClass('checked');
		$('.bi-legend .showL').addClass('checked');
		//4.label
		$('.bi-label .lbshow').removeClass('singleChecked');
		$('.bi-label select[name="lbposition"]').val('top');
		//5.toolbox
		$('.bi-toolbox .tbshow').addClass('singleChecked');
		$('.bi-toolbox select[name="tborient"]').val('horizontal');
		//6.visualmap
		$('.bi-visualmap .show').removeClass('singleChecked');
		$('.bi-visualmap input[name="dimension"]').val('');
		$('.bi-visualmap-text').val('');
		$('.bi-visualmap-inrange').val('');
		//7.tooltip
		$('.bi-tooltip .ttshow').addClass('singleChecked');
		//8.datazoom
		$('.bi-datazoom .dzshow').removeClass('singleChecked');
	};

	var renderColumns = function(){
		$.ajax({
			url:baseUrl+'/selectTableColumn',
			type:'POST',
			data:{
				conId: conId,
				tableName:tableName
			},
			success:function(data) {
				if(data){
					data = JSON.parse( data );
					//获得column数据
					var columnObjects = data.table[tableName];
					if(columnObjects){
						var columnDom = '';
						for(var i = 0; i < columnObjects.length; i ++){
							var columnObject = columnObjects[i];
							columnDom += '<li>' + columnObject.column + '&nbsp;&nbsp;(' + columnObject.parameter[0]+ ')</li>';
						}
						//渲染 字段
						$('.bi-list').html( $(columnDom) );


						//绑定拖放事件
						droppable4Columns();
					}
				}

				$('.mask').show().css({"zIndex":"100"});
				hideLoading();
			}
		});
	}

	var droppable4Columns = function(){
		//这里是字段列表, 维度列表, 量度列表
		var $columnList = $('.bi-list'),
		$dimensionality = $('.bi-dimensionality'),
		$measure = $('.bi-measure');
		
		 //让字段列表的条目可拖拽
	    $( "li", $columnList ).draggable({
	      cancel: "a.ui-icon", // 点击一个图标不会启动拖拽
	      revert: "invalid", // 当未被放置时，条目会还原回它的初始位置
	      containment: "document",
	      helper: "clone",
	      cursor: "move",
	      start: function( event, ui ) {
	    	  //处理拖动的对象的文本,背景颜色
	    	  ui.helper.text(ui.helper.text().split('(')[0].trim());
	    	  ui.helper.css({'background-color':'#f3f3f3'});
	      }
	    });
	    
	    //让 维度列表可放置，接受字段列表的条目
	    $dimensionality.droppable({
	      accept: ".bi-list > li",
	      activeClass: "ui-state-highlight",
	      drop: function( event, ui ) {
	    	  //处置被拖动的元素放置时
	    	  var $item = ui.draggable;
	    	  var text = $item.text().split('(')[0].trim();
	    	  $( "<li></li>" ).append( $('<span>'+ text + '</span><i class="closeB bi-column-close"></i>') ).appendTo( this );
	    	  
	    	  $( '.bi-column-close' ).unbind( 'click' ).click(function(e){
	    		  $(this).parent().remove();
	    	  });
	      }
	    });
	    //让 量度列表可放置，接受字段列表的条目
	    $measure.droppable({
	      accept: ".bi-list > li",
	      activeClass: "ui-state-highlight",
	      drop: function( event, ui ) {
	    	  //处置被拖动的元素放置时
	    	  var $item = ui.draggable;
	    	  var text = $item.text().split('(')[0].trim();
	    	  $( "<li></li>" ).append( $('<span>'+ text + '</span><i class="closeB bi-column-close"></i>') ).appendTo( this );
	    	  
	    	  $('.bi-column-close').unbind('click').click(function(e){
	    		  $(this).parent().remove();
	    	  });
	      }
	    });
	};

	var deleteDroppabledColumn = function(){
		//添加删除事件
		$('.bi-column-close').unbind().click(function(){
			$(this).parent().remove();
		});
	};

	var setChartJson = function($chartJson){
		if(!chartJson){
			chartJson = $chartJson;
			return chartJson;
		}
		
		chartJson = $chartJson;
		//2.setting title
		if(titleShow){
			chartJson.title.show = true;
			chartJson.title.text = titleText;
			if(titlePosition){
				chartJson.title.left = titlePosition
			}
		}
		//3.setting legend
		if(legendShow){
			chartJson.legend.show = true;
			if(legendPosition){
				chartJson.legend.left = legendPosition
			}
		}
		//4.setting label
		if(labelShow){
			for(var i = 0; i < chartJson.series.length; i ++){
				var sery = chartJson.series[i];
				sery.label.normal.show = true;
				sery.label.emphasis.show = true;
				if(labelPosition){
					sery.label.normal.position = labelPosition;
					sery.label.emphasis.position = labelPosition;
				}
			}
		}
		//5.setting tooltip
		if(tooltipShow){
			window.chartJson.toolbox.show = true;
			if(toolboxOrient){
				window.chartJson.toolbox.orient = toolboxOrient;
			}
		}
		//6.setting toolbox
		if(toolboxShow){
			chartJson.toolbox.show = true;
			if(toolboxOrient){
				chartJson.toolbox.orient = toolboxOrient;
			}
		}
		//7.setting datazoom
		if(datazoomShow){
			chartJson.dataZoom.push(dataZoom);
		}
		//8.setting visualmap
		if(visualmapShow){
			chartJson.visualMap.push(visualMap);
		}
		
		return chartJson;
	}
	
	//generate filter sentence
	var getFilter = function(){
		//TODO generating filter sentence via filter attribute.
		return filter;
	};

	//初始化属性面板
	var initAttributeUI = function(){
		//chart type
		$('.bi-menu .iconStyle').removeClass('selected');//图表类型
		$('.bi-menu .iconStyle').each(function(index, item){
			var type = $(item).data('type');
			if(type == chartType){
				$(item).addClass('selected');
				return false;
			}
		});
		//theme
		$('.bi-theme select[name="theme"]').val(chartCommonAttr.theme?chartCommonAttr.theme:'');
		//1.title
		titleShow = chartCommonAttr.titleShow?1:0;
		titlePosition = chartCommonAttr.titleLeft;
		titleText = chartCommonAttr.titleText;
		//页面title
		titleShow?$('.bi-title .show').addClass('singleChecked'):$('.bi-title .show').removeClass('singleChecked');
		$('.bi-title input[name="text"]').val(titleText);
		$('.bi-title .alignIcon').removeClass('checked');
		titlePosition == 'left'?$('.bi-title .showL').addClass('checked'):(
				titlePosition == 'center'?$('.bi-title .showC').addClass('checked'): $('.bi-title .showR').addClass('checked'));

		//2.legend
		legendShow = chartCommonAttr.legendShow?1:0;
		legendPosition = chartCommonAttr.legendLeft;
		//页面legend
		legendShow?$('.bi-legend .lshow').addClass('singleChecked'):$('.bi-legend .lshow').removeClass('singleChecked');
		$('.bi-legend .alignIcon').removeClass('checked');
		legendPosition == 'left'?$('.bi-legend .showL').addClass('checked'):(
				legendPosition == 'center'?$('.bi-legend .showC').addClass('checked'): $('.bi-legend .showR').addClass('checked'));

		//3.label
		labelShow = chartCommonAttr.labelShow?1:0;
		labelPosition = chartCommonAttr.labelPosition;
		//页面label
		labelShow?$('.bi-label .lbshow').addClass('singleChecked'):$('.bi-label .lbshow').removeClass('singleChecked');
		$('.bi-label select[name="lbposition"]').val(labelPosition);
		//4.tooltip
		tooltipShow = chartCommonAttr.tooltipShow?1:0;
		//页tooltip
		tooltipShow?$('.bi-tooltip .ttshow').addClass('singleChecked'):$('.bi-tooltip .ttshow').removeClass('singleChecked');

		//5.toolbox
		toolboxShow = chartCommonAttr.toolboxShow?1:0;
		toolboxOrient = chartCommonAttr.toolboxOrient;
		//页面toolbox
		toolboxShow?$('.bi-toolbox .tbshow').addClass('singleChecked'):$('.bi-toolbox .tbshow').removeClass('singleChecked');
		$('.bi-toolbox select[name="tborient"]').val(toolboxOrient);

		//6.datazoom
		datazoomShow = chartCommonAttr.datazoomShow?1:0;
		//页面datazoom
		datazoomShow?$('.bi-datazoom .dzshow').addClass('singleChecked'):$('.bi-datazoom .dzshow').removeClass('singleChecked');

		//7.visualmap
		visualmapShow = chartCommonAttr.visualmapShow?1:0;
		var visualmapText = chartCommonAttr.visualmapText;
		var visualmapDimension = chartCommonAttr.visualmapDimension;
		var visualmapinrangeColor = chartCommonAttr.visualmapinrangeColor
		if(visualmapText){
			visualMap.text = visualmapText.split(',');
			
			$($('.bi-visualmap-text')[0]).val(visualMap.text[0]);
			$($('.bi-visualmap-text')[1]).val(visualMap.text[1]);
		}
		if(visualmapDimension){
			visualMap.dimension = parseInt(visualmapDimension);
		}
		if(visualmapinrangeColor){
			visualMap.inRange.color = visualmapinrangeColor.split(',');
		}
		//页面visualmap
		visualmapShow?$('.bi-visualmap .show').addClass('singleChecked'):$('.bi-visualmap .show').removeClass('singleChecked');
		$('.bi-visualmap input[name="dimension"]').val(visualmapDimension);
		$('.bi-visualmap-inrange').val(visualmapinrangeColor);
	};
	
	/**
	 * template related
	 */
	//渲染 template
	var renderTemplate = function(chartId, templateId){
		//容器是否有此chart
		if(templateContainer['tmp-' + chartId + '-' + templateId]){
			return ;
		}
		//获得当前chart对象
		showLoading();
		$.ajax({
			url:baseUrl+'/bi/getEchartJSONByIds',
			type:'POST',
			data:{
				chartId: chartId,
				templateId: templateId
			},
			success:function(data) {
				if(data){
					data = JSON.parse( data );
					var chartType_ = data.chartType;
					var chartJson_ = data['chartJson'];
					var theme_ = data.chartCommonAttr.theme;
					if(chartJson_){
						//template面板追加一个默认的容器
						var divId = 'tmp-' + chartId + '-' + templateId;
						$('.bi-template-container').append( $( '<div id="' + divId + '-parent" style="height:300px; width:300px; border:1px #b6bccc solid; position: absolute;"><div class="tmp-chart" id="' + divId  + '" style="height:300px; width:300px;"></div></div>' ) );
						var myChart_ = echarts.init(document.getElementById(divId), theme_);
						myChart_.clear();//清空组件
						//TODO
						if(chartType_ == 'table'){
							Table.buildTable(chartJson_, 'bi-main');
						}else if(chartType_ == 'droplist'){
							Variable.buildDroplist(chartJson_, 'bi-main');
						}else if(chartType_ == 'input'){
							Variable.buildInput(data, 'bi-main');
						}else{
							myChart_.setOption( chartJson_ );
						}
					}
					templateContainer[divId] = chartJson_;
					templateContainer[divId+'-theme'] = theme_;
					
					//非隐藏表单域绑定缩放事件
					if(chartType_ != 'input'){
						bindEventByTempChartId(divId);
					}
				}
				hideLoading();
			}
		});
	};
	//绑定渲染后的template中的图表缩放事件
	var bindEventByTempChartId = function($divId){
		//绑定缩放事件
		$('#' + $divId + '-parent').resizable({
			ghost: true,
	    	minHeight: 150,
	    	maxHeight: 600,
	    	minWidth: 150,
	    	maxWidth: 800,
	    	stop: function( event, ui ) {
	    		var $chartJSON = templateContainer[$divId];
	    		var $theme = templateContainer[$divId+'-theme'];
	    		if($chartJSON){
	    			resetEchart($divId, $chartJSON, $theme);
	    		}
	    	}
	    });
		//绑定拖放事件
		$('#' + $divId + '-parent').draggable({ containment: "parent" });
	};
	var resetEchart = function($divId, $echartJSON, $theme){
    	$('#' + $divId).css({"width": ($('#' + $divId + '-parent').width()) + "px", "height": ($('#' + $divId + '-parent').height()) + "px"});
    	/*if(oldChartType == 'table'){
    		Table.buildTable($echartJSON, 'main');
    	}else if(oldChartType == 'droplist'){
    		Variable.buildDroplist($echartJSON, 'main');
    	}else{
    		echarts.init($('#' + $divId)[0]).setOption($echartJSON);	
    	}*/
    	echarts.init($('#' + $divId)[0], $theme).setOption($echartJSON);	
    };

	var showLoading = function(){
	};
	var hideLoading = function(){
	}
	
    //bi页面列表
    var showList = function(main){
        var $menu = $(main),
            $h2 = $menu.find(".tabT"),
            $detail = $menu.find(".detail");
        $h2.on("click", function () {
            var $curIndex = $(this).parent().index();

            $detail.each(function (index, item) {
                if ($curIndex === index) {
                    $(this).stop().slideToggle(200);
                    return;
                }
                $(this).stop().slideUp(200);
            });
            function $restClass(){
                $('.biDataLbottom .fa,.biDataR .fa').removeClass('fa-caret-down').addClass('fa-caret-right');
            }
            if($(this).children('.fa').hasClass('fa-caret-down')){
                $restClass();
            }else{
                $restClass();
                $(this).children('.fa').removeClass('fa-caret-right').addClass('fa-caret-down');
            }
        });
    };
	showList('.menu');
    showList('.menuRight');
    
//});

 
    //util api
    var commJS = {
		getCookie: function(name){
			var cookieStr = document.cookie;
			if(cookieStr && cookieStr.length > 0 && cookieStr.indexOf(name) > -1){
				return cookieStr.split(name + '=')[1].split(';')[0];
			}
			return null;
		}
};

    //bi入口
    var biInit = function($templateId){
		console.log('bi init:' + $templateId);
		//before 1: bi-template 重置
		//名称列表清空
		$('.bi-chart-list').empty();
		//容器清空
		$('.bi-template-container').empty();
		//1.加载CHART列表,并渲染CHART列表
		$.ajax({
			url:baseUrl+'/bi/getEchartsByTemplateId',
			type:'POST',
			data:{
				templateId: $templateId
			},
			success:function(data) {
				if(data){
					data = JSON.parse( data );
					for(var i = 0; i < data.length; i ++){
						var chart = data[i];
						renderChart(chart);
					}
				}
			}
		});
    };

    //新增chart并渲染到页面
	var renderChart = function(chart){
		var chartId = chart.id;
		var conId = chart.conId;
		var name = chart.name;
		var templateId = chart.templateId;
		$('.bi-chart-list').append( 
				$('<div class="bi-edit" style="margin-top:5px;" data-chartid="'+ chartId + '" data-templateid="' + templateId +'" data-conid="'+ conId + '">'+name+'</div>') );
		//绑定点击和拖拽事件
		biEditBindEvent();
		
		
		//2.判断CHART是否被布局,然后是否进行还原布局
		if(!chart.width || !chart.height){
			console.log('do not layout.');
			return ;
		}
		renderChartLayout(chart);
	};
	
	//渲染已经布局过的chart
	var renderChartLayout = function($chart){
		var width = $chart.width;
		var height = $chart.height;
		var left = $chart.beginXCoordinate;
		var top = $chart.beginYCoordinate;
		var templateId = $chart.templateId;
		var chartId = $chart.id;
		
		$.ajax({
			url:baseUrl+'/bi/getEchartJSONByIds',
			type:'POST',
			data:{
				chartId: chartId,
				templateId: templateId
			},
			success:function(data) {
				if(data){
					data = JSON.parse( data );
					var chartType_ = data.chartType;
					var chartJson_ = data['chartJson'];
					var theme_ = data.chartCommonAttr.theme;
					if(chartJson_){
						//template面板追加一个默认的容器
						var divId = 'tmp-' + chartId + '-' + templateId;
						$('.bi-template-container').append( $( '<div id="' + divId + '-parent" style="height:300px; width:300px; border:1px #b6bccc solid;  position: absolute;"><div class="tmp-chart" id="' + divId  + '" style="height:300px; width:300px;"></div></div>' ) );
						
						//还原位置
						$('#' + divId + '-parent').css({'width': width + 'px', 'height':height + 'px', 'top':top + 'px', 'left':left + 'px'});
						$('#' + divId).css({'width': width + 'px', 'height':height + 'px'});
						
						var myChart_ = echarts.init(document.getElementById(divId), theme_);
						myChart_.clear();//清空组件
						//TODO
						if(chartType_ == 'table'){
							Table.buildTable(chartJson_, 'bi-main');
						}else if(chartType_ == 'droplist'){
							Variable.buildDroplist(chartJson_, 'bi-main');
						}else if(chartType_ == 'input'){
							Variable.buildInput(data, 'bi-main');
						}else{
							myChart_.setOption( chartJson_ );
						}
					}
					templateContainer[divId] = chartJson_;
					templateContainer[divId+'-theme'] = theme_;
					
					//非隐藏表单域绑定缩放事件
					if(chartType_ != 'input'){
						bindEventByTempChartId(divId);
					}
				}
				hideLoading();
			}
		});
	}
