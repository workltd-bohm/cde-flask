import os
import io
import json
import uuid
from datetime import datetime
import zipfile
import shutil
from threading import Thread
import time
from PIL import Image

from app import *

from pathlib import Path
import app.model.helper as helper


@app.route('/get_file_name', methods=['POST', 'GET'])
def get_file_name():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_json = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json)) 
    if main.IsLogin():
        if db.connect(db_adapter):
            project_name = session.get("project")["name"]
            if project_name == 'Shared':
                result = db.get_project_from_shared(db_adapter, request_json, session['user'])
            else:
                result = db.get_project(db_adapter, project_name, session['user'])
            if result:
                project = Project.json_to_obj(result)
                name = request_json['file_name'] + request_json['type']
                if project.is_iso19650:
                    ic = project.find_ic_by_id(request_json, request_json['ic_id'], project.root_ic)
                    # for t in ic.tags:
                        # S1-M0-CP-H-3201.0-S0-P01_testtxt1.txt
                        # print(t.to_json())
                    message, user = db.get_user(db_adapter, {'id': session['user']['id']})
                    db.close_connection(db_adapter)
                    name = helper.get_iso_filename(ic, result, user)
                    # print(name)
                response = {'name': name, 'is_iso19650': project.is_iso19650}
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.STORED_FILE_NOT_FOUND)))
                resp = Response()
                resp.status_code = msg.STORED_FILE_NOT_FOUND['code']
                resp.data = str(msg.STORED_FILE_NOT_FOUND['message'])
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_file/<path:ic_id>', methods=['POST', 'GET'])
def get_file(ic_id):
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_json = {
                        # 'file_id':request.args.get('file_id'),
                        'ic_id': ic_id}
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
        if db.connect(db_adapter):
            result = db.get_file(db_adapter, request_json)
            if result:
                # project_name = session.get("project")["name"]
                # pr = db.get_project(db_adapter, project_name, session['user'])
                # if pr:
                #     project = Project.json_to_obj(pr)
                #     print('is ISO19650 comliant', project.is_iso19650)
                #     result.file_name = 'nesto'
                # logger.log(LOG_LEVEL, result.file_name)
                response = make_response(result.read())
                response.mimetype = result.file_name
                return response
            else:
                logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.STORED_FILE_NOT_FOUND)))
                resp = Response()
                resp.status_code = msg.STORED_FILE_NOT_FOUND['code']
                resp.data = str(msg.STORED_FILE_NOT_FOUND['message'])
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_shared_file/<path:file_id>', methods=['POST', 'GET'])
def get_shared_file(file_id):
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_json = {
                        # 'file_id':request.args.get('file_id'),
                        'file_id': file_id}
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
        if db.connect(db_adapter):
            result = db.get_file(db_adapter, request_json)
            if result:
                # logger.log(LOG_LEVEL, result.file_name)
                resp = Response(result.file_name)
                # response.headers.set('Content-Type', 'mime/jpeg')
                resp.headers.set(
                    'Content-Disposition', 'attachment', filename='%s' % result.file_name)
                resp.status_code = msg.DEFAULT_OK['code']
                return send_file(
                     io.BytesIO(result.read()),
                     attachment_filename=result.file_name)
            else:
                logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.STORED_FILE_NOT_FOUND)))
                resp = Response()
                resp.status_code = msg.STORED_FILE_NOT_FOUND['code']
                resp.data = str(msg.STORED_FILE_NOT_FOUND['message'])
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_thumb/<path:file_id>', methods=['POST', 'GET'])
def get_thumb(file_id):
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_json = {
                        # 'file_id':request.args.get('file_id'),
                        'file_id': file_id}
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
        if db.connect(db_adapter):
            result = db.get_file(db_adapter, request_json)
            if result:
                # logger.log(LOG_LEVEL, result.file_name)
                resp = Response(result.file_name)
                # response.headers.set('Content-Type', 'mime/jpeg')
                resp.headers.set(
                    'Content-Disposition', 'attachment', filename='%s' % result.file_name)
                resp.status_code = msg.DEFAULT_OK['code']
                return send_file(
                     io.BytesIO(result.read()),
                     attachment_filename=result.file_name)
            else:
                logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.STORED_FILE_NOT_FOUND)))
                resp = Response()
                resp.status_code = msg.STORED_FILE_NOT_FOUND['code']
                resp.data = str(msg.STORED_FILE_NOT_FOUND['message'])
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_folder/<path:parent_id>/<path:folder_name>', methods=['POST', 'GET'])
def get_folder(parent_id, folder_name):
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        if parent_id == 'root':
            project_name = folder_name
        else:
            project_name = session.get("project")["name"]
        request_json = {
                        'parent_id': parent_id,
                        'folder_name': folder_name}
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_json))
        if db.connect(db_adapter):
            if project_name == 'Shared':
                result = db.get_project_from_shared_by_parent_id(db_adapter, request_json, session['user'])
                project_name = result['project_name']
            u = session['user']
            response = db.get_project(db_adapter, project_name, u)
            project = Project.json_to_obj(response)
            ic = project.find_ic(request_json, folder_name, project.root_ic)

            path = os.getcwd() + '/'
            millis = int(round(time.time() * 1000))
            try:
                if not os.path.exists(path + 'tmp/'):
                    os.mkdir(path + 'tmp/')
                if not os.path.exists(path + 'tmp/' + u['id'] + '_' + str(millis)):
                    os.mkdir(path + 'tmp/' + u['id'] + '_' + str(millis))
            except OSError as err:
                logger.log(LOG_LEVEL, 'Creation of the directory {} failed'.format(path + '\n' + err))
            path = os.getcwd() + '/tmp/' + u['id'] + '_' + str(millis) + '/'
            json_to_temp_folder_struct(path, ic, response)

            zipf = zipfile.ZipFile('tmp/' + u['id'] + '_' + str(millis) + '/' + ic.name + '.zip', 'w', zipfile.ZIP_DEFLATED)

            # print('Zipping: %s' % 'tmp/' + u['id'] + '_' + str(millis) + '/' + ic.name)
            zipdir('tmp/' + u['id'] + '_' + str(millis) + '/' + ic.name, zipf)
            zipf.close()
            # print(ic.name + '.zip')

            resp = send_file(os.getcwd() + '/tmp/' + u['id'] + '_' + str(millis) + '/' + ic.name + '.zip',
                             mimetype='zip',
                             attachment_filename=ic.name + '.zip',
                             as_attachment=True)

            thread = Thread(target=remove_folder, kwargs={'path': os.getcwd() + '/tmp/' + u['id'] + '_' + str(millis)})
            thread.start()

            logger.log(LOG_LEVEL, 'Response: {}'.format(ic.name + '.zip'))

            return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


