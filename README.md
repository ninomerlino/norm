# Norm Online Remote Monitoring 

Norm allows you to monitor your computer basic statistics over the network it was created to have very light server side and a simple and easy to read client

## Install Norm

 1. From *Github* (Linux, Windows, IOS)
    - git clone https://github.com/ninomerlino/norm/

## Launch Norm

 1. Github installation (from inside norm folder):
    - python3 main.py FLAGS


 - -h [host] where **host** is the address of the device on the network you want norm available 
 > **note** : without the host specification norm will be available on all network the device is part of
 - -p [port] where **port** is the number of the port norm uses for his web service
 > **note** : without the port specification norm will use the 5000 port
 - -w if you wanna specify the number of workers, more than one is reccomended if you want to use multiple client at the same time
 - -ns to remove https protocol and use only http protocol
 > **note** : the information will be visible to all people in the lan

Norm client will be available on https://[*host*]:[*port*] or http://[*host*]:[*port*] when norm client uses https it certificates himself so your browser will very probably display a warning

## Norm features

On the norm client you can:
- Select the section you want to focus on *es: cpu, network, ram*
- Pause the monitoring by clicking the norm logo on the top
- Select which part of the graph you want to se
- change the sampling speed form 0.5*s* up to 2*s* 
- list all process in execution and filter them by pid, user, time of execution or command **ONLY on linux**
