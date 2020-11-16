import json
import io

from app import *


@app.route('/make_user_profile_activity', methods=['POST'])
def make_user_profile_activity():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        user_data = session.get('user')
        response = {
            'html': render_template("dashboard/user/user_profile_activity.html",
                                    id=user_data["id"],
                                    picture=user_data["picture"],
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
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        json_data = json.loads(request.get_data())
        user_data = session.get('user')
        # print(user_data)
        # print(json_data)
        if "id" in json_data and user_data["id"] == json_data["id"]:
            if db.connect(db_adapter):
                user_data = {'id': user_data["id"]}
                message, json_user = db.get_user(db_adapter, user_data)
                if message == msg.LOGGED_IN:
                    user = User()
                    user.create_user(json_user)
                    user.update_user(json_data)
                    user.id = json_data["id"]
                    user.confirmed = True
                    json_user = user.to_json()
                    message = db.edit_user(db_adapter, json_user)

                    if message == msg.ACCOUNT_CHANGED:
                        json_user.pop('password', None)
                        json_user['project_code'] = 'SV' # temp, until drawn from project
                        session['user'] = json_user
                        session.modified = True

                resp.status_code = message['code']
                resp.data = str(message['message'])
                return resp
        else:
            resp.status_code = msg.USER_NOT_FOUND['code']
            resp.data = str(msg.USER_NOT_FOUND['message'])
            return resp

    logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
    resp.status_code = msg.DB_FAILURE['code']
    resp.data = str(msg.DB_FAILURE['message'])
    return resp


@app.route('/get_profile_image/<path:image_id>', methods=['POST', 'GET'])
def get_profile_image(image_id):
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_json = {
            # 'post_id': request.args.get('post_id'),
            'file_id': image_id
        }
        # print('POST data: %s ' % request_json)
        if db.connect(db_adapter):
            result = db.get_post_file(db_adapter, request_json)
            if result:
                resp = Response(result.file_name)
                # response.headers.set('Content-Type', 'mime/jpeg')
                resp.headers.set(
                    'Content-Disposition', 'attachment', filename='%s' % result.file_name)
                resp.status_code = msg.DEFAULT_OK['code']
                return send_file(
                    io.BytesIO(result.read()),
                    attachment_filename=result.file_name)
            else:
                logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.STORED_FILE_NOT_FOUND)))
                resp = Response()
                resp.status_code = msg.STORED_FILE_NOT_FOUND['code']
                resp.data = str(msg.STORED_FILE_NOT_FOUND['message'])
                return resp
        else:
            print(str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp
