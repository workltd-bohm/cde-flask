import os
import json
import uuid
from datetime import datetime
from PIL import Image
import binascii
import io

from app import *
import app.views.actions.getters as gtr


# if deletion needs to be performed after pressing the x button on the upload popup, but havin in mind all that has been already uploaded
# temp_upload_list = {}


@app.route('/clear_projects')
def clear_projects():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        if db.connect(db_adapter):
            db.clear_db(db_adapter, session['user'])
            session.get("project")["name"] = ''
            session.get("user")["picture"] = ''
            session.modified = True
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp
    
    return redirect('/')


@app.route('/select_project', methods=['POST'])
def select_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        session.get("project")["name"] = request_data['choose_project']
        session.modified = True
        resp = Response()
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = str(msg.DEFAULT_OK['message'])
        return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/create_project', methods=['POST'])
def create_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        user = session.get('user')
        name_id = str(uuid.uuid1())
        us = {'user_id': session['user']['id'],
                 'username': session['user']['username'],
                 'picture': session['user']['picture']}
        access = Access(us, '', '', Role.OWNER.value, 'indefinitely')
        
        u = {'user_id': session['user']['id'], 'username': session['user']['username']}
        details = Details(u, 'Created project', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), request_data['project_name'])
        root_obj = IC(name_id,
                      request_data['project_name'],
                      ".",
                      [details],
                      request_data['project_name'],
                      'root',
                      '',
                      [],
                      [],
                      [],
                      [access])
        project = Project("default", request_data['project_name'], root_obj)
        project.is_iso19650 = request_data['is_iso']
        # print('******', project.to_json())
        if db.connect(db_adapter):
            result, id = db.upload_project(db_adapter, project, user)

            # if deletion needs to be performed after pressing the x button on the upload popup, but havin in mind all that has been already uploaded
            # if result == msg.PROJECT_SUCCESSFULLY_ADDED:
            #     if session['user']['id'] not in temp_upload_list:
            #         temp_upload_list[session['user']['id']] = {}
            #     temp_upload_list[session['user']['id']]['project'] = {'project_id': id, 'time': datetime.now()}
            if result:
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


