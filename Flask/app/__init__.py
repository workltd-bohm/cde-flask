from flask import Flask, json, request, Response, render_template, session, redirect, url_for

import config as cfg
import db.db_comminication as db
from model.user import User

db_adapter = cfg.config['basic'].DB

app = Flask(__name__, static_folder='static', static_url_path='')
app.secret_key = cfg.config['basic'].SECRET_KEY
from views import login
from views import dashboard

