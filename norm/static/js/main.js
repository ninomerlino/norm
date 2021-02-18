class Client{
    max_rate = 10000
    min_rate = 500
    constructor(){
        this.fields = []
        this.data = []
        this.rate = 1000
        this.active = true
        this.buffer_size = 100
        this.static_data = {}
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
        let static_vars = await this.post('/setup')
        this.static_data = static_vars
    }
    async listener(){
        while (this.active){
            if(this.data.push(await this.post('/update', this.fields)) > this.buffer_size)this.data.shift();
            let json = this.data[this.data.length-1]
            updateLastdata("cpu", json["cpu_usage"][0])
            let temps = ""
            for(let key in json["temp"]){
                temps += key + " = " + json["temp"][key]+"°C | "
            }
            updateLastdata("temps", temps)
            updateLastdata("ram", json["ram"]);
            let net = ""
            for(let key in json["net_speed"]){
                net += key + " = " + json["net_speed"][key]+" | "
            }
            updateLastdata("net", net);
            updateLastdata("disk", json["disk_usage"]);
            await this.sleep(this.rate)
        }
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    error_alert(msg){

    }
}

function toggle(idname, classname){
    document.getElementById(idname).classList.toggle(classname);
}
function updateLastdata(idname, value){
    document.getElementById(idname).innerText = idname + " : " + value;
}
function start_client(){
    var client = new Client()
    client.setup()
    client.listener()
}
