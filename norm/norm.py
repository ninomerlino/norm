import json
from sys import argv
import monitoring
from flask import Flask, render_template, Request

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

def flag_check(flag : str, default):
    if flag in argv:
        i = argv.index(flag)
        if i+1 < len(argv) and not ('-' in argv[i+1]):
            return argv[i+1]
    return default

if __name__ == '__main__':
    host = flag_check('-h', '0.0.0.0')
    port = flag_check('-p', 8888)
    debug = False
    if '-d' in argv:
        debug = True
    app.run(host=host, port=int(port), debug=debug)