@app.route('/upload_existing_project', methods=['POST', 'GET'])
def upload_existing_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    # print('>>>>>>>>>>>>>>>>>', request.args)
    # print('>>>>>>>>>>>>>>>>>', request.form)
    logger.log(LOG_LEVEL, 'POST data: {}'.format(request.form))

    if 'user' in session:
        user = session['user']

    if main.IsLogin():
        if db.connect(db_adapter):
            path = request.form['path']
            is_dir = request.form['is_dir']
            project = db.get_project(db_adapter, path.split('/')[0], user)
            u = {'user_id': session['user']['id'], 'username': session['user']['username']}
            if not project:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp
            else:
                project = Project.json_to_obj(project)
                us = {'user_id': session['user']['id'],
                 'username': session['user']['username'],
                 'picture': session['user']['picture']}
                access = Access(us, '', '', Role.OWNER.value, 'indefinitely')
                if is_dir == 'false':
                    file = request.files['file'].read()
                    counter = request.form['counter']
                    total = request.form['total']
                    original_path = path

                    logger.log(LOG_LEVEL, 'Path: {}'.format(path))
                    logger.log(LOG_LEVEL, 'Percentage: {}'.format(str((int(counter) / int(total)) * 100) + '%'))

                    current_file_path_old = path.split('/')
                    file_name = current_file_path_old[-1]

                    current_file_path_backup = current_file_path_old[:]
                    current_file_path = current_file_path_old[1:-1]

                    parent_id = project.root_ic.ic_id
                    parent_ic = project.root_ic

                    for i in range(0, len(current_file_path)):
                        name = current_file_path[i]
                        new_id = str(uuid.uuid1())
                        if i < 1:
                            parent_directory = ('/').join(current_file_path_backup[0:1])
                            path = ('/').join(current_file_path_backup[0:1])
                        else:
                            parent_directory = ('/').join(current_file_path_backup[0:i + 1])
                            path = ('/').join(current_file_path_backup[0:i + 1])
                        path = path + '/' + name
                        details = Details(u, 'Created folder', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), name)
                        
                        ic_new = Directory(new_id,
                                           name,
                                           parent_directory,
                                           [details],
                                           path,
                                           parent_id,
                                           '',
                                           [],
                                           [],
                                           [],
                                           [access]
                                           )

                        parent_id = new_id

                        project.added = False
                        message, ic = project.update_ic(ic_new, parent_ic)
                        # message, ic = db.create_folder(db_adapter, project.name, ic_new)

                        # if deletion needs to be performed after pressing the x button on the upload popup, but havin in mind all that has been already uploaded
                        # if message == msg.IC_SUCCESSFULLY_ADDED:
                        #     if session['user']['id'] in temp_upload_list and 'ics' in temp_upload_list[session['user']['id']]:
                        #         temp_upload_list[session['user']['id']]['ics'].append({'ic_id': new_id, 'time': datetime.now()})
                        #     else:
                        #         if session['user']['id'] not in temp_upload_list:
                        #             temp_upload_list[session['user']['id']] = {}
                        #         temp_upload_list[session['user']['id']]['ics'] = [{'ic_id': new_id, 'time': datetime.now()}]

                        parent_ic = ic_new
                        if message == msg.IC_ALREADY_EXISTS:
                            parent_id = ic.ic_id
                            parent_ic = ic

                    message = db.update_project(db_adapter, project, user)
                    if message == msg.PROJECT_SUCCESSFULLY_UPDATED:
                        new_id = str(uuid.uuid1())
                        name = ('.').join(file_name.split('.')[:-1])
                        original_path = ('.').join(original_path.split('.')[:-1])

                        parent_directory = ('/').join(current_file_path_backup[:-1])

                        comments = []
                        if 'comment' in request.form:
                            comments.append(Comments(str(uuid.uuid1()), us, request.form['comment'], datetime.now().strftime("%d.%m.%Y-%H:%M:%S")))
                        
                        details = Details(u, 'Created file', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), name +
                                          ('').join(['.', file_name.split('.')[-1]]))

                        tags = []
                        # temp_name_array = []
                        # if project.is_iso19650:
                        temp_name_array = name.split('-')
                        if 'file_data' in request.form or (len(temp_name_array) == 9 or len(temp_name_array) == 10):
                            if 'file_data' in request.form:
                                file_data = json.loads(request.form['file_data'])
                            else:
                                name, file_data = iso_auto_naming(temp_name_array, name)
                                original_path_temp = original_path.split('/')
                                original_path_temp[len(original_path_temp) - 1] = name
                                original_path = '/'.join(original_path_temp)
                            for key in file_data:
                                # print("key: {} ||||||| value: {}".format(key, file_data[key]))
                                if key != 'name' and key != 'file_extension': # and key != 'project_code' and key != 'company_code':
                                    tag = '#' + file_data[key]
                                    if file_data[key] == '':
                                        tag = ''
                                    tags.append(ISO19650(key, tag, 'ISO19650', 'grey'))

                        ic_new_file = File(new_id, name, name, parent_directory, [details], original_path,
                                           ('').join(['.', file_name.split('.')[-1]]), parent_id, '',
                                           comments, tags, [], [access], '', '')

                        project.added = False
                        encoded = file
                        # print('+++++++++', encoded)
                        # print('+++++++++', len(file))
                        # TODO: fix this mess
                        if len(file) == 0:
                            logger.log(LOG_LEVEL, 'File has 0kb - not uploaded')
                            return request.form['path']

                        # Create A Thumbnail For These File Types
                        file_type = file_name.split('.')[-1]
                        if file_type.lower() == 'jpg' or \
                                file_type.lower() == 'jpeg' or \
                                file_type.lower() == 'jpe' or \
                                file_type.lower() == 'jfif' or \
                                file_type.lower() == 'png' or \
                                file_type.lower() == 'gif' or \
                                file_type.lower() == 'bmp' or \
                                file_type.lower() == 'webp' or \
                                file_type.lower() == 'tif' or \
                                file_type.lower() == 'tiff':
                                
                            thumb = Image.open(io.BytesIO(file))
                            MAX_SIZE = (256, 256)
                            thumb.thumbnail(MAX_SIZE)
                            output = io.BytesIO()
                            thumb.save(output, format='png')
                            
                            contents = output.getvalue()

                            output.close()

                            thumb_id = db.upload_thumb(db_adapter, project.name, ic_new_file, contents)
                            ic_new_file.thumb_id = thumb_id
                            
                        result = db.upload_file(db_adapter, project.name, ic_new_file, encoded)

                        # if deletion needs to be performed after pressing the x button on the upload popup, but havin in mind all that has been already uploaded
                        # if result == msg.IC_SUCCESSFULLY_ADDED:
                        #     if session['user']['id'] in temp_upload_list and 'ics' in temp_upload_list[session['user']['id']]:
                        #         temp_upload_list[session['user']['id']]['ics'].append({'ic_id': new_id, 'time': datetime.now()})
                        #     else:
                        #         if session['user']['id'] not in temp_upload_list:
                        #             temp_upload_list[session['user']['id']] = {}
                        #         temp_upload_list[session['user']['id']]['ics'] = [{'ic_id': new_id, 'time': datetime.now()}]

                        if result != msg.IC_SUCCESSFULLY_ADDED:
                            logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                            resp = Response()
                            resp.status_code = result['code']
                            resp.data = result['message']
                            return resp
                        else:
                            if 'file_data' in request.form or (len(temp_name_array) == 9 or len(temp_name_array) == 10):
                                if 'file_data' in request.form:
                                    file_data = json.loads(request.form['file_data'])
                                # else:
                                #     file_data = json_tags
                                request_data = {}
                                request_data['project_name'] = project.name
                                request_data['ic_id'] = new_id
                                request_data['parent_id'] = parent_id
                                request_data['iso'] = 'ISO19650'
                                request_data['tags'] = {}
                                for key in file_data:
                                    # print("key: {} | value: {}".format(key, file_data[key]))
                                    if key != 'name' and key != 'file_extension': # and key != 'project_code':
                                        request_data['tags'][key] = file_data[key]
                                request_data['update'] = False
                                update_tags = db.update_iso_tags(db_adapter, request_data)
                                logger.log(LOG_LEVEL, 'DB Response message: {}'.format(update_tags["message"]))
                            return request.form['path']
                else:
                    folders = json.loads(request.form['folders'])
                    for folder in folders:
                        logger.log(LOG_LEVEL, 'Folder: {}'.format(folder))
                        current_dir_path = folder['path'].split('/')[1:]
                        current_full_path = folder['path'].split('/')
                        parent_id = project.root_ic.ic_id
                        parent_ic = project.root_ic
                        for i in range(0, len(current_dir_path)):
                            name = current_dir_path[i]
                            if name != '':
                                new_id = str(uuid.uuid1())
                                if i < 1:
                                    parent_directory = ('/').join(current_full_path[0:1])
                                    path = ('/').join(current_full_path[0:1])
                                else:
                                    parent_directory = ('/').join(current_full_path[0:i + 1])
                                    path = ('/').join(current_full_path[0:i + 1])
                                path = path + '/' + name

                                details = Details(u, 'Created folder', datetime.now().strftime("%d.%m.%Y-%H:%M:%S"), name)
                                ic_new = Directory(new_id,
                                                name,
                                                parent_directory,
                                                [details],
                                                path,
                                                parent_id,
                                                '',
                                                [],
                                                [],
                                                [],
                                                [access]
                                                )

                                parent_id = new_id

                                project.added = False
                                message, ic = project.update_ic(ic_new, parent_ic)

                                # if deletion needs to be performed after pressing the x button on the upload popup, but havin in mind all that has been already uploaded
                                # if message == msg.IC_SUCCESSFULLY_ADDED:
                                #     if session['user']['id'] in temp_upload_list and 'ics' in temp_upload_list[session['user']['id']]:
                                #         temp_upload_list[session['user']['id']]['ics'].append({'ic_id': new_id, 'time': datetime.now()})
                                #     else:
                                #         if session['user']['id'] not in temp_upload_list:
                                #             temp_upload_list[session['user']['id']] = {}
                                #         temp_upload_list[session['user']['id']]['ics'] = [{'ic_id': new_id, 'time': datetime.now()}]
                                # print('ovde', ic_new.to_json())
                                # print(message)
                                # message, ic = db.create_folder(db_adapter, project.name, ic_new)
                                parent_ic = ic_new
                                logger.log(LOG_LEVEL, 'Response message: {}'.format(message["message"]))
                                if message == msg.IC_ALREADY_EXISTS:
                                    parent_id = ic.ic_id
                                    parent_ic = ic
                        message = db.update_project(db_adapter, project, user)
                        logger.log(LOG_LEVEL, 'Response message: {}'.format(message["message"]))

                    resp = Response()
                    resp.status_code = msg.PROJECT_SUCCESSFULLY_UPLOADED['code']
                    resp.data = msg.PROJECT_SUCCESSFULLY_UPLOADED['message']
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


