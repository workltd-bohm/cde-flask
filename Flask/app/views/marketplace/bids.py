from app import *


@app.route('/create_bid', methods=['POST', 'GET'])
def create_bid():
    print('Data posting path: %s' % request.path)
    request_json = app.test_json_request_create_bid
    if request.get_data(): request_json.update(json.loads(request.get_data()))
    print(request_json)
    if main.IsLogin():
        request_json['user'] = session.get('user')
        print(request_json)
        if db.connect(db_adapter):
            result = db.create_bid(db_adapter, request_json)
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


@app.route('/get_all_bids', methods=['POST', 'GET'])
def get_all_bids():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_all_bids(db_adapter)
            print(">>>", json.dumps(result))
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            for bid in result:
                bid['html'] = render_template("dashboard/market/bid.html",
                                              bid_id=bid["bid_id"],
                                              post_id=bid["post_id"],
                                              offer=bid["offer"],
                                              username=bid["user"]["username"],
                                              date_created=bid["date_created"]
                                              )
            result = {'one': {'html': render_template("dashboard/market/bid_new.html")},
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


@app.route('/get_my_bids', methods=['POST', 'GET'])
def get_my_bids():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        if db.connect(db_adapter):
            request_data = json.loads(request.get_data())
            dirs.set_project_data(request_data)
            result = db.get_my_bids(db_adapter, session.get('user'))
            print(">>>", json.dumps(result))
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            for bid in result:
                bid['html'] = render_template("dashboard/market/bid.html",
                                              bid_id=bid["bid_id"],
                                              post_id=bid["post_id"],
                                              offer=bid["offer"],
                                              username=bid["user"]["username"],
                                              date_created=bid["date_created"]
                                              )
            result = {'one': {'html': render_template("dashboard/market/bid_all.html")},
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


@app.route('/get_single_bid', methods=['POST', 'GET'])
def get_single_bid():
    print('Data posting path: %s' % request.path)
    request_json = app.test_json_request_get_single_bid
    if request.get_data(): request_json.update(json.loads(request.get_data()))
    print(request_json)
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_single_bid(db_adapter, request_json)
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
