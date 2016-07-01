# -*- coding: utf-8 -*-
from app import db
import datetime

    
class customer_stats(db.Document):
	category = db.IntField()
	annualSpent     = db.DecimalField()   
	ads      = db.DecimalField()   
	aur      = db.DecimalField()   
	upt      = db.DecimalField()   
	numberDept      = db.DecimalField()   
	age      = db.DecimalField()   
	income          = db.DecimalField()   
	category2016    = db.IntField()   



class User(db.Document):
	password = db.StringField(default=True)
	email = db.EmailField(unique=True)
	active = db.BooleanField(default=True)
	isAdmin = db.BooleanField(default=False)
	timestamp = db.DateTimeField(default=datetime.datetime.now())
    
