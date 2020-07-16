from flask import Flask, json, request, Response, render_template, session, redirect, url_for
from app import *


@app.route('/login')
def login():
    return render_template("login/login.html")


@app.route('/logout')
def logout():
    session.clear()
    return render_template("login/login.html")


@app.route('/login_data', methods=['POST'])
def login_data():
    print('Data posting path: %s' % request.path)
    # print('POST data: %s ' % request.get_data())
    json_data = json.loads(request.get_data())
    print('POST data: %s ' % json_data)

    if db.connect(db_adapter):
        user = db.get_user(db_adapter, json_data)
        if user is not None:
            session['user'] = user.to_json()
            return redirect(url_for('index'))
        else:
            resp = Response()
            resp.status_code = 404
            resp.data = str(msg.INVALID_USER_PASS).replace("'", "\"")
            return resp
    else:
        print(str(msg.DB_FAILURE))
        resp = Response()
        resp.status_code = 404
        resp.data = str(msg.DB_FAILURE).replace("'", "\"")
        return resp


@app.route('/signup_data', methods=['POST'])
def signup_data():
    print('Data posting path: %s' % request.path)
    # print('POST data: %s ' % request.get_data())
    json_data = json.loads(request.get_data())
    print('POST data: %s ' % json_data)

    if db.connect(db_adapter):
        user = User()
        user.create_user(json_data)
        user = db.set_user(db_adapter, user)
        print(user)

        if user is not None:
            session['user'] = user.to_json()
            return redirect(url_for('index'))
        else:
            resp = Response()
            resp.status_code = 404
            resp.data = str(msg.USER_ALREADY_IN).replace("'", "\"")
            return resp
    else:
        print(str(msg.DB_FAILURE))
        resp = Response()
        resp.status_code = 404
        resp.data = str(msg.DB_FAILURE).replace("'", "\"")
        return resp