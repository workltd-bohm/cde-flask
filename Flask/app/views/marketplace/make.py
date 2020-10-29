from app import *


@app.route('/make_ticket_bid', methods=['POST'])
def make_ticket_bid():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        # response = {
        #     'html': render_template("dashboard/market/bid.html",
        #         # TODO
        #     ),
        #     'data': []
        # }
        # #print(response)
        # resp.status_code = msg.DEFAULT_OK['code']
        # resp.data = json.dumps(response)
        # return resp
        return render_template("dashboard/market/bid.html")

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/make_ticket_bid_all', methods=['POST'])
def make_ticket_bid_all():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/bid_all.html",
                # TODO
            ),
            'data': []
        }
        #print(response)
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/make_activity_bid', methods=['POST'])
def make_activity_bid():
    print('Data posting path: %s' % request.path)
    request_json = json.loads(request.get_data())
    print(request_json)
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        result = db.get_single_bid(db_adapter, request_json)
        post = db.get_single_post(db_adapter, {'post_id': result[0]["post_id"]})
        # res = json.loads(result[0])
        print(">>>>", result[0])
        response = {
            'html': render_template("dashboard/market/bid_activity.html",
                                    bid_id=result[0]["bid_id"],
                                    username=result[0]["user"]["username"],
                                    description=post[0]["title"],
                                    date=post[0]["date_expired"],
                                    location=post[0]["location"],
                                    status=result[0]["status"],
                                    offer=result[0]["offer"]
                                    ),
            'data': []
        }
        #print(response)
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/make_edit_bid', methods=['POST'])
def make_edit_bid():
    print('Data posting path: %s' % request.path)
    request_json = json.loads(request.get_data())
    print(request_json)
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        result = db.get_single_bid(db_adapter, request_json)
        post = db.get_single_post(db_adapter, {'post_id': result[0]["post_id"]})
        # res = json.loads(result[0])
        print(">>>>", result[0])
        response = {
            'html': render_template("dashboard/market/bid_edit.html",
                                    bid_id=result[0]['bid_id'],
                                    username=result[0]["user"]["username"],
                                    title=result[0]["post_title"],
                                    description=post[0]["description"],
                                    date=post[0]["date_expired"],
                                    location=post[0]["location"],
                                    status=status.Status(int(result[0]["status"])).name,
                                    offer=result[0]["offer"],
                                    comments=result[0]["comments"]
                                    ),
            'data': []
        }
        #print(response)
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/make_activity_bid_edit', methods=['POST'])
def make_activity_bid_edit():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/bid_edit_activity.html",
                # TODO
            ),
            'data': []
        }
        #print(response)
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp

### ------


@app.route('/make_ticket_post', methods=['POST'])
def make_ticket_post():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        # response = {
        #     'html': render_template("dashboard/market/post.html",
        #         # TODO
        #     ),
        #     'data': []
        # }
        # #print(response)
        # resp.status_code = msg.DEFAULT_OK['code']
        # resp.data = render_template("dashboard/market/post.html"
        return render_template("dashboard/market/post.html")

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/make_new_post', methods=['POST'])
def make_ticket_post_new():
    resp = Response()
    print('Data posting path: %s' % request.path)
    request_json = json.loads(request.get_data())
    print(request_json)
    description = ''
    if request_json['data']:
        description = request_json['data']['name']
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/post_new_form.html",
                                    username=session['user']['username'],
                                    description=description
                                    ),
            'data': []
        }
        #print(response)
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/make_activity_post', methods=['POST'])
def make_activity_post():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/post_activity.html",
                # TODO
            ),
            'data': []
        }
        #print(response)
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/make_view_post', methods=['POST'])
def make_view_post():
    print('Data posting path: %s' % request.path)
    request_json = json.loads(request.get_data())
    print(request_json)
    resp = Response()
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_single_post(db_adapter, request_json)
            post = db.get_single_post(db_adapter, {'post_id': result[0]["post_id"]})
            # res = json.loads(result[0])
            print(">>>>", result[0])
            response = {
                'html': render_template("dashboard/market/bid_all_posts.html",
                                        post_id=result[0]["post_id"],
                                        username=result[0]["user_owner"]["username"],
                                        title=result[0]["title"],
                                        description=result[0]["description"],
                                        date=result[0]["date_expired"],
                                        location=result[0]["location"],
                                        status=status.Status(int(result[0]["status"])).name,
                                        dview=result[0]['documents']['3d-view'],
                                        doc=result[0]['documents']['doc'],
                                        image=result[0]['documents']['image'],
                                        offer=0
                                        ),
                'data': {'image': result[0]['documents']['image'],
                         'doc': result[0]['documents']['doc']}
            }
            # print(response)
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp
        else:
            print(str(msg.DB_FAILURE))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/make_edit_post', methods=['POST'])
def make_edit_post():
    print('Data posting path: %s' % request.path)
    request_json = json.loads(request.get_data())
    print(request_json)
    resp = Response()
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_single_post(db_adapter, request_json)
            print(result[0]['documents']['doc'])
            # res = json.loads(result[0])
            print(">>>>", result[0])
            response = {
                'html': render_template("dashboard/market/post_edit.html",
                                        post_id=request_json['post_id'],
                                        username=result[0]["user_owner"]["username"],
                                        title=result[0]["title"],
                                        description=result[0]["description"],
                                        quantity=result[0]["product"]["quantity"],
                                        date=result[0]["date_expired"],
                                        location=result[0]["location"],
                                        lowest_bid=result[0]["current_best_bid"],
                                        dview=result[0]['documents']['3d-view'],
                                        doc=result[0]['documents']['doc'],
                                        image=result[0]['documents']['image'],
                                        bids=[]
                                        ),
                'data': [{'bids': result[0]['bids'],
                          'image': result[0]['documents']['image'],
                          'doc': result[0]['documents']['doc']}]
            }
            # print(response)
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp
        else:
            print(str(msg.DB_FAILURE))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp


    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/make_activity_post_new', methods=['POST'])
def make_activity_post_new():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/post_new_activity.html",
                # TODO
            ),
            'data': []
        }
        #print(response)
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/make_activity_post_edit', methods=['POST'])
def make_activity_post_edit():
    resp = Response()
    print('Data posting path: %s' % request.path)
    request_json = json.loads(request.get_data())
    print(request_json)
    if main.IsLogin():
        if db.connect(db_adapter):
            bids = []
            req_bids = request_json['bids']
            if isinstance(request_json['bids'], str):
                # TODO: fix this
                req_bids = json.loads(request_json['bids'])
            for bid_id in req_bids:
                bids.append(db.get_single_bid(db_adapter, {'bid_id': bid_id})[0])
            div = []
            for bid in bids:
                div.append(bid['offer'])
            response = {
                'html': render_template("dashboard/market/post_edit_activity.html",
                    bids=div
                ),
                'data': []
            }
            #print(response)
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp

        else:
            print(str(msg.DB_FAILURE))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_my_posts_popup', methods=['POST'])
def get_my_posts_popup():
    resp = Response()
    print('Data posting path: %s' % request.path)
    request_json = json.loads(request.get_data())
    print(request_json)

    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_my_posts(db_adapter, session.get('user'))
            print(result)
            response = {
                'html': render_template("dashboard/market/popup/my_posts_popup.html",
                                        posts=result,
                                        json=request_json
                                        ),
                'data': []
            }
            # print(response)
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp
        else:
            print(str(msg.DB_FAILURE))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp
