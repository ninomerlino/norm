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
        console.log(static_vars)
    }
    async listener(){
        while (this.active){
            if(this.data.push(this.post('/update', this.fields)) > this.buffer_size)this.data.shift();
            await this.sleep(this.rate)
        }
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    error_alert(msg){

    }
}
$(document).ready(
    function(){
        var client = new Client()
        client.setup()
        //client.listener()
    }
)