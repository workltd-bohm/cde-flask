from flask import Flask, make_response,json, request, Response, render_template, session, redirect, url_for, \
    send_file, send_from_directory

import app.config as cfg
import app.db.db_comminication as db
from app.model.user import User
import app.model.messages as msg
import app.model.marketplace.post as status
from app.model.information_container import IC
from app.model.directory import Directory
from app.model.file import File
from app.model.details import Details
from app.model.comment import Comments
from app.model.project import Project
from app.model.marketplace.post import Post
from app.model.marketplace.bid import Bid
from app.model.role import Role
from app.model.access import Access

from app.logs import logger

LOG_LEVEL = cfg.config['basic'].LOG_LEVEL
logger.Logger().set_logging(LOG_LEVEL, cfg.config['basic'].LOG_FILE)
logger = logger.Logger().get_logger()

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
from app.views.actions import user
from app.views.actions import search
from app.views.actions import selection

from app.views.marketplace import make
from app.views.marketplace import posts
from app.views.marketplace import bids

from app.views.viewer import create

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
    'file_name': 'SV-WRK-ZZ-ZZ-RI-X-6001-A1-P01-IMG.jpg',
}

app.test_json_request_project = {
    'project_name': 'test-project',
    'user': '',
}

app.test_json_request_create_post = {
    'post_id': '12',
    'title': '300 m2 ironed concrete',
    'user_owner': '',
    'product': {'product_id': '321', 'name': 'Ironed concrete', 'quantity': 1},
    'description': '300 m2 ironed concrete in five days needed with accessible location',
    'date_created': '06.09.2020-12:41:25',
    'date_expired': '10.09.2020-12:00:00',
    'documents': '',
    'bids': [],
    'current_best_bid': None,
    'comments': [],
    'visibility': 'visible',
    'location': 'Heinrich-Luebke-Strasse 8, 81737 Munich',
    'status': 0
}

app.test_json_request_create_bid = {
    'bid_id': 'default',
    'user': '',
    'post_id': '12',
    'offer': '10 euro/m2',
    'date_created': '06.09.2020-17:41:25',
    'description': '',
    'status': '',
    'comments': ['Cheap offer'],
    'post_title': '300 m2 ironed concrete'
}

app.test_json_request_get_bids_for_post = {
    'post_id': '12'
}

app.test_json_request_get_single_post = {
    'post_id': '12'
}

app.test_json_request_get_filtered_files = {
    # 'project_id': '5f623020e60b784154788876',
    # 'project_name': '123',
    'project_code': '',
    'company_code': '',
    'project_volume_or_system': '',
    'project_level': '',
    'type_of_information': '',
    'role_code': '',
    'file_number': '',
    'status': '',
    'revision': '',
    'overlay_type': '',
}