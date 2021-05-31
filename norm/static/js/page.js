//global vars
const adv_settings_switch = document.getElementById("adv_settings_switch");
const adv_settings_list = document.getElementById("adv_settings_list");
const settings_rate_switch = document.getElementById("settings_rate_switch");
const settings_rate_list = document.getElementById("settings_rate_list");
const run_switch = document.getElementById('run_switch');
var remote_collected_data = {
    cpu_usage:[],
    net_traffic:[],
    disk_usage:[],
    ram_usage:[],
    temp:{}
}
//classes
class Settings{
    static rate = 1000;
    static buffer_size = 100;
    static danger_core_treshold = 90;
    static warning_core_treshold = 70;
}
class ChartManager{
    static cpu_usage_chart;
    static cpu_detail_chart;
    static disk_usage_chart;
    static net_traffic_chart;
    static render_charts(){
        ChartManager.cpu_detail_chart.render();
        ChartManager.disk_usage_chart.render();
        ChartManager.cpu_usage_chart.render();
        ChartManager.net_traffic_chart.render();
    }
    static cpu_chart(canvas_id, canvas_id2){//dataset = {name, data}
        ChartManager.cpu_detail_chart = new ApexCharts(document.getElementById(canvas_id), {
            chart: {id:"cpu",type: 'line', height: '60%',
            animations: {enabled: false, easing: 'linear',},
            toolbar: {tools: {download: true,selection: false,zoom: false,zoomin: false,
                zoomout: false,pan: false,reset: false}},
            },
            stroke: {width: 3, curve: 'smooth'},
            series: remote_collected_data.cpu_usage,
            xaxis: {labels:{show:false}},
        });
        ChartManager.cpu_usage_chart = new ApexCharts(document.getElementById(canvas_id2), {
            chart: {id:"cpu2",type: 'line', height: '40%',
            animations: {enabled: true, easing: 'linear',},
            toolbar: {show: false},
            brush:{target: "cpu",enabled: true},
            selection: {enabled: true, xaxis: {min: 1,max: 30}},
            },
            stroke: {width: 3, curve: 'smooth'},
            series: remote_collected_data.cpu_usage,
            xaxis: {labels:{show:false}},
        });
    }
    static disk_chart(canvas_id){
        ChartManager.disk_usage_chart = new ApexCharts(document.getElementById(canvas_id), {
            chart: {height: "70%",type: 'radialBar'},
            plotOptions: {radialBar: {dataLabels: {
                name: {color: "hsl(0, 0%, 21%)",fontSize: "20px"},
                value: {color: "hsl(0, 0%, 21%)",fontSize: "18px",show: true}}}},
            series: remote_collected_data.disk_usage,
            colors: ["hsl(48, 100%, 67%)"],// bulma yellow
            labels: ['Used space'],
        });
    }
    static net_chart(canvas_id){
        let datasets = [{name: 'Recived',data: []}, {name: 'Sent',data: []}];
        ChartManager.net_traffic_chart = new ApexCharts(document.getElementById(canvas_id), {
            series:datasets,
            chart: {height: "90%", type: 'bar',animations: {enabled: true, easing: 'linear',},},
            xaxis: {categories: names_of_objects(remote_collected_data.net_traffic)},
            yaxis: {show:false},
        });
    }
    static init_charts(){
        for (let f of document.getElementsByClassName('corename')) {
            remote_collected_data.cpu_usage.push({name:f.innerText,data:[]})
        }
        for(let f of document.getElementsByClassName('if-name')){
            remote_collected_data.net_traffic.push({name:f.innerText,data:[]})
        }
        ChartManager.cpu_chart('cpu_canvas', 'cpu_canvas2');
        ChartManager.disk_chart('disk_canvas');
        ChartManager.net_chart('net_canvas');
        ChartManager.render_charts();
    }
    static update_net_chart(data){
        let datasets = [{name: 'Sent',data: []}, {name: 'Received',data: []}];
        for(let name of names_of_objects(remote_collected_data.net_traffic)){
            datasets[0].data.push(data[name][0]);
            datasets[1].data.push(data[name][1]);
        }
        ChartManager.net_traffic_chart.updateSeries(datasets);
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
            if(window.location.pathname == "/") {
                let new_data = await ServerConnection.get('/update');
                for(let inx = 0; inx < remote_collected_data.cpu_usage.length; inx++){
                    push_with_buffersize(remote_collected_data.cpu_usage[inx].data, new_data.cpu_usage[inx])
                }
                for(let inx = 0; inx < remote_collected_data.net_traffic.length; inx++){
                    let el = remote_collected_data.net_traffic[inx]
                    push_with_buffersize(el.data, new_data.net_speed[el.name])
                }
                push_with_buffersize(remote_collected_data.disk_usage, new_data.disk_usage);
                push_with_buffersize(remote_collected_data.ram_usage, new_data.ram);
                ChartManager.cpu_usage_chart.updateSeries(remote_collected_data.cpu_usage);
                ChartManager.cpu_detail_chart.updateSeries(remote_collected_data.cpu_usage);
                ChartManager.disk_usage_chart.updateSeries([new_data.disk_usage]);
                ChartManager.update_net_chart(new_data.net_speed);
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
function push_with_buffersize(arr, value){
    arr.push(value);
    while(arr.length > Settings.buffer_size)arr.shift();
}
function names_of_objects(list){
    let names = []
    for(let inx = 0; inx < remote_collected_data.net_traffic.length; inx++)
    names.push(remote_collected_data.net_traffic[inx].name);
    return names;
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
            Settings.rate = parseFloat(value)*1000;
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
ChartManager.init_charts();
ServerConnection.update().then(()=>{console.log("update stopped")});
