USER_ALREADY_IN = {"message": "email already exists in the data base!", "code": 409}
INVALID_USER_PASS = {"message": "Invalid Username/password combination!", "code": 404}
SIGNED_IN = {"message": "SIGNED IN", "code": 200}
LOGGED_IN = {"message": "LOGGED IN", "code": 200}
USER_NOT_FOUND = {"message": "User not found", "code": 404}
ACCOUNT_CONFIRMED = {"message": "Account confirmed", "code": 200}
ACCOUNT_CHANGED = {"message": "Account changed", "code": 200}

DB_FAILURE = {"message": "Connection with the DB failed!", "code": 400}

COMMENT_SUCCESSFULLY_ADDED = {"message": "Added successfully", "code": 200}
COMMENT_SUCCESSFULLY_UPDATED = {"message": "Updated successfully", "code": 200}
COMMENT_SUCCESSFULLY_DELETED = {"message": "Deleted successfully", "code": 200}

TAG_SUCCESSFULLY_ADDED = {"message": "Added successfully", "code": 200}
TAG_SUCCESSFULLY_REMOVED = {"message": "Removed successfully", "code": 200}
TAG_SUCCESSFULLY_UPDATED = {"message": "Tags successfully updated", "code": 200}
TAG_ALREADY_EXISTS = {"message": "Tag already exists", "code": 400}

ACCESS_SUCCESSFULLY_ADDED = {"message": "Added successfully", "code": 200}
ACCESS_SUCCESSFULLY_REMOVED = {"message": "Removed successfully", "code": 200}
ACCESS_TO_YOURSELF = {"message": "Can not grant access to yourself", "code": 400}

IC_SUCCESSFULLY_ADDED = {"message": "Added successfully", "code": 200}
IC_ALREADY_EXISTS = {"message": "IC with the given name already exists", "code": 409}
IC_PATH_NOT_FOUND = {"message": "Path not found", "code": 404}

TRASH_SUCCESSFULLY_EMPTIED = {"message": "Trash successfully emptied", "code": 200}


PROJECT_NOT_FOUND = {"message": "Project with the specific ID not found", "code": 404}
PROJECT_ALREADY_EXISTS = {"message": "Project with the given name already exists", "code": 409}
PROJECT_SUCCESSFULLY_ADDED = {"message": "Added successfully", "code": 200}
PROJECT_SUCCESSFULLY_UPDATED = {"message": "Updated successfully", "code": 200}

STORED_FILE_NOT_FOUND = {"message": "Stored file not found", "code": 404}

IC_SUCCESSFULLY_RENAMED = {"message": "Renamed successfully", "code": 200}
IC_COLOR_CHANGED = {"message": "Color changed", "code": 200}

DEFAULT_OK = {"message": "Success", "code": 200}
DEFAULT_ERROR = {"message": "Failure", "code": 400}

NOT_ALLOWED = {"message": "Not allowed", "code": 400}

NO_PROJECT_SELECTED = {"message": "Project not selected", "code": 400}

IC_SUCCESSFULLY_TRASHED = {"message": "Successfully moved to trash", "code": 200}
IC_SUCCESSFULLY_RESTORED = {"message": "Successfully restored from trash", "code": 200}
IC_SUCCESSFULLY_DELETED = {"message": "Successfully deleted", "code": 200}
IC_SUCCESSFULLY_FOUND = {"message": "Successfully found", "code": 200}
IC_FAILED_RESTORE_PARENT_NOT_FOUND = {"message": "Restore failed. Parent can't be found", "code": 404}

POST_ALREADY_EXISTS = {"message": "Post with the given ID already exists", "code": 409}
POST_CREATED = {"message": "Post created successfully", "code": 200}
POST_NOT_FOUND = {"message": "Post with the given ID not found", "code": 404}
POST_EDITED = {"message": "Post edited successfully", "code": 200}

BID_ALREADY_EXISTS = {"message": "Bid with the given ID already exists", "code": 409}
BID_CREATED = {"message": "Bid created successfully", "code": 200}

MESSAGE_SENT_TO_ADMIN = {"message": "Wait until admin confirms your account", "code": 409}

SUCCESSFULLY_SHARED = {"message": "Project successfully shared", "code": 200}
SUCCESSFULLY_REMOVED_PROJECT_ACCESS = {"message": "Removed Project access successfully", "code": 200}

PROJECT_SUCCESSFULLY_UPLOADED = {"message": "Project successfully uploaded", "code": 200}
PROJECT_SUCCESSFULLY_TRASHED = {"message": "Project successfully moved to trash", "code": 200}
PROJECT_SUCCESSFULLY_RESTORED = {"message": "Project successfully restored from trash", "code": 200}
PROJECT_SUCCESSFULLY_DELETED = {"message": "Project successfully deleted", "code": 200}



FILE_SUCCESSFULLY_DELETED = {"message": "File successfully deleted", "code": 200}
FILE_SUCCESSFULLY_DELETED_FORM_POST = {"message": "File successfully deleted from post", "code": 200}

USER_NO_RIGHTS = {"message": "Permission denied. User has no rights.", "code": 401}
