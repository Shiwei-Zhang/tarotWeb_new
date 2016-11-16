/**
 * @auther zhang haijun
 * @version 1.0
 * @update 2016-11-11
 * @brief about BI operations
 */	
var baseUrl = urlId + '/bi';
var user_ = $.getCookie('userId');
//$(function(){
	//----------------------变量相关---------------//
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

		toolboxShow:1,//工具栏是否显示, 默认显示
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
	
	var toolboxShow = 1;//工具栏是否显示, 默认显示
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
	window.chartJson = null,
	window.oldChartjson = null;
	
	//变量图表
	var variable = '';
	
	//template相关
	var templateContainer = {}
	//template变量相关
	var variableMap = {};
	var chartVarMap = {};
	var templateObjMap = {
		theme: '',
	};
	var templateChartJsons = {};
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
	
	//提示相关
	var errMsg = '';
	
	

	//------------------事件方法相关-----------------------------//
	//数据源事件
	$('.addPart').unbind().click(function(){
		$('.bi-connection').empty();//连接列表
		$('.bi-mainList').empty();//表列表
		$('.mask').show().css({"zIndex":"110"});
		$.showLoading();
		
		//获得连接信息
        var str='<option class="">请选择数据源</option>';
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
                str+='<option value="">other</option>';
                $('.bi-connection').append($(str));
                bindChangeEvent($('.bi-connection'));
                
                
                //显示数据源选择面板
                $('.bi-datasource').show( "fade" ).css({"zIndex":"120"});
        		$('.dataContainerA .mainList').css('overflowY', 'auto');
        		$.hideLoading();
            }
        });
	});
	
	//编辑面板关闭
	$('.bi-close1').unbind().click(function(){
		$('.biData').hide( 'size');
		$('.mask').css({"zIndex":"100"}).hide();
		chartId = '';
		//重置页面
		rest4bi();
	});
	//取消或者关闭数据源面板
	$('.bi-close2, .bi-cancel').unbind().click(function(){
		$('.mask').show().css({"zIndex":"100"});
		$('.bi-datasource').hide( 'fade' );
	});
	//确认选表
	$('.bi-sure').unbind('click').click(function(){
		$('.bi-datasource').hide( 'fade' );
		//没有选择表
		if($('.bi-singleChecked').length < 1){
			$('.mask').show().css({"zIndex":"100"});
			return ;
		}
		
		
		//初始化
		$('.bi-list').empty();
		$('.bi-dimensionality').empty();//x
		$('.bi-measure').empty();//y
		$('.error-tip').empty();//error
		chartJson = null;
		xaxis = [], 
		yaxis = [],
		filter = null,
		orderBy = null;
		echarts.init($biMain[0]).clear();
		echarts.init($biMain[0]).dispose();
		
		$.showLoading();
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
	$('.bi-generator').unbind().click(function(){
		var dimensionality = $('.bi-dimensionality li');
		var measure = $('.bi-measure li');
		var legend = $('.bi-menu .selected');
		
		xaxis = [];
		dimensionality.each(function(index, item){
			xaxis.push($(item).text());
		});
		yaxis = [];
		measure.each(function(index, item){
			yaxis.push($(item).text());
		});
		chartType = legend.data('type');
		
		if( !chartRule(chartType, xaxis.length, yaxis.length, conId, tableName) ){
			$('.error-tip').empty().text(errMsg);
			return ;
		}else{
			errMsg = '';
			$('.error-tip').empty();
		}
		
		$.ajax({
            url:baseUrl+'/getEchartJSONInEdit',
            type:'POST',
            data:{
            	conId: conId,
            	tableName:tableName,
            	chartType: chartType,
            	xaxis: xaxis,
            	yaxis: yaxis,
            	orderBy: orderBy,
            	filter: filter
            },
            success:function(data) {
            	if(data){
					data = JSON.parse( data );
					
					var $chartJson = data['chartJson'];
					if( chartType == 'input' || chartType == 'droplist' || chartType == 'table'){
						var title = {
								show: titleShow,
								text: titleText,
								position: titlePosition
						};
						$('#bi-main').createVariable(event, $chartJson, chartType, title);
					}else if($chartJson){
						var myChart = echarts.init($biMain[0], theme);
						myChart.clear();//清空组件
						myChart.setOption( setChartJson($chartJson) );
					}
            	}
            }
        });
	});
	
	//保存当前编辑chart
	$('.bi-save').unbind().click(function(e){
		//当前是否存在chart
		if(!chartJson){
			if(chartType == 'input'  || chartType == 'droplist' || chartType == 'table' ){
				console.log('current chart is: ' + chartType );
			}else{
				return ;
			}
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
		
		//变量保存
		if(chartType == 'input' || chartType == 'droplist'){
			if(!variable){
				$('.error-tip').empty().text( '请输入变量名~' );
				$('.bi-variable>h2').trigger('click');
				return;
			}
			dataParams.variable = '@' + variable;
		}
		
		//true即是编辑已存在的chart
		if(chartId){
			dataParams.chartId = chartId;
			updateChartData(dataParams);
			return ;
		}
		
		$.showLoading();
		$.ajax({
			url: baseUrl +'/saveEchartDataInEdit',
			data: dataParams,
			type:'POST',
			success:function(data){
				
				$('.mask').hide();
				$('.biData').hide( 'size' );
				if(data){
					data = JSON.parse(data);//chart
					renderChart(data);
				}
			},
			complete: function(){
				//初始化浮层数据
				rest4bi();
				$.hideLoading();
			}
		});
	});
	//重置选项
	$('.bi-reset').unbind().click(function(){
		rest4bi();
	});
	
	$('.bi-template-container').droppable({
	      accept: ".bi-edit",
	      activeClass: "ui-highlight",
	      drop: function( event, ui ) {
	    	  //处置被拖动的元素放置时
	    	  var $item = ui.draggable;
	    	  var chartId = $item.data('chartid');
	    	  var templateId = $item.data('templateid');
	    	  var $chartType = $item.data('charttype');
	    	  if(!chartId || !templateId){
	    		  return ;
	    	  }
	    	  
	    	  var $filter = $item.attr('data-filter');
	    	  if($filter){
	    		  //filter包含变量, 需确认变量是否已经拖入
		    	  for(var varkey in variableMap){
	    			  if($filter.indexOf(varkey) >= 0){
	    				  $filter = $filter.replace('@', '#');
	    			  }
	    		  }
		    	  if($filter.indexOf('@') >= 0){
		    		  $.dialog('请放置所需要的变量图先~');
		    		  return;
		    	  }
	    	  }
	    	  
	    	  var position = ui.position;
	    	  console.log('drop position: (' + position.top + ', ' + position.left + ')');
	    	  
	    	  renderTemplate(chartId, templateId, position, $chartType);
	      }
	 });
	
	$('.bi-preview').unbind('click').click(function(){
		var $tmpId = $('.showbiData').attr('data-templateid');
		var gotoUrl = location.origin + '/TarotWeb/views/temp/preview.html?templateId=' + $tmpId;
		window.open(gotoUrl);
	});
	
	//保存当前编辑的template
	$('.bi-template-save').unbind('click').click(function(e){
		if($.isEmpty(templateContainer)){
			console.log('template container is emtpy, cannot save it.');
			return ;
		}
		
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
		dataParams['theme'] = templateObjMap['theme'];
		$.showLoading();
		$.ajax({
			url:baseUrl+'/updateTemplateAndCharts',
			type:'POST',
			data:dataParams,
			success:function(data) {
				if(data){
					data = JSON.parse( data );
					$.dialog('恭喜您~, 布局保存成功。');
				}
				$.hideLoading();
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
		
		$.showLoading();
		$.ajax({
			url:baseUrl+'/updateTemplateAndCharts',
			type:'POST',
			data:dataParams,
			success:function(data) {
				if(data){
					data = JSON.parse( data );
					//删除当前节点
					$('#temp-' + chartId + '-' + templateId + '-parent').empty().remove();
				}
				$.hideLoading();
			}
		});
	});
	
	$('.showbiData').unbind('click').click(function () {
		templateId = $(this).attr('data-templateid');
		chartId = '';
		init(templateId);//初始化页面
	    $('.biData,.mask').show( "size" );
	    
	    //操作相关隐藏
	    $('.bi-chart-group').hide();
	});
	 
	//选中样式
	$('.iconStyle').unbind().click(function(){
		$('.error-tip').empty();
		var $this = $(this);
        if ($this.hasClass('selected')) {
        	$this.removeClass('selected');
        } else {
        	$('.bi-menu .iconStyle').removeClass('selected');
        	$this.addClass('selected');
            
        	//变量属性显示与否
            if($this.data('type') == 'input' || $this.data('type') == 'droplist'){
            	$('.bi-menu-right>li').hide();
            	$('.filterPart').show();
            	$('.bi-sort').show();
            	$('.bi-title').show();
            	
            	//input 和 droplist属性显示
            	$('.bi-variable').show();
            }else if(  $this.data('type') == 'table' ){
            	$('.bi-menu-right>li').hide();
            	$('.filterPart').show();
            	$('.bi-sort').show();
            	$('.bi-title').show();
            }else{
            	$('.bi-menu-right>li').show();
            	//input 和 droplist属性隐藏
            	$('.bi-variable').hide();
            }
            
            $('.bi-generator').trigger('click');
        }
    });
	
	//排序
	$('.bi-sort select[name="fields"]').unbind().change(function(){
		var field = $(this).val();
		var order = $('.bi-sort select[name="order"]').val();
		if(field && order){
			orderBy = field + ' ' + order;
			if( chartJson  || chartType == 'input' || chartType == 'droplist' || chartType == 'table' ){
				$('.bi-generator').trigger('click');
			}
		}
	});
	$('.bi-sort select[name="order"]').unbind().change(function(){
		var order = $(this).val();
		var field = $('.bi-sort select[name="fields"]').val();
		if(field && order){
			orderBy = field + ' ' + order;
			if( chartJson || chartType == 'input'  || chartType == 'droplist'  || chartType == 'table' ){
				$('.bi-generator').trigger('click');
			}
		}
	});
	
	//过滤
	$('.bi-filter-close').unbind().click(function(){
		var filter = $('.bi-filter');
		if(filter.length == 1){
			filter.find('div.bi-filter-related').hide( 'fade' );
		}else{
			var grandParent = $(this).parent().parent();
			grandParent.hide('fade' , function(){
				grandParent.remove();
			});
		}
	});
	$('.bi-filter-add').unbind().click(function(){
		//复制最后一个filter
		var lastFilter = $('.bi-filter:last');
		
		var cloneFilter = lastFilter.clone(true);
		cloneFilter.hide();
		
		lastFilter.find('i.bi-filter-close').show();
		lastFilter.find('i.bi-filter-add').hide();
		lastFilter.find('div.bi-filter-related').show( 'fade' );
		lastFilter.addClass('new');
		//追加到按钮之前
		$('.bi-filter-btns').before( cloneFilter );
		cloneFilter.show( 'fade' );
		
		$('.bi-filter:last').find('input.bi-filter-operate-content').val('');
	});
	$('.bi-filter-reset').unbind().click(function(){
		//语句重置
		filter = null;
		//内容重置
		$('.bi-filter-fields').val($('.bi-filter-fields option:eq(0)').val());
		$('.bi-filter-operate').val($('.bi-filter-operate option:eq(0)').val())
		$('.bi-filter-operate-content').val('');
		//chart图表还原
		$('.bi-generator').trigger('click');
		
		var filter_ = $('.bi-filter-container .bi-filter');
		if(filter_.length == 1){
			return;
		}
		$('.bi-filter-container .bi-filter.new').remove();//清空新增
		
		//按钮重置
		filter_.find('i.bi-filter-close').hide();
		filter_.find('i.bi-filter-add').show();
		filter_.find('div.bi-filter-related').hide();
	});
	$('.bi-filter-execute').unbind().click(function(){
		var cols = $('.bi-filter-fields');
		var operates = $('.bi-filter-operate');
		var contents = $('.bi-filter-operate-content');
		var orands = $('.bi-filter-related .bi-filter-related-orand');
		var downups = $('.bi-filter-related .bi-filter-related-downup');
		
    	var conditions = [];
    	var isContinue = true;
    	for(var i = 0; i < cols.length; i ++){
    		var colValue = $(cols[i]).val();
    		var operateValue = $(operates[i]).val();
    		var contentValue = $(contents[i]).val();
    		if(!contentValue){
    			isContinue = false;
    			break;
    		}
    		if( operateValue == 'in' ){
    			var inpVs = contentValue.split(',');
				var inpVsStr = "";
				for(var j=0;j<inpVs.length; j++){
					if(j == (inpVs.length - 1)){
						inpVsStr += "'" + inpVs[j] + "'";
						break;
					}else{
						inpVsStr += "'" + inpVs[j] + "',";
					}
				}
				conditions.push(colValue + " in (" + inpVsStr + ")");
    		}else if( operateValue == 'like' ){
    			conditions.push(colValue + " " + operateValue + " '%" + contentValue + "%'");
    		}else{
    			conditions.push(colValue + " " + operateValue + " '" + contentValue + "'");
    		}
    	}
    	
    	if( !isContinue ||  conditions.length < 1 ){
    		console.log("error when connecting SQL.");
    		return ;
    	}
    	
    	//start connecting SQL.
    	//thinking: the last expression is include into '#'
    	//can via '#' to make sure the last expression.
    	var statement = conditions[0];
    	for(var i=0; i<orands.length - 1; i++){
    		var orand = $( orands[i] ).val();
    		var downup = $( downups[i] ).val();
    		
    		if(downup == '0'){
    			statement = statement.split("#").join(" ");
    			statement += " " + orand + " #" + conditions[i + 1] + "# ";
    		}else if(downup == '1'){
    			if(statement.indexOf("#") > -1){
    				statement = statement.split("#").join(" ");
    				statement += " ) " + orand + " #" + conditions[i + 1] + "# ";
    			}else{
    				statement = "(" + statement + ") " + orand + " #" + conditions[i + 1] + "# ";
    			}
    		}else if(downup == '-1'){
    			if(statement.indexOf("#") > -1){
    				statement = statement.replace(
    					statement.substring(statement.indexOf('#'), statement.lastIndexOf('#') + 1), 
						" ( " + conditions[i] + " " + orand + " #" + conditions[i + 1] + "# ");
    			}else{
    				//the first filter is DESC.
    				statement = "( " + statement + " " + orand + " #" + conditions[i + 1] + "# ";
    			}
    		}
    	}
    	statement = statement.split("#").join(" ");
    	
    	//add bracket in end.
    	var leftBracket = statement.split('(').length - 1;
    	var rightBracket = statement.split(')').length - 1;
    	var needAddBracket = leftBracket - rightBracket;
    	if(needAddBracket > 0){
    		for(var i=0; i< needAddBracket; i++){
    			statement += " )";
        	}
    	}else{
    		for(var i=0; i< Math.abs(needAddBracket); i++){
    			statement = "( " + statement;
        	}
    	}
    	console.log('SQL: ' + statement);
    	filter = "( " + statement + " )";
    	
    	if( filter.indexOf('@') > -1){
    		//filter有变量数据
    		console.log('过滤条件中含有变量, 无法执行过滤条件。');
    		return ;
    	}
    	$('.bi-generator').trigger('click');
    	
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
		if(chartType == 'input' || chartType == 'droplist' || chartType == 'table'){
			var titleObj = $('.variable-div').find('.variable-title');
			titleObj.text(titleText);
			if(titleShow == 1){
				titleObj.show();
			}else{
				titleObj.hide();
			}
			return ;
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
		if( titleShow == 1 && (chartType == 'input' || chartType == 'droplist' || chartType == 'table') ){
			$('#bi-main .variable-div').find('.variable-title').text(titleText);
			return ;
		}
		
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
			if( titleShow == 1 && chartType == 'table' ){
				$('#bi-main .variable-div').find('.variable-title').css('text-align',titlePosition);
				return ;
			}
			
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
		chartJson.tooltip.show = tooltipShow?true:false;
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
				echarts.init($biMain[0], theme).setOption(chartJson);
			} catch(e){
				console.log(e);
				datazoomShow = 0;
				chartJson.dataZoom = [];
				echarts.init($biMain[0], theme).setOption(chartJson);
			}
		}else{
			chartJson.dataZoom = [];
			echarts.init($biMain[0], theme).setOption(chartJson);
		}
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
	
	//变量属性
	$('.bi-variable input[name="variable"]').unbind('focus').focus(function(){
		$('.error-tip').empty();
	});
	$('.bi-variable input[name="variable"]').unbind('blur').blur(function(){
		variable = $(this).val();
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
			$.showLoading();
			//选择数据库并显示表
			$.ajax({
	            url:urlId+'/selectValueAndTableByConId'+'?conId=' + conId,
	            type:'POST',
	            success:function(data) {
	            	if(!data){//无表数据
	            		$('.bi-mainList').empty();
	            		console.log('暂无数据');
	            		$.hideLoading();
	            		return ;
	            	}
					var dataJson = JSON.parse(data );
	            	var tableName = dataJson.tableName;
					if( !tableName ){
						$('.bi-mainList').empty();
						console.log('暂无表数据');
						$.hideLoading();
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
	                
	                $.hideLoading();
	            }
	        });
		});
	};
	
	//
	var biEditBindEvent = function(){
		//编辑当前chart
		$('.bi-edit').unbind('click').click(function(e){
			//容器里的提示按钮隐藏
			$('.bi-chart-group').hide();
			
			conId = $(this).data('conid');
			templateId = $(this).data('templateid');
			chartId = $(this).data('chartid');
			if( !conId || !templateId || !chartId ){
				console.log('当前chart不存在.');
				return ;
			}
			$.showLoading();
	
			getEchartJSONByIds(chartId, templateId);
		});
		
		//拖拽效果
		$('.bi-edit').draggable({
	      revert: "invalid", // 当未被放置时，条目会还原回它的初始位置
	      containment: "document",
	      helper: "clone",
	      cursor: "move",
	      start: function( event, ui ) {
	    	  //当前拖拽的对象
	    	  var obj = ui.helper;
	    	  
	    	  //处理拖动的对象的背景颜色
	    	  ui.helper.empty();
	    	  ui.helper.addClass('dragIcons').css({'width':'110px', 'height':'110px'});
	      }
	    });
	};
	
	//根据你chartId 和 Template 获得chart 对象
	var getEchartJSONByIds = function($chartId, $templateId){
		//获得当前chart对象
		$.ajax({
			url:baseUrl+'/getEchartJSONByIds',
			type:'POST',
			data:{
				chartId: chartId,
				templateId: templateId
			},
			success:function(data) {
				if(data){
					//重置页面
					rest4bi();
					
					data = JSON.parse( data );
					//设置页面全局属性
					chartType = data.chartType;
					xaxis = data.xaxis;
					yaxis = data.yaxis;
					tableName = data.tableName;
					filter = data.filter;
					orderBy = data.orderBy;
					
					chartId = data.chartId;
					
					var $chartJson = data['chartJson'];
					if( chartType == 'input' || chartType == 'droplist'){
						var title = JSON.parse(data.title);
						titleText = title.text;
						titleShow = title.show;
						variable = data.variable?data.variable.substr(1): '';
						$('#bi-main').createVariable(event, $chartJson, chartType, title);
						
						rest4Variable();
					}else if(chartType == 'table'){
						var title = JSON.parse(data.title);
						titleText = title.text;
						titlePosition = title.position;
						titleShow = title.show;
						$('#bi-main').createVariable(event, $chartJson, chartType, title);
						rest4Variable(true);
					}else if($chartJson){
						chartCommonAttr = data.chartCommonAttr;
						theme = chartCommonAttr.theme;
						
						chartJson = $chartJson;
						var myChart = echarts.init($biMain[0], theme);
						myChart.clear();//清空组件
						myChart.setOption( $chartJson );
					}
					//初始化界面
					init(templateId, chartId);
					//显示面板
					$('.biData,.mask').show( "size" );
				}
				$.hideLoading();
			}
		});
	};

	//初始化BI编辑页面
	var init = function($templateId, chartId){
		/*$('.bi-list').empty();//字段列表
		$('.bi-dimensionality').empty();
		$('.bi-measure').empty();
		$('.error-tip').empty();*/
		templateId = $templateId;

		if(!chartId){
			return;
		}
		//初始化已存在的CHART编辑页面
		//1.初始化字段面板
		renderColumns();

		//2.初始化维度,量度, 图表类型
		for(var i = 0; i < xaxis.length; i ++){
			if(xaxis[i]){
				$('.bi-dimensionality').append($( "<li></li>" ).append( $('<span>'+ xaxis[i] + '</span><i class="closeB bi-column-close"></i>') ));
				deleteDroppabledColumn();
				
				//3.1初始化排序
				$('.bi-sort select[name="fields"]').append(
						$('<option value="'+xaxis[i]+'">'+xaxis[i]+'</option>') );
			}
		}

		for(var i = 0; i < yaxis.length; i ++){
			if(yaxis[i]){
				$('.bi-measure').append( $( "<li></li>" ).append( $('<span>'+ yaxis[i] + '</span><i class="closeB bi-column-close"></i>') ) );
				deleteDroppabledColumn();
				
				//3.1初始化排序
				$('.bi-sort select[name="fields"]').append(
						$('<option value="'+yaxis[i]+'">'+yaxis[i]+'</option>') );
			}
		}
		

		//3.初始化属性
		//3.1如上
		if(orderBy){
			var fields = orderBy.trim().split(' ');
			var field = fields[0];
			var order = fields[1];
			$('.bi-sort select[name="fields"]').val(field);
			$('.bi-sort select[name="order"]').val(order);
		}
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
			url: baseUrl +'/updateChartData',
			data: dataParams,
			type:'POST',
			success:function(data){
				//初始化浮层数据
				rest4bi();
				$('.mask').hide();
				$('.biData').hide( 'size' );
				if(data){
					var chart = JSON.parse(data);//chart
					
					//父页面更新chart列表数据
					$('.bi-chart-list div').each(function(index, item){
						if(chart.id == $(item).data('chartid')){
							$(item).attr('data-conid', chart.conId);
							$(item).text(chart.name);
							//是否重新渲染到template
							var chartId = chart.id;
							var templateId = chart.templateId;
							var divId = 'tmp-' + chartId + '-' + templateId;
							if(templateContainer[divId]){
								//获得当前chart宽高位置信息
								var currentChartInCon = $('#' + divId + '-parent');
								chart['width'] = currentChartInCon.width();
								chart['height'] = currentChartInCon.height();
								chart['beginXCoordinate'] = currentChartInCon.position().left;
								chart['beginYCoordinate'] = currentChartInCon.position().top;
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
		$('.bi-list').empty();
		$('.bi-dimensionality').empty();//x
		$('.bi-measure').empty();//y
		$('.bi-menu .iconStyle').removeClass('selected');//图表类型
		
		//chart reset
		//图表相关
		tableName = '';
		chartJson = null;
		theme = '';
		chartType = '';
		xaxis = [], 
		yaxis = [],
		filter = null,
		orderBy = null;
		$biMain.empty();
		echarts.init($biMain[0]).clear();
		echarts.init($biMain[0]).dispose();
		
		//reset attributes
		$('.bi-menu-right>li').show();
		//filter
		$('.bi-filter .bi-filter-fields').empty();
		$('.bi-filter .bi-filter-operate-content').val('');
		$('.bi-filter-add').show();
		$('.bi-filter-close').hide();
		$('.bi-filter-container .bi-filter.new').remove();
		$('.bi-filter-related').hide();
		//sort
		$('.bi-sort select[name="fields"]').empty().append( $( '<option value="">请选择字段</option>' ) );
		$('.bi-sort select[name="order"]').val('');
		//1.theme
		$('.bi-theme select[name="theme"]').val('');
		//2.title
		$('.bi-title .show').removeClass('singleChecked');
		$('.bi-title input[name="text"]').val('untitled chart');
		$('.bi-title .alignIcon').removeClass('checked');
		$('.bi-title .showC').addClass('checked');
		//3.legend
		$('.bi-legend .lshow').addClass('singleChecked');
		$('.bi-legend .alignIcon').removeClass('checked');
		$('.bi-legend .showL').addClass('checked');
		//4.label
		$('.bi-label .lbshow').removeClass('singleChecked');
		$('.bi-label select[name="lbposition"]').val('top');
		//5.toolbox
		$('.bi-toolbox .tbshow').addClass('singleChecked');
		$('.bi-toolbox select[name="tborient"]').val('horizontal');
		//6.visualmap
		$('.bi-visualmap .vmshow').removeClass('singleChecked');
		$('.bi-visualmap input[name="dimension"]').val('');
		$('.bi-visualmap-text').val('');
		$('.bi-visualmap-inrange').val('');
		//7.tooltip
		$('.bi-tooltip .ttshow').addClass('singleChecked');
		//8.datazoom
		$('.bi-datazoom .dzshow').removeClass('singleChecked');
		
		//图表和属性收缩弹层, 隐藏内容
		$('.biDataLbottom .fa,.biDataR .fa').removeClass('fa-caret-down').addClass('fa-caret-right');
        $('.detail').hide();
        //变量属性隐藏
        $('.bi-variable').hide();
        $('.bi-variable input').val('');
		
		//重置属性值
		titleShow = 0;//标题显示与否, 默认不显示
		titleText = 'untitled chart';
		titlePosition = 'center';//标题位置
		
		legendShow = 1;//图例是否显示,默认显示
		legendPosition = 'left';//图例位置
		
		labelShow = 0;//标签显示与否, 默认不显示
		labelPosition = 'top';//标签显示位置
		
		tooltipShow = 1;//提示框,默认显示
		
		toolboxShow = 1;//工具栏是否显示, 默认显示
		toolboxOrient = 'horizontal';//工具栏布局朝向
		
		datazoomShow = 0;//区域缩放,默认不显示
		dataZoom = {
				type: 'slider'
		};
		
		visualmapShow  = 0;//视觉映射是否显示, 默认不显示
		//默认值
		visualMap = {
				text: [ '高', '低'],
				calculable:'true',
				dimension:0,
				inRange:{
					color:['#50a3ba', '#eac736', '#d94e5d']
				}
		};
		
		errMsg = '';
		$('.error-tip').empty();
	};

	var rest4Variable = function(notShowVar){
		$('.bi-menu-right>li').hide();
		
		$('.filterPart').show();
		$('.bi-sort').show();
		$('.bi-title').show();
		if(notShowVar){
			return;
		}
		$('.bi-variable').show();
		if(variable){
			$('.bi-variable input[name="variable"]').val(variable);
		}
	};
	
	var renderColumns = function(){
		$.ajax({
			url:urlId+'/selectTableColumn',
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
							
							//过滤字段
							$('.bi-filter .bi-filter-fields').append( 
									$('<option value="'+columnObject.column+'">'+columnObject.column+'</option>') );
						}
						//渲染 字段
						$('.bi-list').html( $(columnDom) );


						//绑定拖放事件
						droppable4Columns();
					}
				}

				$('.mask').show().css({"zIndex":"100"});
				$.hideLoading();
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
	    	  
	    	  //错误提示清空
	    	  $('.error-tip').empty();
	      }
	    });
	    
	    //让 维度列表可放置，接受字段列表的条目
	    $dimensionality.droppable({
	      accept: ".bi-list > li",
	      activeClass: "ui-highlight",
	      drop: function( event, ui ) {
	    	  //处置被拖动的元素放置时
	    	  var $item = ui.draggable;
	    	  var text = $item.text().split('(')[0].trim();
	    	  $( "<li></li>" ).append( $('<span>'+ text + '</span><i class="closeB bi-column-close"></i>') ).appendTo( this );
	    	  
	    	  $( '.bi-column-close' ).unbind( 'click' ).click(function(e){
	    		  $(this).parent().remove();
	    		  
	    		  //错误提示清空
		    	  $('.error-tip').empty();
	    		  
	    		  //排序字段删除一个
	    		  var $text = $(this).prev().text();
	    		  var selectedVal = $('.bi-sort select[name="fields"]').val();
	    		  if($text == selectedVal){
	    			  $('.bi-sort select[name="fields"]').val('');
	    		  }
	    		  $('.bi-sort select[name="fields"]>option[value="'+$text+'"]').remove();
	    	  });
	    	  
	    	  //排序字段增加一个
	    	  $('.bi-sort select[name="fields"]').append( $('<option value="'+text+'">'+text+'</option>') );
	      }
	    });
	    //让 量度列表可放置，接受字段列表的条目
	    $measure.droppable({
	      accept: ".bi-list > li",
	      activeClass: "ui-highlight",
	      drop: function( event, ui ) {
	    	  //处置被拖动的元素放置时
	    	  var $item = ui.draggable;
	    	  var text = $item.text().split('(')[0].trim();
	    	  $( "<li></li>" ).append( $('<span>'+ text + '</span><i class="closeB bi-column-close"></i>') ).appendTo( this );
	    	  
	    	  $('.bi-column-close').unbind('click').click(function(e){
	    		  $(this).parent().remove();
	    		  
	    		  //错误提示清空
		    	  $('.error-tip').empty();
	    		  
	    		  //排序字段删除一个
	    		  var $text = $(this).prev().text();
	    		  var selectedVal = $('.bi-sort select[name="fields"]').val();
	    		  if($text == selectedVal){
	    			  $('.bi-sort select[name="fields"]').val('');
	    		  }
	    		  $('.bi-sort select[name="fields"]>option[value="'+$text+'"]').remove();
	    	  });
	    	  
	    	  //排序字段增加一个
	    	  $('.bi-sort select[name="fields"]').append( $('<option value="'+text+'">'+text+'</option>') );
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
		chartJson.title.show = titleShow?true:false;
		chartJson.title.text = titleText;
		if(titlePosition){
			chartJson.title.left = titlePosition
		}
		//3.setting legend
		chartJson.legend.show = legendShow?true:false;
		if(legendPosition){
			chartJson.legend.left = legendPosition
		}
		//4.setting label
		for(var i = 0; i < chartJson.series.length; i ++){
			var sery = chartJson.series[i];
			sery.label.normal.show = labelShow?true:false;
			sery.label.emphasis.show = labelShow?true:false;
			if(labelPosition){
				sery.label.normal.position = labelPosition;
				sery.label.emphasis.position = labelPosition;
			}
		}
		//5.setting tooltip
		chartJson.tooltip.show = tooltipShow?true:false;
		//6.setting toolbox
		chartJson.toolbox.show = toolboxShow?true:false;
		if(toolboxOrient){
			chartJson.toolbox.orient = toolboxOrient;
		}
		//7.setting datazoom
		if(datazoomShow){
			chartJson.dataZoom.push(dataZoom);
		}else{
			chartJson.dataZoom = [];
		}
		//8.setting visualmap
		if(visualmapShow){
			chartJson.visualMap.push(visualMap);
		}else{
			chartJson.visualMap = [];
		}
		
		return chartJson;
	}
	
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
		
		
		
		if(chartType == 'input' || chartType == 'droplist' || chartType == 'table' ){
			//页面title
			titleShow?$('.bi-title .show').addClass('singleChecked'):$('.bi-title .show').removeClass('singleChecked');
			$('.bi-title input[name="text"]').val(titleText);
			$('.bi-title .alignIcon').removeClass('checked');
			titlePosition == 'left'?$('.bi-title .showL').addClass('checked'):(
					titlePosition == 'right'?$('.bi-title .showR').addClass('checked'): $('.bi-title .showC').addClass('checked'));
			
			console.log('do not need other attributes.');
			return;
		}
		
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
				titlePosition == 'right'?$('.bi-title .showR').addClass('checked'): $('.bi-title .showC').addClass('checked'));
		
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
	var renderTemplate = function(chartId, templateId, position, $chartType){
		//容器是否有此chart, input不考虑在内
		if( $chartType == 'input' ){
			delete templateContainer['tmp-' + chartId + '-' + templateId];
			delete templateContainer['tmp-' + chartId + '-' + templateId + '-theme'];
			$('#tmp-' + chartId + '-' + templateId + '-parent').remove();
		}else if(templateContainer['tmp-' + chartId + '-' + templateId]){
			return ;
		}
		
		//获得当前chart对象
		$.showLoading();
		$.ajax({
			url:baseUrl+'/getEchartJSONByIds',
			type:'POST',
			data:{
				chartId: chartId,
				templateId: templateId,
				variableMap: JSON.stringify(variableMap)
			},
			success:function(data) {
				if(data){
					//template面板追加一个默认的容器
					var divId = 'tmp-' + chartId + '-' + templateId;
					if( $chartType == 'input' || $chartType == 'droplist'){
						$('.bi-template-container').append( $( '<div id="' + divId + '-parent" style="height:35px;  width:260px; position: absolute;"><div class="tmp-chart" id="' + divId  + '" style="height:35px; width:260px;"></div></div>' ) );	
					}else if( $chartType == 'table' ){
						$('.bi-template-container').append( $( '<div id="' + divId + '-parent" style="height:300px;  width:500px; position: absolute;"><div class="tmp-chart" id="' + divId  + '" style="height:300px; width:500px;"></div></div>' ) );
					}else{
						$('.bi-template-container').append( $( '<div id="' + divId + '-parent" style="height:300px; width:300px; position: absolute;"><div class="tmp-chart" id="' + divId  + '" style="height:300px; width:300px;"></div></div>' ) );
					}
					//追加当前放置位置信息
					$('#' + divId + '-parent').css({'top': position.top + 'px', 'left': position.left + 'px'});
					
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
							
							variableMap[variableName] = variableValue + '';
							chartVarMap[divId] = variableName;
							$('#' + divId).createVariable(event, chartJson_, chartType_, title);
							if(chartType_ == 'droplist'){
								bindVarDroplistEvent(divId);
							}
						}else if( chartType_ == 'table' ){
							var title = JSON.parse(data.title);
							chartJson_.caption = title;
							$('#' + divId).createVariable(event, chartJson_, chartType_, title);
						}else{
							var theme_ = templateObjMap['theme'] || data.chartCommonAttr.theme;
							
							var myChart_ = echarts.init(document.getElementById(divId), theme_);
							myChart_.clear();//清空组件
							myChart_.setOption( chartJson_ );
							oldChartjson = chartJson_;
							
							//相应色系变化
							templateChartJsons[divId] = chartJson_;
						}
						
						templateContainer[divId] = chartJson_;
						templateContainer[divId+'-theme'] = theme_;
						
						//非隐藏表单域绑定缩放事件
						if(chartType_ == 'droplist'){
							bindEventByTempChartId4Droplist(divId);
						}else if(chartType_ != 'input'){
							bindEventByTempChartId(divId, chartType_);
						}
					}
				}
				$.hideLoading();
			}
		});
	};
	//绑定渲染后的template中的图表缩放事件
	var bindEventByTempChartId = function($divId, $chartType){
		//绑定缩放事件
		$('#' + $divId + '-parent').resizable({
			ghost: true,
	    	minHeight: 150,
	    	maxHeight: 600,
	    	minWidth: 150,
	    	maxWidth: 800,
	    	start: function( event, ui ){
	    		$('.bi-chart-group').hide();
	    	},
	    	stop: function( event, ui ) {
	    		var $chartJSON = templateContainer[$divId];
	    		var $theme = templateObjMap['theme'] || templateContainer[$divId+'-theme'];
	    		if($chartJSON){
	    			if($chartType == 'table'){
	    				resetEchart($divId, $chartJSON, null, $chartType);
	    			}else{
	    				resetEchart($divId, $chartJSON, $theme);
	    			}
	    			
	    		}
	    	}
	    });
		//绑定拖放事件
		$('#' + $divId + '-parent').draggable({ 
			containment: "parent",
			cursor: "move",
			start: function( event, ui ){
				$('.bi-chart-group').hide();
			}
		});
		
		//绑定'编辑', '删除'事件
		event4ChartInTemplate($divId);
	};
	var bindEventByTempChartId4Droplist = function($divId){
		//绑定拖放事件
		$('#' + $divId + '-parent').draggable({ 
			containment: "parent",
			cursor: "move",
			start: function( event, ui ){
				$('.bi-chart-group').hide();
			}
		});
		
		event4ChartInTemplate($divId);
	};
	
	var event4ChartInTemplate = function($divId){
		//绑定点击事件,显示'删除', '编辑'按钮
		$('#' + $divId + '-parent').unbind('click').click(function(e){
			window.event? window.event.cancelBubble = true : e.stopPropagation();
			var $this = $(this);
			var width = $this.width();
			var height = $this.height();
			var position = $this.position();
			
			var ids = $divId.split('-');
			var chartId = ids[1];
			var templateId = ids[2];
			if( $('.bi-chart-delete').attr('data-ids') == $divId && $('.bi-chart-delete').css('display') != 'none' ){
				return ;
			}else{
				$('.bi-chart-group').hide();
			}
			
			//'删除'按钮位置
			var deletePosition = {left: ( position.left - $('.bi-chart-delete').width() - 12 ) + 'px', top: (position.top + height/2) + 'px'};
			$('.bi-chart-delete').css(deletePosition).attr('data-ids', $divId).show( 'scale' );
			//绑定删除事件
			$('.bi-chart-delete').unbind('click').click(function(){
				var parentId =  $divId + '-parent';
				$('#' + parentId).remove();
				delete templateContainer[$divId];
				delete templateContainer[$divId + '-theme'];
				
				$('.bi-chart-group').hide();
				
				//删除事件
				var dataParams = {};
				var positionAttr = {top: 0, left: 0};
				positionAttr['width'] = 0;
				positionAttr['height'] = 0;
				dataParams[$divId] = JSON.stringify(positionAttr);
				
				$.showLoading();
				$.ajax({
					url:baseUrl+'/updateTemplateAndCharts',
					type:'POST',
					data:dataParams,
					success:function(data) {
						if(data){
							$('#' + parentId).hide('fade', function(){
								$('#' + parentId).remove();
							});
						}
						$.hideLoading();
					}
				});
			});
			//'编辑'按钮位置
			var editPosition = {left:(position.left + width - $('.bi-chart-edit').width()/2 ) + 'px', top: ( position.top - $('.bi-chart-edit').height()/2 ) + 'px'};
			$('.bi-chart-edit').css(editPosition).show( 'scale' );
			//绑定编辑事件
			$('.bi-chart-edit').unbind('click').click(function(){
				var chartId = $divId.split('-')[1];
				$('div[data-chartid="'+ chartId + '"]').trigger('click');
				
				$('.bi-chart-group').hide();
			});
		});
	};
	
	var resetEchart = function($divId, $echartJSON, $theme, $chartType){
    	$('#' + $divId).css({"width": ($('#' + $divId + '-parent').width()) + "px", "height": ($('#' + $divId + '-parent').height()) + "px"});
    	/*if(oldChartType == 'table'){
    		Table.buildTable($echartJSON, 'main');
    	}else if(oldChartType == 'droplist'){
    		Variable.buildDroplist($echartJSON, 'main');
    	}else{
    		echarts.init($('#' + $divId)[0]).setOption($echartJSON);	
    	}*/
    	if($chartType == 'table'){
    		$('#' + $divId).createVariable(event, $echartJSON, $chartType, $echartJSON.caption);
    	}else{
    		echarts.init($('#' + $divId)[0], $theme).setOption($echartJSON);	
    	}
    };

    //bi页面列表
    var showList = function(main){
        var $menu = $(main);
        var $h2 = $menu.find("h2.tabT");
        var $detail = $menu.find(".detail");
        
        $h2.unbind('click').click(function () {
        	var $this = $(this);
        	var icon = $this.find('i');
        	if(icon.hasClass('fa-caret-down')){
        		icon.removeClass('fa-caret-down').addClass('fa-caret-right');
        		$this.next().hide('blind');
        	}else{
        		$h2.find('i').removeClass('fa-caret-down').addClass('fa-caret-right');
        		$detail.hide();
        		icon.removeClass('fa-caret-right').addClass('fa-caret-down');
        		$this.next().show('blind');
        	}
        });
    };
	showList('.bi-menu');
	showList('.bi-menu-right');
    
//});


    //bi入口
    var biInit = function($templateId){
		console.log('bi init:' + $templateId);
		//before 1: bi-template 重置
		//名称列表清空
		$('.bi-chart-list').empty();
		//容器清空
		$('.bi-template-container').empty();
		$('.bi-template-container').removeAttr('style');
		templateContainer = {};//清空template容器数据
		variableMap = {};//清空template中的变量对象
		chartVarMap = {};
		templateObjMap = {
				theme: '',
		};
		templateChartJsons = {};
		//隐藏删除,编辑提示
		$('.bi-chart-group').hide();
		//1.加载CHART列表,并渲染CHART列表
		$.ajax({
			url:baseUrl+'/getEchartsByTemplateId',
			type:'POST',
			data:{
				templateId: $templateId
			},
			success:function(data) {
				if(data){
					data = JSON.parse( data );
					var template = data.template;
					reloadAndRnderTemplate(template);
					
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
						renderChart(chart);
					}
					//a.渲染变量图表
					for(var i = 0; i < varCharts.length; i ++){
						var chart = varCharts[i];
						renderChartLayout(chart, false);
					}
					//b.渲染实例图表
					for(var i = 0; i < instCharts.length; i ++){
						var chart = instCharts[i];
						renderChartLayout(chart, true);
					}
				}
			}
		});
    };
    
    var reloadAndRnderTemplate = function($template){
    	var $theme = $template.theme;
    	templateObjMap['theme'] = $template.theme;
    	if($theme){
    		$('.bi-theme-container li').removeClass('checked');
    		$('.bi-theme-container li.' + $theme).addClass('checked');
    		var color = templateThemeToBGColor[$theme];
    		$('.bi-template-container').css({'background-color': color});
    	}
    };

    //chart渲染到页面
	var renderChart = function(chart){
		var chartId = chart.id;
		var conId = chart.conId;
		var name = chart.name;
		var templateId = chart.templateId;
		var filter = chart.filter
		$('.bi-chart-list').append( 
				$('<div class="bi-edit" style="margin-top:5px;" data-chartid="'+ chartId + '" data-templateid="' + templateId +'" data-conid="'+ conId + '" data-charttype="'+chart.classType+'" data-filter="'+filter+'">'+name+'</div>') );
		//绑定点击和拖拽事件
		biEditBindEvent();
	};
	
	
	//渲染已经布局过的chart
	var renderChartLayout = function($chart, isAsync){
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
			url:baseUrl+'/getEchartJSONByIds',
			type:'POST',
			data:{
				chartId: chartId,
				templateId: templateId,
				variableMap: JSON.stringify(variableMap)
			},
			async: isAsync,
			success:function(data) {
				if(data){
					//template面板追加一个默认的容器
					var divId = 'tmp-' + chartId + '-' + templateId;
					$('.bi-template-container').append( $( '<div id="' + divId + '-parent" style="position: absolute;"><div class="tmp-chart" id="' + divId  + '" style=""></div></div>' ) );
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
							
							variableMap[variableName] = variableValue + '';
							chartVarMap[divId] = variableName;
							$('#' + divId).createVariable(event, chartJson_, chartType_, title);
							if(chartType_ == 'droplist'){
								//绑定change事件
								bindVarDroplistEvent(divId);
							}
						}else if( chartType_ == 'table' ){
							var title = JSON.parse(data.title);
							chartJson_.caption = title;
							$('#' + divId).createVariable(event, chartJson_, chartType_, title);
						}else{
							var theme_ = templateObjMap['theme'] || data.chartCommonAttr.theme;
							var myChart_ = echarts.init(document.getElementById(divId), theme_);
							myChart_.clear();//清空组件
							myChart_.setOption( chartJson_ );
							
							//相应色系变化
							templateChartJsons[divId] = chartJson_;
						}
						
						templateContainer[divId] = chartJson_;
						templateContainer[divId+'-theme'] = theme_;
						
						//非隐藏表单域绑定缩放事件
						if(chartType_ == 'droplist'){
							bindEventByTempChartId4Droplist(divId);
						}else if(chartType_ != 'input'){
							bindEventByTempChartId(divId, chartType_);
						}
					}
				}
				$.hideLoading();
			}
		});
	};
	
	var bindVarDroplistEvent = function($divId){
		$('#' + $divId + '-parent select').unbind('change').change(function(){
			var value = $(this).val();
			if(!value){
				return;
			}
			var varName = chartVarMap[$divId];
			variableMap[varName] = value;
			
			//遍历所有Chart,根据是否包含当前变量来进行重新布局
			$('.bi-chart-list div').each(function(index, item){
				var filter = $(item).data('filter');
				if(filter && filter.indexOf(varName) > -1 ){
					var chartId =  $(item).data('chartid');
					var templateId =  $(item).data('templateid');
					var divId = 'tmp-' + chartId + '-' + templateId;
					if(!templateContainer[divId]){
						return;
					}
					
					$.ajax({
						url:baseUrl+'/getChartByIds',
						type:'POST',
						data:{
							chartId: chartId,
							templateId: templateId
						},
						success:function(data) {
							if(data){
								var chart = JSON.parse(data);
								var divId = 'tmp-' + chart.id + '-' + chart.templateId;
								if(templateContainer[divId]){
									var parentId =  divId + '-parent';
									var currentChartInCon = $('#' + parentId);
									chart['width'] = currentChartInCon.width();
									chart['height'] = currentChartInCon.height();
									chart['beginXCoordinate'] = currentChartInCon.position().left;
									chart['beginYCoordinate'] = currentChartInCon.position().top;
									
									delete templateContainer[divId];
									delete templateContainer[divId + '-theme'];
									
									currentChartInCon.remove();
								}
								renderChartLayout(chart, true);
							}
							$.hideLoading();
						}
					});
				}
			});
		});
	};
	

	//chart生成的规则,
	//每个chart对行和列的要求不一样
	var chartRule = function(chartType, xLength, yLength, conId, tableName){
		errMsg = '';
		if(!chartType){
			errMsg = '请选择图表类型';
			return false;
		}
		
		if(!conId || !tableName){
			errMsg = '请选择数据源';
			return false;
		}
		//line
		if(chartType == 'line' || chartType == 'bar'  || chartType == 'scatter' ||
				chartType == 'boxplot' || chartType == 'parallel'  || chartType == 'map' || chartType == 'table'){
			if(xLength != 1){
				errMsg = '此图表需要1个行字段, 至少1个列字段';
				return false;
			}
			if(yLength < 1){
				errMsg = '此图表需要1个行字段, 至少1个列字段';
				return false;
			}
		}else if(chartType == 'gauge' || chartType == 'treemap' || chartType == 'funnel'){
			if(xLength != 1){
				errMsg = '此图表需要1个行字段, 1个列字段';
				return false;
			}
			if(yLength != 1){
				errMsg = '此图表需要1个行字段, 1个列字段';
				return false;
			}
		}else if(chartType == 'graph' || chartType == 'sankey' ){
			if(xLength != 2){
				errMsg = '此图表需要2个行字段, 1个列字段';
				return false;
			}
			if(yLength != 1){
				errMsg = '此图表需要2个行字段, 1个列字段';
				return false;
			}
		}else if(chartType == 'k'){
			if(xLength != 1){
				errMsg = '此图表需要1个行字段, 至少1个列字段';
				return false;
			}
			if(yLength < 1){
				errMsg = '此图表需要1个行字段, 至少1个列字段';
				return false;
			}
		}else if(chartType == 'pie'){
			if(xLength < 1 || xLength > 3){
				errMsg = '此图表需要1-3个行字段, 1个列字段';
				return false;
			}
			if(yLength != 1){
				errMsg = '此图表需要1-3个行字段, 1个列字段';
				return false;
			}
		}else if(chartType == 'radar'){
			if(xLength != 1){
				errMsg = '此图表需要1个行字段, 至少1个列字段';
				return false;
			}
			if(yLength < 1){
				errMsg = '此图表需要1个行字段, 至少1个列字段';
				return false;
			}
		}else if(chartType == 'input' || chartType == 'droplist'){
			if( (xLength + yLength) < 1 ){
				errMsg = '此图表需要1个行字段或者1个列字段';
				return false;
			}
		}
		return true;
	}
	
    $('.bi-template-container').unbind('click').click(function(){
    	$('.bi-chart-group').hide( 'fade' );
    });
    
    
    /**
     * BI 布局
     * */
    //布局中样式选择事件
    $('.choiceBtn').unbind().click(function(){
        var $this = $(this);
        var styleBtn = $this.find('.styleBtn');
        if(styleBtn.hasClass('down_up')){
        	styleBtn.removeClass('down_up');
        	$('.bi-template-layout-setting').hide();
        }else{
        	styleBtn.addClass('down_up');
        	$('.bi-template-layout-setting').show();
        }
    });
    //关闭面板
    $('.bicharT .closeA').unbind().click(function(){
        $('.bi-template-layout-setting').hide();
        $('.choiceBtn .styleBtn').removeClass('down_up');
    });
    //面板可以拖拽
    $('.bi-template-layout-setting').draggable({
	      containment: "document",
	      cursor: "move"
	 });
    //面板分类点击事件
    showList('.bi-template-layout-setting');
    
    //TODO...
    //主题选择变化
    $('.bi-theme-container li').unbind().click(function(e){
        var $this = $(this);
        if($this.hasClass('checked')){
        	return;
        }else{
        	$('.bi-theme-container li').removeClass('checked');
        	$this.addClass('checked');
        	//TODO...
        	var curTheme = $this.data('theme');
        	templateObjMap['theme'] = curTheme;
        	for(var id in templateChartJsons){
        		var chartJson_ = templateChartJsons[id];
        		var myChart_ = echarts.init(document.getElementById(id), curTheme);
				myChart_.clear();//清空组件
				myChart_.setOption( chartJson_ );
        	}
        	$('.bi-template-container').css({'background-color': templateThemeToBGColor[curTheme]});
        }
    });
    
    
    //TODO will be deleted...
    $('.bicharlistStyle').css('height','390px');