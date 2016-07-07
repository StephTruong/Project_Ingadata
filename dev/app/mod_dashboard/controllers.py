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
	migrationsStacked = df.groupby(['prevCategory','category']).agg({'annualSpent' : 'count'})
	migrations = migrationsStacked.unstack(level=-1)
	migrations.columns= migrations.columns.droplevel()
	migrations = migrations.fillna(0)
	migrationsToProspect = migrations.sum(axis=1)*0.06
	migrations= pd.concat([migrations,migrationsToProspect ],axis=1)
	migrations.columns = [0, 1, 2, 3, 4, 5]
	migrations = migrations.apply(lambda x: 100*x/float(x.sum()),axis=1).round(2)
	migrationJson= migrations.T.to_json()

	### Value impact
	# Calculate the average spending per person binned by segment
	catAnnualSpent = df.groupby('category').sum()['annualSpent']
	catAnnualSpent[5]=0
	annualSpentAvg = catAnnualSpent/migrations.sum(axis=0)
	annualSpentAvg[5] = 0

	# Calculate counts per segment
	prospectPool = 10000 # aka the pool of potential customer (includes current customer)
	catCount = df.groupby('category').count()['annualSpent']
	catCount[5]= prospectPool - catCount.sum()
	
	# Matrix multiplication Vector of count .* Vector annual spending average * Migration matrix
	catAnnualSpentEvolution=[]
	catAnnualSpentEvolution.append(annualSpentAvg*catCount)
	prevCount = (catCount.values).dot(migrations.values/100)
	catAnnualSpentEvolution.append(annualSpentAvg*prevCount)

	for i in range(11):
	    prevCount = prevCount.dot(migrations.values/100)
	    catAnnualSpentEvolution.append(annualSpentAvg*prevCount)

	#Export results to JSON
	catAnnualSpentEvoSum = pd.DataFrame(catAnnualSpentEvolution).sum(axis=1)
	catAnnualSpentEvoSum2 = catAnnualSpentEvoSum #second dataset for drawing test purpose
	newdf = pd.DataFrame({"Default":catAnnualSpentEvoSum,"Alt1":catAnnualSpentEvoSum2+abs(np.random.rand(13)*500000),"Year": [int(i) for i in range(13)]})
	valueImpactJson = newdf.to_json(orient="records")
	
	template_data= {
		'customerData': customerJson,
		'migrationData': migrationJson,
		'valueImpactData': valueImpactJson
		}
	return render_template("dashboard/index.html", **template_data)


