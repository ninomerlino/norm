import psutil

def cpu_usage():
    cpu = psutil.cpu_percent(0.3, percpu=True)
    return cpu

def cpu_freq():
    corelist = psutil.cpu_freq(percpu=True)
    output = {}
    i = 0
    while(i < corelist.lenght):#brutto ma for loop non funziona se i core sono uguali
        output[f"core {i}"] = [corelist[i][1], corelist[i][2]]
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
    output["temp"] = termal_sensors()
    return output

def dynamic() -> dict :
    output = {}
    output["cpu_usage"] = cpu_usage()
    output["temp"] = temp()
    output["ram"] = ram_usage()
    output["disk_usage"] = disk_usage()
    output["net_speed"] = net_speed()
    return output
