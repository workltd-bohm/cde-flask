from app import app
import app.config as cfg

# CORS(app, resources={r"/*": {"Access-Control-Allow-Origin": "*"}})


if __name__ == '__main__':
    # Bind to PORT if defined, otherwise default to 5000.
    app.run(host='0.0.0.0', port=cfg.config['basic'].PORT, debug=cfg.config['basic'].DEBUG)#, use_reloader=False)




