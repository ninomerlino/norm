from . import monitoring
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods = ['GET'])
def index():
    canvas = "20%"
    if "mobile" in request.headers['user-agent'].lower():
        canvas = "40%"
    return render_template("index2.html", canvas_height=canvas)

@app.route('/process', methods = ['GET','POST'])
def process():
    if request.method == 'GET':
        return render_template("process.html")
    else:
        process_name = request.data.decode('UTF-8')
        print(process_name)
        return {'proc':monitoring.process_list(process_name)}

@app.route('/update', methods = ['POST'])
def update():
    return monitoring.dynamic()

@app.route('/setup', methods = ['POST'])
def setup():
    return monitoring.setup()