@app.route('/upload_project')
def upload_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        root_obj = dirs.path_to_obj('root')
        project = Project("default", "test-project", root_obj)
        user = {'id': session.get('user')['id'], 'role': 'OWNER'}
        # print(root_obj)
        if db.connect(db_adapter):
            result, id = db.upload_project(db_adapter, project, user)
            if result:
                logger.log(LOG_LEVEL, result)
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


@app.route('/stop_uploading', methods=['POST'])
def stop_uploading():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        # request_data = json.loads(request.get_data())
        # logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        user = session.get('user')
        
        # DELETE UPLOADED ICs
        if db.connect(db_adapter):
            # print(temp_upload_list)
            # if result:
            #     logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
            resp = Response()
            resp.status_code = msg.DEFAULT_OK['code']
            resp.data = msg.DEFAULT_OK['message']
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


@app.route('/set_color', methods=['POST'])
def set_color():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dirs.set_project_data(request_data, True)
        project_name = session.get("project")["name"]
        if not project_name:
            project_name = request_data['name']
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            color_change = {
                "project_name": project_name,
                "ic_id": request_data["ic_id"],
                "color": request_data["color"],
            }
            result = db.change_color(db_adapter, color_change)
            if result:
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


@app.route('/share_project', methods=['POST'])
def share_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            # {'project_id': '5fce1e6b8eee26f4bdc2cfc5', 'parent_id': 'root', 'user_name': '222', 'role': 'ADMIN'}
            # {'project_name': 'CV', 'ic_id': 'cff253cf-3886-11eb-b860-50e085759744', 'parent_id': 'root', 'is_directory': True, 'user_name': '222', 'role': 'ADMIN'}

            result = db.share_project(db_adapter, request_data, session['user'])
            if result:
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


