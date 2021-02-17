class Client{
    constructor(){
        this.fields = []
        this.data = []
        this.rate = 1000
        this.active = true
        this.buffer_size = 100
    }
    async listener(){
        while (this.active){
            let response = await fetch('/update')
            respone = await response.json()
            console.log(response)
            await this.sleep(this.buffer_size)
        }
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    error_alert(msg){
        
    }
    setup(){

    }
}

var client = Client()
client.listener()