# Import flask dependencies
from flask import Blueprint, request, render_template, \
                  flash, g, session, redirect, url_for, \
                  jsonify
from flask.ext.login import (current_user, login_required, login_user, logout_user, confirm_login, fresh_login_required)
from app import app
import json, pandas
import models

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

	customerJson=json.dumps(models.customer_stats.objects.to_json())
	df= pandas.read_json(eval(customerJson))
	migrationsStacked = df.groupby(['category','category2016']).agg({'ads' : 'sum'}) 
	migrations = migrationsStacked.unstack(level=-1)
	migrations = migrations.fillna(0)
	migrations.columns= migrations.columns.droplevel()
	migrationJson = migrations.apply(lambda x: 100*x/float(x.sum()),axis=1).round(2).to_json()
	print migrationJson

	template_data= {
		'customerData': customerJson,
		'migrationData': migrationJson
		}

	return render_template("dashboard/index.html", **template_data)