@app.route('/send_comment', methods=['POST'])
def send_comment():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            u = {'user_id': session['user']['id'],
                 'username': session['user']['username'],
                 'picture': session['user']['picture']}
            comment = Comments(str(uuid.uuid1()), u, request_data['comment'], datetime.now().strftime("%d.%m.%Y-%H:%M:%S"))
            result = db.add_comment(db_adapter, request_data, comment)
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = render_template("activity/single_comment.html",
                                            comment=comment.to_json(),
                                            picture=u['picture']
                                            )
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

@app.route('/update_comment', methods=['POST'])
def update_comment():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        request_data['user_id'] = session.get('user')['id']
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):                 
            result = db.update_comment(db_adapter, request_data)
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code =  result["code"]
                resp.data =         result["message"]
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

@app.route('/delete_comment', methods=['POST'])
def delete_comment():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        request_data['user_id'] = session.get('user')['id']
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):                 
            result = db.delete_comment(db_adapter, request_data)
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code =  result["code"]
                resp.data =         result["message"]
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

@app.route('/add_tag', methods=['POST'])
def add_tag():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        if 'project_name' in request_data.keys():
            if request_data['project_name'] == '':
                request_data['project_name'] = session['project']['name']
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            result = db.add_tag(db_adapter, request_data, request_data['tags'])
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result['message']
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


@app.route('/remove_tag', methods=['POST'])
def remove_tag():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            result = db.remove_tag(db_adapter, request_data, request_data['tag'])
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result['message']
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    return redirect('/')

