from sys import argv
from norm.routes import app
from werkzeug.serving import run_simple

def flag_check(flag : str, default):
    if flag in argv:
        i = argv.index(flag)
        if i+1 < len(argv) and not ('-' in argv[i+1]):
            return argv[i+1]
    return default
#flag check
host = flag_check('-h', '0.0.0.0')
port = flag_check('-p', 5000)
workers = flag_check('-w',1)
debug = False
if '-d' in argv:
    debug = True
if '-ns' in argv:
    ssl = None
else:
    ssl = 'adhoc'

run_simple(application=app, hostname=host, port=int(port), use_debugger=debug, ssl_context=ssl, processes=int(workers))