def upload_file_process(request_json, file=None):
    logger.log(LOG_LEVEL, "Upload File Process")
    directory = request_json['parent_path']
    u = {'user_id': session['user']['id'], 'username': session['user']['username']}
    # if request_json['is_file']:  directory = directory[:directory.rfind('/')]
    us = {'user_id': session['user']['id'],
                 'username': session['user']['username'],
                 'picture': session['user']['picture']}
    access = Access(us, request_json['parent_id'], '', Role.OWNER.value, 'indefinitely')
    details = Details(u, 'Created file', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), request_json['new_name'])
    file_obj = File(str(uuid.uuid1()),
                    '.'.join(request_json['new_name'].split('.')[:-1]),
                    file.filename if file else request_json["original_name"],
                    directory,
                    [details],
                    directory + '/' + request_json['new_name'],
                    "." + request_json['new_name'].split('.')[-1],
                    request_json['ic_id'],
                    '',
                    [],
                    [],
                    [],
                    [access], # access
                    '',
                    'description') # request_json['description'])
    try:
        file_obj.project_code = request_json['project_code']
        file_obj.company_code = request_json['company_code']
        file_obj.project_volume_or_system = request_json['project_volume_or_system']
        file_obj.project_level = request_json['project_level']
        file_obj.type_of_information = request_json['type_of_information']
        file_obj.role_code = request_json['role_code']
        file_obj.file_number = request_json['file_number']
        file_obj.status = request_json['status']
        file_obj.revision = request_json['revision']
    except Exception:
        pass
    # print(file_obj.to_json())
    if db.connect(db_adapter):
        # with open('app/templates/activity/activity.html', "rb") as f:
        #     encoded = Binary(f.read())  # request_json['file']
        if file:
            encoded = file
            result = db.upload_file(db_adapter, request_json['project_name'], file_obj, encoded)
        else:
            file_obj.stored_id = request_json["stored_id"]
            #result, ic = db.create_folder(db_adapter, request_json['project_name'], file_obj)
            result = db.upload_file(db_adapter, request_json['project_name'], file_obj)
        if result:
            logger.log(LOG_LEVEL, ">> {}".format(result["message"]))
            resp = Response()
            resp.status_code = result["code"]
            resp.data = result["message"]
            return resp
    else:
        logger.log(LOG_LEVEL, "> {}".format(str(msg.DB_FAILURE)))
        resp = Response()
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message'])
        return resp


