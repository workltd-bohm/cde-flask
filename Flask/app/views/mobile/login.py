from app import *

@app.route('/login_app', methods=['POST'])
def login_app():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    print(request.get_data().decode("utf-8") )
    json_data = json.loads(request.get_data())
    # login_ic_data = json_data['login_ic_data']
    # json_data.pop('login_ic_data', None)
    logger.log(LOG_LEVEL, 'POST data: {}'.format(json_data))
    resp = Response()

    if db.connect(db_adapter):
        response, user = db.get_user(db_adapter, json_data)
        db.close_connection(db_adapter)

        if response is msg.LOGGED_IN:
            json_user = user # .to_json()
            json_user.pop('password', None)
            # json_user.update({'project_code': 'SV'}) # temp, until drawn from project
            
            session['user'] = json_user
            session.modified = True
            my_projects = db.get_my_projects(db_adapter, json_user)
            projects = []
            for project in my_projects:
                projects.append({'project_name': project['project_name'],
                                 'project_id': project['project_id'],
                                 'project_code': project['code'],
                                 'coordinates': project['site']['coordinates']
                                 })

            response_message = {}
            response_message['user'] = user
            if 'confirmed' in response_message['user']:
                response_message['user'].pop('confirmed', None)
            # response_message['user'].pop('id', None)
            if 'project_code' in response_message['user']:
                response_message['user'].pop('project_code', None)
            response_message['projects'] = projects

            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response_message)
            return resp
        else:
            resp.status_code = response['code']
            resp.data = response['message']
            return resp
    else:
        logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
        return resp


@app.route('/refresh', methods=['POST'])
def refresh():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    print(request.get_data().decode("utf-8") )
    json_data = json.loads(request.get_data())
    # login_ic_data = json_data['login_ic_data']
    # json_data.pop('login_ic_data', None)
    logger.log(LOG_LEVEL, 'POST data: {}'.format(json_data))
    resp = Response()

    if main.IsLogin():
        if db.connect(db_adapter):
            my_projects = db.get_my_projects(db_adapter, session['user'])
            projects = []
            for project in my_projects:
                projects.append({'project_name': project['project_name'],
                                'project_id': project['project_id'],
                                'project_code': project['code'],
                                'coordinates': project['site']['coordinates']
                                })

            response_message = {}
            response_message['user'] = session['user']
            if 'confirmed' in response_message['user']:
                response_message['user'].pop('confirmed', None)
            # response_message['user'].pop('id', None)
            if 'project_code' in response_message['user']:
                response_message['user'].pop('project_code', None)
            response_message['projects'] = projects

            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response_message)
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp
    else:
        resp = Response()
        resp.status_code = msg.UNAUTHORIZED['code']
        resp.data = str(msg.UNAUTHORIZED['message'])
        return resp