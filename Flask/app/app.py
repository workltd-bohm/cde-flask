import json
import os
import threading
import time
import random
import requests
import datetime as dt

from flask import Flask, json, request, Response, render_template, session, redirect, url_for
from flask_cors import CORS, cross_origin

import db.db_comminication as db
from db.db_file_adapter import DBFileAdapter
from model.user import User
import model.messages as msg

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app, resources={r"/*": {"Access-Control-Allow-Origin": "*"}})

db_adapter = DBFileAdapter()


@app.route('/')
@app.route('/dashboard')
def index():
    print('Data posting path: %s' % request.path)
    if session.get('logged_in'):
        # col = db.Users
        messages = session['username']
        id = session['id']
        email = session['email']
        # credits = col.find_one({'email': email}, {'_id': 0})['credits']
        return render_template("dashboard.html", username=messages, id=id, email=email)
    else:
        return redirect('/login')


@app.route('/login')
def login():
    return render_template("login.html")


@app.route('/login_data', methods=['POST'])
def login_data():
    print('Data posting path: %s' % request.path)
    # print('POST data: %s ' % request.get_data())
    json_data = json.loads(request.get_data())
    print('POST data: %s ' % json_data)
    user = db.get_user(db_adapter, json_data)

    resp = Response()
    if user['message'] == msg.LOGGED_IN:
        session['username'] = user['username']
        session['email'] = user['email']
        session['password'] = user['password']
        session['id'] = user['id']
        session['logged_in'] = True
        return redirect(url_for('index'))
    else:
        resp.status_code = 404
        resp.data = str(user).replace("'", "\"")
        return resp


@app.route('/signup_data', methods=['POST'])
def signup_data():
    print('Data posting path: %s' % request.path)
    # print('POST data: %s ' % request.get_data())
    json_data = json.loads(request.get_data())
    print('POST data: %s ' % json_data)
    user = User()
    user.create_user(json_data)
    signed = db.set_user(db_adapter, user)
    print(signed)
    resp = Response()
    if signed['message'] == msg.SIGNED_IN:
        session['username'] = signed['username']
        session['email'] = signed['email']
        session['password'] = signed['password']
        session['id'] = signed['id']
        session['logged_in'] = True
        return redirect(url_for('index'))
    else:
        resp.status_code = 404
        resp.data = str(signed).replace("'", "\"")
        return resp


@app.route('/dashboard_new', methods=['POST', 'GET'])
def dashboard_new():
    print('Data posting path: %s' % request.path)
    # print(request.get_data())
    # json_data = json.loads(request.get_data())
    # print('POST data: %s ' % json_data)
    return render_template("dashboard.html")#, data=json_data)

# @app.route('/data/<path:sen_path>', methods = ['POST'])
# def data(sen_path):
#     print('Data posting path: %s' %request.path)
#     json_data = json.loads(request.get_data())
#     print('POST data: %s ' %json_data)
#     if json_data['Sensor-ID'] in running_sensors:
#         sensor = running_sensors[json_data['Sensor-ID']]
#         sensor.set_is_active(True)
#         sensor.update_time(int(round(time.time())))
#
#         latest_data = SensorData(json_data['Data'], json_data['Timestamp'])
#         sensor.set_latest_data(latest_data)
#
#         resp = Response(status=200)
#         resp.status_code = 200
#
#     else:
#         resp = Response(status=400)
#         resp.status_code = 400
#         resp.data = "Sensor with Sensor-ID: %s, is not registered." %json_data['Sensor-ID']
#
#     return resp


if __name__ == '__main__':
    app.secret_key = "key"
    # Bind to PORT if defined, otherwise default to 5000.
    app.run(host='0.0.0.0', port=5656, debug=True)#, use_reloader=False)