@app.route('/upload_file', methods=['POST'])
def upload_file():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    # print(session['project'])
    if main.IsLogin():
        # print(json.loads(request.get_data()))
        if 'file' not in request.files:
            logger.log(LOG_LEVEL, 'No file part: '.format(str(msg.DEFAULT_ERROR['message'])))
            resp = Response()
            resp.status_code = msg.DEFAULT_ERROR['code']
            resp.data = str(msg.DEFAULT_ERROR['message'])
            return resp

        file = request.files['file']
        # print(file)
        logger.log(LOG_LEVEL, 'Request data: {}'.format(request.form['data']))
        request_json = json.loads(request.form['data'])  # test_json_request
        set_project_data(request_json, True)
        
        return upload_file_process(request_json, file)

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/update_file', methods=['POST'])
def update_file():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    # print(session['project'])
    if main.IsLogin():
        # print(json.loads(request.form))
        if 'file' not in request.files:
            logger.log(LOG_LEVEL, 'No file part: '.format(str(msg.DEFAULT_ERROR['message'])))
            resp = Response()
            resp.status_code = msg.DEFAULT_ERROR['code']
            resp.data = str(msg.DEFAULT_ERROR['message'])
            return resp

        file = request.files['file']
        # print(file)
        request_json = json.loads(request.form['data'])
        logger.log(LOG_LEVEL, 'Request data: {}'.format(request_json))
        # set_project_data(request_json, True)

        if db.connect(db_adapter):
            result = db.get_project(db_adapter, request_json["project_name"], session['user'])
            if result:
                project = Project.json_to_obj(result)

                ic = project.find_ic_by_id(request_json, request_json['ic_id'], project.root_ic)

                message = db.update_file(db_adapter, request_json["project_name"], ic, file.read())

                resp = Response()
                resp.status_code = message['code']
                resp.data = str(message['message'])
                return resp
        
        else:
            logger.log(LOG_LEVEL, str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/update_file_annotation', methods=['POST'])
def update_file_annotation():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_data = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
    if main.IsLogin():

        if db.connect(db_adapter):
            
            message = db.update_file_annotations(db_adapter, request_data)

            resp = Response()
            resp.status_code = message['code']
            resp.data = str(message['message'])
            return resp
        
        else:
            logger.log(LOG_LEVEL, str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/delete_file_annotation', methods=['POST'])
def delete_file_annotation():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    request_data = json.loads(request.get_data())
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
    if main.IsLogin():

        if db.connect(db_adapter):
            
            message = db.delete_file_annotation(db_adapter, request_data)

            resp = Response()
            resp.status_code = message['code']
            resp.data = str(message['message'])
            return resp
        
        else:
            logger.log(LOG_LEVEL, str(msg.DB_FAILURE))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


def create_dir_process(request_data):
    logger.log(LOG_LEVEL, "Create Dir Process")

    user = session.get('user')
    user_details = {'user_id': user['id'], 'username': user['username']}
    user_access = {
        'user_id': user['id'],
        'username': user['username'],
        'picture': user['picture']
    }

    # Check If User Is Developer On A project - Just inherit the role
    # Owner of the project becomes the owner of the file

    # get the project
    project_json = db.get_project(db_adapter, request_data['project_name'], user)
    
    if not project_json: # Failsafe
        logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND))
        resp = Response()
        resp.status_code = msg.PROJECT_NOT_FOUND['code']
        resp.data = str(msg.PROJECT_NOT_FOUND['message'])
        return resp

    # Project as OBJECT
    project = Project.json_to_obj(project_json)

    # find the ic from which user is making action
    this_ic = project.find_ic_by_id(request_data, request_data['ic_id'], project.root_ic).to_json()

    if not this_ic: #failsafe
        logger.log(LOG_LEVEL, str(msg.IC_PATH_NOT_FOUND))
        resp = Response()
        resp.status_code = msg.IC_PATH_NOT_FOUND['code']
        resp.data = str(msg.IC_PATH_NOT_FOUND['message'])
        return resp

    # get the role that he has in this IC
    my_role = None
    user_access_owner = None
    for user_with_access in this_ic['access']:
        if user_with_access['role'] == Role.OWNER.value: # get owner
            user_access_owner = user_with_access['user']
        if user_with_access['user']['user_id'] == user['id']: # get role of this user
            my_role = user_with_access['role']

    # generate new ic id
    ic_id = str(uuid.uuid1())
    # create access array
    access = [Access(user_access_owner, request_data['parent_id'], ic_id, Role.OWNER.value, 'indefinitely')]
    
    # if user performing action isn't owner add him to access inheriting a role
    if user_access_owner != user_access:
        access.append(Access(user_access, request_data['parent_id'], ic_id, my_role, 'indefinitely'))

    details = Details(user_details, 'Created folder', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), request_data['new_name'])
    
    if 'color' in request_data:
        color = request_data['color']
    else:
        color = ''
    
    folder = Directory(ic_id,
                        request_data['new_name'],
                        request_data['parent_path'],
                        [details],
                        request_data['parent_path'] + '/' + request_data['new_name'],
                        request_data['ic_id'],
                        color,
                        [],
                        [],
                        [],
                        access)
    if db.connect(db_adapter):
        result, ic = db.create_folder(db_adapter, request_data['project_name'], folder)
        if result:
            #print(result["message"])
            resp = Response()
            resp.status_code = result["code"]
            resp.data = result["message"]
            return resp
    else:
        logger.log(LOG_LEVEL, str(msg.DB_FAILURE))
        resp = Response()
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message'])
        return resp


