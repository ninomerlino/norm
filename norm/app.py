import netifaces, getpass, subprocess
from flask import Flask, render_template, Request
from datetime import datetime

app = Flask(__name__)

@app.route('/', methods = ['GET'])
def index():
    return render_template("index.html")

@app.route('/update', methods = ['POST'])
def update(request : Request):
    pass

def select_interface():
    index = 0
    print("Select an interface")
    inter_list = netifaces.interfaces()
    for name in inter_list:
        print(f"{index}) {name}")
        index += 1
    print(f"{index}) all")
    num = int(input())
    if num < index and num >= 0:
        print("Do you wanna use IPV6(y/n)")
        if input() == "y":
            return netifaces.ifaddresses(inter_list[num])[netifaces.AF_INET6][0]['addr']
        else:
            return netifaces.ifaddresses(inter_list[num])[netifaces.AF_INET][0]['addr']
    else:
        return '0.0.0.0'

if __name__ == '__main__':
    host = select_interface()
    app.run(host=host, port=8888)
