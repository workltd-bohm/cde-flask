import json
import io

from app import *

import app.views.actions.getters as gtr

@app.route('/fill_user_info', methods=["POST"])
def fill_user_info():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    form = request.form
    my_user = session.get('user')  
    
    if db.connect(db_adapter):
        user_query = {'id': my_user["id"]}

        message, user_json = db.get_user(db_adapter, user_query)
        db.close_connection(db_adapter)

        # password validation
        if form['password'] != user_json['password'] or \
            form['username'] != user_json['username']:
            resp.status_code = msg.UNAUTHORIZED['code']
            resp.data = str(msg.UNAUTHORIZED['message'])
            return render_template("login/fill_user_info.html",
                                    user = my_user,
                                    fname = form['fname'],
                                    lname = form['lname'],
                                    message = msg.INVALID_USER_PASS['message'])

        user_json['fname'] = form['fname']
        user_json['lname'] = form['lname']

        if message == msg.LOGGED_IN:
            user = User()
            user.create_user(user_json)
            user.update_user(user_json)
            user.id = my_user["id"]
            user.picture = user_json['picture']
            user.confirmed = True
            message = db.edit_user(db_adapter, user.to_json())
        
        session["user"] = user_json
        return redirect('/')
        
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_user_profile_activity', methods=['POST'])
def make_user_profile_activity():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        user_data = session.get('user')
        if db.connect(db_adapter):

            message, user = db.get_user(db_adapter, {'id': user_data['id']})
            db.close_connection(db_adapter)

            role_code = ''
            if 'role_code' in user:
                role_code = user['role_code']
            response = {
                'html': render_template("dashboard/user/user_profile_activity.html",
                                        fname =             user_data["fname"],
                                        lname =             user_data["lname"],
                                        id =                user_data["id"],
                                        picture =           user_data["picture"],
                                        username =          user_data["username"],
                                        email =             user_data["email"],
                                        company_code =      user_data["company_code"],
                                        company_name =      user_data["company_name"],
                                        # company_role =      user_data["company_role"],
                                        complex_tag_list =  gtr.get_input_file_fixed(),
                                        role_code =         role_code
                                        ),
                'head': "User Profile",
                'data': []
            }
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp
        else:
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = msg.DB_FAILURE['message']
            return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/update_user', methods=['POST'])
def update_user():
    print(">>>>>>>>>>>>>>>>>>>", json.loads(request.get_data()))
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        json_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(json_data))
        user_data = session.get('user')
        # print(user_data)
        # print(json_data)
        if "id" in json_data and user_data["id"] == json_data["id"]:
            if db.connect(db_adapter):
                user_data = {'id': user_data["id"]}

                message, json_user = db.get_user(db_adapter, user_data)
                db.close_connection(db_adapter)

                if message == msg.LOGGED_IN:
                    user = User()
                    user.create_user(json_user)
                    user.update_user(json_data)
                    user.id = json_data["id"]
                    user.picture = json_user['picture']
                    user.confirmed = True
                    json_user = user.to_json()
                    message = db.edit_user(db_adapter, json_user)

                    if message == msg.ACCOUNT_CHANGED:
                        json_user.pop('password', None)
                        json_user.pop('role_code', None)
                        json_user.pop('project_code', None)
                        # json_user['project_code'] = 'SV' # temp, until drawn from project
                        session['user'] = json_user
                        session.modified = True

                resp.status_code = message['code']
                resp.data = str(message['message'])
                return resp
        else:
            resp.status_code = msg.USER_NOT_FOUND['code']
            resp.data = str(msg.USER_NOT_FOUND['message'])
            return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
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
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

@app.route('/upload_new_profile_picture', methods=['POST'])
def updateProfilePicture():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if 'newProfilePicture' not in request.files:
        logger.log(LOG_LEVEL, "no image present in request")
        return redirect(request.url)
    newProfilePicture = request.files['newProfilePicture']
    
    picturesOriginalName = newProfilePicture.filename
    picturesOriginalExtension = picturesOriginalName.split('.')[-1]
    logger.log(LOG_LEVEL, 'Original name of uploaded image = :: {}'.format(picturesOriginalName))


    resp = Response()
    if main.IsLogin():
        user_data = session.get('user')
        username = user_data['username']
        picUpdate_request_json = {'file_name': picturesOriginalName, 'type': picturesOriginalName.split('.')[:-1], 'user': username}
        original_picture_id = user_data['picture']
        if db.connect(db_adapter):
            user_id_json = {'id': user_data["id"]}

            message, json_user = db.get_user(db_adapter, user_id_json)
            db.close_connection(db_adapter)

            if message == msg.LOGGED_IN:
                # put picture in the database and get the insertion id
                message, file_id = db.upload_profile_image(db_adapter, picUpdate_request_json, newProfilePicture)
                if message == msg.IC_SUCCESSFULLY_ADDED:
                    logger.log(LOG_LEVEL, 'Added new picture to db with id :: {}'.format(file_id))
                    # update user account with this new id
                    json_user['picture'] = file_id
                    message = db.edit_user(db_adapter, json_user)

                    if message == msg.ACCOUNT_CHANGED:
                        json_user.pop('password', None)
                        json_user['project_code'] = 'SV' # temp, until drawn from project
                        session['user'] = json_user
                        session.modified = True
                        # remove picture with the old id from the database
                        delMsg = db.delete_profile_image(db_adapter, original_picture_id)
                        if delMsg != msg.IC_SUCCESSFULLY_REMOVED :
                            logger.log(LOG_LEVEL, 'Could not remove original profile picture with id {}'.format(original_picture_id))
                        else:
                            logger.log(LOG_LEVEL, 'Removed original profile picture with id {}'.format(original_picture_id))
                    else:
                        logger.log(LOG_LEVEL, 'Could not update picture id of user in db')

                else:
                    logger.log(LOG_LEVEL, 'Could not insert image into db')

            resp.status_code = message['code']
            resp.data = json.dumps({
                "message" : str(message['message']),
                "new_profilePicture_id" : str(file_id)
            })
            return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp
