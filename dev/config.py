DEBUG = True
 
##
# Define application directory
##
import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

##
# Application threads
##
THREADS_PER_PAGE = 2

# Define the database connections
MONGODB_SETTINGS = {
	'db': 'AURORA01',
    'host': 'mongodb://127.0.0.1:27017/'
}
SECRET_KEY="12345"
DATABASE_CONNECT_OPTIONS = {}