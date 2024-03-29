def connect(db_adapter):
    return db_adapter.connect()


def get_table(db_adapter, name):
    return db_adapter.get_table(name)


def get_user(db_adapter, identifier):
    return db_adapter.get_user(identifier)


def set_user(db_adapter, user):
    return db_adapter.set_user(user)


def confirm_account(db_adapter, user):
    return db_adapter.confirm_account(user)


def upload_project(db_adapter, project, user):
    return db_adapter.upload_folder_structure(project, user)


def get_all_projects(db_adapter):
    return db_adapter.get_all_projects()


def get_project(db_adapter, project_name, user):
    return db_adapter.get_project(project_name, user)


def upload_file(db_adapter, project, file_obj, file):
    return db_adapter.upload_file(project, file_obj, file)


def create_folder(db_adapter, project_name, folder):
    return db_adapter.create_folder(project_name, folder)


def rename_ic(db_adapter, request_data):
    return db_adapter.rename_ic(request_data)


def get_file(db_adapter, file_id, file_name):
    return db_adapter.get_file(file_id, file_name)


def clear_db(db_adapter):
    return db_adapter.clear_db()
