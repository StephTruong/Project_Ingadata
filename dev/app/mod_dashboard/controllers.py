# Import flask dependencies
from flask import Blueprint, request, render_template, \
                  flash, g, session, redirect, url_for, \
                  jsonify
import flask.ext.login as flask_login
from app import app
import json
import models


# Define the blueprint: 'dashboard', set its url prefix: app.url/dashboard
mod_dashboard = Blueprint('dashboard', __name__, url_prefix='/dashboard')


@mod_dashboard.before_request
def make_session_permanent():
    session.permanent = True

# Set the route and accepted methods
# dashboard page
@mod_dashboard.route('/', methods=['GET', 'POST'])
def dashboard():
    return render_template("dashboard/index.html")

@mod_dashboard.route('/test/', methods=['GET', 'POST'])
def test_dashboard():
    return render_template("dashboard/index3.html")

# @app.route('/login', methods=['GET', 'POST'])
# def login():
#     if flask.request.method == 'GET':
#         return '''
#                <form action='login' method='POST'>
#                 <input type='text' name='email' id='email' placeholder='email'></input>
#                 <input type='password' name='pw' id='pw' placeholder='password'></input>
#                 <input type='submit' name='submit'></input>
#                </form>
#                '''

#     email = flask.request.form['email']
#     if flask.request.form['pw'] == users[email]['pw']:
#         user = User()
#         user.id = email
#         flask_login.login_user(user)
#         return flask.redirect(flask.url_for('protected'))

#     return 'Bad login'


# @app.route('/protected')
# @flask_login.login_required
# def protected():
#     return 'Logged in as: ' + flask_login.current_user.id

# @app.route('/logout')
# def logout():
#     flask_login.logout_user()
#     return 'Logged out'