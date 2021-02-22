async function request_process(name){
    let response = await fetch(window.location.pathname , {
    method:'POST',
    cache:'no-cache',
    body:name,
    })
    return await response.json()
}
async function generate_table(list){
    html = ""
    list.shift()
    list.forEach(proc => {
        html += "<tr><td>"+proc.pid+"</td><td>"+proc.user+"</td><td>"+proc.time+"</td><td>"+proc.cmd+"</td></tr>"
    });
    document.getElementById("process_list").innerHTML = html;
}
async function search_process(value){
    search_bar.classList.add("is-loading")
    let list = (await request_process(value)).proc
    if(list.length == 0)search_bar.classList.add("is-danger")
    else{await generate_table(list);search_bar.classList.remove("is-danger")}
    search_bar.classList.remove("is-loading")
}
var search_bar = null
function start_page(){
    search_bar = document.getElementById("search_bar")
    search_process("")
    search_bar.addEventListener('input', function (){search_process(this.value)})
}