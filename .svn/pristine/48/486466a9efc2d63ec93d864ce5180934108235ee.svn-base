/**下拉列表框和隐藏表单域渲染*/
var Variable = {
		buildInput: function(data, domId){
			$jq('#' + domId).empty();
			var value = data.value;
			$jq('#' + domId).append($jq('<input  class="hiddenInput" type="hidden" value="'+ value + '" />'));
		},
		buildDroplist: function(data, domId){
			$jq('#' + domId).empty();
			$jq('.ui-icon').hide();
			var values = data.value || [];
			var name = data.name;
			var showLable = data.showLable || false;
			
			var selectStr = '<div class="gen_droplist"  style="display:inline-block;">';
			if(showLable){
				selectStr += '<lable>' + name + '</lable>';
			}
			selectStr += '<select style="width: 80px; margin-left:5px; height: 25px;">';
			for(var i = 0; i < values.length; i ++){
				selectStr += '<option value="' + values[i] + '">' + values[i] + '</option>';
			}
			selectStr += '</select></div>';
			
			$jq('#' + domId).append( $jq( selectStr ) );
			$jq( ".gen_droplist" ).resizable({
		    	minHeight: 30,
		    	maxHeight: 30,
		    	minWidth: 100,
		    	maxWidth: 200,
		    	resize: function( event, ui ) {
		    		var height = $jq('.gen_droplist').height();
		    		var width = $jq('.gen_droplist').width();
		    		
		    		$jq('.gen_droplist select').css({'height': height + 'px', 'width': (width -40) + 'px'});
		    	}
		    });
		}
}