from app import *


def filter_out(request, files):
    filtered = []
    for file in files:
        if request['project_code'] and file.project_code != request['project_code']:
            break
        if request['company_code'] and file.project_code != request['company_code']:
            break
        if request['project_volume_or_system'] and file.project_code != request['project_volume_or_system']:
            break
        if request['project_level'] and file.project_code != request['project_level']:
            break
        if request['type_of_information'] and file.project_code != request['type_of_information']:
            break
        if request['role_code'] and file.project_code != request['role_code']:
            break
        if request['file_number'] and file.project_code != request['file_number']:
            break
        if request['status'] and file.project_code != request['status']:
            break
        if request['revision'] and file.project_code != request['revision']:
            break
        if request['overlay_type'] and file.project_code != request['overlay_type']:
            break
        filtered.append(file)
    return filtered

@app.route('/get_filtered_files', methods=['POST', 'GET'])
def get_filtered_files():
    print('Data posting path: %s' % request.path)
    request_json = app.test_json_request_get_filtered_files
    if request.get_data(): request_json = json.loads(request.get_data())
    print(request_json)
    if main.IsLogin():
        if db.connect(db_adapter):
            # result = db.get_all_projects(db_adapter)
            result = db.get_project(db_adapter, request_json['project_name'], session['user'])
            files = []
            # for project in result:
            #     print(project)
            #     project.pop('_id', None)
            #     p = Project.json_to_obj(project)
            #     p.extract_files(p.root_ic, files)
            p = Project.json_to_obj(result)
            p.extract_files(p.root_ic, files)

            filtered = filter_out(request_json, files)

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



