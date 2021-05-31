from . import monitoring
from flask import Flask, render_template, request

app = Flask(__name__)
@app.route('/', methods = ['GET'])
def index():
    cores, ram, net, disk, term, env=monitoring.setup()
    return render_template("monitor.html", cores=cores,
     disk_size=disk,ram_size=ram, net_setup=net, thermal_setup=term,env=env)

@app.route('/update', methods = ['GET'])
def update():
    return monitoring.dynamic()

@app.route('/process', methods = ['GET','POST'])
def process():
    search_value = request.args.get('search_value',default=None, type=str)
    if search_value:
        return {'proc':monitoring.look_for_process(search_value)}
    else:
        return render_template("process.html")


