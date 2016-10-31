var option = {
	color:[
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
        text: '罗纳尔多 vs 舍普琴科',
        subtext: '完全实况球员数据'
    },
    tooltip : {
        trigger: 'axis'
    },
    legend: {
        x : 'center',
        data:['罗纳尔多','舍普琴科']
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    calculable : true,
    polar : [
        {
            indicator : [
                {text : '进攻', max  : 100},
                {text : '防守', max  : 100},
                {text : '体能', max  : 100},
                {text : '速度', max  : 100},
                {text : '力量', max  : 100},
                {text : '技巧', max  : 100}
            ],
            radius : 130
        }
    ],
    series : [
        {
            name: '完全实况球员数据',
            type: 'radar',
            itemStyle: {
                normal: {
                    areaStyle: {
                        type: 'default'
                    }
                }
            },
            data : [
                {
                    value : [97, 42, 88, 94, 90, 86],
                    name : '舍普琴科'
                },
                {
                    value : [97, 32, 74, 95, 88, 92],
                    name : '罗纳尔多'
                }
            ]
        }
    ]
};
                    