@app.route('/create_dir', methods=['POST'])
def create_dir():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        if 'project_name' in request_data.keys() and request_data['project_name'] == '':
            request_data['project_name'] = session['project']['name']
        set_project_data(request_data, True)
        #print(request_data)
        
        return create_dir_process(request_data)

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/rename_ic', methods=['POST'])
def rename_ic():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        
        set_project_data(request_data, True)
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))

        if db.connect(db_adapter):
            rename = {
                "project_name": request_data["project_name"],
                "parent_id": request_data['parent_id'],
                "ic_id": request_data['ic_id'],
                "path": request_data["parent_path"],
                "old_name": request_data["old_name"],
                "new_name": request_data["new_name"],
                "is_directory": True if "is_directory" in request_data else False,
            }
            print(rename)

            u = {'user_id': session['user']['id'], 'username': session['user']['username']}
            result, project = db.rename_ic(db_adapter, rename, u)

            if request_data['parent_id'] == 'root':
                # request_data['project_name'] = request_data["new_name"]
                # set_project_data(request_data, True)
                session['project']['name'] = request_data["new_name"]
                
            logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
            resp = Response()
            resp.status_code = result["code"]
            resp.data = result["message"]
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

@app.route("/trash_ic", methods=['POST'])
def trash_ic():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        ic_data = json.loads(request.get_data())
        set_project_data(ic_data, True) # session['project']
        ic_data['user_id'] = session['user']['id']
        
        logger.log(LOG_LEVEL, 'POST data: {}'.format(ic_data)) 

        if db.connect(db_adapter):
            result = db.trash_ic(db_adapter, ic_data)

            if result == msg.PROJECT_SUCCESSFULLY_TRASHED \
                or result == msg.IC_SUCCESSFULLY_TRASHED:
                session.get("project").update({'section': 'trash'})
                session.get("project").update({'position': None})
                session.modified = True

            logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))

            resp = Response()
            resp.status_code = result["code"]
            resp.data = result["message"]
            return resp
        
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp
    
    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

