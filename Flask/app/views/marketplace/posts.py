from app import *

from datetime import datetime
import uuid
import io


@app.route('/create_post', methods=['POST'])
def create_post():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = app.test_json_request_create_post
    if request.get_data():
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request.get_data()))
        request_json = json.loads(request.get_data())
        time = datetime.strptime(request_json["date_expired"], '%Y-%m-%dT%H:%M')
        request_json['post_id'] = 'default'
        request_json['user_owner'] = session['user']
        request_json['product'] = {"quantity": request_json['product'], 'product_id': str(uuid.uuid1()), 'name': 'default name'}
        request_json['date_created'] = datetime.now().strftime("%d.%m.%Y-%H:%M:%S")
        request_json.update({'date_expired': time.strftime("%d.%m.%Y-%H:%M:%S")})
        request_json['documents'] = {'3d-view': request_json['3d-view'], 'doc': request_json['doc'], 'image': request_json['image']}
        request_json.pop('3d-view', None)
        request_json.pop('doc', None)
        request_json.pop('image', None)
        request_json['bids'] = []
        request_json['current_best_bid'] = None
        request_json['comments'] = []
        request_json['status'] = 0

    if main.IsLogin():
        request_json['user_owner'] = session.get('user')
        logger.log(LOG_LEVEL, 'POST data updated: {}'.format(request_json))
        if db.connect(db_adapter):
            result, post_id = db.create_post(db_adapter, request_json)
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                if post_id:
                    for file in request_json['documents']['image']:
                        response = db.update_post_file(db_adapter, file, post_id, request_json['user_owner'])
                        # print(response)
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result["message"]
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/edit_post', methods=['POST'])
def edit_post():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    if request.get_data():
        request_json['user_owner'] = session['user']
        request_json['product'] = {"quantity": request_json['quantity'], 'product_id': str(uuid.uuid1()), 'name': 'default name'}
        request_json['date_edited'] = datetime.now().strftime("%d.%m.%Y-%H:%M:%S")
        request_json['documents'] = {'3d-view': request_json['3d-view'], 'doc': request_json['doc'],
                                     'image': request_json['image']}
        request_json.pop('3d-view', None)
        request_json.pop('doc', None)
        request_json.pop('image', None)
        request_json['bids'] = []
        request_json['current_best_bid'] = None
        request_json['comments'] = []
        request_json['status'] = 0

    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.edit_post(db_adapter, request_json)
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp.status_code = result["code"]
                resp.data = result["message"]
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp
    
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_all_posts', methods=['POST', 'GET'])
def get_all_posts():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_all_posts(db_adapter)
            logger.log(LOG_LEVEL, 'All posts: {}'.format(json.dumps(result)))
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            for post in result:
                post['html'] = render_template("dashboard/market/post_info.html",
                                               post_id=post["post_id"],
                                               title=post["title"],
                                               username=post["user_owner"]["username"],
                                               date=post["date_expired"],
                                               location=post["location"],
                                               product=post["product"]["name"]
                                               )
            result = {'one': render_template("dashboard/market/bid_back.html"),
                      'many': json.dumps(result)}
            resp.data = json.dumps(result)
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_all_posts_planetary', methods=['POST', 'GET'])
def get_all_posts_planetary():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()
    if main.IsLogin():
        # if "name" not in session.get("project"):
        #     logger.log(LOG_LEVEL, str(msg.NO_PROJECT_SELECTED))
        #     resp.status_code = msg.NO_PROJECT_SELECTED['code']
        #     resp.data = str(msg.NO_PROJECT_SELECTED['message'])
        #     return resp

        if db.connect(db_adapter):

            response = {
                    "project_name": "All posts",
                    "root_ic": {
                        "ic_id": "",
                        "name": "All posts",
                        "history": [],
                        "path": "Market/All posts",
                        "overlay_type": "",
                        "is_directory": True,
                        "sub_folders": []
                    }
                }

            result = db.get_all_posts(db_adapter)

            for post in result:
                proj_obj = {
                    "ic_id": post['post_id'],
                    # "parent_id": ic.parent_id,
                    "name": post['title'],
                    "parent": "All posts",
                    "history": [],
                    "path": "All posts/" + post['title'],
                    # "type": ic_type,
                    "overlay_type": "all_post_ic",
                    "is_directory": False,
                }
                response['root_ic']["sub_folders"].append(proj_obj)

            resp.status_code = msg.DEFAULT_OK['code']
            # print(project.to_json())
            resp.data = json.dumps({"json": response})
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp


