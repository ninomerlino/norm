class Client{
    max_rate = 10000
    min_rate = 500
    constructor(){
        this.data = []
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
        this.cpu_Graph = this.create_line_graph('cpu_graph', ["core 0"])
        this.ram_Graph = this.create_line_graph('ram_graph', ["ram"])
        this.net_Graph = this.create_line_graph('net_graph', Object.keys(this.static_data["net"]))
        this.temp_Graph = this.create_line_graph('temp_graph', Object.keys(this.static_data["net"]))
        this.disk_Graph = this.create_pie_graph('disk_graph', ["disk"])
        this.disk_Graph.data.labels = ["used","free"]
    }
    async listener(){
        while (this.active){
            if(this.data.push(await this.post('/update')) > this.buffer_size)this.data.shift();
            let json = this.data[this.data.length-1]

            this.update_graph(this.cpu_Graph, [parseFloat(json["cpu_usage"][0])])
            this.update_graph(this.ram_Graph, [parseFloat(json["ram"])])
            let net = []
            for(let key in json["net_speed"]){
                net.push(parseFloat(json["net_speed"][key]))
            }
            this.update_graph(this.net_Graph, net)
            let temps = []
            for(let key in json["temp"]){
                temps.push(parseFloat(json["temp"][key]))
            }
            this.update_graph(this.temp_Graph, temps)
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

    create_line_graph(ctx_id, sets_name){
        let ctx = document.getElementById(ctx_id).getContext('2d')
        let sets = []
        sets_name.forEach(name => {
            sets.push({label: name,data: [],
                backgroundColor: ['rgba(0, 0, 0, 0)',],
                borderColor: [randColor()],
                borderWidth: 3,
                fill: false
            })
        });
        let options = {
            responsive: true,
            animation: {duration: 0},
            hover: {animationDuration: 0},
            responsiveAnimationDuration: 0,
        }
        return new Chart(ctx, {type: "line", data: {datasets:sets,},options : options})
    }

    create_pie_graph(ctx_id, sets_name){
        let ctx = document.getElementById(ctx_id).getContext('2d')
        let sets = []
        sets_name.forEach(name => {
            sets.push({label: name,data: [],
                backgroundColor: [randColor()],
                borderWidth: 3,
            })
        });
        return new Chart(ctx, {type: "pie",data: {datasets:sets,},options : {responsive: true}})
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
}
function toggle(idname, classname){
    document.getElementById(idname).classList.toggle(classname);
}
function updateLastdata(idname, value){
    document.getElementById(idname).innerText = idname + " : " + value;
}
function randColor(){
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}
function getTime(){
    return new Date.now().getUTCSeconds();
}
async function start_client(){
    client = new Client()
    await client.setup()
    client.listener()
}