@app.route('/update_iso_tags', methods=['POST'])
def update_iso_tags():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        
        if db.connect(db_adapter):
            result = db.update_iso_tags(db_adapter, request_data)
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result['message']
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

@app.route('/add_access', methods=['POST'])
def add_access():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            # {'project_id': '5fce1e6b8eee26f4bdc2cfc5', 'parent_id': 'root', 'user_name': '222', 'role': 'ADMIN'}
            # {'project_name': 'CV', 'ic_id': 'cff253cf-3886-11eb-b860-50e085759744', 'parent_id': 'root', 'is_directory': True, 'user_name': '222', 'role': 'ADMIN'}
            if request_data['user_name'] == session['user']['username']:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(msg.ACCESS_TO_YOURSELF))
                resp = Response()
                resp.status_code = msg.ACCESS_TO_YOURSELF["code"]
                resp.data = msg.ACCESS_TO_YOURSELF['message']
                return resp

            # If Project Root Is Shared - Share Whole Project
            if request_data['parent_id'] == 'root':
                result = db.share_project(db_adapter, request_data, session['user'])
                # result = db.add_access(db_adapter, request_data, session['user'])
            # Share Just This IC And Subsequent Folders
            else:
                result = db.add_access(db_adapter, request_data, session['user'])

            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result['message']
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


@app.route('/update_access', methods=['POST'])
def update_access():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            # {'project_id': '5fce1e6b8eee26f4bdc2cfc5', 'parent_id': 'root', 'user_name': '222', 'role': 'ADMIN'}
            # {'project_name': 'CV', 'ic_id': 'cff253cf-3886-11eb-b860-50e085759744', 'parent_id': 'root', 'is_directory': True, 'user_name': '222', 'role': 'ADMIN'}
            if request_data['user']['username'] == session['user']['username']:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(msg.ACCESS_TO_YOURSELF))
                resp = Response()
                resp.status_code = msg.ACCESS_TO_YOURSELF["code"]
                resp.data = msg.ACCESS_TO_YOURSELF['message']
                return resp
            if request_data['parent_id'] == 'root':
                result = db.update_share_project(db_adapter, request_data, session['user'])
                # result = db.add_access(db_adapter, request_data, session['user'])
            else:
                result = db.update_access(db_adapter, request_data, session['user'])
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result['message']
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
    

@app.route('/remove_access', methods=['POST'])
def remove_access():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            if request_data['parent_id'] == 'root':
                # result = db.remove_access(db_adapter, request_data, session['user'])
                result = db.remove_share_project(db_adapter, request_data, session['user'])
            else:
                result = db.remove_access(db_adapter, request_data, session['user'])
            if result:
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = result["code"]
                resp.data = result['message']
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


@app.route('/activate_undo', methods=['POST'])
def activate_undo():
    resp = Response()
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        undo = session.get("undo")

        if undo is None:
            resp.status_code = msg.UNAUTHORIZED['code']
            resp.data = 'Nothing do undo'
            return resp


        position = session.get("project")["position"]
        project_name = session.get("project")["name"]
        user = session.get('user')

        if db.connect(db_adapter) and undo["user"] == user and undo["project_name"] == project_name:
            result = db.get_project(db_adapter, project_name, user)
            if result and undo["data"]:
                project = Project(result['project_id'], result['project_name'], Project.json_folders_to_obj(undo["data"]['root_ic']))
                # print(project.to_json()['root_ic']["sub_folders"])
                # print(undo["data"]['root_ic']["sub_folders"])
                result, id = db.update_project(db_adapter, project, user)
                if result:
                    #session.get("project")["position"] = undo["position"]

                    session["undo"] = {}
                    session.get("project")["undo"] = False
                    session.modified = True
                    resp.status_code = msg.DEFAULT_OK['code']
                    resp.data = str(msg.DEFAULT_OK['message']) #json.dumps({"json": project.to_json(), "project" : position})
                    return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/set_project_config', methods=['POST'])
