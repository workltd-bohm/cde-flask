from app import *

import app.views.actions.getters as gtr


def filter_out(request_json, files):
    filtered = []
    for file in files:
        diff = False
        for (key, value) in request_json.items():
            if value and getattr(file, key) != value:
                diff = True
                break
        if not diff:
            filtered.append(file)

    return filtered


@app.route('/get_filtered_files', methods=['POST', 'GET'])
def get_filtered_files():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    project_name = session.get("project")["name"]
    request_json = json.loads(request.get_data())
    # bundle = json.loads(request.get_data())
    # print(bundle)
    # path_id = bundle["path_id"]
    # temp_request_json = bundle["data"]
    # if temp_request_json and len(temp_request_json) > 0: request_json = temp_request_json
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
    resp = Response()
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_project(db_adapter, project_name, session['user'])
            if result:
                files = []
                p = Project.json_to_obj(result)
                new_ic_array = []
                p.find_folder(request_json['path_id'], p.root_ic, new_ic_array)
                # print(new_ic_array)
                new_ic = None
                for ic in new_ic_array:
                    if ic:
                        new_ic = ic
                # print(new_ic.to_json())
                p.extract_files(new_ic, files)
                filtered = filter_out(request_json['data'], files)

                #res = [file.to_json()['name'] + file.to_json()['type'] for file in filtered]
                response = {
                    "project_name": "Search",
                    "root_ic": {
                        "ic_id": "",
                        "name": "Search",
                        "history": [],
                        "path": ".",
                        "overlay_type": "search",
                        "is_directory": True,
                        "sub_folders": []
                    }
                }
                for file in filtered:
                    print (">>>>>>>>>>", file)
                    path = file.path if file.is_directory else file.path + file.type
                    proj_obj = {
                        "ic_id": file.ic_id,
                        "parent_id": file.parent_id,
                        "name": file.name,
                        "parent": "Search",
                        "history": file.history,
                        "path": path,
                        "type": file.type,
                        "overlay_type": "search_target",
                        "is_directory": False,
                    }
                    response['root_ic']["sub_folders"].append(proj_obj)

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


@app.route('/search_by_tags', methods=['POST'])
def search_by_tags():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))

        if db.connect(db_adapter):
            result = db.get_all_tags_with_ics(db_adapter)
            # print(result)
            if result:
                ics = []
                for tag in request_data['search_tags']:
                    if len(ics) == 0:
                        if tag in result[0]:
                            ics = result[0][tag]
                            continue
                    new_ics = []
                    if tag in result[0]:
                        for tag_ic in result[0][tag]:
                            for ic in ics:
                                if ic['ic_id'] == tag_ic['ic_id']:
                                    new_ics.append(tag_ic)
                                    break
                    ics = new_ics
                # print(ics)
                response = {
                    "project_name": "Search",
                    "root_ic": {
                        "ic_id": "",
                        "name": "Search",
                        "history": [],
                        "path": ".",
                        "overlay_type": "search",
                        "is_directory": True,
                        "sub_folders": []
                    }
                }
                if request_data['project_name'] == '':
                    request_data['project_name'] = session['project']['name']
                result = db.get_project(db_adapter, request_data['project_name'], session['user'])
                project = Project.json_to_obj(result)

                for ic in ics:
                    project.current_ic = None
                    file = project.find_ic_by_id(ic, ic['ic_id'], project.root_ic)
                    # print(file)
                    if file:
                        ic_json = file.to_json()
                        path = file.path if file.is_directory else file.path + file.type
                        ic_type = '' if file.is_directory else file.type
                        proj_obj = {
                            "ic_id": file.ic_id,
                            "parent_id": file.parent_id,
                            "name": file.name,
                            "parent": "Search",
                            "history": ic_json['history'],
                            "path": path,
                            "type": ic_type,
                            "overlay_type": "search_target",
                            "is_directory": file.is_directory,
                            "color": file.color
                        }
                        response['root_ic']["sub_folders"].append(proj_obj)
                # print(response)
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/search_by_name', methods=['POST'])
def search_by_name():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))

        if db.connect(db_adapter):
            if request_data['project_name'] == '':
                request_data['project_name'] = session['project']['name']
            result = db.get_project(db_adapter, request_data['project_name'], session['user'])

            if result:
                project = Project.json_to_obj(result)
                ics = []
                names = request_data['search_names']
                for i in range(0, len(names)):
                    if i == 0:
                        project.search_by_name(names[i], project.root_ic, ics)
                        # print('first', ics)
                    else:
                        new_ics = []
                        for ic in ics:
                            if names[i].lower() in ic.name.lower():
                                new_ics.append(ic)
                                break
                        # print('second', ics)
                        ics = new_ics
                response = {
                    "project_name": "Search",
                    "root_ic": {
                        "ic_id": "",
                        "name": "Search",
                        "history": [],
                        "path": ".",
                        "overlay_type": "search",
                        "is_directory": True,
                        "sub_folders": []
                    }
                }

                # print(ics)
                for ic in ics:
                    # print(ic.name)
                    path = ic.path if ic.is_directory else ic.path + ic.type
                    ic_type = '' if ic.is_directory else ic.type
                    ic_json = ic.to_json()
                    proj_obj = {
                        "ic_id": ic.ic_id,
                        "parent_id": ic.parent_id,
                        "name": ic.name,
                        "parent": "Search",
                        "history": ic_json['history'],
                        "path": path,
                        "type": ic_type,
                        "overlay_type": "search_target",
                        "is_directory": ic.is_directory,
                        "color": ic.color
                    }
                    response['root_ic']["sub_folders"].append(proj_obj)
                # print(response)
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp
