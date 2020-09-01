import os
import json
import uuid

from app import *

@app.route('/clear_projects')
def clear_projects():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
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
    if main.IsLogin():
        print(request.get_data())
        request_data = json.loads(request.get_data())
        app.test_json_request_project['project_name'] = request_data['choose_project']

        resp = Response()
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = str(msg.DEFAULT_OK['message'])
        return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/create_project', methods=['POST'])
def create_project():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        print(request.get_data())
        request_data = json.loads(request.get_data())
        user = session.get('user')
        root_obj = IC(str(uuid.uuid1()),
                    request_data['project_name'],
                    '.',
                    [],
                    request_data['project_name'],
                    [])
        project = Project("default", request_data['project_name'], root_obj)
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
    
    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/upload_project')
def upload_project():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        root_obj = dirs.path_to_obj('app', '.')
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


@app.route('/delete_ic', methods=['POST'])
def delete_ic():
    print('Data posting path: %s' % request.path)
    print(request.get_data())
    request_data = json.loads(request.get_data())
    return "okokok"