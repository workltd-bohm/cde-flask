import os
import json
import uuid

from app import *


@app.route('/get_all_projects')
def get_all_projects():
    print('Data posting path: %s' % request.path)
    main.IsLogin()
    if db.connect(db_adapter):
        result = db.get_all_projects(db_adapter)
        response = {'data':[]}
        if result:
            print(result)
            response['html'] = render_template("popup/choose_project_popup.html")
            for project in result:
                response['data'].append(project['project_name'])
            print(response)
            return json.dumps(response)
        else:
            print("not_found")
    else:
        print(str(msg.DB_FAILURE))
        resp = Response()
        resp.status_code = msg.DB_FAILURE['code']
        resp.data = str(msg.DB_FAILURE['message']).replace("'", "\"")
        return resp
    return ""


@app.route('/get_new_project')
def get_new_project():
    print('Data posting path: %s' % request.path)
    main.IsLogin()
    response = {
        'html': render_template("popup/new_project_popup.html"),
        'data':[]
    }
    print(response)

    return json.dumps(response)