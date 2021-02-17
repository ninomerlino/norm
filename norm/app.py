import subprocess

from flask import render_template
from flask import Flask
app = Flask(__name__)

@app.route('/')
def norm():
    s = subprocess.run("../linux_monitoring/debug.out", capture_output=True)
    return s.stdout

@app.route('/index')
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run()

