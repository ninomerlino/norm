from . import monitoring
from json import loads
from flask import Flask, render_template, request

app = Flask(__name__)
@app.route('/', methods = ['GET'])
def index():
    cores, ram, net, disk, term, env=monitoring.setup()
    return render_template("monitor.html", cores=cores,
     disk_size=disk,ram_size=ram, net_setup=net, thermal_setup=term,env=env)

@app.route('/process', methods = ['GET','POST'])
def process():
    if request.method == 'GET':
        return render_template("process.html")
    else:
        process_name = loads(request.data)
        print(process_name)
        return {'proc':monitoring.process_list(process_name)}

@app.route('/update', methods = ['GET'])
def update():
    return monitoring.dynamic()

