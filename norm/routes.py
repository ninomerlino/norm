from .monitoring import dynamic, look_for_process, Device
from flask import Flask, render_template, request

app = Flask(__name__)
@app.route('/', methods = ['GET'])
def index():
    return render_template("monitor.html", cores=Device.cores,
     disk_size=Device.disk_size,ram_size=Device.ram_size,
      net_setup=Device.net_interfaces, thermal_setup=Device.thermal_sensors,env=Device.environment)

@app.route('/update', methods = ['GET'])
def update():
    return dynamic()

@app.route('/process', methods = ['GET'])
def process():
    search_value = request.args.get('search',default=None, type=str)
    if search_value:
        return {'proc':look_for_process(search_value)}
    else:
        return render_template("process.html",env=Device.environment)


