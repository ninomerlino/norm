# Norm Online Remote Monitoring 

Norm allows you to monitor your computer basic statistics over the network it was created to have very light server side and a simple and easy to read client

 - -h [host] where **host** is the address of the device on the network you want norm available 
 > **note** : without the host specification norm will be available on all network the device is part of
 - -p [port] where **port** is the number of the port norm uses for his web service
 > **note** : without the port specification norm will use the 5000 port
 - -w if you wanna specify the number of workers, more than one is reccomended if you want to use multiple client at the same time
 - -ns to remove https protocol and use only http protocol

Norm client will be available on https://[*host*]:[*port*] or http://[*host*]:[*port*] when norm client uses https it certificates himself so your browser will very probably display a warning

## Norm features

On the norm client you can:
- Monitor cpu usage per core, ram usage, used space in disk, network traffic per nic, thermal sensors temperatures
- Hide charts you don't want to see
- Save chart as png or svg
- Sampling speed from *1s* to *5s*
- list all process in execution and filter them by id, user, time of execution, name or cpu usage
- click on process to get all details about it

## Install Norm

 1. From *Github* (Linux, Windows, IOS):
    - git clone https://github.com/ninomerlino/norm/

 1. From *.deb* package:
   - download the .deb package from the releases and install it

## Launch Norm

 1. Github installation (from inside norm folder):
    - python3 main.py FLAGS

 1. From *.deb* package:
    - norm FLAGS