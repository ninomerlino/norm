import psutil
import platform
import subprocess
from math import sqrt

process_keys = ['ppid','name','status','username','cpu_times','cpu_percent']
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

def resize_close_to_square(array):
    '''
    finds a and b where a*b = x and a is the closest int to
    the square root of x then rezise the list as a 2d array
    with a columns and b rows
    '''
    length = len(array)
    new_lenth = int(sqrt(length))+1
    output = []
    i = 0
    for r in range(new_lenth):
        output.append([])
        for c in range(new_lenth):
            if i < length:
                output[r].append(array[i])
            else:
                output[r].append(None)
            i += 1
    return output

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
    temp = list(temp.keys())
    return resize_close_to_square(temp)

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

def look_for_process(search_value = ''):
    if Device.environment['system'] == "Windows":
        process_keys.remove('ppid')
    process = psutil.process_iter(process_keys)
    output = []
    for p in process:
        p = p.info
        p['ppid'] = str(p['ppid'])
        p['cpu_percent'] = str(p['cpu_percent'])
        p['cpu_times'] = str(sum(p['cpu_times']))
        phash = "\n".join(p.values())
        if search_value in phash:
            output.append(p)
    return output
    

def bootMonitor():
    '''
    init the monitor module
    '''
    global prev_data
    tmp = psutil.net_io_counters(pernic=True)
    for interface in tmp.keys(): #inizializa i valori di prev_data per ottenere la differenza di pacchetti e non il numero totale
        prev_data[interface] = {} 
        prev_data[interface]["sent"] = tmp[interface][2]
        prev_data[interface]["recv"] = tmp[interface][3]
    psutil.cpu_percent(percpu=True) #non sono pazzo ci serve qua

def dynamic() -> dict :
    output = {}
    output["cpu_usage"] = cpu_usage()
    output["temp"] = temp()
    output["ram"] = ram_usage()
    output["disk_usage"] = disk_usage()
    output["net_speed"] = net_speed()
    return output

class Device:
    cores = cpu_freq()
    ram_size = ram_dimension()
    net_interfaces = net_addr()
    disk_size = disk_dimension()
    thermal_sensors = termal_sensors()
    environment = env_info()


bootMonitor()