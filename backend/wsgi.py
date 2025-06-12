import sys
import os


path = '/home/Sam1304/mysite/backend' 
if path not in sys.path:
    sys.path.append(path)

from app import app as application # 'application' is the name PythonAnywhere expects