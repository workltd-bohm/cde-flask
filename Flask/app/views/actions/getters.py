import os
import json
import uuid
import base64
from datetime import datetime

from app import *


@app.route('/input')
def input():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
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
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin() and session.get("project"):
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(session.get("project"))
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/set_project', methods=['POST'])
def set_project():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dirs.set_project_data(request_data)

        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = str(msg.DEFAULT_OK['message'])
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_project', methods=['POST'])
def get_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        dirs.set_project_data(request_data)
        if "name" not in session.get("project"):
            logger.log(LOG_LEVEL, str(msg.NO_PROJECT_SELECTED))
            resp.status_code = msg.NO_PROJECT_SELECTED['code']
            resp.data = str(msg.NO_PROJECT_SELECTED['message'])
            return resp

        if 'project' in request_data:
            if request_data['project'] == {'position': None, 'section': 'project'}:
                return redirect(url_for('get_root_project', data={}))

        position = session.get("project")["position"]
        project_name = session.get("project")["name"]
        user = session.get('user')
        if db.connect(db_adapter):
            if project_name == 'Shared':
                result, ic_shares = db.get_my_shares(db_adapter, user)
                name_id = str(uuid.uuid1())
                us = {'user_id': session['user']['id'],
                        'username': session['user']['username'],
                        'picture': session['user']['picture']}
                access = Access(us, '', '', Role.ADMIN.value)
                
                u = {'user_id': session['user']['id'], 'username': session['user']['username']}
                details = Details(u, 'Created project', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), 'Shared')
                root_obj = IC(name_id,
                            'Shared',
                            ".",
                            [details],
                            'Shared',
                            'root',
                            '',
                            [],
                            [],
                            [],
                            [access])
                project = Project("default", 'Shared', root_obj)
                for ic in result:
                    project.root_ic.sub_folders.append(ic)
                result = project.to_json()
            else:
                result = db.get_project(db_adapter, project_name, user)

            if result:
                project = Project.json_to_obj(result)
                # p = Project(project.project_id, project.project_name, None)
                project = project.filter_by_access(session['user'], project.root_ic)
                # project = Project(result['project_id'], result['project_name'], Project.json_folders_to_obj(result['root_ic']))

                project = project.to_json()
                
                if project_name == 'Shared':
                    for i, ic in enumerate(project['root_ic']['sub_folders']):
                        project['root_ic']['sub_folders'][i]['project_id'] = ic_shares[i]['project_id']

                resp.status_code = msg.DEFAULT_OK['code']
                # print(project.to_json())
                resp.data = json.dumps({"json": project, "project" : position, "session": session.get("project")})
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND))
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_my_projects', methods=['POST'])
def get_my_projects():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()
    if main.IsLogin():
        user = session.get('user')
        # print(request_data)
        if db.connect(db_adapter):
            result = db.get_my_projects(db_adapter, user)

            response = {
                    'html': render_template("popup/folder_structure.html",
                                            ),
                    'data': result
                }
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp

            # resp.status_code = msg.DEFAULT_OK['code']
            # resp.data = resp.data = json.dumps({"data": result, "project" : False, "session": session.get("project")})
            # resp.data = json.dumps(result)
            # return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_root_project', methods=['GET', 'POST'])
def get_root_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()
    if main.IsLogin():
        request_data = {}
        if request.get_data():
            request_data = json.loads(request.get_data())
        else:
            request_data = {'project': {'name': None, 'position': None}}

        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))

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
            # if result:
            for project in result:
                if project:
                    proj_obj = {
                        "ic_id": "",
                        "name": project["project_name"],
                        "parent": "Projects",
                        "history": [],
                        "path": "Projects/"+project["project_name"],
                        "is_directory": False,
                    }
                    response['root_ic']["sub_folders"].append(proj_obj)

            result, ic_shares = db.get_my_shares(db_adapter, user)
            if result:
            # for share in result:
            #     if share:
                # pr = db.get_my_project(db_adapter, share["project_id"])
                # pr.current_ic = None
                # ic = pr.find_ic_by_id(share, share['ic_id'], pr.root)
                shared_obj = {
                    "ic_id": "",
                    "name": 'Shared',
                    "parent": "Projects",
                    "history": [],
                    "path": "Projects/shared",
                    "is_directory": False,
                }
                response['root_ic']["sub_folders"].append(shared_obj)

            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps({"json": response, "project" : False, "session": session.get("project")})
            return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp

