import json

from app import *

import app.views.actions.getters as gtr


@app.route('/get_open_file', methods=['POST'])
def get_open_file():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        name = request_data['name']
        type = request_data['type']
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))

        if db.connect(db_adapter):
            project_name = session['project']['name']
            result = db.get_ic_object(db_adapter, project_name, request_data, name+type)
            if result:
                details = [x.to_json() for x in result.history]
                tags = [x.to_json() for x in result.tags]
                file_name = result.name + result.type
                path = result.path
                share_link = 'http://bohm.cloud/get_shared_file/' + file_name
                comments = [x.to_json() for x in result.comments]
                access = [x.to_json() for x in result.access]
                for a in access:
                    a['role'] = Role(a['role']).name

                response = {
                    'html': render_template("popup/open_file.html",
                                            preview='/get_shared_file/' + name + type
                                            ),
                    'activity': render_template("activity/filter_files.html",
                                                details=details,
                                                tags=tags,
                                                file_name=file_name,
                                                path=path,
                                                share_link=share_link,
                                                comments=comments,
                                                project_name=project_name,
                                                parent_id=result.parent_id,
                                                ic_id=result.ic_id,
                                                stored_id=result.stored_id,
                                                name=name+type,
                                                access=access
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
        return redirect('/')


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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
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
                                            project_path=request_data["project_path"],
                                            parent_id=request_data["parent_id"],
                                            ic_id=request_data["ic_id"],
                                            project_name=project_name,
                                            project_code=user['project_code'],
                                            company_code=user['company_code'],
                                            is_file=request_data["is_file"],
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp


@app.route('/get_rename_ic', methods=['POST'])
def get_rename_ic():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        project_name = session.get("project")["name"]
        logger.log(LOG_LEVEL, 'POST data: {}'.format(request_data))
        if db.connect(db_adapter):
            result = db.get_project(db_adapter, project_name, session['user'])
            if result:
                filter_file = gtr.get_input_file_fixed()
                response = {
                    'html': render_template("popup/rename_ic_popup.html",
                                            parent_path=request_data["parent_path"],
                                            parent_id=request_data["parent_id"],
                                            ic_id=request_data["ic_id"],
                                            project_name=project_name,
                                            old_name=request_data["old_name"],
                                            is_directory=True if request_data["is_directory"] else False,
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp

@app.route('/get_trash_ic', methods=['POST'])
def get_trash_ic():
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
                    'html': render_template("popup/trash_ic_popup.html",
                                            parent_path=request_data["parent_path"],
                                            parent_id=request_data["parent_id"],
                                            ic_id=request_data["ic_id"],
                                            project_name=project_name,
                                            delete_name=request_data["delete_name"],
                                            is_directory = True if request_data["is_directory"] else False,
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp
            
@app.route('/get_restore_ic', methods=['POST'])
def get_restore_ic():
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
                    'html': render_template("popup/restore_ic_popup.html",
                                            project_id =    request_data["project_id"],
                                            parent_path =   request_data["parent_path"],
                                            parent_id =     request_data["parent_id"],
                                            ic_id =         request_data["ic_id"],
                                            project_name =  project_name,
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
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
                                            parent_path=request_data["parent_path"],
                                            parent_id=request_data["parent_id"],
                                            ic_id=request_data["ic_id"],
                                            project_name=project_name,
                                            delete_name=request_data["delete_name"],
                                            is_directory= True if request_data["is_directory"] else False,
                                            multi=is_multi,
                                            )
                    if not is_multi else
                            render_template("popup/delete_ic_popup.html",
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
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
    resp.status_code = msg.DEFAULT_ERROR['code']
    resp.data = str(msg.DEFAULT_ERROR['message'])
    return resp
