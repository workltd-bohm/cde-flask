import os
import json
import uuid

from app import *


@app.route('/input')
def input():
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        doc = open('app/static/file/input.json', 'r')
        file = doc.read()
        doc.close()
        resp = Response()
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = file
        return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp

@app.route('/get_session', methods=['POST'])
def get_session():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin() and session.get("project"):
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(session.get("project"))
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp

@app.route('/get_project', methods=['POST'])
def get_project():
    print('Data posting path: %s' % request.path)
    resp = Response()
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dirs.set_project_data(request_data)
        if "name" not in session.get("project"):
            print(str(msg.NO_PROJECT_SELECTED))
            resp.status_code = msg.NO_PROJECT_SELECTED['code']
            resp.data = str(msg.NO_PROJECT_SELECTED['message'])
            return resp

        position = session.get("project")["position"]
        project_name = session.get("project")["name"]
        user = session.get('user')
        if db.connect(db_adapter):
            result = db.get_project(db_adapter, project_name, user)
            if result:
                project = Project(result['project_id'], result['project_name'], Project.json_folders_to_obj(result['root_ic']))

                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps({"json": project.to_json(), "project" : position})
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
        request_data = json.loads(request.get_data())
        request_data["project"]["name"] = None
        request_data["project"]["position"] = None
        dirs.set_project_data(request_data)
        user = session.get('user')
        # print(request_data)
        if db.connect(db_adapter):
            response = {
                "project_name": "Projects",
                "root_ic": {
                    "ic_id": "",
                    "name": "Projects",
                    "history": [],
                    "path": ".",
                    "overlay_type": "project",
                    "is_directory": True,
                    "sub_folders": []
                }
            }
            result = db.get_my_projects(db_adapter, user)
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
            resp.data = json.dumps({"json": response, "project" : False})
            return resp

        else:
            print(str(msg.DB_FAILURE))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_user_profile', methods=['POST'])
def get_user_profile():
    print('Data posting path: %s' % request.path)
    resp = Response()
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dirs.set_project_data(request_data)
        user = session.get('user')
        # print(request_data)
        if db.connect(db_adapter):
            response = {
                "project_name": "Projects",
                "root_ic": {
                    "ic_id": "",
                    "name": user["username"],
                    "history": [],
                    "path": ".",
                    "overlay_type": "user",
                    "is_directory": False,
                    "sub_folders": [
                        {
                            "ic_id": "",
                            "name": "User Profile",
                            "parent": user["username"],
                            "history": [],
                            "path": user["username"],
                            "is_directory": False,
                        },
                    ]
                }
            }

            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps({"json": response, "project" : False})
            return resp

        else:
            print(str(msg.DB_FAILURE))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_root_market', methods=['POST'])
def get_root_market():
    print('Data posting path: %s' % request.path)
    resp = Response()
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        request_data["project"]["market"] = None
        dirs.set_project_data(request_data)
        user = session.get('user')
        # print(request_data)
        if db.connect(db_adapter):
            response = {
                "project_name": "Projects",
                "root_ic": {
                    "ic_id": "",
                    "name": "Market",
                    "history": [],
                    "path": ".",
                    "overlay_type": "market",
                    "is_directory": False,
                    "sub_folders": [
                        {
                            "ic_id": "",
                            "name": "Bids",
                            "parent": "Market",
                            "history": [],
                            "path": "Market",
                            "is_directory": False,
                        },
                        {
                            "ic_id": "",
                            "name": "Posts",
                            "parent": "Market",
                            "history": [],
                            "path": "Market",
                            "is_directory": False,
                        }
                    ]
                }
            }

            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps({"json": response, "project" : False})
            return resp

        else:
            print(str(msg.DB_FAILURE))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp

def get_input_file_fixed():
    doc = open('app/static/file/input.json', 'r')
    file = json.loads(doc.read())
    doc.close()
    filter_file = {}
    keys = list(file.keys())
    values = list(file.values())
    for i in range(0, len(keys), 2):
        elements = []
        name = 'Default'
        order = -1
        for j in range(0, len(values[i])):
            elements.append(values[i][j] + ', ' + values[i + 1][j])
        key = ''
        if keys[i] == 'volume_system_code':
            key = 'project_volume_or_system'
            name = 'Project Volume or System'
            order = 2
        if keys[i] == 'level_code':
            key = 'project_level'
            name = 'Project Level'
            order = 3
        if keys[i] == 'type_code':
            key = 'type_of_information'
            name = 'Type of Information'
            order = 4
        if keys[i] == 'role_code':
            key = 'role_code'
            name = 'Role Code'
            order = 5
        if keys[i] == 'number_code':
            key = 'file_number'
            name = 'File Number'
            order = 6
        if keys[i] == 'status_code':
            key = 'status'
            name = 'Status'
            order = 7
        if keys[i] == 'revision_code':
            key = 'revision'
            name = 'Revision'
            order = 8
        if keys[i] == 'uniclass_code':
            key = 'uniclass_2015'
            name = 'Uniclass 2015'
            order = 9
        filter_file[key] = {'elements': elements, 'name': name, 'order': order}
    return filter_file


