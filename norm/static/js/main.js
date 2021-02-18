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
            var json = this.data[this.data.length-1]
            $("#cpu").html("cpu_usage = "+json["cpu_usage"][0])
            var temps = ""
            for(var key in json["temp"]){
                temps += key + " = " + json["temp"][key]+"°C | "
            }
            $("#temps").html("temps: "+temps)
            $("#ram").html("ram: "+json["ram"]+"%")
            var net = ""
            for(var key in json["net_speed"]){
                net += key + " = " + json["net_speed"][key]+" | "
            }
            $("#net").html("intefaces: "+net)
            $("#disk").html("disk usage: "+json["disk_usage"]+"%")
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

function start_client(){
    var client = new Client()
    client.setup()
}
