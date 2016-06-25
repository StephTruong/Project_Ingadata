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
    'host': 'mongodb://localhost'
}
DATABASE_CONNECT_OPTIONS = {}