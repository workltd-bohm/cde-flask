from app import *


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
    project_name = request.args.get('project_name')
    request_json = app.test_json_request_get_filtered_files
    if request.get_data(): request_json = json.loads(request.get_data())
    print(request_json)
    if main.IsLogin():
        if db.connect(db_adapter):
            # result = db.get_all_projects(db_adapter)
            result = db.get_project(db_adapter, project_name, session['user'])
            files = []
            # for project in result:
            #     print(project)
            #     project.pop('_id', None)
            #     p = Project.json_to_obj(project)
            #     p.extract_files(p.root_ic, files)
            p = Project.json_to_obj(result)
            p.extract_files(p.root_ic, files)

            # request_json.pop('project_id', None)
            # request_json.pop('project_name', None)
            filtered = filter_out(request_json, files)

            print(len(filtered))

            response = [file.to_json() for file in filtered]
            print(response)
            # print(">>>", json.dumps(result))
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = json.dumps(response)  # , default=str)
            return resp
        else:
            print(str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp



