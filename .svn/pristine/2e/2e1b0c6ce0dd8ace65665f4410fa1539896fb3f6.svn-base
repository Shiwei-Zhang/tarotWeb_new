var option = {
	color:[
	       "red",
	       "green",
	       "gray",
	       "#32cd32",
	       "#6495ed",
	       "#ff69b4",
	       "#ba55d3",
	       "#cd5c5c",
	       "#ffa500",
	       "#40e0d0",
	       "#1e90ff",
	       "#ff6347",
	       "#7b68ee",
	       "#00fa9a",
	       "#ffd700",
	       "#6699FF",
	       "#ff6666",
	       "#3cb371",
	       "#b8860b",
	       "#30e0e0"
	],
    title : {
        text : '',
        subtext : ''
    },
    tooltip : {
        trigger: 'axis',
        axisPointer:{
            show: true,
            type : 'cross',
            lineStyle: {
                type : 'dashed',
                width : 1
            }
        }
    },
    dataZoom: {
        show: true,
        start : 30,
        end : 70
    },
    legend : {
        data : ['series1', 'series2']
    },
    dataRange: {
        min: 0,
        max: 100,
        orient: 'horizontal',
        y: 30,
        x: 'center',
        //text:['高','低'],           // 文本，默认为数值文本
        color:['lightgreen','orange'],
        splitNumber: 5
    },
    xAxis : [
        {
            type : 'category',
            axisLabel: {
                formatter : function(v) {
                    return '类目' + v
                }
            },
            data : function (){
                var list = [];
                var len = 0;
                while (len++ < 500) {
                    list.push(len);
                }
                return list;
            }()
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    animation: false,
    series : [
        {
            name:'series1',
            type:'scatter',
            tooltip : {
                trigger: 'item',
                formatter : function (params) {
                    return params.seriesName + ' （'  + '类目' + params.value[0] + '）<br/>'
                           + params.value[1] + ', ' 
                           + params.value[2]; 
                },
                axisPointer:{
                    show: true
                }
            },
            symbolSize: function (value){
                return Math.round(value[2]/10);
            },
            data: (function () {
                var d = [];
                var len = 0;
                var value;
                while (len++ < 500) {
                    d.push([
                        len,
                        (Math.random()*30).toFixed(2) - 0,
                        (Math.random()*100).toFixed(2) - 0
                    ]);
                }
                return d;
            })()
        },
        {
            name:'series2',
            type:'scatter',
            tooltip : {
                trigger: 'item',
                formatter : function (params) {
                    return params.seriesName + ' （'  + '类目' + params.value[0] + '）<br/>'
                           + params.value[1] + ', ' 
                           + params.value[2]; 
                },
                axisPointer:{
                    show: true
                }
            },
            symbolSize: function (value){
                return Math.round(value[2]/10);
            },
            data: (function () {
                var d = [];
                var len = 0;
                var value;
                while (len++ < 500) {
                    d.push([
                        len,
                        (Math.random()*30).toFixed(2) - 0,
                        (Math.random()*100).toFixed(2) - 0
                    ]);
                }
                return d;
            })()
        }
    ]
};