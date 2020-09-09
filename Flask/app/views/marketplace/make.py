from app import *

@app.route('/make_ticket_bid', methods=['POST'])
def make_ticket_bid():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/bid.html",
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
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/bid_activity.html",
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

@app.route('/make_edit_bid', methods=['POST'])
def make_edit_bid():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/bid_edit.html",
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
        response = {
            'html': render_template("dashboard/market/post.html",
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

@app.route('/make_ticket_post_new', methods=['POST'])
def make_ticket_post_new():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/post_new.html",
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

@app.route('/make_edit_post', methods=['POST'])
def make_edit_post():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/post_edit.html",
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