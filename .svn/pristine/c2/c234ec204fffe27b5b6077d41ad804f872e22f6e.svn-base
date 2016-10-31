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
    },
    tooltip : {
        trigger: 'item',
        formatter: "{b}"
    },
    calculable : false,
    series : [
        {
            name:'树图',
            type:'tree',
            orient: 'horizontal',  // vertical horizontal
            rootLocation: {x: 100, y: '50%'}, // 根节点位置  {x: 'center',y: 10}
            nodePadding: 10,
            symbol: 'circle',
            symbolSize: 40,
            itemStyle: {
                normal: {
                    label: {
                        show: true,
                        position: 'right',
                        textStyle: {
                            color: 'black',
                            fontSize: 15,
                            fontWeight:  'bolder'
                        }
                    },
                    lineStyle: {
                        color: '#000',
                        width: 1,
                        type: 'broken' // 'curve'|'broken'|'solid'|'dotted'|'dashed'
                    }
                }
            },
            data: [
                {
                    name: '手机',
                    value: 6,
         			symbol: 'circle',
                    children: [
                        {
                            name: '小米',
                            value: 4
                        },
                        {
                            name: '苹果',
                            value: 4
                        },
                        {
                            name: '华为',
                            value: 2
                        },
                        {
                            name: '联想',
                            value: 2
                        }
                    ]
                }
            ]
        }
    ]
};
                    