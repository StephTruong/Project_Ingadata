# Import flask and template operators
from flask import Flask, render_template, request, redirect 
from flask.ext.mongoengine import MongoEngine, MongoEngineSessionInterface
from flask.ext.login import LoginManager
from flask.ext.bcrypt import Bcrypt
import os

# Define the WSGI application object
app = Flask(__name__)

# Configurations
app.config.from_object('config')

# Sample HTTP error handling
@app.errorhandler(404)
def not_found(error):
    #return render_template('404.html'), 404
    return "Oops!! It's 404. Page doesn't exist."

# # database connection
# app.config['MONGODB_SETTINGS'] = {'HOST':os.environ.get('MONGOLAB_URI'),'DB': 'FlaskLogin'}
# app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
# app.debug = os.environ.get('DEBUG',False)

db = MongoEngine(app) # connect MongoEngine with Flask App
app.session_interface = MongoEngineSessionInterface(db) # sessions w/ mongoengine

# Flask BCrypt will be used to salt the user password
flask_bcrypt = Bcrypt(app)

# Associate Flask-Login manager with current app
login_manager = LoginManager()
login_manager.session_protection = 'strong'
login_manager.login_view = 'login'
login_manager.init_app(app)



# Import a module / component using its blueprint handler variable (mod_auth)
from app.mod_home.controllers import mod_home as auth_home

# Register blueprint(s)
app.register_blueprint(auth_home)

# Import a module / component using its blueprint handler variable (mod_dashboard)
from app.mod_dashboard.controllers import mod_dashboard as auth_dashboard

# Register blueprint(s)
app.register_blueprint(auth_dashboard)

# Import a module / component using its blueprint handler variable (mod_login)
from app.mod_login.controllers import mod_login as auth_login

# Register blueprint(s)
app.register_blueprint(auth_login)


