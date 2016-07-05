# Import flask dependencies
from flask import Blueprint, request, render_template, \
                  flash, g, session, redirect, url_for, \
                  jsonify
from flask.ext.login import (current_user, login_required, login_user, logout_user, confirm_login, fresh_login_required)
from app import app
import json, pandas as pd, numpy as np
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
	customerJson = json.dumps(models.customer_stats.objects.to_json())
	df= pd.read_json(eval(customerJson))
	
	# Segment yearly migration pattern
	migrationsStacked = df.groupby(['category','category2016']).agg({'annualSpent' : 'sum'})
	migrations = migrationsStacked.unstack(level=-1)
	migrations = migrations.fillna(0)
	migrations.columns= migrations.columns.droplevel()
	migrations = migrations.apply(lambda x: 100*x/float(x.sum()),axis=1).round(1)
	migrationJson = migrations.T.to_json()
	
	# Value impact
	catAnnualSpent = df.groupby('category').sum()['annualSpent']
	catAnnualSpentEvolution=[]
	catAnnualSpentEvolution.append(catAnnualSpent.values)
	prevCAS = (catAnnualSpent.values).dot(migrations.values/100)
	catAnnualSpentEvolution.append(prevCAS)

	for i in range(10):
		prevCAS = prevCAS[0:-1,].dot(migrations.values/100)
		catAnnualSpentEvolution.append( prevCAS)


	catAnnualSpentEvoSum = pd.DataFrame(catAnnualSpentEvolution).sum(axis=1)
	catAnnualSpentEvoSum2 = catAnnualSpentEvoSum
	newdf = pd.DataFrame({"Default":catAnnualSpentEvoSum,"Alt1":catAnnualSpentEvoSum2+abs(np.random.rand(12)*50000),"Year": [int(i) for i in range(12)]})
	valueImpactJson = newdf.to_json(orient="records")
	
	template_data= {
		'customerData': customerJson,
		'migrationData': migrationJson,
		'valueImpactData': valueImpactJson
		}

	return render_template("dashboard/index.html", **template_data)