def set_project_config():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            result = db.get_project(db_adapter, request_data['project_name'], session['user'])
            
            if result:
                project = Project.json_to_obj(result)

                project.name = request_data['project-name-activity']
                project.description = request_data['project-description-activity']
                project.code = request_data['project-code-activity']
                project.number = request_data['project-number-activity']
                project.status = request_data['project-status-activity']
                project.notes = request_data['project-notes-activity']
                project.ref = request_data['project-ref-activity']
                project.originator = request_data['originator-activity']
                project.disclaimer = request_data['disclaimer-activity']
                project.custom = request_data['project-custom-activity']

                site = Site(request_data['site-name-activity'], 
                            request_data['site-description-activity'], 
                            request_data['site-full-address-activity'],
                            request_data['site-gross-perimeter-activity'],
                            request_data['site-gross-area-activity'],
                            request_data['site-coordinates-activity'])
                site.custom = request_data['site-custom-activity']

                building = Building(request_data['building-name-activity'],
                                    request_data['building-description-activity'])
                building.custom = request_data['building-custom-activity']

                
                project.site = site
                project.building = building

                project.is_iso19650 = request_data['iso19650']

                message = db.update_project(db_adapter, project, session['user'])

                resp = Response()
                resp.status_code = message["code"]
                resp.data = message['message']
                return resp
            else:
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND["code"]
                resp.data = msg.PROJECT_NOT_FOUND['message']
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

def iso_auto_naming(temp_name_array, fil_name):
    json_tags = {}
    input_file = gtr.get_input_file() 
    for i, tag_key in enumerate(temp_name_array):
        if i == 0:
            key = 'project_code'
            tag = tag_key
        if i == 1:
            key = 'company_code'
            tag = tag_key
        if i == 2:
            key = 'project_volume_or_system'
            if tag_key in input_file[key]:
                value = input_file[key][tag_key]
            else:
                tag_key = 'ZZ'
                value = 'Multiple volumes/systems'
            tag = tag_key + ', ' + value
        if i == 3:
            key = 'project_level'
            if tag_key in input_file[key]:
                value = input_file[key][tag_key]
            else:
                tag_key = 'ZZ'
                value = 'Multiple levels'
            tag = tag_key + ', ' + value
        if i == 4:
            key = 'type_of_information'
            if tag_key in input_file[key]:
                value = input_file[key][tag_key]
            else:
                tag_key = 'AF'
                value = 'Animation file (of model)'
            tag = tag_key + ', ' + value
        if i == 5:
            key = 'role_code'
            if tag_key in input_file[key]:
                value = input_file[key][tag_key]
            else:
                tag_key = 'A'
                value = 'Architect'
            tag = tag_key + ', ' + value
            
        if i == 6:
            key = 'file_number'
            if tag_key in input_file[key]:
                value = input_file[key][tag_key]
            else:
                tag_key = '1.0'
                value = 'General'
            tag = tag_key + ', ' + value
        if i == 7:
            key = 'status'
            if tag_key in input_file[key]:
                value = input_file[key][tag_key]
            else:
                tag_key = 'S0'
                value = 'Initial status'
            tag = tag_key + ', ' + value
        if len(temp_name_array) == 9:
            if i == 8:
                file_name = '_'.join(tag_key.split('_')[1:])
                tag_key = tag_key.split('_')[0]
                key = 'revision'
                if tag_key in input_file[key]:
                    value = input_file[key][tag_key]
                else:
                    tag_key = 'P01.01'
                    value = 'Work in progress version'
                tag = tag_key + ', ' + value
        if len(temp_name_array) == 10:
            if i == 8:
                key = 'revision'
                if tag_key in input_file[key]:
                    value = input_file[key][tag_key]
                else:
                    tag_key = 'P01.01'
                    value = 'Work in progress version'
                tag = tag_key + ', ' + value
            if i == 9:
                file_name = '_'.join(tag_key.split('_')[1:])
                tag_key = tag_key.split('_')[0]
                key = 'uniclass_2015'
                if tag_key in input_file[key]:
                    value = input_file[key][tag_key]
                else:
                    tag_key = ''
                    value = ''
                tag = tag_key
            
        json_tags[key] = tag
    if len(temp_name_array) == 9:
        key = 'uniclass_2015'
        tag = ''
        json_tags[key] = tag
    return file_name, json_tags