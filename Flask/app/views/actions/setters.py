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
            session.get("project")["name"] = ''
            session.modified = True
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
        session.get("project")["name"] = request_data['choose_project']
        session.modified = True
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
        name_id = str(uuid.uuid1())
        root_obj = IC(name_id,
                    request_data['project_name'],
                    ".",
                    [],
                    request_data['project_name'],
                    '',
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
        root_obj = dirs.path_to_obj('app')
        project = Project("default", "test-project", root_obj)
        user = {'id': session.get('user')['id'], 'role': 'OWNER'}
        print(root_obj)
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


@app.route('/set_color', methods=['POST'])
def set_color():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        print(request_data)
        if db.connect(db_adapter):
            pass # TODO
        else:
            print(str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    return redirect('/')