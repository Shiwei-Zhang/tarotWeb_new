var option = {
    title : {
        text: '',
        subtext: ''
    },
    tooltip : {
        trigger: 'axis'
    },
    legend: {
        data:['最高气温','最低气温']
    },
    
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
    xAxis : [
        {
            type : 'category',
            boundaryGap : false,
            data : ['周一','周二','周三','周四','周五','周六','周日']
        }
    ],
    yAxis : [
        {
            type : 'value',
            axisLabel : {
                formatter: '{value} °C'
            }
        }
    ],
    series : [
        {
            name:'最高气温',
            type:'line',
            /*itemStyle: {normal: {areaStyle: {type: 'default'}}},*/
            data:[11, 11, 15, 13, 12, 13, 10],
            markPoint : {
                data : [
                    {type : 'max', name: '最大值'},
                    {type : 'min', name: '最小值'}
                ]
            },
            markLine : {
                data : [
                    {type : 'average', name: '平均值'}
                ]
            }
        },
        {
            name:'最低气温',
            type:'line',
            /*itemStyle: {normal: {areaStyle: {type: 'default'}}},*/
            data:[1, -2, 2, 5, 3, 2, 0],
            markPoint : {
                data : [
                    {name : '周最低', value : -2, xAxis: 1, yAxis: -1.5}
                ]
            },
            markLine : {
                data : [
                    {type : 'average', name : '平均值'}
                ]
            }
        }
    ]
};
                    