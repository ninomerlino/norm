import psutil
import platform
import subprocess

prev_data = {}
max_process_name = 100
hz_scale = ['MHz','GHz','THz']
byte_scale = ["byte", "KB","MB","GB","TB","PB"]
interface_names = []

def scale_hz(freq):
    i = 0
    while freq > 1000:
        freq /= 1000
        i += 1
    return str(freq) + hz_scale[i]

def scale_byte(size):
    i = 0
    while size > 1000:
        size /= 1000
        i += 1
    return str(round(size)) + byte_scale[i]

def env_info():
    system = platform.system()
    os = platform.node()
    if "Windows" in system:
        proc = platform.processor()
    elif "Linux" in system:
        cpuinfo = subprocess.Popen(["cat","/proc/cpuinfo"], stdout=subprocess.PIPE)
        model = subprocess.check_output(["grep","model\ name","-m1"], stdin=cpuinfo.stdout)
        proc = model.decode("utf-8").split(": ")[1][:-1]
        try: 
            cpuinfo = subprocess.Popen(["cat","/proc/cpuinfo"], stdout=subprocess.PIPE)
            vendor = subprocess.check_output(["grep","vendor_id","-m1"], stdin=cpuinfo.stdout)
            proc += " from " + vendor.decode("utf-8").split(": ")[1][:-1]
        except:
            pass
    elif "Darwin" in system:
        proc = "Do you use apple? Cringe bro"
    return {"OS":os, "system":system, "proc":proc} 

def cpu_usage():
    cpu = psutil.cpu_percent(percpu=True)#senza un intervallo conta le prestazioni dall'ultima chiamata
    return cpu

def cpu_freq():
    corelist = psutil.cpu_freq(percpu=True)
    output = {}
    i = 0
    while(i < len(corelist)):#brutto ma for loop non funziona se i core sono uguali
        output[f"core {i}"] = [scale_hz(corelist[i][1]),scale_hz(corelist[i][2])]
        i+=1
    return output

def termal_sensors():
    temp = psutil.sensors_temperatures()
    return list(temp.keys())

def temp():
    temp = psutil.sensors_temperatures()
    output = {}
    for key in temp.keys():
        output[key] = temp[key][0][1]
    return output

def ram_dimension():
    ram = psutil.virtual_memory()
    return scale_byte(ram[0])    

def ram_usage():
    ram = psutil.virtual_memory()
    return ram[2]

def net_addr():
    global interface_names
    interfaces = psutil.net_if_addrs()
    interface_names = list(interfaces.keys())
    output = {}
    for name in interface_names:
        output[name] = [interfaces[name][0][1],interfaces[name][0][2]]
    return output

def net_speed():#net speed ma in realta controlla il traffico
    global prev_data
    interfaces = psutil.net_io_counters(pernic=True,nowrap=False)
    output = {}
    for interface in interface_names:
        output[interface] = [interfaces[interface][2] - prev_data[interface]["sent"], interfaces[interface][3] - prev_data[interface]["recv"]]
        prev_data[interface]["sent"] = interfaces[interface][2]
        prev_data[interface]["recv"] = interfaces[interface][3]
    return output

def disk_dimension():
    disk = psutil.disk_usage("/")
    return scale_byte(disk[0])  

def disk_usage():
    disk = psutil.disk_usage("/")
    return disk[3]

def create_process_dict(string):
    col = list(filter(lambda x: x!='', string.strip().split(" ")))
    args = ""
    if len(col) > 4:
        args = " ".join(col[4:])
    return {'pid':col[0], 'user':col[1], 'time':col[2], 'cmd':col[3][:max_process_name], 'args':args}

def setup() -> dict :
    '''
    return cpu_cores, ram_size, net_addrs, disk_size
    termal_sensor, env_info
    '''
    global prev_data
    tmp = psutil.net_io_counters(pernic=True)
    for interface in tmp.keys(): #inizializa i valori di prev_data per ottenere la differenza di pacchetti e non il numero totale
        prev_data[interface] = {} 
        prev_data[interface]["sent"] = tmp[interface][2]
        prev_data[interface]["recv"] = tmp[interface][3]
    psutil.cpu_percent(percpu=True) #non sono pazzo ci serve qua
    return cpu_freq(), ram_dimension(), net_addr(), disk_dimension(), termal_sensors(), env_info()

def dynamic() -> dict :
    output = {}
    output["cpu_usage"] = cpu_usage()
    output["temp"] = temp()
    output["ram"] = ram_usage()
    output["disk_usage"] = disk_usage()
    output["net_speed"] = net_speed()
    return output

def process_list(proc_name):
    output = []
    if platform.system() == 'Linux':
        all_process = subprocess.check_output(["ps","-e","--format","pid,user,time,cmd"]).decode("UTF-8").split("\n")
        for process in all_process:
            if proc_name in process and process != '':
                output.append(create_process_dict(process))
    return output