@app.route('/get_trash', methods=['POST'])
def get_trash():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()

    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        request_data["project"]["name"] = None
        request_data["project"]["position"] = None  # reset position
        dirs.set_project_data(request_data)
        user = session.get('user')
        # print(request_data)

        if db.connect(db_adapter):

            # setup trash container to take in information
            response = {
                "project_name": "Trash",
                "root_ic": {
                    "ic_id": "",
                    "name": "Trash",
                    "history": [],
                    "path": ".",
                    "overlay_type": "trash",
                    "is_directory": True,
                    "sub_folders": []
                }
            }

            # gets project list from Users.Roles 'trash' -> project id & role (lvl of access)
            my_trashed_items = db.get_my_trash(db_adapter, user)

            for trashed_project in my_trashed_items:
                proj_obj = dict()

                if trashed_project:
                    proj_obj['project_id'] = trashed_project['project_id']
                    proj_obj['parent'] = "Trash"
                    proj_obj['history'] = []
                    proj_obj['overlay_type'] = "trash_planet"

                    if 'project_name' in trashed_project.keys():
                        proj_obj['name'] =          trashed_project['project_name']
                        proj_obj['is_directory'] =  "" 
                        proj_obj['ic_id'] =         ""
                        proj_obj['parent_id'] =     "root"
                    else:
                        proj_obj['name'] =          trashed_project['name']
                        if 'type' in trashed_project.keys():
                            proj_obj['name'] += trashed_project['type']
                        proj_obj['is_directory'] =  trashed_project['is_directory']
                        proj_obj['ic_id'] =         trashed_project['ic_id']
                        proj_obj['parent_id'] =     trashed_project['parent_id']

                    proj_obj['path'] = "Trash/" + proj_obj['name'] # TODO maybe leave path

                    # fill root container with found items (which will later become planets)
                    response['root_ic']["sub_folders"].append(proj_obj)

            resp.status_code = msg.DEFAULT_OK['code'] # get response code
            session.get("project").update({'section': 'trash'})
            resp.data = json.dumps({"json": response, "project" : False, "session": session.get("project")})
            return resp
        else:
            # failsafe
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    # user not logged
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_user_profile', methods=['POST'])
def get_user_profile():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
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
            resp.data = json.dumps({"json": response, "project": False})
            return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_root_market', methods=['POST'])
def get_root_market():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
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
                        # {
                        #     "ic_id": "",
                        #     "name": "Bids",
                        #     "parent": "Market",
                        #     "history": [],
                        #     "path": "Market",
                        #     "is_directory": False,
                        # },
                        # {
                        #     "ic_id": "",
                        #     "name": "Posts",
                        #     "parent": "Market",
                        #     "history": [],
                        #     "path": "Market",
                        #     "is_directory": False,
                        # }
                    ]
                }
            }

            result = db.get_all_posts(db_adapter)

            for post in result:
                proj_obj = {
                    "ic_id": post['post_id'],
                    # "parent_id": ic.parent_id,
                    "name": post['title'],
                    "parent": "Market",
                    "history": [],
                    "path": "Market/" + post['title'],
                    # "type": ic_type,
                    "overlay_type": "post_ic",
                    "is_directory": False,
                }
                response['root_ic']["sub_folders"].append(proj_obj)

            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps({"json": response, "project" : False})
            return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_viewer', methods=['POST'])
def get_viewer():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        response = {
            'html': render_template("dashboard/viewer/activity.html",
                                    # TODO
                                    ),
            'data': []
        }
        # print(response)
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_all_tags', methods=['GET'])
def get_all_tags():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_all_tags(db_adapter)
            if result:
                response = {
                    'data': result
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps({'data': []})
                return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp

@app.route('/get_all_users', methods=['GET'])
def get_all_users():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        if db.connect(db_adapter):
            usernames = db.get_all_users(db_adapter)
            response = {
                'users': usernames
            }
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_encoded_data', methods=['POST', 'GET'])
def get_encoded_data():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_data = request.get_data()
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
    if main.IsLogin():
        base64_bytes = base64.b64encode(request_data)
        return base64_bytes
    else:
        return redirect('/login')

    resp = Response()
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_shared_ic/<path:ic_data>', methods=['POST', 'GET'])
def get_shared_ic(ic_data):
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_data = base64.b64decode(ic_data).decode('utf-8')
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
    resp = Response()
    if main.IsLogin():
        if db.connect(db_adapter):
            request_json = json.loads(request_data)

            project_json = db.get_project(db_adapter, request_json['project']['name'], session['user'])

            if project_json:
                project = Project.json_to_obj(project_json)

                ic = project.find_ic_by_id(request_json['project']['position'],
                                           request_json['project']['position']['ic_id'],
                                           project.root_ic)

                success = False
                for access in ic.access:
                    if session['user']['id'] == access.user['user_id']:
                        success = True
                        break

                if success:
                    dirs.set_project_data(request_json)
                    return redirect('/')
                else:
                    resp = Response()
                    resp.status_code = msg.NO_ACCESS['code']
                    resp.data = str(msg.NO_ACCESS['message'])
                    return resp
            else:
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp

    return redirect(url_for('login', data=ic_data), code=307)


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