@app.route("/empty_trash", methods=['POST'])
def empty_trash():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        #set_project_data(ic_data, True)
        user = session['user']
        user['user_id'] = user['id']
        if db.connect(db_adapter):
            result = db.empty_my_trash(db_adapter, user)

            if result == msg.PROJECT_SUCCESSFULLY_TRASHED:
                session.get("project").update({'section': 'project'})
                session.get("project").update({'position': None})
                session.modified = True

            #logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))

            resp = Response()
            resp.status_code = result["code"]
            resp.data = result["message"]
            return resp
        
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp
    
    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

@app.route("/restore_ic", methods=['POST'])
def restore_ic():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        ic_data = json.loads(request.get_data())
        set_project_data(ic_data, True)
        ic_data['user_id'] = session['user']['id']
        
        logger.log(LOG_LEVEL, 'POST data: {}'.format(ic_data)) 

        if db.connect(db_adapter):
            result = db.restore_ic(db_adapter, ic_data)

            if result == msg.PROJECT_SUCCESSFULLY_RESTORED \
                or result == msg.IC_SUCCESSFULLY_RESTORED:
                session.get("project").update({'section': 'trash'})
                session.get("project").update({'position': ''})
                session.modified = True

            logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))

            resp = Response()
            resp.status_code = result["code"]
            resp.data = result["message"]
            return resp
        
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp
    
    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

@app.route('/delete_ic', methods=['POST'])
def delete_ic():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        delete_ic_data = json.loads(request.get_data())
        set_project_data(delete_ic_data, True)
        delete_ic_data['user_id'] = session['user']['id']
        logger.log(LOG_LEVEL, 'POST data: {}'.format(delete_ic_data))
        if db.connect(db_adapter):
            result = db.delete_ic(db_adapter, delete_ic_data)
            if result == msg.PROJECT_SUCCESSFULLY_DELETED:
                session.get("project").update({'section': 'project'})
                session.get("project").update({'position': None})
                session.modified = True
            logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
            resp = Response()
            resp.status_code = result["code"]
            resp.data = result["message"]
            return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

# ----------------------------------------------------

# @app.route('/move_ic', methods=['POST'])
# def move_ic():
#     print('Data posting path: %s' % request.path)
#     if main.IsLogin():
#         request_data = json.loads(request.get_data())
#         set_project_data(request_data, True)
#         print(request_data)
#         if db.connect(db_adapter):
#             resp = Response()
#             resp.status_code = msg.DEFAULT_OK['code']
#             resp.data = str(msg.DEFAULT_OK['message'])
#             return resp

#         else:
#             print(str(msg.DB_FAILURE))
#             resp = Response()
#             resp.status_code = msg.DB_FAILURE['code']
#             resp.data = str(msg.DB_FAILURE['message'])
#             return resp

