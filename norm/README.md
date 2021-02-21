# Norm Online Remote Monitoring 

Norm allows you to monitor your computer basic statistics over the network it was created to have very light server side and a simple and easy to read client

## Install Norm

//installation instruction

## Launch Norm

// launch instruction

 - -h [host] where **host** is the address of the device on the network you want norm available 
 > **note** : without the host specification norm will be available on all network the device is part of
 - -p [port] where **port** is the number of the port norm uses for his web service
 > **note** : without the port specification norm will use the 5000 port

Norm client will be available on http://[*host*]:[*port*] please notice norm uses **http** protocol, norm client uses https but it certificates himself so your browser will very probably display a warning

## Norm features

On the norm client you can:
- Select the section you want to focus on *es: cpu, network, ram*
- Pause the monitoring by clicking the norm logo on the top
- Select with part of the graph you want to se
- change the sampling speed form 2*s* up to 0.5*s* 