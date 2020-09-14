from app import *


@app.route('/create_post', methods=['POST'])
def create_post():
    print('Data posting path: %s' % request.path)
    request_json = app.test_json_request_create_post
    if request.get_data():
        print(request.get_data())
        request_json = json.loads(request.get_data())
        request_json['post_id'] = 'default'
        request_json['user_owner'] = session['user']
        request_json['product'].update({'product_id': '321', 'name': 'default name'})
        request_json['date_created'] = '06.09.2020-12:41:25'
        request_json['documents'] = ''
        request_json['bids'] = []
        request_json['current_best_bid'] = None
        request_json['comments'] = []
        request_json['status'] = 0

    print(request_json)
    if main.IsLogin():
        request_json['user_owner'] = session.get('user')
        print(request_json)
        if db.connect(db_adapter):
            result = db.create_post(db_adapter, request_json)
            if result:
                print(">>", result["message"])
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result["message"]
                return resp
        else:
            print(">", str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_all_posts', methods=['POST', 'GET'])
def get_all_posts():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_all_posts(db_adapter)
            print(">>>", json.dumps(result))
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
            print(str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_my_posts', methods=['POST', 'GET'])
def get_my_posts():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        if db.connect(db_adapter):
            request_data = json.loads(request.get_data())
            dirs.set_project_data(request_data)
            result = db.get_my_posts(db_adapter, session.get('user'))
            # for post in result:
            #     print(post)
            print(">>>", session.get('user'))
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
            print(str(msg.DB_FAILURE))
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
    print('Data posting path: %s' % request.path)
    request_json = app.test_json_request_get_single_post
    if request.get_data(): request_json.update(json.loads(request.get_data()))
    print(request_json)
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_single_post(db_adapter, request_json)
            print(">>>", json.dumps(result))
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(result) #, default=str)
            return resp
        else:
            print(str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp


@app.route('/get_bids_for_post', methods=['POST', 'GET'])
def get_bids_for_post():
    print('Data posting path: %s' % request.path)
    request_json = app.test_json_request_get_bids_for_post
    if request.get_data(): request_json.update(json.loads(request.get_data()))
    print(request_json)
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_bids_for_post(db_adapter, request_json)
            print(">>>", json.dumps(result))
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(result) #, default=str)
            return resp
        else:
            print(str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp
