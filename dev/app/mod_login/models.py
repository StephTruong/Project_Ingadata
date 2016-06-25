# -*- coding: utf-8 -*-
import os

from werkzeug.security import generate_password_hash, check_password_hash
from flask.ext.login import (LoginManager, current_user, login_required,
                            login_user, logout_user, UserMixin, AnonymousUserMixin,
                            confirm_login, fresh_login_required)

import models
from flask.ext.mongoengine.wtf import model_form
from wtforms.fields import *
from flask.ext.mongoengine.wtf.orm import validators

import datetime
from app import db

class User(db.Document):
    email = db.EmailField(unique=True)
    password = db.StringField(default=True)
    active = db.BooleanField(default=True)
    isAdmin = db.BooleanField(default=False)
    timestamp = db.DateTimeField(default=datetime.datetime.now())
    
class Note(db.Document):
    title = db.StringField(required=True,max_length=120)
    content = db.StringField()
    last_updated = db.DateTimeField(default=datetime.datetime.now())
    user = db.ReferenceField(User)
    

class User(UserMixin):
    def __init__(self, email=None, password=None, active=True, id=None):
        self.email = email
        self.password = password
        self.active = active
        self.isAdmin = False
        self.id = None


    def save(self): 
        newUser = models.User(email=self.email, password=self.password, active=self.active)
        newUser.save()
        print "new user id = %s " % newUser.id
        self.id = newUser.id
        return self.id

    def get_by_email(self, email):

    	dbUser = models.User.objects.get(email=email)
    	if dbUser:
            self.email = dbUser.email
            self.active = dbUser.active
            self.id = dbUser.id
            return self
        else:
            return None
    
    def get_by_email_w_password(self, email):

        try:
            dbUser = models.User.objects.get(email=email)
            
            if dbUser:
                self.email = dbUser.email
                self.active = dbUser.active
                self.password = dbUser.password
                self.id = dbUser.id
                return self
            else:
                return None
        except:
            print "there was an error"
            return None

    def get_mongo_doc(self):
        if self.id:
            return models.User.objects.with_id(self.id)
        else:
            return None

    def get_by_id(self, id):
    	dbUser = models.User.objects.with_id(id)
    	if dbUser:
    		self.email = dbUser.email
    		self.active = dbUser.active
    		self.id = dbUser.id

    		return self
    	else:
    		return None



class Anonymous(AnonymousUserMixin):
    name = u"Anonymous"

user_form = model_form(models.User, exclude=['password'])

# Signup Form created from user_form
class SignupForm(user_form):
    password = PasswordField('Password', validators=[validators.Required(), validators.EqualTo('confirm', message='Passwords must match')])
    confirm = PasswordField('Repeat Password')

# Login form will provide a Password field (WTForm form field)
class LoginForm(user_form):
    password = PasswordField('Password',validators=[validators.Required()])
