import psutil

def cpu_usage():
    cpu = psutil.cpu_percent(0.3, percpu=True)
    return cpu

def cpu_freq():
    cpu = psutil.cpu_freq()
    output = {"max":cpu[2], "min":cpu[1]}
    return output

def temp():
    temp = psutil.sensors_temperatures()
    output = {}
    for key in temp.keys():
        output[key] = temp[key][0][1]
    return output

def ram_dimension():
    ram = psutil.virtual_memory()
    return ram[0]    

def ram_usage():
    ram = psutil.virtual_memory()
    return ram[2]

def net_addr():
    interfaces = psutil.net_if_addrs()
    output = {}
    for interface in interfaces.keys():
        output[interface] = interfaces[interface][0][1]
    return output

def net_speed():
    interfaces = psutil.net_if_stats()
    output = {}
    for interface in interfaces.keys():
        output[interface] = interfaces[interface][2]
    return output

def disk_dimension():
    disk = psutil.disk_usage("/")
    return disk[0]  

def disk_usage():
    disk = psutil.disk_usage("/")
    return disk[3]

def setup() -> dict :
    output = {}
    output['cpu'] = cpu_freq()
    output['ram'] = ram_dimension()
    output['net'] = net_addr()
    output['disk'] = disk_dimension()
    return output

def dynamic(args) -> dict :
    output = {}
    if "cpu" in args:
        output["cpu_usage"] = cpu_usage()
    if "temp" in args:
        output["temp"] = temp()
    if "ram" in args:
        output["ram"] = ram_usage()
    if "net" in args:
        output["net_speed"] = net_speed()
    if "disk" in args:
        output["disk_usage"] = disk_usage()
    return output
