from flask import Flask, json, request, Response, render_template, session, redirect, url_for

import app.config as cfg
import app.db.db_comminication as db
from app.model.user import User
import app.model.messages as msg
from app.model.information_container import IC
from app.model.directory import Directory
from app.model.file import File

db_adapter = cfg.config['basic'].DB

app = Flask(__name__, static_folder='static', static_url_path='')
app.secret_key = cfg.config['basic'].SECRET_KEY
from app.views import login
from app.views import main
from app.views import dashboard
from app.views import dirs
from app.views.popups import popups