@app.route('/get_my_posts_planetary', methods=['POST'])
def get_my_posts_planetary():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        dirs.set_project_data(request_data)
        # if "name" not in session.get("project"):
        #     logger.log(LOG_LEVEL, str(msg.NO_PROJECT_SELECTED))
        #     resp.status_code = msg.NO_PROJECT_SELECTED['code']
        #     resp.data = str(msg.NO_PROJECT_SELECTED['message'])
        #     return resp

        # position = session.get("project")["position"]
        # project_name = session.get("project")["name"]
        # user = session.get('user')
        if db.connect(db_adapter):
            request_data = json.loads(request.get_data())

            response = {
                    "project_name": "My posts",
                    "root_ic": {
                        "ic_id": "",
                        "name": "My posts",
                        "history": [],
                        "path": "Market/My posts",
                        "overlay_type": "posts",
                        "is_directory": True,
                        "sub_folders": []
                    }
                }

            result = db.get_my_posts(db_adapter, session.get('user'))

            for post in result:
                    # path = ic.name if ic.is_directory else ic.name + ic.type
                    # ic_type = '' if ic.is_directory else ic.type
                    proj_obj = {
                        "ic_id": post['post_id'],
                        # "parent_id": ic.parent_id,
                        "name": post['title'],
                        "parent": "My posts",
                        "history": [],
                        "path": "My posts/" + post['title'],
                        # "type": ic_type,
                        "overlay_type": "all_post_ic",
                        "is_directory": False,
                    }
                    response['root_ic']["sub_folders"].append(proj_obj)

            resp.status_code = msg.DEFAULT_OK['code']
            # print(project.to_json())
            resp.data = json.dumps({"json": response})
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp


@app.route('/get_my_posts', methods=['POST', 'GET'])
def get_my_posts():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        if db.connect(db_adapter):
            request_data = json.loads(request.get_data())
            dirs.set_project_data(request_data)
            result = db.get_my_posts(db_adapter, session.get('user'))
            # for post in result:
            #     print(post)
            # print(">>>", result)
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            for post in result:
                post['html'] = render_template("dashboard/market/post.html",
                                               post_id=post["post_id"],
                                               title=post["title"],
                                               username=post["user_owner"]["username"],
                                               date=post["date_expired"],
                                               location=post["location"],
                                               product=post["product"]["name"]
                                               )
            result = {'one': render_template("dashboard/market/post_new.html"),
                      'many': json.dumps(result)}
            resp.data = json.dumps(result)
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_single_post', methods=['POST', 'GET'])
def get_single_post():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = app.test_json_request_get_single_post
    if request.get_data(): request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_single_post(db_adapter, request_json)
            logger.log(LOG_LEVEL, 'Single POST: {}'.format(json.dumps(result)))
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(result) #, default=str)
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp


@app.route('/get_bids_for_post', methods=['POST', 'GET'])
def get_bids_for_post():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = app.test_json_request_get_bids_for_post
    if request.get_data(): request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_bids_for_post(db_adapter, request_json)
            logger.log(LOG_LEVEL, 'BIDS for POST: {}'.format(json.dumps(result)))
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(result) #, default=str)
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/upload_post_file', methods=['POST'])
def upload_post_file():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        # print(request.files['file'])
        if 'file' not in request.files:
            logger.log(LOG_LEVEL, 'No file part: '.format(str(msg.DEFAULT_ERROR['message'])))
            resp = Response()
            resp.status_code = msg.DEFAULT_ERROR['code']
            resp.data = str(msg.DEFAULT_ERROR['message'])
            return resp

        file = request.files['file'].read()
        # print(file)
        # print(request.form['data'])
        request_json = json.loads(request.form['data'])
        request_json['user'] = session['user']['username']
        if '.' in request_json['file_name']:
            request_json['type'] = request_json['file_name'].split('.')[:-1]

        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))

        if db.connect(db_adapter):
            result, id = db.upload_post_file(db_adapter, request_json, file)
            if id:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = json.dumps({'id': id, 'message': result["message"]})
                return resp
            else:
                resp = Response()
                resp.status_code = 400
                resp.data = 'not found'
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/remove_post_file', methods=['POST'])
def remove_post_file():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():

        logger.log(LOG_LEVEL, 'POST data: {}'.format(request.form['data']))
        request_json = json.loads(request.form['data'])
        request_json['user'] = session['user']['username']

        if db.connect(db_adapter):
            result = db.remove_post_file(db_adapter, request_json)
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result["message"]
                return resp
            else:
                resp = Response()
                resp.status_code = 400
                resp.data = 'not found'
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_post_image/<path:file_id>', methods=['POST', 'GET'])
def get_post_image(file_id):
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_json = {
                        #'post_id': request.args.get('post_id'),
                        'file_id': file_id
        }
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
        if db.connect(db_adapter):
            result = db.get_post_file(db_adapter, request_json)
            if result:
                # print(result.file_name)
                resp = Response(result.file_name)
                # response.headers.set('Content-Type', 'mime/jpeg')
                resp.headers.set(
                    'Content-Disposition', 'attachment', filename='%s' % result.file_name)
                resp.status_code = msg.DEFAULT_OK['code']
                return send_file(
                    io.BytesIO(result.read()),
                    attachment_filename=result.file_name)
            else:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(str(msg.STORED_FILE_NOT_FOUND['message'])))
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp
