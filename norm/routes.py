from . import monitoring
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods = ['GET'])
def index():
    print()
    return render_template("index.html")

@app.route('/update', methods = ['POST'])
def update():
    return monitoring.dynamic()

@app.route('/setup', methods = ['POST'])
def setup():
    return monitoring.setup()
    