# -*- coding: utf-8 -*- 
from flask_wtf import Form

from wtforms import TextAreaField, StringField, TextAreaField, SubmitField, validators, ValidationError
from flask_wtf.html5 import  EmailField, TelField

class ContactForm(Form):
  name = StringField("Name", [validators.Required()],render_kw={"placeholder": "Name"})
  company = StringField("Company",[validators.Required()], render_kw={"placeholder": "Company"})	
  email = EmailField("Email",[validators.Required(), validators.Email()], render_kw={"placeholder": "Email"})
  phone = TelField("Phone",[validators.Required()], render_kw={"placeholder": "Phone"})
  message = TextAreaField("Message",[validators.Required()], render_kw={"placeholder": "Message"})
  submit = SubmitField("Submit")
