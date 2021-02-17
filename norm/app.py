import json
import monitoring
from netifaces import AF_INET, AF_INET6, interfaces, ifaddresses
from flask import Flask, render_template, Request
from datetime import datetime

app = Flask(__name__)

@app.route('/', methods = ['GET'])
def index():
    return render_template("index.html")

@app.route('/update', methods = ['POST'])
def update():
    return json.dumps([1,2,3])

@app.route('/setup', methods = ['POST'])
def setup():
    return json.dumps(monitoring.setup())

def select_interface():
    index = 0
    inter_available = {}
    for name in interfaces():
        protocols = {}
        interface = ifaddresses(name)
        if AF_INET in interface.keys():
            protocols[AF_INET] = interface[AF_INET][0]['addr']
        if AF_INET6 in interface.keys():
            protocols[AF_INET6] = interface[AF_INET6][0]['addr']
    print("Select an interface to deploy norm")
    for name in inter_available:
        print(f"{index}) {name}")
        index += 1
    print(f"{index}) all")


if __name__ == '__main__':
    host = select_interface()
    app.run(host=host, port=8888)
