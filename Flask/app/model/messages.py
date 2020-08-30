USER_ALREADY_IN = {"message": "email already exists in the data base!", "code": 409}
INVALID_USER_PASS = {"message": "Invalid Username/password combination!", "code": 404}
SIGNED_IN = {"message": "SIGNED IN", "code": 200}
LOGGED_IN = {"message": "LOGGED IN", "code": 200}

DB_FAILURE = {"message": "Connection with the DB failed!", "code": 400}

IC_SUCCESSFULLY_ADDED = {"message": "Added successfully", "code": 200}
IC_ALREADY_EXISTS = {"message": "IC with the given name already exists", "code": 409}
IC_PATH_NOT_FOUND = {"message": "Path not found", "code": 404}

PROJECT_NOT_FOUND = {"message": "Project with the specific ID not found", "code": 404}
PROJECT_ALREADY_EXISTS = {"message": "Project with the given name already exists", "code": 409}
PROJECT_SUCCESSFULLY_ADDED = {"message": "Added successfully", "code": 200}

STORED_FILE_NOT_FOUND = {"message": "Stored file not found", "code": 404}

IC_SUCCESSFULLY_RENAMED = {"message": "Renamed successfully", "code": 200}

DEFAULT_OK = {"message": "Success", "code": 200}
DEFAULT_ERROR = {"message": "Failure", "code": 400}
