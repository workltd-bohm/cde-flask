import os
import json
import uuid

from app import *

@app.route('/clear_projects')
def clear_projects():
    print('Data posting path: %s' % request.path)
    main.IsLogin()
    if db.connect(db_adapter):
        db.clear_db(db_adapter)
    else:
        print(str(msg.DB_FAILURE))
        resp = Response()
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
        return resp
    return redirect('/')


@app.route('/select_project', methods=['POST'])
def select_project():
    print('Data posting path: %s' % request.path)
    main.IsLogin()
    request_data = json.loads(request.get_data())
    print(request_data)
    app.test_json_request_project['project_name'] = request_data['value']

    resp = Response()
    resp.status_code = msg.DEFAULT_OK['code']
    resp.data = str(msg.DEFAULT_OK['message'])
    return resp


@app.route('/create_project', methods=['POST'])
def create_project():
    print('Data posting path: %s' % request.path)
    main.IsLogin()
    request_data = json.loads(request.get_data())
    user = session.get('user')
    root_obj = IC(str(uuid.uuid1()),
                  request_data['value'],
                  '.',
                  [],
                  request_data['value'],
                  [])
    project = Project("default", request_data['value'], root_obj)
    # print(project.to_json())
    if db.connect(db_adapter):
        result = db.upload_project(db_adapter, project, user)
        if result:
            print(result["message"])
            resp = Response()
            resp.status_code = result["code"]
            resp.data = result["message"]
            return resp
    else:
        print(str(msg.DB_FAILURE))
        resp = Response()
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
        return resp
    return redirect('/')


@app.route('/upload_project')
def upload_project():
    print('Data posting path: %s' % request.path)
    main.IsLogin()
    root_obj = path_to_obj('app', '.')
    project = Project("default", "test-project", root_obj)
    user = {'id': '17b16930-c5f6-11ea-99bc-50e085759747', 'role': 'OWNER'}
    if db.connect(db_adapter):
        result = db.upload_project(db_adapter, project, user)
        if result:
            print(result)
    else:
        print(str(msg.DB_FAILURE))
        resp = Response()
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
        return resp
    return redirect('/')