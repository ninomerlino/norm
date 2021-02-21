from sys import argv
from norm.routes import app

def flag_check(flag : str, default):
    if flag in argv:
        i = argv.index(flag)
        if i+1 < len(argv) and not ('-' in argv[i+1]):
            return argv[i+1]
    return default

host = flag_check('-h', '0.0.0.0')
port = flag_check('-p', 5000)
debug = False
if '-d' in argv:
    debug = True
app.run(host=host, port=int(port), debug=debug, ssl_context='adhoc')