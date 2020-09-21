import os
import json
import uuid

from app import *

@app.route('/make_user_profile_activity', methods=['POST'])
def make_user_profile_activity():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        user_data = session.get('user')
        response = {
            'html': render_template("dashboard/user/user_profile_activity.html",
                id=user_data["id"],
                username=user_data["username"],
                email=user_data["email"],
                company_code=user_data["company_code"],
                company_name=user_data["company_name"],
                company_role=user_data["company_role"],
            ),
            'head': "User Profile",
            'data': []
        }
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp

@app.route('/update_user', methods=['POST'])
def update_user():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        json_data = json.loads(request.get_data())
        user_data = session.get('user')
        # print(user_data)
        # print(json_data)
        json_user = {}
        if "id" in json_data and user_data["id"] == json_data["id"]:
            if db.connect(db_adapter):
                for key, value in json_data.items():
                    if value:
                        json_user[key] = value
                message = db.edit_user(db_adapter, json_user)

                # json_user = user.to_json()
                # json_user.pop('password', None)
                json_user['project_code'] = 'SV' # temp!!
                session['user'] = json_user
                print(session['user'])
                session.modified = True

                resp.status_code = message['code']
                resp.data = str(message['message'])
                return resp
        else:
            resp.status_code = msg.USER_NOT_FOUND['code']
            resp.data = str(msg.USER_NOT_FOUND['message'])
            return resp

    print(str(msg.DB_FAILURE))
    resp.status_code = msg.DB_FAILURE['code']
    resp.data = str(msg.DB_FAILURE['message'])
    return resp