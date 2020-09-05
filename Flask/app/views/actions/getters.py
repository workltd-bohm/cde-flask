import os
import json
import uuid

from app import *


@app.route('/input')
def input():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        file = open('app/static/file/input.json', 'r').read()
        resp = Response()
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = file
        return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_project', methods=['POST'])
def get_project():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        # request_data = json.loads(request.get_data())
        #session.set("project_position") = request_data["project_position"]
        project_position = session.get("project_position")
        project_name = session["project_name"]
        user = app.test_json_request_project['user']
        # print(request_data)
        if db.connect(db_adapter):
            result = db.get_project(db_adapter, project_name, user)
            if result:
                project = Project(result['project_id'], result['project_name'], Project.json_folders_to_obj(result['root_ic']))
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps({"json": project.to_json(), "project_position" : project_position})
                return resp
            else:
                print("not_found")
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

