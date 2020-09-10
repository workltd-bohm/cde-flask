import app.controller.send_email as email
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
        response, user = db.get_user(db_adapter, json_data)
        if response is msg.LOGGED_IN:
            json_user = user.to_json()
            json_user.pop('password', None)
            json_user.update({'project_code': 'SV', 'company_code': 'WRK'})
            session['user'] = json_user
            return redirect(url_for('index'))
        else:
            resp = Response()
            resp.status_code = response['code']
            resp.data = response['message']
            return resp
    else:
        print(str(msg.DB_FAILURE))
        resp = Response()
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
        return resp


@app.route('/signup_data', methods=['POST'])
def signup_data():
    print('Data posting path: %s' % request.path)
    # print('POST data: %s ' % request.get_data())
    json_data = json.loads(request.get_data())
    print('POST data: %s ' % json_data)

    resp = Response()
    if db.connect(db_adapter):
        user = User()
        user.create_user(json_data)
        message , user = db.set_user(db_adapter, user)
        print(user)

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
        print(str(msg.DB_FAILURE))
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message'])
        return resp


@app.route('/confirm_account', methods=['GET'])
def confirm_account():
    print('Data posting path: %s' % request.path)
    print('Username: %s ' % request.args.get('username'))
    print('Email: %s ' % request.args.get('email'))

    user = {"username": request.args.get('username'), "email": request.args.get('email')}

    resp = msg.USER_NOT_FOUND
    if db.connect(db_adapter):
        resp = db.confirm_account(db_adapter, user)
        print(resp)

    return resp['message']