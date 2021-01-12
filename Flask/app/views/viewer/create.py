from app import *
import mimetypes

mimetypes.add_type("application/javascript", ".js", True)


@app.route('/load_viewer', methods=['POST'])
def load_viewer():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    resp = Response()
    if main.IsLogin():
        request_data = json.loads(request.get_data())
        dview = request_data['link']
        response = {
            'html': render_template("dashboard/viewer/viewer.html",
                                    dview=dview
                                    ),
            'data': []
        }
        # print(response)
        resp.status_code = msg.DEFAULT_OK['code']
        resp.data = json.dumps(response)
        return resp

    resp.status_code = msg.UNAUTHORIZED['code']
    resp.data = str(msg.UNAUTHORIZED['message'])
    return resp


@app.route('/bohmviewer', methods=['GET'])
def bohmviewer():
    logger.log(LOG_LEVEL, 'Data posting path: {}'.format(request.path))
    return render_template("dashboard/viewer/bohm_viewer.html")