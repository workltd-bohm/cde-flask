def connect(db_adapter):
    return db_adapter.connect()


def get_table(db_adapter, name):
    return db_adapter.get_table(name)


def get_user(db_adapter, identifier):
    return db_adapter.get_user(identifier)


def get_all_users(db_adapter):
    return db_adapter.get_all_users()


def get_users_dump(db_adapter):
    return db_adapter.get_users_dump()


def set_user(db_adapter, user):
    return db_adapter.set_user(user)


def edit_user(db_adapter, user):
    return db_adapter.edit_user(user)


def upload_profile_image(db_adapter, request_json, file):
    return db_adapter.upload_profile_image(request_json, file)


def delete_profile_image(db_adapter, image_id):
    return db_adapter.delete_profile_image(image_id)


def confirm_account(db_adapter, user):
    return db_adapter.confirm_account(user)


def upload_project(db_adapter, project, user):
    return db_adapter.upload_folder_structure(project, user)


def update_project(db_adapter, project, user):
    return db_adapter.update_project(project, user)


def get_all_projects(db_adapter):
    return db_adapter.get_all_projects()


def get_my_projects(db_adapter, user):
    return db_adapter.get_my_projects(user)

# TODO TRASH
def get_my_trash(db_adapter, user):
    return db_adapter.get_my_trash(user)


def get_my_shares(db_adapter, user):
    return db_adapter.get_my_shares(user)


def get_project(db_adapter, project_name, user):
    return db_adapter.get_project(project_name, user)


def upload_file(db_adapter, project, file_obj, file=None):
    return db_adapter.upload_file(project, file_obj, file)


def upload_thumb(db_adapter, project, file_obj, thumb):
    return db_adapter.upload_thumb(project, file_obj, thumb)


def update_file(db_adapter, project, file_obj, file=None):
    return db_adapter.update_file(project, file_obj, file)


def update_file_annotations(db_adapter, request):
    return db_adapter.update_file_annotations(request)


def delete_file_annotation(db_adapter, request):
    return db_adapter.delete_file_annotation(request)


def get_file_annotations(db_adapter, stored_id):
    return db_adapter.get_file_annotations(stored_id)


def create_folder(db_adapter, project_name, folder):
    return db_adapter.create_folder(project_name, folder)


def rename_ic(db_adapter, request_data, user):
    return db_adapter.rename_ic(request_data, user)


def trash_ic(db_adapter, ic_data):
    return db_adapter.trash_ic(ic_data)


def restore_ic(db_adapter, ic_data):
    return db_adapter.restore_ic(ic_data)


def delete_ic(db_adapter, delete_ic_data):
    return db_adapter.delete_ic(delete_ic_data)


def empty_my_trash(db_adapter, user):
    return db_adapter.empty_my_trash(user)


def get_file(db_adapter, file_name):
    return db_adapter.get_file(file_name)


def get_ic_object(db_adapter, project_name, request_data, file_name):
    return db_adapter.get_ic_object(project_name, request_data, file_name)


def get_ic_object_from_shared(db_adapter, request_data, user):
    return db_adapter.get_ic_object_from_shared(request_data, user)


def get_post_file(db_adapter, request_json):
    return db_adapter.get_post_file(request_json)


def get_file_size(db_adapter, stored_id, asstr=False):
    return db_adapter.get_file_size(stored_id, asstr)


def change_color(db_adapter, file_obj):
    return db_adapter.change_color(file_obj)


def create_post(db_adapter, request_json):
    return db_adapter.create_post(request_json)


def edit_post(db_adapter, request_json):
    return db_adapter.edit_post(request_json)


def get_all_posts(db_adapter):
    return db_adapter.get_all_posts()


def get_my_posts(db_adapter, user):
    return db_adapter.get_my_posts(user)


def upload_post_file(db_adapter, request_json, file):
    return db_adapter.upload_post_file(request_json, file)


def remove_post_file(db_adapter, request_json):
    return db_adapter.remove_post_file(request_json)


def update_post_file(db_adapter, file, post_id, user):
    return db_adapter.update_post_file(file, post_id, user)


def create_bid(db_adapter, request_json):
    return db_adapter.create_bid(request_json)


def get_all_bids(db_adapter):
    return db_adapter.get_all_bids()


def get_my_bids(db_adapter, user):
    return db_adapter.get_my_bids(user)


def get_single_post(db_adapter, request_json):
    return db_adapter.get_single_post(request_json)


def get_single_bid(db_adapter, request_json):
    return db_adapter.get_single_bid(request_json)


def get_bids_for_post(db_adapter, request_json):
    return db_adapter.get_bids_for_post(request_json)


def share_project(db_adapter, request_data, user):
    return db_adapter.share_project(request_data, user)


def update_share_project(db_adapter, request_data, user):
    return db_adapter.update_share_project(request_data, user)


def remove_share_project(db_adapter, request_data, session_user):
    return db_adapter.remove_share_project(request_data, session_user)


def add_comment(db_adapter, request_data, comment):
    return db_adapter.add_comment(request_data, comment)


def update_comment(db_adapter, request_data):
    return db_adapter.update_comment(request_data)


def delete_comment(db_adapter, request_data):
    return db_adapter.delete_comment(request_data)


def get_comments(db_adapter, request_data):
    return db_adapter.get_comments(request_data)


def add_tag(db_adapter, request_data, tags):
    return db_adapter.add_tag(request_data, tags)


def remove_tag(db_adapter, request_data, tag):
    return db_adapter.remove_tag(request_data, tag)


def update_iso_tags(db_adapter, request_data):
    return db_adapter.update_iso_tags(request_data)


def get_all_tags(db_adapter):
    return db_adapter.get_all_tags()


def get_ic_tags(db_adapter, request_data):
    return db_adapter.get_ic_tags(request_data)


def get_all_tags_with_ics(db_adapter):
    return db_adapter.get_all_tags_with_ics()


def add_access(db_adapter, request_data, session_user):
    return db_adapter.add_access(request_data, session_user)


def update_access(db_adapter, request_data, session_user):
    return db_adapter.update_access(request_data, session_user)


def remove_access(db_adapter, request_data, session_user):
    return db_adapter.remove_access(request_data, session_user)


def clear_db(db_adapter, user):
    return db_adapter.clear_db(user)

def close_connection(db_adapter):
    db_adapter._close_connection()