#     resp = Response()
#     resp.status_code = msg.DEFAULT_ERROR['code']
#     resp.data = str(msg.DEFAULT_ERROR['message'])
#     return resp

# ----------------------------------------------------

@app.route('/get_dir')
def get_dir():
    print('Data posting path: %s' % request.path)
    print(json.dumps(path_to_dict('app')))
    return redirect('/')


@app.route('/set_dir')
def set_dir():
    print('Data posting path: %s' % request.path)
    obj = path_to_obj('app')
    print(obj.to_json())

    print(Project.json_folders_to_obj(obj.to_json()).to_json())
    return redirect('/')

# ----------------------------------------------------


def path_to_obj(path, parent=False, parent_id=""):
    p = Path(path)
    name = p.stem
    new_id = str(uuid.uuid1())
    parent = parent if parent != False else path # new_id
    u = {'user_id': session['user']['id'], 'username': session['user']['username']}
    details = Details(u, 'Date created', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"))
    if os.path.isdir(path):
        root = Directory(new_id,
                         name,
                         parent,
                         [details],
                         path,
                         parent_id,
                         '',
                         [],
                         [],
                         [],
                         [],
                         [path_to_obj(path + '/' + x, path, new_id) for x in os.listdir(path)
                          if not x.endswith(".pyc") and "__pycache__" not in x])
    else:
        root = File(new_id, name, name, parent, [details], path, p.suffix, new_id, '', [], [], [], [], '', '')
    return root


def path_to_dict(path):
    d = {'name': os.path.basename(path), 'path': path}
    if os.path.isdir(path):
        d['type'] = "directory"
        d['children'] = [path_to_dict(os.path.join(path, x)) for x in os.listdir(path) if not x.endswith(".pyc")
                         and "__pycache__" not in x]
    else:
        d['type'] = "file"
    return d


def json_to_temp_folder_struct(path, ic, project):
    if ic.is_directory:
        try:
            os.mkdir(path + ic.name)
        except OSError:
            print("Creation of the directory %s failed" % path)
        for sub_folder in ic.sub_folders:
            json_to_temp_folder_struct(path + ic.name + '/', sub_folder, project)
    else:
        if db.connect(db_adapter):
            result = db.get_file(db_adapter, {'ic_id': ic.ic_id})
            if result:
                # print(result.file_name)
                response = result.read()
                f = open(path + helper.get_iso_filename(ic, project, session['user']), "wb+")
                f.write(response)
                f.close()
            else:
                print(str(msg.STORED_FILE_NOT_FOUND))


def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, folders, files in os.walk(path):
        for folder in folders:
            ziph.write(os.path.join(root, folder), os.path.relpath(os.path.join(root, folder), os.path.join(path, '..')))
        for file in files:
            ziph.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), os.path.join(path, '..')))


def set_project_data(data, save=False):
    # print(data)
    # print(session.get("project"))
    if "project" in data:
        if data["project"]:
            session.get("project").update(data["project"])

    if "name" in session.get("project"):
        project_name = session.get("project")["name"]
        user = session.get('user')
        if session.get("undo") and session.get("undo")["user"] == user and session.get("undo")["project_name"] == project_name:
            session.get("project")["undo"] = True
        else:
            session.get("project")["undo"] = False
        #print(session["undo"])

    if save:
        session["undo"] = {}
        session.get("project")["undo"] = False
        if db.connect(db_adapter):
                result = db.get_project(db_adapter, project_name, user)
                if result:
                    session.get("undo")["data"] = result
                    session.get("undo")["position"] = session.get("project")["position"]
                    session.get("undo")["project_name"] = session.get("project")["name"]
                    session.get("undo")["user"] = session.get('user')
                    session.get("project")["undo"] = True

    session.modified = True


def remove_folder(path):
    time.sleep(30)
    # Delete the zip file if not needed
    shutil.rmtree(path)
