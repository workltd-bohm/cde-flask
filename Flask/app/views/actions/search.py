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
    print('Data posting path: %s' % request.path)
    project_name = session.get("project")["name"]
    request_json = json.loads(request.get_data())
    # bundle = json.loads(request.get_data())
    # print(bundle)
    # path_id = bundle["path_id"]
    # temp_request_json = bundle["data"]
    # if temp_request_json and len(temp_request_json) > 0: request_json = temp_request_json
    print(request_json)
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
                print(new_ic.to_json())
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
                    proj_obj = {
                        "ic_id": file.to_json()['ic_id'],
                        "parent_id": file.to_json()['parent_id'],
                        "name": file.to_json()['name'],
                        "parent": "Search",
                        "history": [],
                        "path": "Search/"+file.to_json()['name'] + file.to_json()['type'],
                        "type": file.to_json()['type'],
                        "overlay_type": "search_target",
                        "is_directory": False,
                    }
                    response['root_ic']["sub_folders"].append(proj_obj)

                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
        else:
            print(str(msg.DB_FAILURE))

            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_filter_activity', methods=['POST'])
def get_filter_activity():
    resp = Response()
    print('Data posting path: %s' % request.path)
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        name = request_data['name']
        print(request_data)

        if name == 'Projects':
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = str(msg.DEFAULT_OK['message'])
            return resp

        if db.connect(db_adapter):
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

                response = {
                    'html': render_template("activity/filter_folders.html",
                                            project_name=session.get("project")["name"],
                                            search=filter_file,
                                            details=details,
                                            tags=tags,
                                            comments = comments,
                                            file_name=file_name,
                                            path=path,
                                            share_link=share_link,
                                            parent_id=result.parent_id,
                                            ic_id=result.ic_id
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
