class ColorGenerator{
    static jump = 200;
    static last_color = 255;
    static max_color = 16777215;
    static get_new_color(){
        if (ColorGenerator.last_color + ColorGenerator.jump > ColorGenerator.max_color)ColorGenerator.reset();
        else ColorGenerator.last_color += ColorGenerator.jump;
        return "#" + ColorGenerator.last_color.toString(16);
    }
    static reset(){
        ColorGenerator.last_color = 255;
    }
}
class Client{
    static max_rate = 10000
    static min_rate = 500
    constructor(){
        this.rate = 1000
        this.active = true
        this.buffer_size = 20 
        this.static_data = {}
        this.cpu_Graph = null
        this.ram_Graph = null
        this.net_Graph = null
        this.ram_Graph = null
        this.disk_Graph = null
    }
    async post(url, data = []){
        let response = await fetch(url , {
        method:'POST',
        cache:'no-cache',
        body:JSON.stringify(data),
        })
        return await response.json()
    }
    async setup(){
        this.static_data = await this.post('/setup')
        this.cpu_Graph = this.create_line_graph('cpu_graph', Object.keys(client.static_data.cpu))
        this.ram_Graph = this.create_line_graph('ram_graph', ["ram"], true)
        this.net_Graph = this.create_line_graph('net_graph', Object.keys(this.static_data.net))
        this.temp_Graph = this.create_line_graph('temp_graph', this.static_data.temp)
        this.disk_Graph = this.create_pie_graph('disk_graph', ["used","free"], ["orange", "green"])
    }
    async listener(){
        while (this.active){
            let json = await this.post('/update')
            this.update_graph(this.cpu_Graph,json["cpu_usage"].map(val => parseFloat(val)))
            this.update_graph(this.ram_Graph, [parseFloat(json["ram"])])
            this.update_graph(this.net_Graph, Object.values(json["net_speed"]).map(val => parseFloat(val)))
            this.update_graph(this.temp_Graph, Object.values(json["temp"]).map(val => parseFloat(val)))
            this.disk_Graph.data.datasets[0].data = [parseFloat(json["disk_usage"]), 100-parseFloat(json["disk_usage"])] 
            this.disk_Graph.update()
            await this.sleep(this.rate)
        }
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async toggle_field(index){
        let btn = document.getElementById("selector").children[index];
        btn.classList.toggle("is-outlined");
        btn.classList.toggle("is-danger");
        btn.classList.toggle("is-success");
        let tile = document.getElementsByClassName("section")[index];
        tile.classList.toggle("is-hidden")
    }

    create_line_graph(ctx_id, sets_name, fill = false){
        let ctx = document.getElementById(ctx_id).getContext('2d')
        let sets = []
        sets_name.forEach(name => {
            sets.push({label: name,data: [],
                backgroundColor: ['rgba(0,0,0,0)'],
                borderColor: [ColorGenerator.get_new_color()],
                borderWidth: 3,
                fill: fill
            })
        });
        let options = {
            responsive: true,
            elements: {line: {tension: 0}},
        }
        ColorGenerator.reset()
        return new Chart(ctx, {type: "line", data: {datasets:sets,},options : options})
    }

    create_pie_graph(ctx_id, sets_name, colors){
        let ctx = document.getElementById(ctx_id).getContext('2d')
        let sets = []
        sets_name.forEach(name => {
            sets.push({label: name,data: [],
                backgroundColor: [colors.shift()],
                borderWidth: 1,
            })
        });
        return new Chart(ctx, {type: "doughnut",data: {datasets:sets,},
            options : {responsive: true, rotation: 1 * Math.PI, circumference: 1 * Math.PI,}
        })
    }

    update_graph(graph, values){
        for(let x = 0; x < values.length; x++){
            graph.data.datasets[x].data.push(values[x])}
        graph.data.labels.push("")
        if(graph.data.datasets[0].data.length > this.buffer_size){
            graph.data.datasets.forEach( set => { set.data.shift()})
            graph.data.labels.shift("")}
        graph.update()
    }
    generate_cpu_core(){

    }
}
//indipendent function
function toggle(idname, classname){
    document.getElementById(idname).classList.toggle(classname);
}
function updateLastdata(idname, value){
    document.getElementById(idname).innerText = idname + " : " + value;
}
function randColor(){
    let color = "";
    while (color == reserved_color || color == "") {
        color = "#" + Math.floor(Math.random()*16777215).toString(16);
    }
    return color;
}
var client;
async function start_client(){
    client = new Client()
    await client.setup()
    client.listener()
}
