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
                                    username=result[0]["user"]["username"],
                                    description=post[0]["description"],
                                    date=post[0]["date_expired"],
                                    location=post[0]["location"],
                                    status=result[0]["status"],
                                    offer=result[0]["offer"],
                                    comments=result[0]["comments"][0]
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
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/post_new_form.html",
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
                                        username=result[0]["user_owner"]["username"],
                                        description=result[0]["description"],
                                        date=result[0]["date_expired"],
                                        location=result[0]["location"],
                                        status="",
                                        offer=0,
                                        comments=[]
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


@app.route('/make_edit_post', methods=['POST'])
def make_edit_post():
    print('Data posting path: %s' % request.path)
    request_json = json.loads(request.get_data())
    print(request_json)
    resp = Response()
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_single_post(db_adapter, request_json)
            # res = json.loads(result[0])
            print(">>>>", result[0])
            response = {
                'html': render_template("dashboard/market/post_edit.html",
                                        username=result[0]["user_owner"]["username"],
                                        description=result[0]["description"],
                                        date=result[0]["date_expired"],
                                        location=result[0]["location"],
                                        lowest_bid=result[0]["current_best_bid"]
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


@app.route('/make_activity_post_edit', methods=['POST'])
def make_activity_post_edit():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/post_edit_activity.html",
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

