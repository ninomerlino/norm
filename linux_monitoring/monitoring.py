import psutil

def cpu_usage():
    cpu = psutil.cpu_freq(percpu=True)
    output = []
    for core in cpu:
        output.append((core[0]-core[1])*100/(core[2]-core[1]))
    return output

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

def ram():
    ram = psutil.virtual_memory()
    output = {"total":ram[0], "used":ram[3], "percent":ram[2]}
    return output

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

def disk_usage():
    disk = psutil.disk_usage("/")
    print(disk)
    output = {"total":disk[0], "used":disk[1], "percent":disk[3]}
    return output

def non_lo_so(args):
    output = {}

    if "cpu_usage" in args:
        output["cpu_usage"] = cpu_usage()
    if "cpu_freq" in args:
        output["cpu_freq"] = cpu_freq()
    if "temp" in args:
        output["temp"] = temp()
    if "ram" in args:
        output["ram"] = ram()
    if "net_addr" in args:
        output["net_addr"] = net_addr()
    if "net_speed" in args:
        output["net_speed"] = net_speed()
    if "disk_usage" in args:
        output["disk_usage"] = disk_usage()

    return output
