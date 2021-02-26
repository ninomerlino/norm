from getpass import getpass
from random import choices
from string import printable

class LoginManager():
    safe_browser = True
    registed_cookies = {}
    key_lenght = 64

    @staticmethod
    def generate_key() -> str :
        return "".join(choices(printable, LoginManager.key_lenght))

    @staticmethod
    def add_client(client_addr : str) -> str :
        key = LoginManager.generate_key()
        LoginManager.registed_cookies[client_addr] = key
        return key

    @staticmethod
    def has_login(client_addr : str, client_key : str) -> bool:
        if LoginManager.safe_browser:
            key = getattr(LoginManager.registed_cookies, client_addr, None)
            if key != None and key == client_key:
                return True
            else:
                return False
        else:
            return True

    @staticmethod
    def remove_client(client_addr: str):
        if getattr(LoginManager.registed_cookies, client_addr, None) != None:
            del LoginManager.registed_cookies[client_addr]

def setup_client_idetification():
    not_ready = True
    while not_ready:
        print("Please set up a password for the client, if no password is given the default password will be \"norm\"")
        client_pass = getpass()
        if client_pass == '':
            return 'norm'
        print("Confirm client password")
        not_ready = (client_pass != getpass())
        if not_ready:
            print("passwords don't match")
    return client_pass
