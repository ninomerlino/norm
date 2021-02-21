# Norm Online Remote Monitoring 

Norm allows you to monitor your computer basic statistics over the network it was created to have very light server side and a simple and easy to read client

## Install Norm

//installation instruction

## Launch Norm

 - Linux (from inside norm folder):
    - python3 main.py FLAGS
 - Windows (from inside norm folder):
    - python main.py FLAGS

 - -h [host] where **host** is the address of the device on the network you want norm available 
 > **note** : without the host specification norm will be available on all network the device is part of
 - -p [port] where **port** is the number of the port norm uses for his web service
 > **note** : without the port specification norm will use the 5000 port
<<<<<<< HEAD
 - -ns to remove https protocol and use only http protocol
 > **note** : the information will be visible to all people in the lan if -ns is present
=======
 - -w if you wanna specify the number of workers, more than one is reccomended if you want to use multiple client at the same time
 - -ns to remove https protocol and use only http protocol
 > **note** : the information will be visible to all people in the lan
>>>>>>> 3e3823d5ceaa8f7dbb2e7e59da9734cdfcbb8aec

Norm client will be available on https://[*host*]:[*port*] or http://[*host*]:[*port*] please notice norm uses **http** protocol, norm client uses https but it certificates himself so your browser will very probably display a warning

## Norm features

On the norm client you can:
- Select the section you want to focus on *es: cpu, network, ram*
- Pause the monitoring by clicking the norm logo on the top
- Select with part of the graph you want to se
- change the sampling speed form 0.5*s* up to 2*s* 