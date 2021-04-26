import json

from app import *

import app.views.actions.getters as gtr
import app.model.helper as helper

@app.route('/get_annotations/<path:file_id>', methods=['GET'])
def get_annotations(file_id):
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():

        if db.connect(db_adapter):

            annotations = db.get_file_annotations(db_adapter, file_id)

            # print(json.dumps(annotations))
            return json.dumps(annotations)

        else:        
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message'])
            return resp

    else:
        resp = Response()
        resp.status_code = msg.UNAUTHORIZED['code']
        resp.data = str(msg.UNAUTHORIZED['message'])
        return resp

@app.route('/get_open_file', methods=['POST'])
def get_open_file():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        name = request_data['name']
        type = request_data['type']
        ic_id = request_data['ic_id']
        parent_id = request_data['parent_id']

        if db.connect(db_adapter):
            print('hererer111')
            project_name = session['project']['name']
            shared = bool(project_name == "Shared")
            if shared:
                result = db.get_ic_object_from_shared(db_adapter, request_data, session['user'])
            else:
                result = db.get_ic_object(db_adapter, project_name, request_data, name+type)

            if result:
                if not shared:
                    project = db.get_project(db_adapter, project_name, session['user']) #shared
                access = [x.to_json() for x in result.access]

                is_owner = False
                for a in access:
                    if a['user']['user_id'] == session['user']['id'] and a['role'] == Role.OWNER.value:
                        is_owner = True
                    a['role'] = Role(a['role']).name
                    m, user = db.get_user(db_adapter, {'id': a['user']['user_id']})
                    a['user']['picture'] = user['picture']
                    a['user']['username'] = user['username']

                comments = [x.to_json() for x in result.comments]
                for c in comments:
                    m, user = db.get_user(db_adapter, {'id': c['user']['user_id']})
                    c['user']['picture'] = user['picture']
                    c['user']['username'] = user['username']
                
                # close db connection
                db.close_connection(db_adapter)

                file_name =         result.name + result.type
                file_iso_name =     helper.get_iso_filename(result, project, session['user']) if not shared else file_name # hot fix
                file_details =      [x.to_json() for x in result.history]
                file_tags =         [x.to_json() for x in result.tags]
                file_size =         db.get_file_size(db_adapter, result.stored_id, True)
                file_path =         result.path + result.type
                file_share_link =   'http://bohm.cloud/get_shared_file/' + result.stored_id

                message, user = db.get_user(db_adapter, {'id': session.get('user')['id']})
                db.close_connection(db_adapter)
                role_code = ''
                if 'role_code' in user:
                    role_code = user['role_code']
                if result.type == '.pdf':
                    html = render_template("popup/open_file_pdf.html",
                                            preview =      '/get_shared_file/' + result.stored_id,
                                            file_name =    file_name,
                                            project_name = project_name,
                                            parent_id =    parent_id,
                                            ic_id =        ic_id,
                                            user =         session['user']
                                            )
                elif result.type.lower() == '.jpg' or \
                        result.type.lower() == '.jpeg' or \
                        result.type.lower() == '.png' or \
                        result.type.lower() == '.gif' or \
                        result.type.lower() == '.bmp' or \
                        result.type.lower() == '.psd' or \
                        result.type.lower() == '.webp' or \
                        result.type.lower() == '.tiff':

                    html = render_template("popup/open_file_img.html",
                                            preview = '/get_shared_file/' + result.stored_id,
                                            file_name = file_name,
                                            user_id = session['user']['id'],
                                            user = session['user']['username'],
                                            stored_id = result.stored_id
                                            )
                else:
                    html = render_template("popup/open_file.html",
                                            preview = '/get_shared_file/' + result.stored_id
                                            )
                
                # shared hot fix
                if not shared:
                    project_code = project['code'] 
                    company_code = user['company_code']
                    for t in file_tags:
                        if 'key' in t:
                            if t['key'] == 'project_code' and t['tag'] != '':
                                project_code = t['tag'][1:]
                            if t['key'] == 'company_code' and t['tag'] != '':
                                company_code = t['tag'][1:]
                else:
                    project_code = ""
                    company_code = ""

                response = {
                    'html': html,
                    'activity': render_template("activity/file.html",
                                                user =              user,
                                                role_code =         role_code,
                                                is_owner =          str(is_owner),
                                                details =           file_details,
                                                tags =              file_tags,
                                                file_name =         file_name,
                                                name =              name+type,
                                                full_name =         file_iso_name, #shared
                                                path =              file_path,
                                                share_link =        file_share_link,
                                                comments =          comments,
                                                project_name =      project_name,
                                                parent_id =         result.parent_id,
                                                ic_id =             result.ic_id,
                                                stored_id =         result.stored_id,
                                                access =            access,
                                                complex_tag_list =  gtr.get_input_file_fixed(),
                                                size =              file_size,
                                                project_code =      project_code,   # shared hot fix
                                                company_code =      company_code    # shared hot fix
                                                ),
                    'data': []
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp

        logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
        resp = Response()
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message'])
        return resp

    else:
        resp = Response()
        resp.status_code = msg.UNAUTHORIZED['code']
        resp.data = str(msg.UNAUTHORIZED['message'])
        return resp


@app.route('/get_all_projects')
def get_all_projects():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        if db.connect(db_adapter):
            result = db.get_all_projects(db_adapter)
            if result:
                response = {'data':[]}
                response['html'] = render_template("popup/choose_project_popup.html")
                for project in result:
                    response['data'].append(project['project_name'])
                logger.log(LOG_LEVEL, 'Response message: {}'.format(result["message"]))
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp
        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_new_project')
def get_new_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        response = {
            'html': render_template("popup/new_project_popup.html"),
            'data': []
        }
        resp = Response()
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_upload_project')
def get_upload_project():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        response = {
            'html': render_template("popup/upload_folder_popup.html"),
            'data': []
        }
        resp = Response()
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_new_folder', methods=['POST'])
def get_new_folder():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            result = db.get_project(db_adapter, project_name, session.get('user'))
            if result:
                response = {
                    'html': render_template("popup/new_folder_popup.html",
                                            parent_path=request_data["parent_path"],
                                            parent_id=request_data["parent_id"],
                                            ic_id=request_data["ic_id"],
                                            project_name=project_name,
                                            ),
                    'data': []
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_new_file', methods=['POST'])
def get_new_file():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            user = session.get('user')
            result = db.get_project(db_adapter, project_name, user)
            if result:
                filter_file = gtr.get_input_file_fixed()
                filter_file.pop('uniclass_2015', None)
                response = {
                    'html': render_template("popup/file_input_popup.html",
                                            is_iso19650 =   result['is_iso19650'],
                                            project_path =  request_data["project_path"],
                                            parent_id =     request_data["parent_id"],
                                            ic_id =         request_data["ic_id"],
                                            project_name =  project_name,
                                            project_code =  result['code'],
                                            company_code =  user['company_code'],
                                            is_file =       request_data["is_file"],
                                            inputs =        filter_file
                                            ),
                    'data': []
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_iso_rename_popup', methods=['POST'])
def get_iso_rename_popup():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            user = session.get('user')

            message, us = db.get_user(db_adapter, {'id': user['id']})
            db.close_connection(db_adapter)

            role_code = ''
            if 'role_code' in us:
                role_code = us['role_code']
            result = db.get_project(db_adapter, project_name, user)
            if result:
                filter_file = gtr.get_input_file_fixed()
                filter_file.pop('uniclass_2015', None)

                input_file = gtr.get_input_file()
                
                response = {
                    'html': render_template("popup/upload_file_popup.html",
                                            project_path=request_data["project_path"],
                                            parent_id=request_data["parent_id"],
                                            ic_id=request_data["ic_id"],
                                            project_name=project_name,
                                            project_code=result['code'],
                                            company_code=user['company_code'],
                                            is_file=request_data["is_file"],
                                            inputs=filter_file
                                            ),
                    'html-block': render_template("popup/upload_file_popup_block.html",
                                            project_code=result['code'],
                                            company_code=user['company_code'],
                                            inputs=filter_file,
                                            role_code=role_code
                                            ),
                    'input_file': input_file
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
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


@app.route('/get_rename_ic', methods=['POST'])
def get_rename_ic():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            if request_data['parent_path'] == 'Projects':
                project_name = request_data['old_name']
            else:
                if session.get("project")["name"] == 'Shared':
                    result = db.get_project_from_shared(db_adapter, request_data, session['user'])
                    project_name = result['project_name']
                else:
                    project_name = session.get("project")["name"]
            result = db.get_project(db_adapter, project_name, session['user'])
            if result:
                if request_data['parent_path'] == 'Projects':
                    parent_path = result['root_ic']['parent']
                    parent_id = result['root_ic']['parent_id']
                    ic_id = result['root_ic']['ic_id']
                    is_directory = result['root_ic']['is_directory']
                else:
                    parent_path=request_data["parent_path"]
                    parent_id=request_data["parent_id"]
                    ic_id=request_data["ic_id"]
                    project_name=project_name
                    is_directory=True if request_data["is_directory"] else False
                    # print(parent_id)
                filter_file = gtr.get_input_file_fixed()
                response = {
                    'html': render_template("popup/rename_ic_popup.html",
                                            parent_path=parent_path,
                                            parent_id=parent_id,
                                            ic_id=ic_id,
                                            project_name=project_name,
                                            old_name=request_data["old_name"],
                                            is_directory=is_directory,
                                            inputs=filter_file
                                            ),
                    'data': []
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_trash_ic', methods=['POST'])
def get_trash_ic():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        if 'parent_path' in request_data and request_data['parent_path'] == 'Projects':
            project_name = request_data['delete_name']
        else:
            project_name = session.get("project")["name"]
        is_multi = True if "is_multi" in request_data else False
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        
        if db.connect(db_adapter):
            if project_name == 'Shared':
                result = db.get_project_from_shared(db_adapter, request_data, session['user'])
                project_name = result['project_name']
            result = db.get_project(db_adapter, project_name, session['user'])
            if result:
                if 'parent_path' in request_data and request_data['parent_path'] == 'Projects':
                    request_data["project_id"] = result["project_id"]
                    parent_path = result['root_ic']['parent']
                    parent_id = result['root_ic']['parent_id']
                    ic_id = result['root_ic']['ic_id']
                    is_directory = result['root_ic']['is_directory']
                else:
                    if not is_multi:
                        parent_path=request_data["parent_path"]
                        parent_id=request_data["parent_id"]
                        ic_id=request_data["ic_id"]
                        project_name=project_name
                        is_directory=True if request_data["is_directory"] else False
                response = {
                    'html': render_template("popup/trash_ic_popup.html",
                                            parent_path=parent_path,
                                            parent_id=parent_id,
                                            project_id=request_data["project_id"] if "project_id" in request_data else None,
                                            ic_id=ic_id,
                                            project_name=project_name,
                                            delete_name=request_data["delete_name"],
                                            is_directory = is_directory,
                                            multi=is_multi,
                                            )
                    if not is_multi else
                            render_template("popup/trash_ic_popup.html",
                                            multi=is_multi,
                                            delete_name="Selections",
                                            ),
                    'data': []
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp
            
@app.route('/get_restore_ic', methods=['POST'])
def get_restore_ic():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        is_multi = True if "is_multi" in request_data else False
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        
        if db.connect(db_adapter):
            result = db.get_all_projects(db_adapter)
            if result:
                response = {
                    'html': render_template("popup/restore_ic_popup.html",
                                            project_id =    request_data["project_id"],
                                            parent_path =   request_data["parent_path"],
                                            parent_id =     request_data["parent_id"],
                                            ic_id =         request_data["ic_id"],
                                            restore_name =  request_data["restore_name"],
                                            is_directory =  True if request_data["is_directory"] else False,
                                            multi =         is_multi,
                                            )
                    if not is_multi else
                            render_template("popup/restore_ic_popup.html",
                                            multi =         is_multi,
                                            delete_name =   "Selections",
                                            ),
                    'data': []
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp
            
@app.route('/get_delete_ic', methods=['POST'])
def get_delete_ic():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        is_multi = True if "is_multi" in request_data else False
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            result = db.get_all_projects(db_adapter)
            if result:
                response = {
                    'html': render_template("popup/delete_ic_popup.html",
                                            project_id =    request_data["project_id"],
                                            parent_path =   request_data["parent_path"],
                                            parent_id =     request_data["parent_id"],
                                            ic_id =         request_data["ic_id"],
                                            project_name =  project_name,
                                            delete_name =   request_data["delete_name"],
                                            is_directory =  True if request_data["is_directory"] else False,
                                            multi =         is_multi,
                                            )
                    if not is_multi else
                            render_template("popup/delete_ic_popup.html",
                                            multi =         is_multi,
                                            delete_name =   "Selections",
                                            ),
                    'data': []
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

@app.route('/get_empty_trash', methods=['POST'])
def get_empty_trash():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        project_name = session.get("project")["name"]
        
        if db.connect(db_adapter):
            result = db.get_all_projects(db_adapter)
            if result:
                response = {
                    'html': render_template("popup/empty_trash_popup.html"),
                    'data': []
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp

@app.route('/get_share', methods=['GET'])
def get_share():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        # request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        # print(request_data)
        if db.connect(db_adapter):
            user = session.get('user')
            result = db.get_project(db_adapter, project_name, user)
            if result:
                usernames = db.get_all_users(db_adapter)
                response = {
                    'html': render_template("popup/share_project.html",
                                            project_id=result["project_id"]
                                            ),
                    'data': usernames
                }
                resp = Response()
                resp.status_code = msg.DEFAULT_OK['code']
                resp.data = json.dumps(response)
                return resp
            else:
                logger.log(LOG_LEVEL, str(msg.PROJECT_NOT_FOUND['message']))
                resp = Response()
                resp.status_code = msg.PROJECT_NOT_FOUND['code']
                resp.data = str(msg.PROJECT_NOT_FOUND['message'])
                return resp

        else:
            logger.log(LOG_LEVEL, 'Error: {}'.format(str(msg.DB_FAILURE)))
            resp = Response()
            resp.status_code = msg.DB_FAILURE['code']
            resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
            return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_help')
def get_help():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        data = [
            {'new_folder name': 'opens new folder popup\n'
                                'name (optional) - set the folder name without opening the popup'},
            {'create_file': 'opens create file popup'},
            {'open': 'opens preview'},
            {'rename': 'renames information container'},
            {'tag #tag_name color': 'tag - adding a tag(s) to the information container \n'
                                    'tag_name (mandatory) - set tag name \n'
                                    'color (optional - default is white) - set the tag color\n'
                                    'example - tag #some_tag black #some_other_tag green'},
            {'#tag': 'search by tag. Could be an array of tags separated with space\n'
                     'example - #some_tag #some_other_tag '},
            {'ic_name': 'search by name. Could be an array of names. Press space or enter to get search results\n'
                        'example - part_of_name1 part_of_name2 '},
        ]
        response = {
            'html': render_template("popup/help.html",
                                    data=data),
            'data': []
        }
        # print(response)
        resp = Response()
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/get_help_suggest')
def get_help_suggest():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        response = {
            'data': ['new_folder',
                     'create_file',
                     'open',
                     'rename',
                     'tag',
                     'help'
                     ]
        }
        resp = Response()
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp = Response()
    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp
