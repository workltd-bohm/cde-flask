def connect(db_adapter):
    return db_adapter.connect()


def get_table(db_adapter, name):
    return db_adapter.get_table(name)


def get_user(db_adapter, identifier):
    return db_adapter.get_user(identifier)


def set_user(db_adapter, user):
    return db_adapter.set_user(user)


def upload_project(db_adapter, project):
    return db_adapter.upload_folder_structure(project)


def get_project(db_adapter, project_name):
    return db_adapter.get_project(project_name)
