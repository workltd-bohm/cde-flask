import app.controller.send_email as email
import random
import os
from app import *
import base64


@app.route('/login')
def login():
    return render_template("login/login.html")


@app.route('/logout')
def logout():
    session.clear()
    return render_template("login/login.html")


@app.route('/login_data', methods=['POST'])
def login_data():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    json_data = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(json_data))

    if db.connect(db_adapter):
        response, user = db.get_user(db_adapter, json_data)
        if response is msg.LOGGED_IN:
            json_user = user # .to_json()
            json_user.pop('password', None)
            json_user.update({'project_code': 'SV'}) # temp, until drawn from project
            if json_user['picture'] == '':
                json_user.update({'picture': set_random_profile_picture(json_user['username'])})
            session['user'] = json_user
            session['project'] = {}
            session.modified = True
            return redirect(url_for('index'))
        else:
            resp = Response()
            resp.status_code = response['code']
            resp.data = response['message']
            return resp
    else:
        logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
        resp = Response()
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
        return resp


@app.route('/signup_data', methods=['POST'])
def signup_data():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    json_data = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(json_data))

    resp = Response()
    if db.connect(db_adapter):
        user = User()
        user.create_user(json_data)
        user.picture = set_random_profile_picture(user.username)
        message, user = db.set_user(db_adapter, user)
        logger.log(LOG_LEVEL, 'User: {}'.format(user))

        if user is not None:
            email.send_an_email(user.username, user.email)
            resp.status_code = message['code']
            resp.data = str(message['message'])
            return resp
        else:
            resp.status_code = message['code']
            resp.data = str(message['message'])
            return resp
    else:
        logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message'])
        return resp


@app.route('/confirm_account', methods=['GET'])
def confirm_account():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    # print('Username: %s ' % request.args.get('username'))
    # print('Email: %s ' % request.args.get('email'))

    user = {"username": request.args.get('username'), "email": request.args.get('email')}

    resp = msg.USER_NOT_FOUND
    if db.connect(db_adapter):
        resp = db.confirm_account(db_adapter, user)
        logger.log(LOG_LEVEL, 'Response message: {}'.format(resp))

    return resp['message']


def set_random_profile_picture(username):
    path = "app/static/img/user_profile/"
    files = os.listdir(path)
    img = random.choice(files)
    request_json = {'file_name': img, 'type': img.split('.')[:-1], 'user': username}
    file = open(path + img, "rb")
    message, file_id = db.upload_profile_image(db_adapter, request_json, file)
    if message == msg.IC_SUCCESSFULLY_ADDED:
        return file_id
    return ''
