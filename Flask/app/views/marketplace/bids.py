from app import *

from datetime import datetime


@app.route('/create_bid', methods=['POST', 'GET'])
def create_bid():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = app.test_json_request_create_bid
    if request.get_data():
        request_json = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))

        request_json['bid_id'] = "default"
        request_json.update({'offer': request_json['offer'] + ' ' + request_json['per']})
        request_json.update({'status': request_json["status"]})
        request_json['date_created'] = datetime.now().strftime("%d.%m.%Y-%H:%M:%S")
        request_json['description'] = ""
    if main.IsLogin():
        request_json['user'] = session.get('user')
        logger.log(LOG_LEVEL, 'POST data updated: {}'.format(request_json))
        if db.connect(db_adapter):
            result = db.create_bid(db_adapter, request_json)
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
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


@app.route('/edit_bid', methods=['POST'])
def edit_bid():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_data = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    # if request.get_data():
    #     print(request.get_data())
    #     request_json = json.loads(request.get_data())
    #     request_json['post_id'] = 'default'
    #     request_json['user_owner'] = session['user']
    #     request_json['product'] = {"quantity": request_json['product'], 'product_id': '321', 'name': 'default name'}
    #     request_json['date_created'] = '06.09.2020-12:41:25'
    #     request_json['documents'] = ''
    #     request_json['bids'] = []
    #     request_json['current_best_bid'] = None
    #     request_json['comments'] = []
    #     request_json['status'] = 0

    if main.IsLogin():
        #     request_json['user_owner'] = session.get('user')
        #     print(request_json)
        #     if db.connect(db_adapter):
        #         result = db.create_post(db_adapter, request_json)
        #         if result:
        #             print(">>", result["message"])
        #             resp.status_code = result["code"]
        #             resp.data = result["message"]
        #             return resp
        #     else:
        #         print(">", str(msg.DB_FAILURE))
        #         resp.status_code = msg.DB_FAILURE['code']
        #         resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
        #         return resp
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = str(msg.DEFAULT_OK['message'])
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_all_bids', methods=['POST', 'GET'])
def get_all_bids():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_all_bids(db_adapter)
            logger.log(LOG_LEVEL, 'DB result: {}'.format(json.dumps(result)))
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
            result = {'one': render_template("dashboard/market/bid_new.html"),
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


@app.route('/get_my_bids', methods=['POST', 'GET'])
def get_my_bids():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        if db.connect(db_adapter):
            request_data = json.loads(request.get_data())
            dirs.set_project_data(request_data)
            result = db.get_my_bids(db_adapter, session.get('user'))
            logger.log(LOG_LEVEL, 'DB result: {}'.format(json.dumps(result)))
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            for bid in result:
                bid['html'] = render_template("dashboard/market/bid.html",
                                              title = bid["post_title"],
                                              bid_id=bid["bid_id"],
                                              post_id=bid["post_id"],
                                              offer=bid["offer"],
                                              username=bid["user"]["username"],
                                              date_created=bid["date_created"]
                                              )
            result = {'one': render_template("dashboard/market/bid_all.html"),
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


@app.route('/get_my_bids_planetary', methods=['POST', 'GET'])
def get_my_bids_planetary():
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
                    "project_name": "My bids",
                    "root_ic": {
                        "ic_id": "",
                        "name": "My bids",
                        "history": [],
                        "path": ".",
                        "overlay_type": "",
                        "is_directory": True,
                        "sub_folders": []
                    }
                }

            result = db.get_my_bids(db_adapter, session.get('user'))

            for bid in result:
                # path = ic.name if ic.is_directory else ic.name + ic.type
                # ic_type = '' if ic.is_directory else ic.type
                proj_obj = {
                    "ic_id": bid['bid_id'],
                    # "parent_id": ic.parent_id,
                    "name": bid['post_title'],
                    "parent": "My bids",
                    "history": [],
                    "path": "My bids/",
                    # "type": ic_type,
                    "overlay_type": "bid_ic",
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


@app.route('/get_single_bid', methods=['POST', 'GET'])
def get_single_bid():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = app.test_json_request_get_single_bid
    if request.get_data(): request_json.update(json.loads(request.get_data()))
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_single_bid(db_adapter, request_json)
            logger.log(LOG_LEVEL, 'DB result: {}'.format(json.dumps(result)))
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
