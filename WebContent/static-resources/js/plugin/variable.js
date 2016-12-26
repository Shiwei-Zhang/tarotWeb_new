/**下拉列表框和隐藏表单域渲染*/
;(function($, window, document, undefined){
	//生成变量图表
	//start--
	var Variable = {
			buildInput: function(data, $domObj, $title){
				$domObj.empty();
				var value = data.value || '';
				var titleText = ($title && $title.text) || titleText || '';
				var titleShow = ($title && $title.show) || titleShow || false;
				$domObj.append($('<div class="variable-div">' +
								'	<span class="variable-title" title="'+(titleText)+'">'+(titleText)+'</span>'+
								'	<input class="variable-input" disabled="disabled" value="'+ value + '" placeholder="次变量暂无值"/>' +
								'</div>'));
				var id = $domObj.attr('id');
				$domObj.find('div.variable-div').css({'text-align':'center','width':'280px','height':'35px',
					'top':(($domObj.height() - 35)/2) + 'px', 'left': (($domObj.width() - 280)/2) + 'px'});
				if(id == 'bi-main'){
					$domObj.find('div.variable-div').css('position', 'absolute');
				}
				$domObj.find('.variable-title').css({'height':'30px', 'width':'110px', 'font-size':'18px', 'vertical-align':'sub', 'display':'inline-block'});
				titleShow? $domObj.find('.variable-title').show(): $domObj.find('.variable-title').hide();
				$domObj.find('.variable-input').css({'width':'150px','height':'30px'});
			},
			buildDroplist: function(data, $domObj, $title){
				$domObj.empty();
				var value = data.value || [];
				var titleText = ($title && $title.text) || titleText || '';
				var titleShow = ($title && $title.show) || titleShow || false;
				var options = '<select class="variable-select">' + 
							  ' <option value="">全部</option>';
				for(var i = 0; i < value.length; i ++){
					options += '<option value="'+value[i]+'">'+value[i]+'</option>'
				}
				options += '</select>';
				$ ('<div class="variable-div">' +
						'	<span class="variable-title"  title="'+(titleText)+'">'+(titleText)+'</span>'+
						'</div>').append( options ).appendTo( $domObj );
				
				var id = $domObj.attr('id');
				$domObj.find('div.variable-div').css({'text-align':'center', 'height':'35px',
					'top':(($domObj.height() - 35)/2) + 'px', 'left': (($domObj.width() - 260)/2) + 'px'});
				if(id == 'bi-main'){
					$domObj.find('div.variable-div').css('position', 'absolute');
				}
				
				$domObj.find('.variable-title').css({'height':'30px', 'width':'110px', 'font-size':'18px', 'vertical-align':'sub', 'display':'inline-block'});
				titleShow? $domObj.find('.variable-title').show(): $domObj.find('.variable-title').hide();
				$domObj.find('.variable-select').css({'width':'150px','height':'30px'});
			}
	};
	//--end
	
	//生成表格图表
	//-start--
	var Table = {
		tableData: '',
		page:{
			pageSize: 10,
			total: 0
		},
		count: 0,
		start: 0,
		currentDomId: '',
		filterTableData:'',
		init: function(id){

		},
		
		buildTable: function(table, $domObj, $title){//JSON数据
			Table.currentDOmId = $domObj;
			$domObj.empty();
			
			var titleShow = ($title && $title.show) || titleShow || false;
			Table.pageSize = table.page.pageSize || Table.pageSize;
			//title
			var caption = {
					name: ($title && $title.text) || titleText || '',
					textAlign: ($title && $title.position) || titlePosition || 'center'
			}
			var isShow = ($title && $title.show) || titleShow || false;
			
			var tableHeaders = table.headers;//表格头
			//cols
			var columns = table.columns;
			//rows
			var rowFields = table.rows;
			Table.tableData = table.data;
			Table.page = table.page;
			
			var domHeight = $domObj.height() - 35;
			var domWidth = $domObj.width();
			var id = Table.generateUUID(10);
			var tableStr = '<div class="table-container variable-div"><table id="'+ id +'" class="-generator-table" style="width:'+ domWidth + 'px; text-align:center; border-collapse:collapse">';
			
			//setting caption
			tableStr += '<caption class="variable-title" style="text-align:'+caption.textAlign+'; display:none;">'+ caption.name + '</caption>';
			
			//setting table header
			var asix = (columns && columns.length > 1) ?columns[0].type : 'string';
			if(tableHeaders && tableHeaders.lenght == 2){
				var header1 = tableHeaders[0];
				var header2 = tableHeaders[1];
				tableStr += '<thead><tr><th data-axis="'+asix+'" data-index="0" class="table-first-cell_">'+ header1 +'\\'+ header2 + '</th>';
			}else{
				var headerName1 = columns[0] && columns[0].name?columns[0].name : '';
				tableStr += '<thead><tr><th data-axis="'+asix+'" data-index="0" class="table-first-cell_"><span class="rowWords">'+headerName1+'</span><span class="columnWords">Attribute</span></th>';
			}
			for(var i = 1; i < columns.length; i ++){
				var col = columns[i];
				if(col.type == 'number'){
					tableStr +='<th data-axis="number" data-index="'+ (i) + '">' + col.name + '</th>';
				}else if(col.type == 'date'){
					tableStr +='<th data-axis="date" data-index="'+ (i) + '">' + col.name + '</th>';
				}else{
					tableStr +='<th data-axis="string" data-index="'+ (i) + '">' + col.name + '</th>';	
				}
			}
			tableStr += '</tr></thead>';
			//end setting header
			
			//setting table body
			tableStr += '<tbody>';
			if(Table.tableData && Table.tableData.length > 0){
				for(var i = 0; i < Table.tableData.length; i ++){
					if(i < Table.pageSize){
						var rowData = Table.tableData[i];//row data
						tableStr += '<tr>';
						for(var j = 0; j < rowData.length; j ++){
							tableStr += '<td>' + rowData[j] + '</td>';
						}
						tableStr += '</tr>';
					}
				}
			}
			tableStr += '</tbody></table>';
			
			var table = $(tableStr);
			$domObj.append(table);
			$domObj.find('.table-container').css({'font-size':'14px', 'height':domHeight + 'px', 'overflow-x':'hidden', 'overflow-y':'auto'});
			$domObj.find('.-generator-table').css('font-size', '14px');
			$domObj.find('.-generator-table caption').css({"font-size": "18px", "font-weight": "600", "height":"35px" });
			isShow? $domObj.find('.-generator-table caption').show() : $domObj.find('.-generator-table caption').hide();
			$domObj.find('.-generator-table  tbody>tr').css({ "height": "30px" });
			$domObj.find('.-generator-table  thead tr:eq(0)').css({"background-color": "#f3f3f3", "height": "40px" });
			$domObj.find('.-generator-table  tbody tr:odd').css({ "background-color": "#fbfbfb" });
			$domObj.find('.-generator-table  td, .-generator-table th').css({ "border": "1px #efefef solid", 'width': (domWidth/columns.length - columns.length * 2 - 2 ) + 'px' });
			
			//paging
			var paging = $('<div id="pageToolbar"></div>');
			$domObj.append(paging);
			$domObj.find('#pageToolbar').Paging({pagesize: Table.page.pageSize,count: Table.page.total,toolbar:true, callback:function(page, size, count){
				console.log('当前页：' + page + ', size： ' + size);
				var start = (page - 1) * size;
				size = parseInt(size);
				Table.change($domObj, start, size, Table.tableData);
				
				$domObj.find('.-generator-table  tbody>tr').css({ "height": "30px" });
				$domObj.find('#pageToolbar>div>ul>li').css({'font-size':'14px', 'height':'15px', 'line-height':'15px'});
			}});
			$domObj.find('#pageToolbar>div>ul>li').css({'font-size':'14px', 'height':'15px', 'line-height':'15px'});
			
			//header event
			//sorting
			$domObj.find('table').find('th').click(function(event){
				var type = $(this).attr('data-axis');
				var index = $(this).attr('data-index');
				var order = '';
				if($(this).hasClass('sortedASC') || $(this).hasClass('sortedDESC')){
					
					if($(this).hasClass('sortedDESC')){
						$(this).removeClass('sortedDESC').addClass('sortedASC');
						order = 'asc';
					}else{
						order = 'desc';
						$(this).removeClass('sortedASC').addClass('sortedDESC');
					}
					
				}else{
					$domObj.find('table').find('th').removeClass('sortedASC');
					$domObj.find('table').find('th').removeClass('sortedDESC');
					order = 'asc';
					$(this).addClass('sortedASC');
				}
				
				Table.sort(Table.tableData, type, order, index);
			});
			//end sorting.
			
			//filtering
			
			
			//表头
			var $header = $('.table-first-cell_');
			var ps = $header.position();
			//Table.drawLine($header, ps.left, ps.top, (ps.left + $header.width()), (ps.top + $header.height()));
			Table.drawLine($header, 0, 0, $header.width(),$header.height(),'#dcd7d7');
			$header.find('.rowWords').css({'width':$header.width()/2,'height':$header.height()/2,'position':'absolute',left:0,top:$header.height()/2});
			$header.find('.columnWords').css({'width':$header.width()/2,'height':$header.height()/2,'position':'absolute',left:$header.width()/2,top:5});
		},
		change: function($domObj, start, size, tableData){
			//global
			Table.start = start;
			Table.page.pageSize = size;
			//--
			var tbody = '';
			for(var i = start; i < tableData.length; i ++){
				if(i < size + start){
					var rowData = tableData[i];//row data
					tbody += '<tr>';
					for(var j = 0; j < rowData.length; j ++){
						tbody += '<td>' + rowData[j] + '</td>';
					}
					tbody += '</tr>';
				}
			}
			$domObj.find('table').find('tbody').empty().append(tbody);
			
			$domObj.find('.-generator-table  tbody td').css({ "height": "30px" });
			$domObj.find('.-generator-table  tbody tr:odd').css({ "background-color": "#fbfbfb" });
			$domObj.find('.-generator-table  td, .-generator-table th').css({ "border": "1px #efefef solid" });
		},
		sort: function(tableData, type, order, index){
			if(type == 'number'){
				tableData.sort(function(aArray, bArray){
					if(order == 'asc'){
						return aArray[index] - bArray[index];
					}else{
						return bArray[index] - aArray[index];
					}
				});
			}if(type == 'string'){
				tableData.sort(function(aArray, bArray){
					try{
						if(order == 'asc'){
							return aArray[index].toLowerCase() - bArray[index].toLowerCase();
						}else{
							return bArray[index].toLowerCase() - aArray[index].toLowerCase();
						}
					}catch(e){
						if(order == 'asc'){
							return aArray[index] - bArray[index];
						}else{
							return bArray[index] - aArray[index];
						}
					}
				});
			}else if(type == 'date'){
				tableData.sort(function(aArray, bArray){
					if(order == 'asc'){
						return new Date(aArray[index]).getTime() -new Date(bArray[index]).getTime();
					}else{
						return new Date(bArray[index]).getTime() -new Date(aArray[index]).getTime();
					}
				});
			}
			
			Table.change(Table.currentDOmId, Table.start, Table.pageSize, tableData);
		},
		filter: function(tableData, value, index){
			var newTableData = tableData.filter(function(item){
				return item[index]  == value;
			});
			
			Table.filterTableData = tableData;
			Table.tableData = newTableData;
			Table.change(Table.currentDOmId, 0, Table.page.pageSize, Table.tableData);
		},
		clearFilter: function(){
			Table.tableData = Table.filterTableData;
			Table.filterTableData = '';
			
			Table.change(Table.currentDOmId, 0, Table.page.pageSize, Table.tableData);
		},
		generateUUID:function(len){
			var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
			var maxPos = $chars.length || 10;
			var uuid = '';
		    for (i = 0; i < maxPos; i++) {
		    	uuid += $chars.charAt(Math.floor(Math.random() * maxPos));
		    }
		    return uuid;
		},
		drawLine: function($header, startX, startY, endX, endY, lineColor){
			lineColr = lineColor || '#efefef';
	        var canvas = document.createElement("canvas");
	        if(canvas.getContext){
	            var ctx = canvas.getContext('2d');
	            ctx.clearRect(0,0,endX,endY); //清空画布，多个表格时使用
	            ctx.fill();
	            ctx.lineWidth = 1;
	            ctx.strokeStyle = lineColor;
	            ctx.beginPath();
	            ctx.moveTo(startX+0.5,startY+0.5);
	            ctx.lineTo(endX+0.5,endY+0.5);

	            ctx.stroke();
	            ctx.closePath();
	            $(canvas).css({'position':'absolute', 'z-index':'999'});
	            $header.css({'background-image':'url("' + ctx.canvas.toDataURL() + '")'});
	        }
	    }
	};
	//--end
	
	//新增事件
	$.fn.createVariable = function(e, data, chartType, title){
		var $this = $(this);
		
		if($.isEmpty(data)){
			return ;
		}
		if(chartType == 'input'){
			Variable.buildInput(data, $this, title);
		}else if(chartType == 'droplist'){
			Variable.buildDroplist(data, $this, title);
		}else if( chartType == 'table' ){
			Table.buildTable(data, $this, title);
		}
	};
	
})(jQuery, window, document);