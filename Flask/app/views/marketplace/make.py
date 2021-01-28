from app import *
from uuid import uuid1

import app.views.actions.getters as gtr

@app.route('/make_ticket_bid', methods=['POST'])
def make_ticket_bid():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
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
        return render_template("dashboard/market/bid_old.html")

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_ticket_bid_all', methods=['POST'])
def make_ticket_bid_all():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/bid_all.html",
                                    # TODO
                                    ),
            'data': []
        }

        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_activity_bid', methods=['POST'])
def make_activity_bid():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    resp = Response()
    if main.IsLogin():
        result = db.get_single_bid(db_adapter, request_json)
        post = db.get_single_post(db_adapter, {'post_id': result[0]["post_id"]})
        # res = json.loads(result[0])
        logger.log(LOG_LEVEL, 'DB result: {}'.format(result[0]))
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
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_edit_bid', methods=['POST'])
def make_edit_bid():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    resp = Response()
    if main.IsLogin():
        result = db.get_single_bid(db_adapter, request_json)
        post = db.get_single_post(db_adapter, {'post_id': result[0]["post_id"]})
        # res = json.loads(result[0])
        logger.log(LOG_LEVEL, 'DB result: {}'.format(result[0]))
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

        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_post_view_activity', methods=['POST'])
def make_post_view_activity():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    if main.IsLogin():
        if db.connect(db_adapter):
            post = db.get_single_post(db_adapter, request_json)[0]
            response = {
                'html': render_template("dashboard/market/post_view_activity.html",
                                        post=post,
                                        bids=[],
                                        profile_picture=session['user']['picture']
                                        # tags=[]
                                        ),
                'data': []
            }

            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_ticket_post', methods=['POST'])
def make_ticket_post():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
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
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    description = ''
    if request_json['data']:
        description = request_json['data']['name']
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/post_new_form_1.html",
                                    ),
            'data': []
        }

        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_activity_post', methods=['POST'])
def make_activity_post():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/post_activity.html",
                                    # TODO
                                    ),
            'data': []
        }

        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_view_post', methods=['POST'])
def make_view_post():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    resp = Response()
    if main.IsLogin():
        if db.connect(db_adapter):
            post = db.get_single_post(db_adapter, request_json)
            # post = db.get_single_post(db_adapter, {'post_id': result[0]["post_id"]})
            logger.log(LOG_LEVEL, 'DB result: {}'.format(post))
            if session['user']["username"] == post[0]["user_owner"]["username"]:
                response = {
                'html': render_template("dashboard/market/post_edit_1.html",
                                        post_id=request_json['post_id'],
                                        username=post[0]["user_owner"]["username"],
                                        title=post[0]["title"],
                                        description=post[0]["description"],
                                        quantity=post[0]["product"]["quantity"],
                                        date=post[0]["date_expired"],
                                        location=post[0]["location"],
                                        lowest_bid=post[0]["current_best_bid"],
                                        dview=post[0]['documents']['3d-view'],
                                        doc=post[0]['documents']['doc'],
                                        image=post[0]['documents']['image'],
                                        bids=[]
                                        ),
                'data': {
                    'type': 'edit',
                    'bids': post[0]['bids'],
                    'image': post[0]['documents']['image'],
                    'doc': post[0]['documents']['doc']}
                }
            else:
                # bid = db.get_my_bids(db_adapter, session['user'])
                response = {
                    'html': render_template("dashboard/market/post_view.html",
                                            post_id=post[0]["post_id"],
                                            username=post[0]["user_owner"]["username"],
                                            title=post[0]["title"],
                                            description=post[0]["description"],
                                            date=post[0]["date_expired"],
                                            location=post[0]["location"],
                                            status=status.Status(int(post[0]["status"])).name,
                                            dview=post[0]['documents']['3d-view'],
                                            doc=post[0]['documents']['doc'],
                                            image=post[0]['documents']['image'],
                                            offer=0
                                            ),
                    'data': {
                        'type': 'view',
                        'image': post[0]['documents']['image'],
                        'doc': post[0]['documents']['doc']}
                }

            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_edit_post', methods=['POST'])
