//global vars
const adv_settings_switch = document.getElementById("adv_settings_switch");
const adv_settings_list = document.getElementById("adv_settings_list");
const settings_rate_switch = document.getElementById("settings_rate_switch");
const settings_rate_list = document.getElementById("settings_rate_list");
const run_switch = document.getElementById('run_switch');
var remote_collected_data = {
    cpu_usage:[],
    net_traffic_recieved:[],
    net_traffic_sent:[],
    disk_usage:[],
    ram_usage:[],
    temp:[]
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
    static disk_usage_chart;
    static net_traffic_chart_recieved;
    static net_traffic_chart_send
    static net_usage_chart;
    static ram_usage_chart;
    static temp_chart;
    static cpu_chart(canvas_id, data, type = 'line', percentage = false){//dataset = {name, data}
        let yaxis = {}
        if(percentage)yaxis = {max:100, min:0}
        return new ApexCharts(document.getElementById(canvas_id), {
            chart: {type: type, height: '90%',
            animations: {enabled: false, easing: 'linear',},
            toolbar: {tools: {download: true,selection: false,zoom: true,zoomin: true,
                zoomout: true,pan: false,reset: false}},
            },
            stroke: {width: 3, curve: 'smooth'},
            series: data,
            xaxis: {labels:{show:false}},
            yaxis: yaxis
        });
    }
    static disk_chart(canvas_id){
        return new ApexCharts(document.getElementById(canvas_id), {
            chart: {height: "70%",type: 'radialBar'},
            plotOptions: {radialBar: {dataLabels: {
                name: {color: "hsl(0, 0%, 21%)",fontSize: "20px"},
                value: {color: "hsl(0, 0%, 21%)",fontSize: "18px",show: true}}}},
            series: remote_collected_data.disk_usage,
            colors: ["hsl(48, 100%, 67%)"],// bulma yellow
            labels: ['Used space'],
        });
    }
    static init_charts(){
        for (let f of document.getElementsByClassName('corename')) {
            remote_collected_data.cpu_usage.push({name:f.innerText,data:[]})
        }
        for(let f of document.getElementsByClassName('if-name')){
            remote_collected_data.net_traffic_sent.push({name:f.innerText,data:[]})
            remote_collected_data.net_traffic_recieved.push({name:f.innerText,data:[]})
        }
        for(let f of document.getElementsByClassName('thermal-name')){
            remote_collected_data.temp.push({name:f.innerText,data:[]})
        }
        ChartManager.cpu_usage_chart = ChartManager.cpu_chart('cpu_canvas', remote_collected_data.cpu_usage, 'line', true);
        ChartManager.disk_usage_chart = ChartManager.disk_chart('disk_canvas');
        ChartManager.net_traffic_chart_send = ChartManager.cpu_chart('net_canvas', remote_collected_data.net_traffic_sent);
        ChartManager.net_traffic_chart_recieved = ChartManager.cpu_chart('net_canvas2', remote_collected_data.net_traffic_recieved);
        ChartManager.temp_chart = ChartManager.cpu_chart('thermal_canvas', remote_collected_data.temp);
        ChartManager.ram_usage_chart = ChartManager.cpu_chart('ram_canvas', [{name:"ram used percentage",data:remote_collected_data.ram_usage}], 'area', true)
        ChartManager.disk_usage_chart.render();
        ChartManager.cpu_usage_chart.render();
        ChartManager.net_traffic_chart_send.render();
        ChartManager.net_traffic_chart_recieved.render();
        ChartManager.temp_chart.render();
        ChartManager.ram_usage_chart.render();
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
        while (run_switch.checked && window.location.pathname == "/"){
                let new_data = await ServerConnection.get('/update');
                for(let index of Object.keys(remote_collected_data.cpu_usage)){
                    push_with_buffersize(remote_collected_data.cpu_usage[index].data, new_data.cpu_usage[index])
                    change_status(new_data.cpu_usage[index], remote_collected_data.cpu_usage[index].name, Settings.danger_core_treshold, Settings.warning_core_treshold);
                }
                for(let inx = 0; inx < remote_collected_data.net_traffic_sent.length; inx++){
                    let se = remote_collected_data.net_traffic_sent[inx];
                    let re = remote_collected_data.net_traffic_recieved[inx];
                    push_with_buffersize(se.data, new_data.net_speed[se.name][0]);
                    push_with_buffersize(re.data, new_data.net_speed[re.name][1]);
                }
                for(let inx = 0; inx < remote_collected_data.temp.length; inx++){
                    let el = remote_collected_data.temp[inx];
                    push_with_buffersize(el.data, new_data.temp[el.name]);
                }
                push_with_buffersize(remote_collected_data.ram_usage, new_data.ram)
                push_with_buffersize(remote_collected_data.disk_usage, new_data.disk_usage);
                push_with_buffersize(remote_collected_data.ram_usage, new_data.ram);
                ChartManager.cpu_usage_chart.updateSeries(remote_collected_data.cpu_usage);
                ChartManager.temp_chart.updateSeries(remote_collected_data.temp);
                ChartManager.disk_usage_chart.updateSeries([new_data.disk_usage]);
                ChartManager.net_traffic_chart_send.updateSeries(remote_collected_data.net_traffic_sent);
                ChartManager.net_traffic_chart_recieved.updateSeries(remote_collected_data.net_traffic_recieved);
                ChartManager.ram_usage_chart.updateSeries([{name:"ram used percentage",data:remote_collected_data.ram_usage}]);
                await ServerConnection.sleep();
        }
    }
}
//Functions
function change_status(element_value, element_name, danger, warning, change = "has-background-", update_value = false){
    let new_status = "success";
    let element = document.getElementById(element_name);
    if(element_value > danger){
        new_status = "danger";
    }else if(element_value > warning){
        new_status = "warning";
    }
    if(new_status != element.dataset.status){
        element.classList.replace(change+element.dataset.status, change+new_status);
        element.dataset.status = new_status;
    }
    if(update_value)element.value = element_value;
}
function get_color(index){
    return valid_colors[index%valid_colors.length];
}
function start(){
    console.log("start");
}
function push_with_buffersize(arr, value){
    arr.push(value);
    let i = 0;
    let r = arr.length - Settings.buffer_size;
    try {
        while(arr.length > Settings.buffer_size){arr.shift();i++}
    } catch (error) {
        console.log(r, i);
    }
}
function names_of_objects(list){
    let names = []
    for(let inx = 0; inx < remote_collected_data.net_traffic.length; inx++)
    names.push(remote_collected_data.net_traffic[inx].name);
    return names;
}
function getCheckBox(id){
    if(document.getElementById(id) && document.getElementById(id).checked){
        return true;
    }else{
        return false;
    }
}
function generateTable(programs){
    programs = programs.proc
    let table = document.getElementById('process_table');
    //get fields to show
    let id = getCheckBox('checkbox_id');
    let name = getCheckBox('checkbox_name');
    let status = getCheckBox('checkbox_status');
    let username = getCheckBox('checkbox_username');
    let time = getCheckBox('checkbox_cputime');
    let perc = getCheckBox('checkbox_cpupercentage');
    //generate table header
    let html = "<thead><tr>"
    if(id) html+= '<th>ppid</th>'
    if(name) html+= '<th>name</th>'
    if(status) html+= '<th>status</th>'
    if(username) html+= '<th>username</th>'
    if(time) html+= '<th>cpu time</th>'
    if(perc) html+= '<th>cpu percentage</th>'
    html += '</tr></thead><tbody>'
    //generate table values
    for(let i=0; i<programs.length; i++){
        html += "<tr>"
        if(id) html+= '<td>'+programs[i].ppid+'</td>'
        if(name) html+= '<td>'+programs[i].name+'</td>'
        if(status) html+= '<td>'+programs[i].status+'</td>'
        if(username) html+= '<td>'+programs[i].username+'</td>'
        if(time) html+= '<td>'+programs[i].cpu_times+'</td>'
        if(perc) html+= '<td>'+programs[i].cpu_percent+'</td>'
        html += "</tr>"
    }
    html += "</tbody>"
    table.innerHTML = html;
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
document.getElementById('danger_thermal_input').addEventListener(
    'change',
    (event) => {
        console.log(event.target.value)
        let value = event.target.value;
        if(value <= 100 && value >= 0)Settings.danger_thermal_treshold = value;
    }    
);
document.getElementById('warning_thermal_input').addEventListener(
    'change',
    (event) => {
        console.log(event.target.value)
        let value = event.target.value;
        if(value <= 100 && value >= 0)Settings.warning_thermal_treshold = value;
    }    
);
if(window.location.pathname == "/process"){document.getElementById('searchbar').addEventListener(
    'input',
    (event) => {
        let word = event.target.value
        ServerConnection.get("/process?search="+word).then(generateTable)
        
    }
)}
run_switch.addEventListener(
    'click',
    () => {
        ServerConnection.update().then(()=>{console.log("update stopped")});
    }    
);
//main process
ChartManager.init_charts();
ServerConnection.update().then(()=>{console.log("update stopped")});
