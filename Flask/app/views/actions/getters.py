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
    resp = Response()
    if main.IsLogin():
        # request_data = json.loads(request.get_data())
        #session.set("project_position") = request_data["project_position"]
        if "project_name" not in session:
            print(str(msg.NO_PROJECT_SELECTED))
            resp.status_code = msg.NO_PROJECT_SELECTED['code']
            resp.data = str(msg.NO_PROJECT_SELECTED['message'])
            return resp
        project_position = session.get("project_position")
        project_name = session["project_name"]
        user = session['user']
        # print(request_data)
        if db.connect(db_adapter):
            result = db.get_project(db_adapter, project_name, user)
            if result:
                project = Project(result['project_id'], result['project_name'], Project.json_folders_to_obj(result['root_ic']))

                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps({"json": project.to_json(), "project_position" : project_position})
                return resp
            else:
                print(str(msg.PROJECT_NOT_FOUND))
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp
        else:
            print(str(msg.DB_FAILURE))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_root_project', methods=['POST'])
def get_root_project():
    print('Data posting path: %s' % request.path)
    resp = Response()
    if main.IsLogin():

        user = session['user']
        # print(request_data)
        if db.connect(db_adapter):
            response = {
                "project_name": "Projects",
                "root_ic": {
                    "ic_id": "",
                    "name": "Projects",
                    "history": [],
                    "path": ".",
                    "is_root": True,
                    "is_directory": True,
                    "sub_folders": []
                }
            }
            result = db.get_all_projects(db_adapter)
            if result:
                for project in result:
                    proj_obj = {
                        "ic_id": "",
                        "name": project["project_name"],
                        "parent": "Projects",
                        "history": [],
                        "path": "Projects/"+project["project_name"],
                        "is_directory": False,
                    }
                    response['root_ic']["sub_folders"].append(proj_obj)

            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps({"json": response, "project_position" : False})
            return resp

        else:
            print(str(msg.DB_FAILURE))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp