# Import flask dependencies
from flask import Blueprint, request, render_template, \
                  flash, g, session, redirect, url_for, \
                  jsonify
from flask.ext.login import (current_user, login_required, login_user, logout_user, confirm_login, fresh_login_required)
from app import app
import json, pandas as pd, numpy as np, datetime
import models

# Define the blueprint: 'dashboard', set its url prefix: app.url/dashboard
mod_dashboard = Blueprint('dashboard', __name__, url_prefix='/dashboard')

customerJson = json.dumps(models.customer_stats.objects.to_json())
global originalCatAnnualEvoSum

@mod_dashboard.before_request
def make_session_permanent():
    session.permanent = True

# Set the route and accepted methods
# dashboard page
@mod_dashboard.route('/', methods=['GET', 'POST'])
@login_required
def dashboard():
	df= pd.read_json(eval(customerJson))
	# Segment yearly migration pattern
	migrationsStacked = df.groupby(['prevCategory','category']).agg({'annualSpent' : 'count'})
	migrations = migrationsStacked.unstack(level=-1)
	migrations.columns= migrations.columns.droplevel()
	migrations = migrations.fillna(0)
	migrationsToProspect = migrations.sum(axis=1)*0.06
	migrations= pd.concat([migrations,migrationsToProspect ],axis=1)
	migrations.columns = [0, 1, 2, 3, 4, 5]
	migrationsPct = migrations.apply(lambda x: 100*x/float(x.sum()),axis=1).round(2)
	
	migrationJson= migrations.to_json(orient="values")
	migrationPctJson= migrationsPct.to_json(orient="values")
	valueImpactJson = impactValueCalc(migrationsPct,0)
	
	#circular network
	# migrationsStacked2 = migrations.stack()
	# migrationsConnection=[]
	# for i in range(6):
	#     for j in range(6):
	#         try:
	#             value = migrationsStacked2.loc[i,j]
	#         except TypeError,IndexError:
	#             value = 0
	#         migrationsConnection.append(["cat"+str(i),"cat"+str(j),round(value)])
	
	# migrationConnectionJson = json.dumps(migrationsConnection)

	# print migrationConnectionJson

	template_data= {
		'customerData': customerJson,
		'migrationPctData': migrationPctJson,
		'migrationData': migrationJson,
		'valueImpactData': valueImpactJson
		}
	return render_template("dashboard/index.html", **template_data)

@mod_dashboard.route('/migrationImpact', methods=['GET', 'POST'])
def updateMigrationImpactValue():
	migrations_json = request.get_data().decode('utf-8')
	migrations = pd.read_json(migrations_json)

	valueImpactJson = impactValueCalc(migrations,1)
	print valueImpactJson
	return valueImpactJson


# ProspectPool: the pool of potential customer (includes current customer)
def impactValueCalc(migrations, update=0, prospectPool=10000):
	### Value impact
	# Calculate the average spending per person binned by segment
	df= pd.read_json(eval(customerJson))
	catAnnualSpent = df.groupby('category').sum()['annualSpent']
	catAnnualSpent[5]=0
	annualSpentAvg = catAnnualSpent/migrations.sum(axis=0)
	annualSpentAvg[5] = 0

	# Calculate counts per segment
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
	if update == 0:
		global originalCatAnnualEvoSum
		originalCatAnnualEvoSum = pd.DataFrame(catAnnualSpentEvolution).sum(axis=1)
	catAnnualSpentEvoSum = pd.DataFrame(catAnnualSpentEvolution).sum(axis=1)
	newdf = pd.DataFrame({"Default":originalCatAnnualEvoSum,"Alt1":catAnnualSpentEvoSum,"Year": [int(i)+ datetime.date.today().year for i in range(13)]})
	valueImpactJson = newdf.to_json(orient="records")
	return valueImpactJson