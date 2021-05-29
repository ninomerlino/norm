//global vars
const adv_settings_switch = document.getElementById("adv_settings_switch");
const adv_settings_list = document.getElementById("adv_settings_list");
const settings_rate_switch = document.getElementById("settings_rate_switch");
const settings_rate_list = document.getElementById("settings_rate_list");
const run_switch = document.getElementById('run_switch');
const valid_colors = ['red','blue','green','yellow','lightblue','lime','orange','royalblue','forestgreen']
//classes
class Settings{
    static rate = 1000;
    static buffer_size = 30;
    static danger_core_treshold = 90;
    static warning_core_treshold = 70;
}
class ChartManager{
    static cpu_usage_chart;
    static disk_usage_chart;
    static net_traffic_chart;
    static cpu_chart(canvas_id, data, type = 'line', curve = 'smooth', width = 3){//dataset = {name, data}
        let datasets = []
        for(let i = 0; i < data.length; i++){
            datasets.push({name:data[i],data:[]})
        }
        return new ApexCharts(document.getElementById(canvas_id), {
            chart: {type: type, height: '90%',
            animations: {
                enabled: true,
                easing: 'linear',
                speed: 200,
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
            }}},
            stroke: {width: width, curve: curve},
            series: datasets,
            xaxis: {categories: []}
        });
    }
    static disk_chart(canvas_id){
        return new ApexCharts(document.getElementById(canvas_id), {
            chart: {
                height: "90%",
                type: 'radialBar',
                animations: {
                    enabled: true,
                    easing: 'linear',
                    speed: 800,
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            dataLabels: {value: {show: true}},
            series: [0],
            colors: ["hsl(48, 100%, 67%)"],
            labels: [''],
        });
    }
    static net_chart(canvas_id, interfaces){
        let datasets = [{name: 'Recived',data: []}, {name: 'Sent',data: []}];
        return new ApexCharts(document.getElementById(canvas_id), {
            series:datasets,
            chart: {
            height: "90%",
            type: 'bar',
            },
            xaxis: {categories: interfaces,}
        });
    }
    static generate_charts(){
        let c = [];
        for (let index = 0; index < document.getElementsByClassName('corename').length; index++) {
            c.push("core "+index);
        }
        let n = [];
        for(let f of document.getElementsByClassName('if-name')){
            n.push(f.innerText)
        }
        ChartManager.cpu_usage_chart = ChartManager.cpu_chart('cpu_canvas', c);
        ChartManager.disk_usage_chart = ChartManager.disk_chart('disk_canvas');
        ChartManager.net_traffic_chart = ChartManager.net_chart('net_canvas', n);
        ChartManager.cpu_usage_chart.render()
        ChartManager.disk_usage_chart.render()
        ChartManager.net_traffic_chart.render()
    }
    static update_cpu_chart(chart,values){
        let datasets = []
        for(let i = 0; i < values.length; i++){
            while(chart.opts.series[i].data.length >= Settings.buffer_size){
                chart.opts.series[i].data.shift()
            }
            datasets.push({data:[values[i]]})
        }
        chart.appendData(datasets);
    }
    static update_disk_chart(chart, value){
        chart.opts.series[0] = value;
    }
    static update_net_chart(chart, values){
        let datasets = [{name: 'Sent',data: []}, {name: 'Recived',data: []}];
        for(let i=0; i<values.length; i+=2){
            datasets[0].data.push(values[i]);
            datasets[1].data.push(values[i+1]);
        }
        chart.updateSeries(datasets);
    }
}
class ServerConnection{
    static async sleep(){
        return new Promise(resolve => setTimeout(resolve, Settings.rate));
    }
    static async post(url, data = []){
        let response = await fetch(url , {
        method:'POST',
        cache:'no-cache',
        body:JSON.stringify(data),
        })
        return await response.json()
    }
    static async get(url){
        let response = await fetch(url , {
        method:'GET',
        cache:'no-cache',
        })
        return await response.json()
    }

    static async update(){
        while (run_switch.checked){
            if(window.location.pathname) {
                let new_data = await ServerConnection.get('/update');
                ChartManager.update_cpu_chart(ChartManager.cpu_usage_chart, new_data.cpu_usage);
                for (let i = 0; i < new_data.cpu_usage.length; i++) {
                    change_status(new_data.cpu_usage[i], "core "+i);
                }
                ChartManager.update_disk_chart(ChartManager.disk_usage_chart, new_data.disk_usage)
                ChartManager.update_net_chart(ChartManager.net_traffic_chart, Object.values(new_data.net_speed));
                await ServerConnection.sleep();
            }
        }
    }
}
//Functions
function change_status(core_value, core_name){
    let new_status = "success";
    let core = document.getElementById(core_name);
    if(core_value > Settings.danger_core_treshold){
        new_status = "danger";
    }else if(core_value > Settings.warning_core_treshold){
        new_status = "warning";
    }
    if(new_status != core.status){
        core.classList.replace("has-background-"+core.status, "has-background-"+new_status);
        core.status = new_status;
    }
}
function get_color(index){
    return valid_colors[index%valid_colors.length];
}
function start(){
    console.log("start");
}
//Events
adv_settings_switch.addEventListener(
    'click',
    () => {
        adv_settings_switch.classList.toggle("is-active");
        adv_settings_list.classList.toggle("is-hidden");
    }
);
settings_rate_switch.addEventListener(
    'click',
    () => {
        settings_rate_switch.classList.toggle("is-active");
        settings_rate_list.classList.toggle("is-hidden");
    }
);
for(element of document.getElementsByClassName('settings_rate_value')){
    element.addEventListener(
        'click',
        (event)=>{
            let value = event.target.innerHTML;
            Settings.rate = parseInt(value.replace('ms',''));
            settings_rate_list.classList.toggle('is-hidden');
            settings_rate_switch.classList.toggle('is-active');
        }
    )
}
for(element of document.getElementsByClassName('card-footer-item')){
    element.addEventListener(
        'click',
        (event)=>{
            let name = event.target.id.replace("hide-","");
            document.getElementById(name).classList.toggle('is-hidden');
        }
    )
}
document.getElementById('buffer_size_input').addEventListener(
    'change',
    (event) => {
        console.log(event.target.value)
        let value = event.target.value;
        if(value <= 1000 && value > 0)Settings.buffer_size = value;
    }    
);
document.getElementById('danger_core_input').addEventListener(
    'change',
    (event) => {
        console.log(event.target.value)
        let value = event.target.value;
        if(value <= 100 && value >= 0)Settings.danger_core_treshold = value;
    }    
);
document.getElementById('warning_core_input').addEventListener(
    'change',
    (event) => {
        console.log(event.target.value)
        let value = event.target.value;
        if(value <= 100 && value >= 0)Settings.warning_core_treshold = value;
    }    
);
run_switch.addEventListener(
    'click',
    () => {
        ServerConnection.update().then(()=>{console.log("update stopped")});
    }    
);
//main process
ChartManager.generate_charts();
ServerConnection.update().then(()=>{console.log("update stopped")});
