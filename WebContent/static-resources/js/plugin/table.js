var Table = {
	tableData: '',
	pageSize: 10,
	count: 0,
	start: 0,
	currentDomId: '',
	filterTableData:'',
	init: function(id){

	},
	
	buildTable: function(table, domId){//JSON数据
		$jq('#' + domId).empty();
		
		Table.pageSize = table.page.pageSize || Table.pageSize;
		//title
		var caption = table.caption;
		
		var tableHeaders = table.headers;
		
		//cols
		var columns = table.columns;
		//rows
		var rowFields = table.rows;
		Table.tableData = table.data;
		Table.count = table.data.length;
		
		var domHeight = $jq("#" + domId).height() - 80;
		var domWidth = $jq("#" + domId).width() - 5;
	
		var id = Table.generateUUID(10);
		var tableStr = '<table id="'+ id +'" class="-generator-table" style="width:'+ domWidth + 'px; height:'+ domHeight + 'px; text-align:center; border-collapse:collapse">';
		
		if(caption){
			var title = caption.name;
			//setting caption
			tableStr += '<caption>'+ title + '</caption>';
		}
		
		//setting table header
		if(tableHeaders && tableHeaders.lenght == 2){
			var header1 = tableHeaders[0];
			var header2 = tableHeaders[1];
			tableStr += '<thead><tr><th colspan="'+ rowFields.length + '" data-axis="string" data-index="0">'+ header1 +'\\'+ header2 + '</th>';
		}else{
			tableStr += '<thead><tr><th colspan="'+ rowFields.length + '" data-axis="string" data-index="0">行\列</th>';
		}
		for(var i = 0; i < columns.length; i ++){
			var col = columns[i];
			if(col.type == 'number'){
				tableStr +='<th data-axis="number" data-index="'+ (i + 1) + '">' + col.name + '</th>';
			}else if(col.type == 'date'){
				tableStr +='<th data-axis="date" data-index="'+ (i + 1) + '">' + col.name + '</th>';
			}else{
				tableStr +='<th data-axis="string" data-index="'+ (i + 1) + '">' + col.name + '</th>';	
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
		
		var table = $jq(tableStr);
		$jq('#' + domId).append(table);
		$jq('.-generator-table caption').css({"font-size": "25px", "font-weight": "600", "height":"35px", "text-align":(caption.textAlign ?(caption.textAlign):"center") });
		$jq('.-generator-table  thead tr:eq(0)').css({"background-color": "#f3f3f3", "height": "40px" });
		$jq('.-generator-table  tbody tr').css({ "height": "30px" });
		$jq('.-generator-table  tbody tr:odd').css({ "background-color": "#fbfbfb" });
		$jq('.-generator-table  td, .-generator-table th').css({ "border": "1px #efefef solid" });
		
		//paging
		var paging = $jq('<div id="pageToolbar"></div>');
		$jq('#' + domId).append(paging);
		$jq('#pageToolbar').Paging({pagesize:Table.pageSize,count:Table.count,toolbar:true, callback:function(page, size, count){
			console.log('当前页：' + page + ', size： ' + size);
			var start = (page - 1) * size;
			size = parseInt(size);
			Table.change(domId, start, size, Table.tableData);
		}});
		
		//header event
		//sorting
		$jq('#' + domId + ' table th').click(function(event){
			var type = $jq(this).attr('data-axis');
			var index = $jq(this).attr('data-index');
			var order = '';
			if($jq(this).hasClass('sortedASC') || $jq(this).hasClass('sortedDESC')){
				
				if($jq(this).hasClass('sortedDESC')){
					$jq(this).removeClass('sortedDESC').addClass('sortedASC');
					order = 'asc';
				}else{
					order = 'desc';
					$jq(this).removeClass('sortedASC').addClass('sortedDESC');
				}
				
			}else{
				$jq('#' + domId + ' table th').removeClass('sortedASC');
				$jq('#' + domId + ' table th').removeClass('sortedDESC');
				order = 'asc';
				$jq(this).addClass('sortedASC');
			}
			
			Table.sort(Table.tableData, type, order, index);
		});
		//end sorting.
		
		//filtering
		
	},
	change: function(domId, start, size, tableData){
		//global
		Table.start = start;
		Table.pageSize = size;
		Table.currentDomId = domId;
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
		$jq('#' + domId + ' table tbody').empty().append(tbody);
		
		$jq('.-generator-table  tbody td').css({ "height": "30px" });
		$jq('.-generator-table  tbody tr:odd').css({ "background-color": "#fbfbfb" });
		$jq('.-generator-table  td, .-generator-table th').css({ "border": "1px #efefef solid" });
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
				if(order == 'asc'){
					return aArray[index].toLowerCase().localeCompare( bArray[index].toLowerCase() );
				}else{
					return bArray[index].toLowerCase().localeCompare( aArray[index].toLowerCase() );
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
		
		Table.change(Table.currentDOmId?Table.currentDOmId : 'main', Table.start, Table.pageSize, tableData);
	},
	filter: function(tableData, value, index){
		var newTableData = tableData.filter(function(item){
			return item[index]  == value;
		});
		
		Table.filterTableData = tableData;
		Table.tableData = newTableData;
		Table.change(Table.currentDOmId?Table.currentDOmId : 'main', 0, Table.pageSize, Table.tableData);
	},
	clearFilter: function(){
		Table.tableData = Table.filterTableData;
		Table.filterTableData = '';
		
		Table.change(Table.currentDOmId?Table.currentDOmId : 'main', 0, Table.pageSize, Table.tableData);
	},
	generateUUID:function(len){
		var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
		var maxPos = $chars.length || 10;
		var uuid = '';
	    for (i = 0; i < maxPos; i++) {
	    	uuid += $chars.charAt(Math.floor(Math.random() * maxPos));
	    }
	    return uuid;
	}

};