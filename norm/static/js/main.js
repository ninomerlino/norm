class Client{
    max_rate = 10000
    min_rate = 500
    constructor(){
        this.data = []
        this.rate = 1000
        this.active = true
        this.buffer_size = 100
        this.static_data = {}
        this.cpu_Graph = null
    }
    async post(url, data = []){
        let response = await fetch(url , {
        method:'POST',
        cache:'no-cache',
        body:JSON.stringify(data),
        })
        return await response.json()
    }
    setup(){
        this.post('/setup').then(resolve => this.static_data)
        this.create_graph()
    }
    async listener(){
        while (this.active){
            if(this.data.push(await this.post('/update')) > this.buffer_size)this.data.shift();
            let json = this.data[this.data.length-1]
            updateLastdata("cpu", json["cpu_usage"][0]+"%")
            let temps = ""
            for(let key in json["temp"]){
                temps += key + " = " + json["temp"][key]+"°C "
            }
            updateLastdata("temps", temps)
            updateLastdata("ram", json["ram"]+"%");
            let net = ""
            for(let key in json["net_speed"]){
                net += key + " = " + json["net_speed"][key]+" "
            }
            updateLastdata("net", net)
            updateLastdata("disk", json["disk_usage"]+"%")
            this.update_graph(parseInt(this.cpu_Graph, json["cpu_usage"][0]))
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
        let tile = document.getElementsByClassName("is-parent")[index];
        tile.classList.toggle("is-hidden")
    }

    create_graph(){
        let ctx = document.getElementById('cpu_graph').getContext('2d')
        this.cpu_Graph = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: '% cpu usage',
                    data: [],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                    ],
                    borderWidth: 9,
                    fill: false
                }]
            },
            options : {responsive: true}
        })
    }

    update_graph(graph, point){
        graph.data.datasets[0].data.push(point)
        graph.data.labels.push("")
        graph.update()
    }
}
function toggle(idname, classname){
    document.getElementById(idname).classList.toggle(classname);
}
function updateLastdata(idname, value){
    document.getElementById(idname).innerText = idname + " : " + value;
}
function start_client(){
    client = new Client()
    client.setup()
    client.listener()
}
