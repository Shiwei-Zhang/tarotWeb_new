var schema = [
    {name: 'date', index: 0, text: '日期'},
    {name: 'AQIindex', index: 1, text: 'AQI'},
    {name: 'PM25', index: 2, text: 'PM2.5'},
    {name: 'PM10', index: 3, text: 'PM10'},
    {name: 'CO', index: 4, text: ' CO'},
    {name: 'NO2', index: 5, text: 'NO2'},
    {name: 'SO2', index: 6, text: 'SO2'},
    {name: '等级', index: 7, text: '等级'}
];

var lineStyle = {
    normal: {
        width: 1,
        opacity: 0.5
    }
};

var option = {
    backgroundColor: '#333',
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
    legend: {
        bottom: 30,
        data: ['北京', '上海', '广州'],
        itemGap: 20,
        textStyle: {
            color: '#fff',
            fontSize: 14
        }
    },
    
    parallelAxis: [
        {dim: 0, name: schema[0].text, inverse: true, max: 31, nameLocation: 'start'},
        {dim: 1, name: schema[1].text},
        {dim: 2, name: schema[2].text},
        {dim: 3, name: schema[3].text},
        {dim: 4, name: schema[4].text},
        {dim: 5, name: schema[5].text},
        {dim: 6, name: schema[6].text},
        {dim: 7, name: schema[7].text,
        type: 'category', data: ['优', '良', '轻度污染', '中度污染', '重度污染', '严重污染']}
    ],
    visualMap: {
        show: true,
        min: 0,
        max: 150,
        dimension: 2,
        inRange: {
            color: ['#d94e5d','#eac736','#50a3ba'].reverse(),
            // colorAlpha: [0, 1]
        }
    },
    parallel: {
        left: '5%',
        right: '18%',
        bottom: 100,
        parallelAxisDefault: {
            type: 'value',
            name: 'AQI指数',
            nameLocation: 'end',
            nameGap: 20,
            nameTextStyle: {
                color: '#fff',
                fontSize: 12
            },
            axisLine: {
                lineStyle: {
                    color: '#aaa'
                }
            },
            axisTick: {
                lineStyle: {
                    color: '#777'
                }
            },
            splitLine: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: '#fff'
                }
            }
        }
    },
    series: [
        {
            name: '北京',
            type: 'parallel',
            lineStyle: lineStyle,
            data: [
               [29,82,92,174,3.29,0,13,"良"],
               [30,106,116,188,3.628,101,16,"轻度污染"],
               [31,118,50,0,1.383,76,11,"轻度污染"]
            ]
        },
        {
            name: '上海',
            type: 'parallel',
            lineStyle: lineStyle,
            data: [
               [29,188,143,197,1.66,99,51,"中度污染"],
               [30,174,131,174,1.55,108,50,"中度污染"],
               [31,187,143,201,1.39,89,53,"中度污染"]
            ]
        },
        {
            name: '广州',
            type: 'parallel',
            lineStyle: lineStyle,
            data: [
                [29,134,96,165,2.76,83,41,"轻度污染"],
                [30,52,24,60,1.03,50,21,"良"],
                [31,46,5,49,0.28,10,6,"优"]
            ]
        }
    ]
};