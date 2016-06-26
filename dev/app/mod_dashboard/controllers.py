# Import flask dependencies
from flask import Blueprint, request, render_template, \
                  flash, g, session, redirect, url_for, \
                  jsonify
from flask.ext.login import (current_user, login_required, login_user, logout_user, confirm_login, fresh_login_required)
from app import app
import json
import models
import User

# Define the blueprint: 'dashboard', set its url prefix: app.url/dashboard
mod_dashboard = Blueprint('dashboard', __name__, url_prefix='/dashboard')


@mod_dashboard.before_request
def make_session_permanent():
    session.permanent = True

# Set the route and accepted methods
# dashboard page
@mod_dashboard.route('/', methods=['GET', 'POST'])
@login_required
def dashboard():
    return render_template("dashboard/index.html")

