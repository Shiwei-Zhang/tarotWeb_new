
  	function addlogicnode(){
  		var jsonObj = {};
  		var logicNode = new Object();
  		var columnObj = new Object();
  		var columnObj2 = new Object();
  		var columnObj3={"name":"test","type":"gz"};  
  		var columnArray = new Array();
  		logicNode.content = "bbb";
  		columnObj.name="abc";
  		columnObj.type="002";
  		columnObj2.name="abcdef";
  		columnObj2.type="003";
  		columnArray.push(columnObj);
  		columnArray.push(columnObj2);
  		jsonObj.logicNode=logicNode;
  		jsonObj.importColumns=columnArray;
  		$.ajax({  
			     url:'logicNode/addLogicNode',
			     type:'POST',  
			     dataType:"json",
			     contentType: "application/json",
               data:JSON.stringify(jsonObj),
			     success:function(data) {
			    	 console.log(data);
			    	 alert("ok");  
			     },  
			     error : function() {   
		          	 alert("异常！");  
			     }  
		 	})
  	}
  	
  	function deletelogicnodes(){
  		var nodeNumArray = new Array();
  		nodeNumArray.push("a");
  		nodeNumArray.push("b");
  		$.ajax({  
			     url:'logicNode/deleteLogicNodes',
			     type:'POST',  
			     dataType:"json",
			     contentType: "application/json",
               data:JSON.stringify(nodeNumArray),
			     success:function(data) {
			    	 alert("ok");  
			     },  
			     error : function() {   
		          	 alert("异常！");  
			     }  
		 	})
  	}
  	function testlogicnodes(){
  		var request = {};
  		var jsonObj = {};
  		var logicNode = new Object();
  		var columnObj = new Object();
  		var columnObj2 = new Object();
  		var columnObj3={"name":"test","type":"gz"};  
  		var columnArray = new Array();
  		logicNode.content = "bbb";
  		logicNode.isLogic = 0;
  		columnObj.name="abc";
  		columnObj.type="002";
  		columnObj2.name="abcdef";
  		columnObj2.type="003";
  		columnArray.push(columnObj);
  		columnArray.push(columnObj2);
  		jsonObj.logicNode=logicNode;
  		jsonObj.importColumns=columnArray;
  		request.service = "addLogicNode";
  		request.jsonStr = JSON.stringify(jsonObj);
  		$.ajax({  
			     url:'http://172.16.1.226:8080/TarotIDE/queueController/queueOffer',
			     type:'POST',  
			     dataType:"json",
			     contentType: "application/json",
			     data:JSON.stringify(request),
			     success:function(data) {
			    	 console.log(data);
			     },  
			     error : function() {   
		          	 alert("异常！");  
			     }  
		 	})
  	}