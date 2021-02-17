#include <iostream>
#include <string>
#include <map>
#include <vector>
//#include <python3.8/Python.h>

using namespace std;

bool is_init = false;
unsigned int cpu_core_count;
vector<double> cpu_freq_max;
vector<double> cpu_freq_min;
vector<double> cpu_term_max;

//data handling
string get_data_as_string(string cmd, unsigned int max_buffer = 64) {
  string data = "[";
  FILE * stream;
  char buffer[max_buffer];
  cmd.append(" 2>&1");
  stream = popen(cmd.c_str(), "r");
  if (stream) {
    while (!feof(stream))
      if (fgets(buffer, max_buffer, stream) != NULL){data.append(string(buffer)+",");}
    pclose(stream);
  }
  data += "]";
  return data;
}
vector<double> get_data_as_double(string cmd, unsigned int max_buffer = 32) {
  vector<double> data;
  FILE * stream;
  char buffer[max_buffer];
  cmd.append(" 2>&1");
  stream = popen(cmd.c_str(), "r");
  if (stream) {
    while (!feof(stream))
      if (fgets(buffer, max_buffer, stream) != NULL) data.push_back(stod(buffer));
    pclose(stream);
  }
  return data;
}
string vtos(vector<double> v){
  int count = v.size()-1;
  string data = "[";
  for (size_t i = 0; i < count; i++)
  {
    data.append(to_string(v[i])+",");
  }
  if(count > 0 )data.append(to_string(v[count])+",");
  data += "]";
  return data;
}
void data_init(){
    cpu_freq_max = get_data_as_double("cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_max_freq");
    cpu_freq_min = get_data_as_double("cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_min_freq");
    cpu_term_max = get_data_as_double("cat /sys/class/thermal/cooling_device*/max_state");
    cpu_core_count = cpu_freq_max.size();
    is_init = true;
}
//cpu function
string get_cpu_static_info(){
  string temp;
  string info = "{";
  temp = get_data_as_string("cat /proc/cpuinfo | grep 'vendor' | uniq");
  temp = temp.substr(temp.find(":")+2);
  temp = temp.substr(0, temp.length()-3);
  info += "\"vendor\":\""+temp+"\",";
  temp = get_data_as_string("cat /proc/cpuinfo | grep 'model name' | uniq");
  temp = temp.substr(temp.find(":")+2);
    temp = temp.substr(0, temp.length()-3);
  info += "\"name\":\""+temp+"\",";
  temp = get_data_as_string("cat /proc/cpuinfo | grep 'cache size' | uniq");
  temp = temp.substr(temp.find(":")+2);
  temp = temp.substr(0, temp.length()-3);
  info += "\"cache\":\""+temp+"\",";
  info += "\"core count\":\""+to_string(cpu_core_count)+"\",";
  info += "\"max freq\":\""+vtos(cpu_freq_max)+"\",";
  info += "\"min freq\":\""+vtos(cpu_freq_min)+"\",";
  info += "\"max term state\":\""+vtos(cpu_term_max)+"\",";
  //info += "name:\""+value+"\","
  info += "}";
  return info;
}
string get_cpu_usage(){
    string usage = "[";
    vector<double> cur = get_data_as_double("cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_cur_freq");
    if(is_init)
        for (size_t i = 0; i < cpu_core_count; i++)
            usage.append(to_string((cur[i]-cpu_freq_min[i])/(cpu_freq_max[i]-cpu_freq_min[i]))+",");
    usage += "]";
    return usage;
}
string get_cpu_cooling_state(){
    return get_data_as_string("cat /sys/class/thermal/cooling_device*/cur_state");
}
string get_cpu_temperature(){
    return get_data_as_string("cat /sys/class/thermal/thermal_zone*/temp");
}
//memory

//gpu
//net
//storage
int main(){
  data_init();
  cout<<get_cpu_static_info()<<endl;
  cout<<get_cpu_temperature()<<endl;
  cout<<get_cpu_cooling_state()<<endl;
  cout<<get_cpu_usage()<<endl;
  return 0;
}