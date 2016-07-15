# Import flask dependencies
from flask import Blueprint, request, render_template, \
                  flash, g, session, redirect, url_for, \
                  jsonify

from app import app

import json
from forms import ContactForm


# Define the blueprint: 'home', set its url prefix: app.url/home
mod_home = Blueprint('home', __name__, url_prefix='/home')


@mod_home.before_request
def make_session_permanent():
    session.permanent = True

# Set the route and accepted methods
# home page
@mod_home.route('/', methods=['GET', 'POST'])
def home_page():
	form = ContactForm()
	return render_template("home/index.html", form = form)


@mod_home.route('/contact', methods=['POST'])
def contact():
  form = ContactForm()
  if request.method == 'POST':
    if form.validate() == False:
      flash('All fields are required.')
      return render_template('home/index.html', scroll ='contact', form=form)
    else:
      return 'Form posted.'