from flask import Flask, json, request, Response, render_template, session, redirect, url_for

import app.config as cfg
import app.db.db_comminication as db
from app.model.user import User
import app.model.messages as msg
from app.model.information_container import IC
from app.model.directory import Directory
from app.model.file import File
from app.model.project import Project
from app.model.role import Role

db_adapter = cfg.config['basic'].DB

app = Flask(__name__, static_folder='static', static_url_path='')
app.secret_key = cfg.config['basic'].SECRET_KEY
from app.views import login
from app.views import main
from app.views import dashboard

from app.views.actions import dirs
from app.views.actions import popups
from app.views.actions import getters
from app.views.actions import setters

app.test_json_request = {
    'project_id': '5f25580d49e1b44fef634b56',
    'project_name': 'test-project',
    'original_name': 'original_name',
    'dir_path': 'app/templates/activity',
    'file_name': 'activity111.html',
    'user': '',
    'file': '',
    'description': 'test description'
}

app.test_json_request_file = {
    'file_id': '5f2e7166bc71e9ecb31305ba',
    'file_name': 'SV-WRK-XX-XX-MI-W-3201-B1-P01.01-test',
}

app.test_json_request_project = {
    'project_name': 'test-project',
    'user': '',
}