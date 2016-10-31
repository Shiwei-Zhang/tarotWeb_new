var option = {
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    legend: {
        data:['直接访问', '邮件营销','联盟广告','视频广告','搜索引擎']
    },
    color:[
     "#ff7f50",
     "#87cefa",
     "#da70d6",
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
    yAxis : [
        {
            type : 'value'
        }
    ],
    xAxis : [
        {
            type : 'category',
            data : ['周一','周二','周三','周四','周五','周六','周日']
        }
    ],
    series : [
        {
            name:'直接访问',
            type:'bar',
            stack:'total',
            itemStyle : { normal: {label : {show: true, position: 'inside'}}},
            data:[320, 302, 301, 334, 390, 330, 320]
        },
        {
            name:'邮件营销',
            type:'bar',
            stack:'total',
            itemStyle : { normal: {label : {show: true, position: 'inside'}}},
            data:[120, 132, 101, 134, 90, 230, 210]
        },
        {
            name:'联盟广告',
            type:'bar',
            stack:'total',
            itemStyle : { normal: {label : {show: true, position: 'inside'}}},
            data:[220, 182, 191, 234, 290, 330, 310]
        },
        {
            name:'视频广告',
            type:'bar',
            stack:'total',
            itemStyle : { normal: {label : {show: true, position: 'inside'}}},
            data:[150, 212, 201, 154, 190, 330, 410]
        },
        {
            name:'搜索引擎',
            type:'bar',
            stack:'total',
            itemStyle : { normal: {label : {show: true, position: 'inside'}}},
            data:[820, 832, 901, 934, 1290, 1330, 1320]
        }
    ]
};
                    