def make_edit_post():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    resp = Response()
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_single_post(db_adapter, request_json)
            # res = json.loads(result[0])
            logger.log(LOG_LEVEL, 'DB result: {}'.format(result[0]))
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
                                        bids=result[0]['bids']
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
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_activity_post_new', methods=['POST'])
def make_activity_post_new():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        response = {
            'html': render_template("dashboard/market/post_new_activity_1.html",
                                    profile_picture=session['user']['picture'],
                                    post_id= uuid1()
                                    ),
            'data': []
        }

        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/make_activity_post_edit', methods=['POST'])
def make_activity_post_edit():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    if main.IsLogin():
        if db.connect(db_adapter):
            post = db.get_single_post(db_adapter, request_json)[0]
            bids = []
            req_bids = post['bids']
            if isinstance(post['bids'], str):
                # TODO: fix this
                req_bids = json.loads(post['bids'])
            for bid_id in req_bids:
                bids.append(db.get_single_bid(db_adapter, {'bid_id': bid_id})[0])

            response = {
                'html': render_template("dashboard/market/post_edit_activity_1.html",
                                        post=post,
                                        comments=[],
                                        bids=bids,
                                        profile_picture=session['user']['picture']
                                        ),
                'data': []
            }

            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_my_posts_popup', methods=['POST'])
def get_my_posts_popup():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))

    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_my_posts(db_adapter, session.get('user'))
            logger.log(LOG_LEVEL, 'DB result: {}'.format(result))
            print(result)
            print(request_json)
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
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_filter_activity', methods=['POST'])
def get_filter_activity():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        name = request_data['name']
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))

        if name == 'Projects':
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = str(msg.DEFAULT_OK['message'])
            return resp

        if name == 'Shared':
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = str(msg.DEFAULT_OK['message'])
            return resp

        if db.connect(db_adapter):
            result = None
            if request_data['project_name'] == 'Shared':
                result = db.get_ic_object_from_shared(db_adapter, request_data, session['user'])
            else:
                project_name = session['project']['name']
                result = db.get_ic_object(db_adapter, project_name, request_data, name)
            if result:
                filter_file = gtr.get_input_file_fixed()
                details = [x.to_json() for x in result.history]
                tags = [x.to_json() for x in result.tags]
                file_name = result.name
                path = result.path
                share_link = ''
                comments = [x.to_json() for x in result.comments]
                access = [x.to_json() for x in result.access]
                is_owner = False
                for a in access:
                    if a['user']['user_id'] == session['user']['id'] and a['role'] == 0:
                        is_owner = True
                    a['role'] = Role(a['role']).name
                    m, user = db.get_user(db_adapter, {'id': a['user']['user_id']})
                    a['user']['picture'] = user['picture']
                    a['user']['username'] = user['username']

                for c in comments:
                    m, user = db.get_user(db_adapter, {'id': c['user']['user_id']})
                    c['user']['picture'] = user['picture']
                    c['user']['username'] = user['username']

                db.close_connection(db_adapter)
                if result.parent_id == 'root':
                    project = db.get_project(db_adapter, session['project']['name'], session['user'])
                    response = {
                        'html': render_template("activity/project.html",
                                                project_name =      session.get("project")["name"],
                                                profile_picture =   session['user']['picture'],
                                                user_id =           session['user']['id'],
                                                is_owner =          str(is_owner),
                                                is_iso19650 =       project['is_iso19650'],
                                                project =           project,
                                                details =           details,
                                                tags =              tags,
                                                comments =          comments,
                                                file_name =         file_name,
                                                path =              path,
                                                share_link =        share_link,
                                                parent_id =         result.parent_id,
                                                ic_id =             result.ic_id,
                                                access =            access
                                                ),
                        'data': []
                    }
                else:

                    response = {
                        'html': render_template("activity/folder.html",
                                                project_name =      session.get("project")["name"],
                                                profile_picture =   session['user']['picture'],
                                                user_id =           session['user']['id'],
                                                search =            filter_file,
                                                details =           details,
                                                tags =              tags,
                                                comments =          comments,
                                                file_name =         file_name,
                                                path =              path,
                                                share_link =        share_link,
                                                parent_id =         result.parent_id,
                                                ic_id =             result.ic_id,
                                                access =            access
                                                ),
                        'data': []
                    }
                # print(response)
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                resp.status_code = msg.IC_PATH_NOT_FOUND['code']
                resp.data = str(msg.IC_PATH_NOT_FOUND['message'])
                return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp